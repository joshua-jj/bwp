const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');
const generator = require('generate-password');

const recruitFieldOfficer = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    sex,
    dateOfBirth,
    bvn,
    state,
    lga,
    hub,
    governmentId,
    governmentIdType,
  } = req.body;

  const { id: userId } = req.user;

  if (
    !fullName ||
    !email ||
    !phoneNumber ||
    !sex ||
    !dateOfBirth ||
    !bvn ||
    !state ||
    !lga ||
    !hub ||
    !governmentId ||
    !governmentIdType
  ) {
    throw new BadRequestError('Please provide all fields.');
  }

  // Validate email
  const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (!regexEmail.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  let queryFieldOfficerEmail = `SELECT * FROM field_officers_details WHERE email='${email}'`;
  let [resultEmail] = await db.query(queryFieldOfficerEmail);

  if (resultEmail.length) throw new BadRequestError('Email already exists.');

  // Validate sex
  if (sex.toLowerCase() !== 'male' && sex.toLowerCase() !== 'female') {
    throw new BadRequestError(
      `${sex} is invalid. Please provide a valid sex (Male or Female)`
    );
  }

  let queryFieldOfficerNumber = `SELECT * FROM field_officers_details WHERE phone_number='${phoneNumber}'`;
  let [resultNumber] = await db.query(queryFieldOfficerNumber);

  if (resultNumber.length)
    throw new BadRequestError('Phone number already exists.');

  // Validate BVN
  const regexBvn = /^\d+$/;

  if (bvn.length !== 11 || !regexBvn.test(bvn)) {
    throw new BadRequestError('BVN is invalid');
  }

  let queryFieldOfficerBvn = `SELECT * FROM field_officers_details WHERE bvn='${bvn}'`;
  let [resultBvn] = await db.query(queryFieldOfficerBvn);
  if (resultBvn.length) throw new BadRequestError('BVN already exists.');

  let queryStateId = `SELECT id FROM states WHERE state='${state}'`;
  let queryLgaId = `SELECT id FROM lgas WHERE lga='${lga}'`;
  let queryLgaStateId = `SELECT state_id FROM lgas WHERE lga='${lga}'`;

  const [[stateIdQuery]] = await db.query(queryStateId);
  const [[lgaIdQuery]] = await db.query(queryLgaId);

  // Validate state and LGA
  if (!stateIdQuery) throw new BadRequestError(`State is invalid`);
  if (!lgaIdQuery) throw new BadRequestError(`LGA is invalid`);

  const { id: stateId } = stateIdQuery;
  const { id: lgaId } = lgaIdQuery;
  const [[{ state_id: lgaStateId }]] = await db.query(queryLgaStateId);

  // Verify if LGA belongs to state
  if (stateId !== lgaStateId)
    throw new BadRequestError(`${lga} LGA does not belong to ${state} State`);

  // Validate Government ID Type

  let queryGovernmentIdType = `SELECT id FROM government_id_types WHERE id_type="${governmentIdType}"`;
  const [[idTypeQuery]] = await db.query(queryGovernmentIdType);

  if (!idTypeQuery)
    throw new BadRequestError('Government Identification type is invalid');
  const { id: identificationTypeId } = idTypeQuery;

  // Validate Government ID
  let regexId = /^(?=.*[A-Z])(?=.*\d).+$/;

  if (governmentIdType.toLowerCase() === "permanent voter's card") {
    if (governmentId.length !== 16 || !regexId.test(governmentId)) {
      throw new BadRequestError('Government Id is invalid');
    }
  }

  if (governmentIdType.toLowerCase() === "driver's license") {
    if (governmentId.length !== 12 || !regexId.test(governmentId)) {
      throw new BadRequestError('Government Id is invalid');
    }
  }

  if (governmentIdType.toLowerCase() === 'international passport') {
    if (governmentId.length !== 9 || !regexId.test(governmentId)) {
      throw new BadRequestError('Government Id is invalid');
    }
  }

  let queryGovernmentId = `SELECT * FROM field_officers_details WHERE government_identification_id='${governmentId}'`;
  let [resultGovernmentId] = await db.query(queryGovernmentId);

  if (resultGovernmentId.length)
    throw new BadRequestError('Government id already exists.');

  // Validate hub
  let queryHubId = `SELECT id FROM hubs WHERE hub='${hub}'`;
  const [[hubQuery]] = await db.query(queryHubId);

  if (!hubQuery) throw new BadRequestError(`Hub is invalid`);
  const { id: hubId } = hubQuery;

  let queryUniqueOperatorId = `SELECT unique_operator_id FROM operators_details WHERE user_id='${userId}'`;
  const [[{ unique_operator_id: uniqueOperatorId }]] = await db.query(
    queryUniqueOperatorId
  );

  let querySexId = `SELECT id FROM sex WHERE sex='${sex}'`;
  const [[{ id: sexId }]] = await db.query(querySexId);

  let queryInsertFieldOfficer = `INSERT INTO field_officers_details (full_name, email, phone_number, sex_id, date_of_birth, bvn, state_id, lga_id, hub_id, government_identification_id, government_identification_type_id, unique_operator_id) VALUES ('${fullName}', '${email}', '${phoneNumber}', ${sexId}, '${dateOfBirth}', '${bvn}', ${stateId}, ${lgaId}, ${hubId}, '${governmentId}', ${identificationTypeId}, '${uniqueOperatorId}')`;

  await db.query(queryInsertFieldOfficer);

  res
    .status(StatusCodes.CREATED)
    .json({ status: StatusCodes.CREATED, message: 'Success' });
};

const getAllFieldOfficers = async (req, res) => {
  const { id: userId } = req.user;

  let queryUniqueOperatorId = `SELECT unique_operator_id FROM operators_details WHERE user_id='${userId}'`;
  const [[{ unique_operator_id: uniqueOperatorId }]] = await db.query(
    queryUniqueOperatorId
  );

  let queryGetAllFieldOfficers = `
    SELECT field_officers_details.id, field_officers_details.full_name, field_officers_details.email, field_officers_details.phone_number, sex.sex, field_officers_details.date_of_birth, field_officers_details.bvn, 
    states.state, lgas.lga, hubs.hub, field_officers_details.government_identification_id AS government_id, government_id_types.id_type AS government_id_type,
    field_officers_government_id_images.image AS government_id_image, field_officers_details.unique_operator_id, field_officers_details.verified, field_officers_details.unique_field_officer_id
    FROM field_officers_details
    LEFT JOIN sex ON sex.id=field_officers_details.sex_id
    LEFT JOIN states ON states.id=field_officers_details.state_id
    LEFT JOIN lgas ON lgas.id=field_officers_details.lga_id
    LEFT JOIN hubs ON hubs.id=field_officers_details.hub_id
    LEFT JOIN government_id_types ON government_id_types.id=field_officers_details.government_identification_type_id
    LEFT JOIN field_officers_government_id_images ON field_officers_government_id_images.email=field_officers_details.email
    WHERE unique_operator_id='${uniqueOperatorId}'
  `;
  const [data] = await db.query(queryGetAllFieldOfficers);
  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, message: 'Success', data });
};

const getAllFieldOfficersAdmin = async (req, res) => {
  const { q } = req.query;

  let queryGetAllFieldOfficers = `
    SELECT field_officers_details.id, field_officers_details.full_name, field_officers_details.email, field_officers_details.phone_number, sex.sex, field_officers_details.date_of_birth, field_officers_details.bvn, 
    states.state, lgas.lga, hubs.hub, field_officers_details.government_identification_id AS government_id, government_id_types.id_type AS government_id_type,
    field_officers_government_id_images.image AS government_id_image, field_officers_details.unique_operator_id, field_officers_details.verified, field_officers_details.unique_field_officer_id
    FROM field_officers_details
    LEFT JOIN sex ON sex.id=field_officers_details.sex_id
    LEFT JOIN states ON states.id=field_officers_details.state_id
    LEFT JOIN lgas ON lgas.id=field_officers_details.lga_id
    LEFT JOIN hubs ON hubs.id=field_officers_details.hub_id
    LEFT JOIN government_id_types ON government_id_types.id=field_officers_details.government_identification_type_id
    LEFT JOIN field_officers_government_id_images ON field_officers_government_id_images.email=field_officers_details.email
    LEFT JOIN operators_details ON operators_details.unique_operator_id = field_officers_details.unique_operator_id
  `;

  if (q) {
    queryGetAllFieldOfficers = `${queryGetAllFieldOfficers} WHERE field_officers_details.unique_operator_id LIKE '%${q}%' OR operators_details.full_name LIKE '%${q}%'`;
  }

  const [data] = await db.query(queryGetAllFieldOfficers);
  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, message: 'Success', data });
};

const generateTestQuestions = async (req, res) => {
  const { email } = req.body;
  const categories = [];
  const randomQuestions = [];

  let queryGetFieldOfficer = `SELECT * FROM field_officers_details WHERE email = '${email}'`;
  const [resultFieldOfficer] = await db.query(queryGetFieldOfficer);

  if (!resultFieldOfficer.length)
    throw new BadRequestError('No field officer exists with this email');

  let queryGetSession = `SELECT * FROM sessions WHERE field_officer_email = '${email}'`;
  const [resultSession] = await db.query(queryGetSession);

  if (resultSession.length)
    throw new BadRequestError(
      'Test has already been generated for this field officer'
    );

  const [{ full_name: fieldOfficerName }] = resultFieldOfficer;

  let queryGetCategories = `SELECT * FROM question_categories`;
  const [resultCategories] = await db.query(queryGetCategories);
  categories.push(...resultCategories);

  for (const { category } of categories) {
    let queryGetCategoryId = `SELECT * FROM question_categories WHERE category = '${category}'`;
    const [[{ id: categoryId }]] = await db.query(queryGetCategoryId);
    let queryGetRandomQuestions = `
      SELECT field_officers_questions.id, field_officers_questions.question,  field_officers_questions.option1, field_officers_questions.option2, field_officers_questions.option3,
      field_officers_questions.option4, field_officers_questions.option5, field_officers_questions.answer, question_categories.category
      FROM field_officers_questions JOIN question_categories ON question_categories.id = field_officers_questions.category_id
      WHERE field_officers_questions.category_id = ${categoryId}
      ORDER BY rand() LIMIT 5
    `;
    const [resultRandomQuestions] = await db.query(queryGetRandomQuestions);
    randomQuestions.push(...resultRandomQuestions);
  }

  const password = generator.generate({
    length: 10,
    numbers: true,
  });

  let queryInsertSession = `INSERT INTO sessions (password, field_officer_email) VALUES ('${password}', '${email}')`;
  const [{ insertId: sessionId }] = await db.query(queryInsertSession);

  for (const { question, category } of randomQuestions) {
    let queryGetCategoryId = `SELECT * FROM question_categories WHERE category = '${category}'`;
    const [[{ id: categoryId }]] = await db.query(queryGetCategoryId);

    let queryGetQuestion = `SELECT * FROM field_officers_questions WHERE question = "${question}"`;
    const [[{ id: questionId }]] = await db.query(queryGetQuestion);
    let queryInsertSessionQuestion = `INSERT INTO sessions_questions (session_id, question_id, category_id) VALUES (${sessionId}, ${questionId}, ${categoryId})`;
    await db.query(queryInsertSessionQuestion);
  }

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    message: 'Success',
    fieldOfficerName,
    testPassword: password,
    questions: randomQuestions,
  });
};

const getTestQuestions = async (req, res) => {
  const { email } = req.user;

  const questions = [];

  let queryGetCandidate = `SELECT * FROM sessions WHERE field_officer_email = '${email}'`;
  const [resultQueryCandidate] = await db.query(queryGetCandidate);

  const [{ id: sessionId, test_score: testScore }] = resultQueryCandidate;

  if (testScore !== null) {
    throw new ForbiddenError('You have already taken this test');
  }

  let queryGetCandidateQuestion = `SELECT * FROM sessions_questions WHERE session_id = '${sessionId}'`;
  const [resultQueryQuestion] = await db.query(queryGetCandidateQuestion);

  for (const { question_id: questionId } of resultQueryQuestion) {
    let queryQuestions = `
      SELECT field_officers_questions.id, field_officers_questions.question,  field_officers_questions.option1, field_officers_questions.option2, field_officers_questions.option3,
      field_officers_questions.option4, field_officers_questions.option5, question_categories.category
      FROM field_officers_questions JOIN question_categories ON question_categories.id = field_officers_questions.category_id
      WHERE field_officers_questions.id = ${questionId}
    `;
    const [[result]] = await db.query(queryQuestions);
    questions.push(result);
  }

  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, message: 'Success', data: questions });
};

const submitTestAnswers = async (req, res) => {
  const { email } = req.user;

  let score = 0;

  let queryGetCandidate = `SELECT * FROM sessions WHERE field_officer_email = '${email}'`;
  const [resultQueryCandidate] = await db.query(queryGetCandidate);

  const [{ id: sessionId, test_score: testScore }] = resultQueryCandidate;

  if (testScore !== null) {
    throw new ForbiddenError('You have already taken this test');
  }

  for (const [id, answer] of Object.entries(req.body)) {
    const questionId = Number(id);
    let queryUpdateAnswer = `UPDATE sessions_questions SET field_officer_answer = '${answer}' WHERE session_id = ${sessionId} AND question_id = ${questionId}`;
    await db.query(queryUpdateAnswer);
    let queryQuestions = `SELECT * FROM field_officers_questions WHERE id = ${questionId}`;
    const [[result]] = await db.query(queryQuestions);
    if (answer === result.answer) score++;
  }

  let queryUpdateScore = `UPDATE sessions SET test_score = ${score} WHERE id=${sessionId}`;
  await db.query(queryUpdateScore);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: 'Success',
    score,
  });
};

const getTestScore = async (req, res) => {
  const { email } = req.body;
  let queryGetCandidate = `SELECT * FROM sessions WHERE field_officer_email = '${email}'`;
  const [resultQueryCandidate] = await db.query(queryGetCandidate);

  if (!resultQueryCandidate.length)
    throw new BadRequestError('No field officer exists with this email');

  const [{ id: sessionId, test_score: testScore }] = resultQueryCandidate;

  let queryGetQuestions = `SELECT * FROM sessions_questions WHERE session_id = ${sessionId}`;
  const [resultQueryQuestions] = await db.query(queryGetQuestions);

  const scorePercentage = Math.round(
    (testScore * 100) / resultQueryQuestions.length
  );

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: 'Success',
    testScore,
    testScorePercentage: `${scorePercentage}%`,
  });
};
module.exports = {
  recruitFieldOfficer,
  getAllFieldOfficers,
  getAllFieldOfficersAdmin,
  generateTestQuestions,
  getTestQuestions,
  submitTestAnswers,
  getTestScore,
};
