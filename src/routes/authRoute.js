const express = require('express');
const {
  signUp,
  completeProfile,
  login,
  signUpAdmin,
  loginAdmin,
  verifyOperator,
} = require('../controllers/authController');
const { uploadPhoto } = require('../controllers/uploadsController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/signUp').post(signUp);
router.route('/login').post(login);
router.route('/admin/signUp').post(signUpAdmin);
router.route('/admin/login').post(loginAdmin);
router.route('/completeProfile').post(authenticateToken, completeProfile);
router.route('/verifyOperator').post(authenticateToken, verifyOperator);
router
  .route('/completeProfile/uploadPhoto')
  .post(authenticateToken, uploadPhoto);

module.exports = router;
