const express = require('express');
const {
  recruitFieldOfficer,
  getAllFieldOfficers,
  getAllFieldOfficersAdmin,
} = require('../controllers/fieldOfficersController');
const authenticateToken = require('../middlewares/authMiddleware');
const checkVerification = require('../middlewares/verificationMiddleware');
const router = express.Router();

router
  .route('/fieldOfficers')
  .post(authenticateToken, checkVerification, recruitFieldOfficer)
  .get(authenticateToken, checkVerification, getAllFieldOfficers);

router
  .route('/admin/fieldOfficers')
  .get(authenticateToken, getAllFieldOfficersAdmin);

module.exports = router;
