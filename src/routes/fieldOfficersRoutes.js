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

const authenticateToken = require('../middlewares/authMiddleware');

const {
  restrictAccessOperator,
  restrictAccessAdmin,
  restrictAccessTestCandidate,
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
  .route('/admin/fieldOfficers/test/generateTestQuestions')
  .post(authenticateToken, restrictAccessAdmin, generateTestQuestions);

  router
    .route('/admin/fieldOfficers/test/score')
    .get(authenticateToken, restrictAccessAdmin, getTestScore);


router
  .route('/fieldOfficers/test/questions')
  .get(authenticateToken, restrictAccessTestCandidate, getTestQuestions);

router
  .route('/fieldOfficers/test/submitTestAnswers')
  .patch(authenticateToken,restrictAccessTestCandidate, submitTestAnswers);


module.exports = router;
