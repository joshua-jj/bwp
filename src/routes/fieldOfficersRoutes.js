const express = require('express');
const { recruitFieldOfficers } = require('../controllers/fieldOfficersController');
const authenticateToken = require('../middlewares/authMiddleware');
const checkVerification = require('../middlewares/verificationMiddleware');
const router = express.Router();

router
  .route('/fieldOfficers')
  .post(authenticateToken, checkVerification, recruitFieldOfficers);

module.exports = router;
