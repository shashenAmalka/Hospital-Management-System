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
    const items = await PharmacyItem.find()
      .populate('supplier', 'supplierId supplierName contactNumber')
      .sort({ name: 1 });

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

// Get expiring pharmacy items (expires within 30 days)
exports.getExpiringItems = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const items = await PharmacyItem.find({
      expiryDate: {
        $lte: thirtyDaysFromNow,
        $gte: new Date() // Not already expired
      }
    })
    .populate('supplier', 'supplierId supplierName contactNumber')
    .sort({ expiryDate: 1 }); // Sort by expiry date (earliest first)
    
    // Add dynamic status and days until expiry
    const itemsWithExpiryInfo = items.map(item => {
      const daysUntilExpiry = Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      let expiryStatus;
      
      if (daysUntilExpiry <= 7) {
        expiryStatus = 'expires very soon';
      } else if (daysUntilExpiry <= 14) {
        expiryStatus = 'expires soon';
      } else {
        expiryStatus = 'expires in 30 days';
      }
      
      let stockStatus;
      if (item.quantity === 0) {
        stockStatus = 'out of stock';
      } else if (item.quantity < item.minRequired) {
        stockStatus = 'low stock';
      } else {
        stockStatus = 'in stock';
      }
      
      return { 
        ...item.toObject(), 
        daysUntilExpiry,
        expiryStatus,
        status: stockStatus
      };
    });

    res.status(200).json({
      success: true,
      count: itemsWithExpiryInfo.length,
      data: itemsWithExpiryInfo
    });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ message: 'Error fetching expiring items' });
  }
};

// Get a single pharmacy item by ID
exports.getPharmacyItemById = async (req, res) => {
  try {
    const item = await PharmacyItem.findById(req.params.id)
      .populate('supplier', 'supplierId supplierName contactNumber');
    
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
    const { name, category, quantity, minRequired, unitPrice, expiryDate, manufacturer, description, supplier } = req.body;
    
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
      supplier: supplier || null,
      updatedBy: req.user ? req.user._id : null
    });
    
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);
    
    // If supplier is provided, update the supplier's itemsSupplied array
    if (supplier) {
      try {
        await Supplier.findByIdAndUpdate(
          supplier,
          { $addToSet: { itemsSupplied: savedItem._id } },
          { new: true }
        );
        console.log(`Added item ${savedItem._id} to supplier ${supplier} itemsSupplied array`);
      } catch (error) {
        console.error('Error updating supplier itemsSupplied:', error);
        // Don't fail the main operation if supplier update fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Pharmacy item created successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Error creating pharmacy item:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Item with this ID already exists. Please try again.',
        error: 'Duplicate item ID'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }
    
    // Generic error
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
    const { name, category, quantity, minRequired, unitPrice, expiryDate, manufacturer, description, supplier } = req.body;
    
    // Find item
    const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    const oldSupplierId = item.supplier;
    const newSupplierId = supplier || null;
    
    // Update fields
    if (name) item.name = name;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (minRequired !== undefined) item.minRequired = Number(minRequired);
    if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
    if (expiryDate) item.expiryDate = expiryDate;
    if (manufacturer) item.manufacturer = manufacturer;
    if (description) item.description = description;
    if (supplier !== undefined) item.supplier = newSupplierId;
    
    if (req.user) {
      item.updatedBy = req.user._id;
    }
    
    await item.save();
    
    // Handle supplier relationship changes
    if (String(oldSupplierId) !== String(newSupplierId)) {
      try {
        // Remove item from old supplier's itemsSupplied array
        if (oldSupplierId) {
          await Supplier.findByIdAndUpdate(
            oldSupplierId,
            { $pull: { itemsSupplied: id } },
            { new: true }
          );
          console.log(`Removed item ${id} from old supplier ${oldSupplierId} itemsSupplied array`);
        }
        
        // Add item to new supplier's itemsSupplied array
        if (newSupplierId) {
          await Supplier.findByIdAndUpdate(
            newSupplierId,
            { $addToSet: { itemsSupplied: id } },
            { new: true }
          );
          console.log(`Added item ${id} to new supplier ${newSupplierId} itemsSupplied array`);
        }
      } catch (error) {
        console.error('Error updating supplier relationships:', error);
        // Don't fail the main operation if supplier update fails
      }
    }
    
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

// Delete a pharmacy item
exports.deletePharmacyItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await PharmacyItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    
    // If item has a supplier, remove it from supplier's itemsSupplied array
    if (item.supplier) {
      try {
        await Supplier.findByIdAndUpdate(
          item.supplier,
          { $pull: { itemsSupplied: id } },
          { new: true }
        );
        console.log(`Removed item ${id} from supplier ${item.supplier} itemsSupplied array`);
      } catch (error) {
        console.error('Error updating supplier itemsSupplied on delete:', error);
        // Don't fail the main operation if supplier update fails
      }
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
        'Total': itemTotal.toFixed(2),
        'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A',
        'Manufacturer': item.manufacturer || 'N/A',
        'Status': status,
      };
    });

    if (format === 'xlsx') {
      // Generate XLSX using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pharmacy Inventory');
      
      // Define columns
      worksheet.columns = [
        { header: 'Item ID', key: 'itemId', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: 'Unit Price (Rs.)', key: 'unitPrice', width: 18 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Expiry Date', key: 'expiryDate', width: 15 },
        { header: 'Manufacturer', key: 'manufacturer', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      
      // Add data rows
      reportData.forEach(item => {
        worksheet.addRow({
          itemId: item['Item ID'],
          name: item['Name'],
          category: item['Category'],
          quantity: item['Quantity'],
          unitPrice: item['Unit Price (Rs.)'],
          total: item['Total'],
          expiryDate: item['Expiry Date'],
          manufacturer: item['Manufacturer'],
          status: item['Status']
        });
      });
      
      // Add empty row and subtotal
      worksheet.addRow({});
      worksheet.addRow({
        itemId: '',
        name: '',
        category: '',
        quantity: '',
        unitPrice: 'Sub Total (Rs.):',
        total: subTotal.toFixed(2),
        expiryDate: '',
        manufacturer: '',
        status: ''
      });
      
      // Set headers and send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=pharmacy_inventory_report.xlsx');
      
      const buffer = await workbook.xlsx.writeBuffer();
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
        doc.text(item['Total'], 330, currentY);
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
