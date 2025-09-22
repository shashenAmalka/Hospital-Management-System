const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createCertification,
  getAllCertifications,
  getCertificationsByStaff,
  getExpiringCertifications,
  updateCertification,
  deleteCertification,
  getCertificationStats,
  updateCertificationStatuses
} = require('../Controller/CertificationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/certifications/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only PDF, JPG, JPEG, PNG files
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /api/certifications - Get all certifications with filters
router.get('/', getAllCertifications);

// GET /api/certifications/stats - Get certification statistics
router.get('/stats', getCertificationStats);

// GET /api/certifications/expiring - Get expiring certifications
router.get('/expiring', getExpiringCertifications);

// GET /api/certifications/staff/:staffId - Get certifications by staff ID
router.get('/staff/:staffId', getCertificationsByStaff);

// POST /api/certifications - Create new certification with file upload
router.post('/', upload.single('certificationFile'), createCertification);

// PUT /api/certifications/:id - Update certification
router.put('/:id', updateCertification);

// DELETE /api/certifications/:id - Delete certification (soft delete)
router.delete('/:id', deleteCertification);

// POST /api/certifications/update-statuses - Update all certification statuses
router.post('/update-statuses', updateCertificationStatuses);

module.exports = router;