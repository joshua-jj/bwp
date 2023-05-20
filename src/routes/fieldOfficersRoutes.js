const express = require('express');
const {
  recruitFieldOfficer,
  getAllFieldOfficers,
} = require('../controllers/fieldOfficersController');
const authenticateToken = require('../middlewares/authMiddleware');
const checkVerification = require('../middlewares/verificationMiddleware');
const router = express.Router();

router
  .route('/fieldOfficers')
  .post(authenticateToken, checkVerification, recruitFieldOfficer)
  .get(authenticateToken, checkVerification, getAllFieldOfficers);

module.exports = router;
