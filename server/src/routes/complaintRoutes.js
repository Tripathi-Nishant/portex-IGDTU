const express = require('express');
const { 
  submitComplaint, 
  getComplaints, 
  getComplaintById, 
  trackComplaint 
} = require('../controllers/complaintController');
const { authMiddleware, restrictTo } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

const router = express.Router();

// Publicly accessible for anonymous employees using the tracking code
router.get('/track/:trackingCode', trackComplaint);

// All other routes require auth
router.use(authMiddleware);

// Employee submitting complaint
router.post('/', upload.array('evidence', 5), submitComplaint);

// Admins and Ethics Members viewing complaints
router.get('/', restrictTo('ADMIN', 'ETHICS_MEMBER'), getComplaints);
router.get('/:id', restrictTo('ADMIN', 'ETHICS_MEMBER'), getComplaintById);

module.exports = router;
