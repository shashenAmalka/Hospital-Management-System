const Certification = require('../Model/CertificationModel');
const User = require('../Model/UserModel');
const Staff = require('../Model/StaffModel');

// Create new certification
const createCertification = async (req, res) => {
  try {
    console.log('Creating certification with body:', req.body);
    console.log('Uploaded file:', req.file);
    
    const {
      staffId,
      certificationName,
      certificationType,
      issuingAuthority,
      issueDate,
      expiryDate,
      certificationNumber,
      notes
    } = req.body;

    // Validate required fields
    if (!staffId || !certificationName || !certificationType || !issuingAuthority || !issueDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if staff exists
    console.log('Looking for staff with ID:', staffId);
    const staff = await Staff.findById(staffId);
    console.log('Staff found:', staff ? `${staff.firstName} ${staff.lastName} (${staff.email})` : 'None');
    
    if (!staff) {
      console.log('Staff member not found for ID:', staffId);
      return res.status(404).json({
        success: false,
        message: `Staff member not found with ID: ${staffId}`
      });
    }

    // Handle file upload
    let documentUrl = null;
    if (req.file) {
      documentUrl = `/uploads/certifications/${req.file.filename}`;
      console.log('File uploaded to:', documentUrl);
    }

    // Create certification
    const certification = new Certification({
      staffId,
      staffName: `${staff.firstName} ${staff.lastName}`,
      certificationName,
      certificationType,
      issuingAuthority,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      certificationNumber,
      notes,
      documentUrl
    });

    await certification.save();

    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      data: certification
    });
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all certifications with filters
const getAllCertifications = async (req, res) => {
  try {
    const { status, staffId, certificationType, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (staffId) {
      filter.staffId = staffId;
    }
    
    if (certificationType) {
      filter.certificationType = certificationType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get certifications with pagination
    const certifications = await Certification.find(filter)
      .populate('staffId', 'firstName lastName fullName email role')
      .sort({ expiryDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCertifications = await Certification.countDocuments(filter);

    // Calculate status counts
    const statusCounts = await Certification.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusSummary = {
      valid: 0,
      'expiring-soon': 0,
      expired: 0,
      total: 0
    };

    statusCounts.forEach(item => {
      statusSummary[item._id] = item.count;
      statusSummary.total += item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        certifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCertifications / limit),
          totalItems: totalCertifications,
          itemsPerPage: parseInt(limit)
        },
        statusSummary
      }
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get certifications by staff ID
const getCertificationsByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const certifications = await Certification.find({
      staffId,
      isActive: true
    })
    .populate('staffId', 'firstName lastName fullName email role')
    .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: certifications
    });
  } catch (error) {
    console.error('Error fetching staff certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get expiring certifications
const getExpiringCertifications = async (req, res) => {
  try {
    const { days = 60 } = req.query;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const expiringCertifications = await Certification.find({
      expiryDate: {
        $gte: today,
        $lte: futureDate
      },
      isActive: true
    })
    .populate('staffId', 'firstName lastName fullName email role')
    .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: expiringCertifications
    });
  } catch (error) {
    console.error('Error fetching expiring certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update certification
const updateCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if certification exists
    const certification = await Certification.findById(id);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // If staffId is being updated, verify the new staff exists
    if (updateData.staffId && updateData.staffId !== certification.staffId.toString()) {
      const staff = await Staff.findById(updateData.staffId);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }
      updateData.staffName = `${staff.firstName} ${staff.lastName}`;
    }

    // Update certification
    const updatedCertification = await Certification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('staffId', 'firstName lastName fullName email role');

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      data: updatedCertification
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete certification (soft delete)
const deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;

    const certification = await Certification.findById(id);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Soft delete
    certification.isActive = false;
    await certification.save();

    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get certification statistics
const getCertificationStats = async (req, res) => {
  try {
    const stats = await Certification.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          valid: {
            $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] }
          },
          expiringSoon: {
            $sum: { $cond: [{ $eq: ['$status', 'expiring-soon'] }, 1, 0] }
          },
          expired: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      valid: 0,
      expiringSoon: 0,
      expired: 0
    };

    // Get certifications by type
    const byType = await Certification.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$certificationType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: result,
        byType
      }
    });
  } catch (error) {
    console.error('Error fetching certification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Bulk update certification status (for maintenance)
const updateCertificationStatuses = async (req, res) => {
  try {
    const certifications = await Certification.find({ isActive: true });
    
    for (let cert of certifications) {
      await cert.save(); // This will trigger the pre-save middleware to update status
    }

    res.status(200).json({
      success: true,
      message: 'Certification statuses updated successfully'
    });
  } catch (error) {
    console.error('Error updating certification statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createCertification,
  getAllCertifications,
  getCertificationsByStaff,
  getExpiringCertifications,
  updateCertification,
  deleteCertification,
  getCertificationStats,
  updateCertificationStatuses
};