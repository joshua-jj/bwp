const express = require('express');
const {
  recruitFieldOfficer,
  getAllFieldOfficers,
  getAllFieldOfficersAdmin,
  generateTestQuestions,
  getTestQuestions,
  submitTestAnswers,
  getTestScore,
} = require('../controllers/fieldOfficersController');
const { uploadFieldOfficerGovId } = require('../controllers/uploadsController');

const authenticateToken = require('../middlewares/authMiddleware');

const {
  restrictAccessOperator,
  restrictAccessAdmin,
  restrictAccessTestCandidate,
} = require('../middlewares/accessRestrictionMiddleware');

const router = express.Router();

router
  .route('/fieldOfficers/recruit')
  .post(authenticateToken, restrictAccessOperator, recruitFieldOfficer);

router
  .route('/fieldOfficers')
  .get(authenticateToken, restrictAccessOperator, getAllFieldOfficers);

router
  .route('/uploadFieldOfficerGovId')
  .post(authenticateToken, restrictAccessOperator, uploadFieldOfficerGovId);

router
  .route('/admin/fieldOfficers')
  .get(authenticateToken, restrictAccessAdmin, getAllFieldOfficersAdmin);

router
  .route('/admin/fieldOfficers/test/generateTestQuestions')
  .post(authenticateToken, restrictAccessAdmin, generateTestQuestions);

router
  .route('/admin/fieldOfficers/test/score')
  .get(authenticateToken, restrictAccessAdmin, getTestScore);

router
  .route('/fieldOfficers/test/questions')
  .get(authenticateToken, restrictAccessTestCandidate, getTestQuestions);

router
  .route('/fieldOfficers/test/submit')
  .patch(authenticateToken, restrictAccessTestCandidate, submitTestAnswers);

module.exports = router;
