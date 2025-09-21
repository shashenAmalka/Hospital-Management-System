const mongoose = require('mongoose');
const PharmacyItem = require('../Model/PharmacyItemModel');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');

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
      // Generate PDF
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Pharmacy Inventory Report', 105, 15, null, null, 'center');

      const tableColumn = ["Name", "Category", "Quantity", "Unit Price (Rs.)", "Item Total (Rs.)", "Status"];
      const tableRows = [];

      reportData.forEach(item => {
        const itemData = [
          item.Name,
          item.Category,
          item.Quantity,
          item['Unit Price (Rs.)'],
          item['Item Total (Rs.)'],
          item.Status,
        ];
        tableRows.push(itemData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(12);
          doc.text(`Sub Total: Rs. ${subTotal.toFixed(2)}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
      
      const pdfBuffer = doc.output('arraybuffer');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=pharmacy_inventory_report.pdf');
      res.send(Buffer.from(pdfBuffer));
    }
  } catch (error) {
    console.error('Error generating pharmacy report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};
