const express = require('express');
const {
  completeOperatorProfile,
  verifyOperator,
} = require('../controllers/usersController');
const {uploadOperatorPhoto } = require('../controllers/uploadsController');
const authenticateToken = require('../middlewares/authMiddleware');
const {
  restrictAccessOperator,
  restrictAccessAdmin,
} = require('../middlewares/accessRestrictionMiddleware');
const router = express.Router();

router
  .route('/completeProfile')
  .post(authenticateToken, completeOperatorProfile);
router
  .route('/verifyOperator')
  .post(authenticateToken, restrictAccessAdmin, verifyOperator);
router
  .route('/uploadOperatorPhoto')
  .post(authenticateToken, restrictAccessOperator, uploadOperatorPhoto);


module.exports = router;
