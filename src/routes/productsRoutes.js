const express = require('express');
const { selectProduct } = require('../controllers/productsController');
const authenticateToken = require('../middlewares/authMiddleware');
const {
  restrictAccessOperator,
} = require('../middlewares/accessRestrictionMiddleware');
const router = express.Router();

router
  .route('/products')
  .post(authenticateToken, restrictAccessOperator, selectProduct);

module.exports = router;
