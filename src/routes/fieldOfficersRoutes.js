const express = require('express');
const {
  recruitFieldOfficer,
  getAllFieldOfficers,
  getAllFieldOfficersAdmin,
  generateTestQuestions,
} = require('../controllers/fieldOfficersController');
const authenticateToken = require('../middlewares/authMiddleware');
const {
  restrictAccessOperator,
  restrictAccessAdmin,
} = require('../middlewares/accessRestrictionMiddleware');
const router = express.Router();

router
  .route('/fieldOfficers')
  .post(authenticateToken, restrictAccessOperator, recruitFieldOfficer)
  .get(authenticateToken, restrictAccessOperator, getAllFieldOfficers);

router
  .route('/admin/fieldOfficers')
  .get(authenticateToken, restrictAccessAdmin, getAllFieldOfficersAdmin);

router
  .route('/admin/fieldOfficers/generateTestQuestions')
  .post(authenticateToken, restrictAccessAdmin, generateTestQuestions);

module.exports = router;
