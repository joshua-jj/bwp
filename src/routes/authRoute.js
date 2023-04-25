const express = require('express');
const { signUp, completeProfile, login } = require('../controllers/authController');
const router = express.Router();

router.route('/signUp').post(signUp);
router.route('/completeProfile').post(completeProfile);
router.route('/login').post(login);

module.exports = router;
