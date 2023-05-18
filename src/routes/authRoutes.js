const express = require('express');
const {
  signUp,
  login,
  signUpAdmin,
  loginAdmin,
} = require('../controllers/authController');
const router = express.Router();

router.route('/signUp').post(signUp);
router.route('/login').post(login);
router.route('/admin/signUp').post(signUpAdmin);
router.route('/admin/login').post(loginAdmin);

module.exports = router;
