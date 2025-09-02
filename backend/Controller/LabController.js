const Test = require('../Model/TestModel');
const LabInventory = require('../Model/LabInventoryModel');
const Equipment = require('../Model/EquipmentModel');
const User = require('../Model/UserModel');
const Patient = require('../Model/PatientModel');
const Notification = require('../Model/NotificationModel');

// Helper function to create notifications
const createNotification = async (userId, title, message, type = 'info', relatedTo = null) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedTo
    });
    await notification.save();
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Get lab statistics
exports.getLabStats = async (req, res) => {
  try {
    const pendingCount = await Test.countDocuments({ status: 'pending' });
    const inProgressCount = await Test.countDocuments({ status: 'in_progress' });
    
    // Count completed tests today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await Test.countDocuments({
      status: 'completed',
      completedAt: { $gte: today }
    });
    
    // Count critical results
    const criticalResults = await Test.countDocuments({
      status: 'completed',
      isCritical: true
    });
    
    // Count total samples
    const totalSamples = await Test.countDocuments({
      sampleCollected: true
    });
    
    // Count low inventory items
    const lowInventoryItems = await LabInventory.countDocuments({
      $expr: { $lt: ["$currentStock", "$minRequired"] }
    });
    
    res.status(200).json({
      pendingTests: pendingCount,
      inProgressTests: inProgressCount,
      completedToday,
      criticalResults,
      totalSamples,
      lowInventoryItems
    });
  } catch (error) {
    console.error('Error fetching lab stats:', error);
    res.status(500).json({ message: 'Error fetching lab statistics' });
  }
};

// Get pending tests
exports.getPendingTests = async (req, res) => {
  try {
    const tests = await Test.find({ status: 'pending' })
      .populate('patient', 'firstName lastName patientId')
      .populate('requestedBy', 'firstName lastName')
      .sort({ priority: 1, deadline: 1 });
    
    // Format the data for frontend
    const formattedTests = tests.map(test => ({
      id: test._id,
      patientName: `${test.patient.firstName} ${test.patient.lastName}`,
      patientId: test.patient.patientId,
      testType: test.testType,
      priority: test.priority,
      requestedBy: `Dr. ${test.requestedBy.firstName} ${test.requestedBy.lastName}`,
      deadline: test.deadline,
      sampleCollected: test.sampleCollected
    }));
    
    res.status(200).json(formattedTests);
  } catch (error) {
    console.error('Error fetching pending tests:', error);
    res.status(500).json({ message: 'Error fetching pending tests' });
  }
};

// Get in-progress tests
exports.getInProgressTests = async (req, res) => {
  try {
    const tests = await Test.find({ status: 'in_progress' })
      .populate('patient', 'firstName lastName patientId')
      .populate('requestedBy', 'firstName lastName')
      .sort({ startedAt: 1 });
    
    // Format the data for frontend
    const formattedTests = tests.map(test => ({
      id: test._id,
      patientName: `${test.patient.firstName} ${test.patient.lastName}`,
      patientId: test.patient.patientId,
      testType: test.testType,
      priority: test.priority,
      requestedBy: `Dr. ${test.requestedBy.firstName} ${test.requestedBy.lastName}`,
      deadline: test.deadline,
      startedAt: test.startedAt
    }));
    
    res.status(200).json(formattedTests);
  } catch (error) {
    console.error('Error fetching in-progress tests:', error);
    res.status(500).json({ message: 'Error fetching in-progress tests' });
  }
};

// Get completed tests
exports.getCompletedTests = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const tests = await Test.find({ status: 'completed' })
      .populate('patient', 'firstName lastName patientId')
      .populate('requestedBy', 'firstName lastName')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Format the data for frontend
    const formattedTests = tests.map(test => ({
      id: test._id,
      patientName: `${test.patient.firstName} ${test.patient.lastName}`,
      patientId: test.patient.patientId,
      testType: test.testType,
      result: test.result,
      notes: test.notes,
      status: test.isCritical ? 'abnormal' : 'normal',
      completedAt: test.completedAt,
      verifiedBy: `Lab Tech ${test.verifiedBy.firstName}`
    }));
    
    // Get total count for pagination
    const totalTests = await Test.countDocuments({ status: 'completed' });
    
    res.status(200).json({
      tests: formattedTests,
      pagination: {
        total: totalTests,
        page,
        pages: Math.ceil(totalTests / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    res.status(500).json({ message: 'Error fetching completed tests' });
  }
};

// Request a new test
exports.requestTest = async (req, res) => {
  try {
    const { patientId, testType, priority, deadline, notes } = req.body;
    
    // Validate required fields
    if (!patientId || !testType || !priority || !deadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Create new test
    const test = new Test({
      patient: patientId,
      testType,
      priority,
      deadline,
      notes,
      requestedBy: req.user.id,
      status: 'pending',
      sampleCollected: false
    });
    
    await test.save();
    
    // Notify lab technicians about new test request
    const labTechs = await User.find({ role: 'lab_technician' });
    for (const tech of labTechs) {
      await createNotification(
        tech._id,
        'New Test Request',
        `Dr. ${req.user.firstName} ${req.user.lastName} requested a ${testType} test for patient ${patient.firstName} ${patient.lastName}.`,
        'info',
        { model: 'Test', id: test._id }
      );
    }
    
    res.status(201).json({ message: 'Test request created successfully', test });
  } catch (error) {
    console.error('Error creating test request:', error);
    res.status(500).json({ message: 'Error creating test request' });
  }
};

// Update test status
exports.updateTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const test = await Test.findById(id)
      .populate('patient', 'firstName lastName')
      .populate('requestedBy');
      
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Update test status
    test.status = status;
    
    // If moving to in_progress, set startedAt
    if (status === 'in_progress') {
      test.startedAt = new Date();
    }
    
    await test.save();
    
    // Notify doctor if needed
    if (status === 'in_progress') {
      await createNotification(
        test.requestedBy._id,
        'Test In Progress',
        `The ${test.testType} test for patient ${test.patient.firstName} ${test.patient.lastName} is now being processed.`,
        'info',
        { model: 'Test', id: test._id }
      );
    }
    
    res.status(200).json({ message: 'Test status updated successfully' });
  } catch (error) {
    console.error('Error updating test status:', error);
    res.status(500).json({ message: 'Error updating test status' });
  }
};

// Update sample collection status
exports.updateSampleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { sampleCollected } = req.body;
    
    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Update sample collection status
    test.sampleCollected = sampleCollected;
    if (sampleCollected) {
      test.sampleCollectedAt = new Date();
    }
    
    await test.save();
    
    res.status(200).json({ message: 'Sample status updated successfully' });
  } catch (error) {
    console.error('Error updating sample status:', error);
    res.status(500).json({ message: 'Error updating sample status' });
  }
};

// Complete a test with results
exports.completeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { result, notes, isCritical } = req.body;
    
    // Validate required fields
    if (!result) {
      return res.status(400).json({ message: 'Result is required' });
    }
    
    const test = await Test.findById(id)
      .populate('patient', 'firstName lastName email')
      .populate('requestedBy', 'firstName lastName email');
      
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Update test with results
    test.result = result;
    test.notes = notes;
    test.isCritical = isCritical || false;
    test.status = 'completed';
    test.completedAt = new Date();
    test.verifiedBy = req.user.id;
    
    await test.save();
    
    // Notify doctor about test completion
    const notificationType = isCritical ? 'critical' : 'info';
    const notificationTitle = isCritical ? 'CRITICAL Test Result Available' : 'Test Result Available';
    
    // Notify the requesting doctor
    await createNotification(
      test.requestedBy._id,
      notificationTitle,
      `Results for ${test.testType} test for patient ${test.patient.firstName} ${test.patient.lastName} are now available.`,
      notificationType,
      { model: 'Test', id: test._id }
    );
    
    // If critical, also notify all doctors caring for this patient
    if (isCritical) {
      const patientDoctors = await User.find({
        role: 'doctor',
        _id: { $ne: test.requestedBy._id } // Exclude the requesting doctor
      });
      
      for (const doctor of patientDoctors) {
        await createNotification(
          doctor._id,
          'CRITICAL Test Result Alert',
          `Critical test result for ${test.patient.firstName} ${test.patient.lastName}'s ${test.testType} test requires attention.`,
          'critical',
          { model: 'Test', id: test._id }
        );
      }
    }
    
    res.status(200).json({ message: 'Test completed successfully' });
  } catch (error) {
    console.error('Error completing test:', error);
    res.status(500).json({ message: 'Error completing test' });
  }
};

// Get laboratory inventory
exports.getLabInventory = async (req, res) => {
  try {
    const inventory = await LabInventory.find()
      .sort({ name: 1 });
    
    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error fetching lab inventory:', error);
    res.status(500).json({ message: 'Error fetching laboratory inventory' });
  }
};

// Add new inventory item
exports.addInventoryItem = async (req, res) => {
  try {
    const { name, currentStock, minRequired } = req.body;
    
    // Validate required fields
    if (!name || currentStock === undefined || minRequired === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if item already exists
    const existingItem = await LabInventory.findOne({ name });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already exists' });
    }
    
    // Create new inventory item
    const item = new LabInventory({
      name,
      currentStock,
      minRequired,
      updatedBy: req.user.id,
      stockHistory: [{
        quantity: currentStock,
        operation: 'add',
        updatedBy: req.user.id,
        notes: 'Initial stock'
      }]
    });
    
    await item.save();
    
    res.status(201).json({ message: 'Inventory item added successfully', item });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ message: 'Error adding inventory item' });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, minRequired, operation, notes } = req.body;
    
    const item = await LabInventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    const oldStock = item.currentStock;
    
    // Update inventory properties
    if (minRequired !== undefined) {
      item.minRequired = minRequired;
    }
    
    if (currentStock !== undefined) {
      item.currentStock = currentStock;
    } else if (operation && operation.quantity) {
      // Handle stock adjustment with operation
      if (operation.type === 'add') {
        item.currentStock += operation.quantity;
      } else if (operation.type === 'remove') {
        if (item.currentStock < operation.quantity) {
          return res.status(400).json({ message: 'Not enough stock to remove' });
        }
        item.currentStock -= operation.quantity;
      }
      
      // Add to stock history
      item.stockHistory.push({
        quantity: operation.quantity,
        operation: operation.type,
        updatedBy: req.user.id,
        notes: notes || `${operation.type === 'add' ? 'Added' : 'Removed'} ${operation.quantity} units`
      });
    }
    
    item.updatedBy = req.user.id;
    
    await item.save();
    
    // Check if status changed and notify if needed
    if (item.status === 'low' && oldStock >= item.minRequired) {
      // Item just went low
      const labTechs = await User.find({ role: 'lab_technician' });
      for (const tech of labTechs) {
        await createNotification(
          tech._id,
          'Low Inventory Alert',
          `${item.name} is running low. Current stock: ${item.currentStock}, Minimum required: ${item.minRequired}`,
          'warning',
          { model: 'LabInventory', id: item._id }
        );
      }
    } else if (item.status === 'critical') {
      // Critical alert for admins and lab techs
      const adminsAndTechs = await User.find({ role: { $in: ['admin', 'lab_technician'] } });
      for (const user of adminsAndTechs) {
        await createNotification(
          user._id,
          'CRITICAL Inventory Alert',
          `${item.name} is critically low. Current stock: ${item.currentStock}, Minimum required: ${item.minRequired}`,
          'critical',
          { model: 'LabInventory', id: item._id }
        );
      }
    }
    
    res.status(200).json({ message: 'Inventory item updated successfully', item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Error updating inventory item' });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await LabInventory.find({
      $expr: { $lt: ["$currentStock", "$minRequired"] }
    }).sort({ status: 1, name: 1 });
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Error fetching low stock items' });
  }
};

// Get equipment status
exports.getEquipmentStatus = async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .sort({ name: 1 });
    
    res.status(200).json(equipment);
  } catch (error) {
    console.error('Error fetching equipment status:', error);
    res.status(500).json({ message: 'Error fetching equipment status' });
  }
};

// Add new equipment
exports.addEquipment = async (req, res) => {
  try {
    const { name, serialNumber, manufacturer, status, lastCalibration, nextCalibration } = req.body;
    
    // Validate required fields
    if (!name || !lastCalibration || !nextCalibration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create new equipment
    const equipment = new Equipment({
      name,
      serialNumber,
      manufacturer,
      status: status || 'operational',
      lastCalibration,
      nextCalibration,
      calibrationHistory: [{
        date: lastCalibration,
        performedBy: req.user.id,
        notes: 'Initial calibration',
        result: 'passed'
      }]
    });
    
    await equipment.save();
    
    res.status(201).json({ message: 'Equipment added successfully', equipment });
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).json({ message: 'Error adding equipment' });
  }
};

// Update equipment status
exports.updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!['operational', 'maintenance', 'out_of_service'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    const oldStatus = equipment.status;
    equipment.status = status;
    
    // Add to maintenance history if status changed
    if (oldStatus !== status) {
      equipment.maintenanceHistory.push({
        date: new Date(),
        type: 'inspection',
        performedBy: req.user.id,
        notes: notes || `Status changed from ${oldStatus} to ${status}`
      });
    }
    
    await equipment.save();
    
    // If equipment is no longer operational, notify
    if (status !== 'operational' && oldStatus === 'operational') {
      const labTechs = await User.find({ role: 'lab_technician' });
      for (const tech of labTechs) {
        await createNotification(
          tech._id,
          'Equipment Status Change',
          `${equipment.name} is now in ${status} mode and requires attention.`,
          status === 'out_of_service' ? 'critical' : 'warning',
          { model: 'Equipment', id: equipment._id }
        );
      }
    }
    
    res.status(200).json({ message: 'Equipment status updated successfully' });
  } catch (error) {
    console.error('Error updating equipment status:', error);
    res.status(500).json({ message: 'Error updating equipment status' });
  }
};

// Log equipment calibration
exports.logCalibration = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, notes, result, nextCalibration } = req.body;
    
    // Validate required fields
    if (!date || !result) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Add calibration record
    equipment.calibrationHistory.push({
      date,
      performedBy: req.user.id,
      notes,
      result
    });
    
    // Update last and next calibration dates
    equipment.lastCalibration = date;
    if (nextCalibration) {
      equipment.nextCalibration = nextCalibration;
    }
    
    // Update status based on calibration result
    if (result === 'failed') {
      equipment.status = 'out_of_service';
      
      // Notify about failed calibration
      const labTechs = await User.find({ role: 'lab_technician' });
      for (const tech of labTechs) {
        await createNotification(
          tech._id,
          'Equipment Calibration Failed',
          `${equipment.name} failed calibration and is now out of service.`,
          'critical',
          { model: 'Equipment', id: equipment._id }
        );
      }
    } else if (result === 'adjusted') {
      equipment.status = 'operational';
    }
    
    await equipment.save();
    
    res.status(200).json({ message: 'Calibration logged successfully' });
  } catch (error) {
    console.error('Error logging calibration:', error);
    res.status(500).json({ message: 'Error logging calibration' });
  }
};
