const express = require('express');
const { selectProduct } = require('../controllers/productsController');
const authenticateToken = require('../middlewares/authMiddleware');
const checkVerification = require('../middlewares/verificationMiddleware')
const router = express.Router();

router.route('/products').post(authenticateToken, checkVerification, selectProduct);

module.exports = router;
