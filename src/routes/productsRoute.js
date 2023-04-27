const express = require('express');
const { selectProduct } = require('../controllers/productsController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/products').post(authenticateToken, selectProduct);

module.exports = router;
