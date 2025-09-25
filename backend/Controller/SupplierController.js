const Supplier = require('../Model/SupplierModel');
const PharmacyItem = require('../Model/PharmacyItemModel');

// Sync supplier-item relationships (utility function)
exports.syncSupplierItemRelationships = async (req, res) => {
  try {
    console.log('Starting supplier-item relationship synchronization...');
    
    // Get all suppliers
    const suppliers = await Supplier.find();
    
    // Clear all itemsSupplied arrays first
    await Supplier.updateMany({}, { $set: { itemsSupplied: [] } });
    console.log('Cleared all existing itemsSupplied arrays');
    
    // Get all pharmacy items with suppliers
    const itemsWithSuppliers = await PharmacyItem.find({ supplier: { $ne: null } });
    console.log(`Found ${itemsWithSuppliers.length} items with suppliers`);
    
    // Group items by supplier
    const itemsBySupplier = {};
    itemsWithSuppliers.forEach(item => {
      const supplierId = item.supplier.toString();
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = [];
      }
      itemsBySupplier[supplierId].push(item._id);
    });
    
    // Update each supplier's itemsSupplied array
    let syncedSuppliers = 0;
    for (const [supplierId, itemIds] of Object.entries(itemsBySupplier)) {
      await Supplier.findByIdAndUpdate(
        supplierId,
        { $set: { itemsSupplied: itemIds } },
        { new: true }
      );
      syncedSuppliers++;
      console.log(`Updated supplier ${supplierId} with ${itemIds.length} items`);
    }
    
    console.log('Supplier-item relationship synchronization completed');
    
    res.status(200).json({
      success: true,
      message: 'Supplier-item relationships synchronized successfully',
      data: {
        totalSuppliers: suppliers.length,
        syncedSuppliers,
        totalItemsWithSuppliers: itemsWithSuppliers.length
      }
    });
  } catch (error) {
    console.error('Error syncing supplier-item relationships:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error syncing supplier-item relationships',
      error: error.message
    });
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate('itemsSupplied', 'name category')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ supplierName: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching suppliers' 
    });
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id)
      .populate('itemsSupplied', 'name category quantity unitPrice')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!supplier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supplier not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching supplier' 
    });
  }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { supplierName, contactNumber, email, address, notes } = req.body;

    // Validate required fields
    if (!supplierName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name and contact number are required'
      });
    }

    // Check if supplier with same name already exists
    const existingSupplier = await Supplier.findOne({ 
      supplierName: { $regex: new RegExp(`^${supplierName}$`, 'i') } 
    });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }

    const supplierData = {
      supplierName,
      contactNumber,
      email,
      address,
      notes,
      createdBy: req.user?._id // Assuming auth middleware sets req.user
    };

    const supplier = new Supplier(supplierData);
    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this information already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error creating supplier' 
    });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierName, contactNumber, email, address, status, notes } = req.body;

    // Check if supplier exists
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supplier not found' 
      });
    }

    // Check if supplier name is being changed and if new name already exists
    if (supplierName && supplierName !== supplier.supplierName) {
      const existingSupplier = await Supplier.findOne({ 
        supplierName: { $regex: new RegExp(`^${supplierName}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this name already exists'
        });
      }
    }

    const updateData = {
      ...(supplierName && { supplierName }),
      ...(contactNumber && { contactNumber }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      updatedBy: req.user?._id
    };

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('itemsSupplied', 'name category');

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error updating supplier' 
    });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supplier not found' 
      });
    }

    // Check if supplier has associated items
    const associatedItems = await PharmacyItem.find({ supplier: id });
    if (associatedItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. ${associatedItems.length} items are associated with this supplier. Please reassign or remove those items first.`
      });
    }

    await Supplier.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting supplier' 
    });
  }
};

// Get suppliers with their item counts
exports.getSuppliersWithItemCounts = async (req, res) => {
  try {
    const suppliers = await Supplier.aggregate([
      {
        $lookup: {
          from: 'pharmacyitems',
          localField: '_id',
          foreignField: 'supplier',
          as: 'suppliedItems'
        }
      },
      {
        $addFields: {
          itemCount: { $size: '$suppliedItems' },
          totalValue: {
            $sum: {
              $map: {
                input: '$suppliedItems',
                as: 'item',
                in: { $multiply: ['$$item.quantity', '$$item.unitPrice'] }
              }
            }
          }
        }
      },
      {
        $project: {
          supplierId: 1,
          supplierName: 1,
          contactNumber: 1,
          email: 1,
          status: 1,
          itemCount: 1,
          totalValue: 1,
          createdAt: 1
        }
      },
      { $sort: { supplierName: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers with item counts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching supplier statistics' 
    });
  }
};

// Get active suppliers only (for dropdown selection)
exports.getActiveSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ status: 'active' })
      .select('supplierId supplierName contactNumber')
      .sort({ supplierName: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching active suppliers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching active suppliers' 
    });
  }
};