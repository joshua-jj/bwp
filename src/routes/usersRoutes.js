const express = require('express');
const {
  completeOperatorProfile,
  verifyOperator,
} = require('../controllers/usersController');
const { uploadOperatorPhoto } = require('../controllers/uploadsController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router
  .route('/completeProfile')
  .post(authenticateToken, completeOperatorProfile);
router.route('/verifyOperator').post(authenticateToken, verifyOperator);
router
  .route('/completeProfile/uploadOperatorPhoto')
  .post(authenticateToken, uploadOperatorPhoto);

module.exports = router;
