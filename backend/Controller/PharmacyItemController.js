const mongoose = require('mongoose');
const PharmacyItem = require('../Model/PharmacyItemModel');
const PharmacyDispense = require('../Model/PharmacyDispenseModel');
const Supplier = require('../Model/SupplierModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const buildDispenseMatchQuery = (range = 'today', options = {}) => {
  if (range === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return { dispensedAt: { $gte: startOfDay, $lte: endOfDay } };
  }

  if (range === 'custom' && options.from && options.to) {
    const fromDate = new Date(options.from);
    const toDate = new Date(options.to);

    if (!isNaN(fromDate.valueOf()) && !isNaN(toDate.valueOf())) {
      toDate.setHours(23, 59, 59, 999);
      fromDate.setHours(0, 0, 0, 0);
      return { dispensedAt: { $gte: fromDate, $lte: toDate } };
    }
  }

  return {};
};

const calculateDispenseSummary = async (range = 'today', options = {}) => {
  const match = buildDispenseMatchQuery(range, options);
  const pipeline = [];

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  pipeline.push({
    $group: {
      _id: null,
      totalQuantity: { $sum: '$quantity' },
      totalDispenses: { $sum: 1 }
    }
  });

  const [result] = await PharmacyDispense.aggregate(pipeline);

  let recentDispenses = [];
  if (options.includeRecent) {
    const recentLimit = options.recentLimit || 5;

    const recentRecords = await PharmacyDispense.find(match)
      .sort({ dispensedAt: -1 })
      .limit(recentLimit)
      .populate('item', 'name itemId category unitPrice')
      .select('quantity reason dispensedAt itemSnapshot');

    recentDispenses = recentRecords.map(record => ({
      id: record._id,
      quantity: record.quantity,
      reason: record.reason,
      dispensedAt: record.dispensedAt,
      itemId: record.itemSnapshot?.itemId || record.item?.itemId,
      itemName: record.itemSnapshot?.name || record.item?.name,
      category: record.itemSnapshot?.category || record.item?.category,
      unitPrice: record.itemSnapshot?.unitPrice || record.item?.unitPrice || null
    }));
  }

  return {
    range,
    totalDispensedQuantity: result?.totalQuantity || 0,
    totalDispenseEvents: result?.totalDispenses || 0,
    recentDispenses,
    generatedAt: new Date()
  };
};

const normalizeMonthParam = (rawMonth) => {
  if (rawMonth === undefined || rawMonth === null) {
    return null;
  }

  const parsed = Number(rawMonth);
  if (Number.isNaN(parsed)) {
    return null;
  }

  if (parsed >= 0 && parsed <= 11) {
    return parsed;
  }

  if (parsed >= 1 && parsed <= 12) {
    return parsed - 1;
  }

  return null;
};

// Get all pharmacy items
exports.getAllPharmacyItems = async (req, res) => {
  try {
    const items = await PharmacyItem.find().sort({ name: 1 });

    // Dynamically set status for each item
    const itemsWithDynamicStatus = items.map(item => {
      let status;
      if (item.quantity === 0) {
        status = 'out of stock';
      } else if (item.quantity < item.minRequired) {
        status = 'low stock';
      } else {
        status = 'in stock';
      }
      // Return a plain object to avoid modifying the Mongoose document directly
      return { ...item.toObject(), status };
    });

    res.status(200).json({
      success: true,
      count: itemsWithDynamicStatus.length,
      data: itemsWithDynamicStatus
    });
  } catch (error) {
    console.error('Error fetching pharmacy items:', error);
    res.status(500).json({ message: 'Error fetching pharmacy items' });
  }
};

// Get low stock pharmacy items
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await PharmacyItem.find({
      $expr: { $lt: ["$quantity", "$minRequired"] }
    }).sort({ name: 1 });
    
    // Dynamically set status for each item
    const itemsWithDynamicStatus = items.map(item => {
      let status;
      if (item.quantity === 0) {
        status = 'out of stock';
      } else if (item.quantity < item.minRequired) {
        status = 'low stock';
      } else {
        status = 'in stock';
      }
      // Return a plain object to avoid modifying the Mongoose document directly
      return { ...item.toObject(), status };
    });

    res.status(200).json({
      success: true,
      count: itemsWithDynamicStatus.length,
      data: itemsWithDynamicStatus
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Error fetching low stock items' });
  }
};

// Get expiring items (within next 30 days)
exports.getExpiringItems = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const items = await PharmacyItem.find({
      expiryDate: {
        $gte: today,
        $lte: thirtyDaysFromNow
      }
    }).sort({ expiryDate: 1 });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ message: 'Error fetching expiring items' });
  }
};

// Get a single pharmacy item by ID
exports.getPharmacyItemById = async (req, res) => {
  try {
    const item = await PharmacyItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching pharmacy item:', error);
    res.status(500).json({ message: 'Error fetching pharmacy item' });
  }
};

// Create a new pharmacy item
exports.createPharmacyItem = async (req, res) => {
  try {
    console.log('Creating pharmacy item with body:', req.body);
    const { name, category, quantity, minRequired, unitPrice, expiryDate, manufacturer, description } = req.body;
    
    // Validate required fields
    if (!name || !category || quantity === undefined || minRequired === undefined || unitPrice === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        requiredFields: { name, category, quantity, minRequired, unitPrice }
      });
    }
    
    // Create item
    const item = new PharmacyItem({
      name,
      category,
      quantity: Number(quantity),
      minRequired: Number(minRequired),
      unitPrice: Number(unitPrice),
      expiryDate,
      manufacturer,
      description,
      updatedBy: req.user ? req.user._id : null
    });
    
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);
    
    res.status(201).json({
      success: true,
      message: 'Pharmacy item created successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Error creating pharmacy item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating pharmacy item',
      error: error.message
    });
  }
};

// Update a pharmacy item
exports.updatePharmacyItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, minRequired, unitPrice, expiryDate, manufacturer, description } = req.body;
    
    // Find item
    const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    // Update fields
    if (name) item.name = name;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (minRequired !== undefined) item.minRequired = Number(minRequired);
    if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
    if (expiryDate) item.expiryDate = expiryDate;
    if (manufacturer) item.manufacturer = manufacturer;
    if (description) item.description = description;
    
    if (req.user) {
      item.updatedBy = req.user._id;
    }
    
    await item.save();
    
    res.status(200).json({
      success: true,
      message: 'Pharmacy item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating pharmacy item:', error);
    res.status(500).json({ message: 'Error updating pharmacy item' });
  }
};

// Dispense a pharmacy item and record the transaction
exports.dispensePharmacyItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    const dispenseQuantity = Number(quantity);

    if (!dispenseQuantity || Number.isNaN(dispenseQuantity) || dispenseQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Dispense quantity must be a positive number'
      });
    }

  const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Pharmacy item not found' });
    }

    if (item.quantity < dispenseQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot dispense ${dispenseQuantity} units. Only ${item.quantity} units available.`
      });
    }

    item.quantity -= dispenseQuantity;
    if (req.user) {
      item.updatedBy = req.user._id;
    }

    await item.save();

    const trimmedReason = typeof reason === 'string' ? reason.trim() : undefined;

    const dispenseRecord = await PharmacyDispense.create({
      item: item._id,
      quantity: dispenseQuantity,
      reason: trimmedReason || undefined,
      dispensedBy: req.user ? req.user._id : null,
      itemSnapshot: {
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        unitPrice: item.unitPrice
      }
    });

    const populatedItem = await PharmacyItem.findById(id)
      .populate('supplier', 'supplierId supplierName contactNumber')
      .lean();
    const todaySummary = await calculateDispenseSummary('today', { includeRecent: true, recentLimit: 5 });

    res.status(200).json({
      success: true,
      message: 'Pharmacy item dispensed successfully',
      data: {
  item: populatedItem,
        dispense: {
          id: dispenseRecord._id,
          quantity: dispenseRecord.quantity,
          reason: dispenseRecord.reason,
          dispensedAt: dispenseRecord.dispensedAt,
          dispensedBy: dispenseRecord.dispensedBy,
          itemId: dispenseRecord.itemSnapshot?.itemId || populatedItem?.itemId,
          itemName: dispenseRecord.itemSnapshot?.name || populatedItem?.name,
          category: dispenseRecord.itemSnapshot?.category || populatedItem?.category,
          unitPrice: dispenseRecord.itemSnapshot?.unitPrice || populatedItem?.unitPrice || null
        },
        todaySummary
      }
    });
  } catch (error) {
    console.error('Error dispensing pharmacy item:', error);
    res.status(500).json({ success: false, message: 'Error dispensing pharmacy item' });
  }
};

// Get pharmacy dispense summary (defaults to today)
exports.getPharmacyDispenseSummary = async (req, res) => {
  try {
    const {
      range = 'today',
      from,
      to,
      includeRecent = 'true',
      recentLimit
    } = req.query;

    const summary = await calculateDispenseSummary(range, {
      from,
      to,
      includeRecent: includeRecent !== 'false',
      recentLimit: recentLimit ? Number(recentLimit) : undefined
    });

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching pharmacy dispense summary:', error);
    res.status(500).json({ success: false, message: 'Error fetching pharmacy dispense summary' });
  }
};

exports.getPharmacyDispenseAnalytics = async (req, res) => {
  try {
    const current = new Date();
    const normalizedMonth = normalizeMonthParam(req.query.month);
    const yearParam = req.query.year ? Number(req.query.year) : current.getFullYear();
    const year = Number.isNaN(yearParam) ? current.getFullYear() : yearParam;
    const month = normalizedMonth === null ? current.getMonth() : normalizedMonth;

    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();

    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Future months and years are not allowed for analytics queries.'
      });
    }

    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + 1, 1);

    const pipeline = [
      {
        $match: {
          dispensedAt: {
            $gte: periodStart,
            $lt: periodEnd
          }
        }
      },
      {
        $project: {
          quantity: 1,
          dispensedAt: 1,
          reason: 1,
          item: 1,
          itemSnapshot: 1,
          category: {
            $ifNull: ['$itemSnapshot.category', 'Uncategorized']
          },
          itemId: '$itemSnapshot.itemId',
          itemName: '$itemSnapshot.name',
          unitPrice: '$itemSnapshot.unitPrice'
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            item: { $ifNull: ['$item', '$_id'] },
            itemId: '$itemId'
          },
          totalQuantity: { $sum: '$quantity' },
          latestDispensedAt: { $max: '$dispensedAt' },
          itemName: { $first: '$itemName' },
          unitPrice: { $first: '$unitPrice' }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          dispensed: { $sum: '$totalQuantity' },
          uniqueItems: { $sum: 1 },
          items: {
            $push: {
              itemId: '$_id.itemId',
              itemRef: '$_id.item',
              name: '$itemName',
              totalQuantity: '$totalQuantity',
              unitPrice: '$unitPrice',
              lastDispensedAt: '$latestDispensedAt'
            }
          }
        }
      },
      {
        $sort: { dispensed: -1 }
      }
    ];

    const analytics = await PharmacyDispense.aggregate(pipeline);

    const totalDispensed = analytics.reduce((sum, category) => sum + (category.dispensed || 0), 0);
    const monthlyDispenses = analytics.map(category => ({
      category: category._id || 'Uncategorized',
      dispensed: category.dispensed || 0,
      itemCount: category.uniqueItems || 0,
      items: category.items || []
    }));

    const categorySummary = monthlyDispenses.reduce((acc, item) => {
      acc[item.category] = item.dispensed;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        totalDispensed,
        monthlyDispenses,
        categorySummary
      }
    });
  } catch (error) {
    console.error('Error fetching pharmacy dispense analytics:', error);
    res.status(500).json({ success: false, message: 'Error fetching pharmacy dispense analytics' });
  }
};

exports.getPharmacyQuickReports = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      dailySummaryBase,
      dailyCategoryBreakdown,
      trendRaw,
      stockByCategory,
      criticalItemsDocs,
      monthlyDispenseBreakdown
    ] = await Promise.all([
      calculateDispenseSummary('today', { includeRecent: true, recentLimit: 5 }),
      PharmacyDispense.aggregate([
        {
          $match: {
            dispensedAt: {
              $gte: startOfToday,
              $lt: endOfToday
            }
          }
        },
        {
          $project: {
            category: {
              $ifNull: ['$itemSnapshot.category', 'Uncategorized']
            },
            quantity: 1
          }
        },
        {
          $group: {
            _id: '$category',
            quantity: { $sum: '$quantity' }
          }
        },
        { $sort: { quantity: -1 } },
        { $limit: 3 }
      ]),
      PharmacyDispense.aggregate([
        {
          $match: {
            dispensedAt: {
              $gte: sixMonthsStart,
              $lt: nextMonth
            }
          }
        },
        {
          $project: {
            year: { $year: '$dispensedAt' },
            month: { $month: '$dispensedAt' },
            category: {
              $ifNull: ['$itemSnapshot.category', 'Uncategorized']
            },
            quantity: '$quantity'
          }
        },
        {
          $group: {
            _id: {
              year: '$year',
              month: '$month',
              category: '$category'
            },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              month: '$_id.month'
            },
            totalDispensed: { $sum: '$totalQuantity' },
            categories: {
              $push: {
                category: '$_id.category',
                quantity: '$totalQuantity'
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      PharmacyItem.aggregate([
        {
          $group: {
            _id: '$category',
            currentStock: { $sum: '$quantity' },
            minRequired: { $sum: '$minRequired' },
            itemCount: { $sum: 1 },
            lowStockCount: {
              $sum: {
                $cond: [{ $lt: ['$quantity', '$minRequired'] }, 1, 0]
              }
            },
            outOfStockCount: {
              $sum: {
                $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      PharmacyItem.find({
        $or: [
          { quantity: 0 },
          { $expr: { $lt: ['$quantity', '$minRequired'] } }
        ]
      })
        .select('itemId name category quantity minRequired status')
        .sort({ quantity: 1, name: 1 })
        .limit(10),
      PharmacyDispense.aggregate([
        {
          $match: {
            dispensedAt: {
              $gte: monthStart,
              $lt: nextMonth
            }
          }
        },
        {
          $project: {
            category: {
              $ifNull: ['$itemSnapshot.category', 'Uncategorized']
            },
            quantity: 1
          }
        },
        {
          $group: {
            _id: '$category',
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ])
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dailySummary = {
      ...dailySummaryBase,
      topCategories: dailyCategoryBreakdown.map(entry => ({
        category: entry._id,
        quantity: entry.quantity
      }))
    };

    const trendMap = new Map();
    trendRaw.forEach(entry => {
      const key = `${entry._id.year}-${entry._id.month}`;
      trendMap.set(key, {
        totalDispensed: entry.totalDispensed || 0,
        categories: (entry.categories || []).map(cat => ({
          category: cat.category,
          quantity: cat.quantity
        }))
      });
    });

    const trendMonths = [];
    let previousTotal = null;
    for (let offset = 5; offset >= 0; offset -= 1) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const year = targetDate.getFullYear();
      const monthIndex = targetDate.getMonth();
      const key = `${year}-${monthIndex + 1}`;
      const trendEntry = trendMap.get(key) || { totalDispensed: 0, categories: [] };

      const totalDispensed = trendEntry.totalDispensed || 0;
      const changeFromPrevious = previousTotal === null || previousTotal === 0
        ? null
        : ((totalDispensed - previousTotal) / previousTotal) * 100;

      trendMonths.push({
        year,
        month: monthIndex + 1,
        label: `${monthNames[monthIndex].slice(0, 3)} ${year}`,
        totalDispensed,
        categoryBreakdown: trendEntry.categories,
        changeFromPrevious
      });

      previousTotal = totalDispensed;
    }

    const totalDispensedLastSixMonths = trendMonths.reduce((sum, month) => sum + (month.totalDispensed || 0), 0);
    const averageMonthlyDispensed = trendMonths.length
      ? totalDispensedLastSixMonths / trendMonths.length
      : 0;
    const peakMonth = trendMonths.reduce((acc, month) => {
      if (!acc || month.totalDispensed > acc.totalDispensed) {
        return month;
      }
      return acc;
    }, null);

    const monthlyDispenseMap = new Map();
    monthlyDispenseBreakdown.forEach(entry => {
      monthlyDispenseMap.set(entry._id || 'Uncategorized', entry.totalQuantity || 0);
    });

    const stockCategories = stockByCategory.map(entry => {
      const category = entry._id || 'Uncategorized';
      return {
        category,
        currentStock: entry.currentStock || 0,
        minRequired: entry.minRequired || 0,
        itemCount: entry.itemCount || 0,
        lowStockCount: entry.lowStockCount || 0,
        outOfStockCount: entry.outOfStockCount || 0,
        dispensedThisMonth: monthlyDispenseMap.get(category) || 0
      };
    });

    monthlyDispenseMap.forEach((value, category) => {
      if (!stockCategories.find(entry => entry.category === category)) {
        stockCategories.push({
          category,
          currentStock: 0,
          minRequired: 0,
          itemCount: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          dispensedThisMonth: value || 0
        });
      }
    });

    const stockTotals = stockCategories.reduce((acc, category) => {
      acc.totalCurrentStock += category.currentStock || 0;
      acc.totalMinRequired += category.minRequired || 0;
      acc.totalItems += category.itemCount || 0;
      acc.totalLowStock += category.lowStockCount || 0;
      acc.totalOutOfStock += category.outOfStockCount || 0;
      acc.totalDispensedThisMonth += category.dispensedThisMonth || 0;
      return acc;
    }, {
      totalCurrentStock: 0,
      totalMinRequired: 0,
      totalItems: 0,
      totalLowStock: 0,
      totalOutOfStock: 0,
      totalDispensedThisMonth: 0
    });

    const criticalItems = criticalItemsDocs.map(item => ({
      id: item._id,
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minRequired: item.minRequired,
      status: item.status
    }));

    res.status(200).json({
      success: true,
      data: {
        dailySummary,
        trendAnalysis: {
          months: trendMonths,
          totalDispensedLastSixMonths,
          averageMonthlyDispensed,
          peakMonth
        },
        stockImpact: {
          categories: stockCategories,
          criticalItems,
          totals: stockTotals
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pharmacy quick reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching pharmacy quick reports' });
  }
};

// Delete a pharmacy item
exports.deletePharmacyItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    await PharmacyItem.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Pharmacy item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pharmacy item:', error);
    res.status(500).json({ message: 'Error deleting pharmacy item' });
  }
};

const jsPDF = require('jspdf').jsPDF;
require('jspdf-autotable');

// ... existing code ...

// Generate Pharmacy Report
exports.generatePharmacyReport = async (req, res) => {
  try {
    const { format } = req.query;
    const items = await PharmacyItem.find().sort({ name: 1 });

    if (!['xlsx', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'Invalid report format specified' });
    }

    // Prepare data with totals and status
    let subTotal = 0;
    const reportData = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subTotal += itemTotal;
      
      let status;
      if (item.quantity === 0) {
        status = 'out of stock';
      } else if (item.quantity < item.minRequired) {
        status = 'low stock';
      } else {
        status = 'in stock';
      }

      return {
        'Item ID': item.itemId,
        'Name': item.name,
        'Category': item.category,
        'Quantity': item.quantity,
        'Unit Price (Rs.)': item.unitPrice.toFixed(2),
        'Item Total (Rs.)': itemTotal.toFixed(2),
        'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A',
        'Manufacturer': item.manufacturer || 'N/A',
        'Status': status,
      };
    });

    if (format === 'xlsx') {
      // Generate XLSX
      const worksheetData = [...reportData, {}, { 'Name': 'Sub Total (Rs.)', 'Category': subTotal.toFixed(2) }];
      const worksheet = xlsx.utils.json_to_sheet(worksheetData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Pharmacy Inventory');
      
      // Set headers and send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=pharmacy_inventory_report.xlsx');
      
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);

    } else if (format === 'pdf') {
      // Generate PDF using PDFKit
      const doc = new PDFDocument();
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=pharmacy_inventory_report.pdf');
        res.send(pdfBuffer);
      });

      // Title
      doc.fontSize(20).text('Pharmacy Inventory Report', { align: 'center' });
      doc.moveDown();

      // Table headers
      const startY = 100;
      let currentY = startY;
      
      doc.fontSize(12);
      doc.text('Name', 50, currentY);
      doc.text('Category', 150, currentY);
      doc.text('Qty', 220, currentY);
      doc.text('Price (Rs.)', 260, currentY);
      doc.text('Total (Rs.)', 330, currentY);
      doc.text('Status', 400, currentY);
      
      currentY += 20;
      doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
      currentY += 10;

      // Table rows
      reportData.forEach(item => {
        doc.text(item.Name.substring(0, 15), 50, currentY);
        doc.text(item.Category, 150, currentY);
        doc.text(item.Quantity.toString(), 220, currentY);
        doc.text(item['Unit Price (Rs.)'], 260, currentY);
        doc.text(item['Item Total (Rs.)'], 330, currentY);
        doc.text(item.Status, 400, currentY);
        currentY += 20;
        
        // Add new page if needed
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
      });

      // Footer with total
      currentY += 20;
      doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
      currentY += 15;
      doc.fontSize(14).text(`Sub Total: Rs. ${subTotal.toFixed(2)}`, 330, currentY);
      
      doc.end();
    }
  } catch (error) {
    console.error('Error generating pharmacy report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Get user medications - placeholder implementation
exports.getUserMedications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For now, return empty array since we don't have a prescription/medication assignment system
    // In a real system, this would fetch medications prescribed to this user
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  } catch (error) {
    console.error('Error fetching user medications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user medications' 
    });
  }
};

// Get medications for a specific user
exports.getUserMedications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For now, return empty array as there's no user-medication relationship model
    // This can be extended when prescription/medication assignment is implemented
    const medications = [];
    
    res.status(200).json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    console.error('Error fetching user medications:', error);
    res.status(500).json({ message: 'Error fetching user medications' });
  }
};
