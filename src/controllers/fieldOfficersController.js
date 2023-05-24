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
    governmentIdImage,
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
    !governmentIdType ||
    !governmentIdImage
  ) {
    throw new BadRequestError('Please provide all fields.');
  }

  const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (!regexEmail.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  if (sex.toLowerCase() !== 'male' && sex.toLowerCase() !== 'female') {
    throw new BadRequestError(
      `${sex} is invalid. Please provide a valid sex (Male or Female)`
    );
  }

  let queryOperatorEmail = `SELECT * FROM field_officers_details WHERE email='${email}'`;
  let [resultEmail] = await db.query(queryOperatorEmail);

  if (resultEmail.length) throw new BadRequestError('Email already exists.');

  let queryOperatorNumber = `SELECT * FROM field_officers_details WHERE phone_number='${phoneNumber}'`;
  let [resultNumber] = await db.query(queryOperatorNumber);

  if (resultNumber.length)
    throw new BadRequestError('Phone number already exists.');

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

  let queryGovernmentIdType = `SELECT id FROM government_id_types WHERE id_type="${governmentIdType}"`;
  const [[idTypeQuery]] = await db.query(queryGovernmentIdType);

  if (!idTypeQuery)
    throw new BadRequestError(`Government Identification type is invalid`);
  const { id: identificationTypeId } = idTypeQuery;

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

  let queryInsertFieldOfficer = `INSERT INTO field_officers_details (full_name, email, phone_number, sex_id, date_of_birth, bvn, state_id, lga_id, hub_id, government_identification_id, government_identification_type_id, government_identification_image, unique_operator_id) VALUES ('${fullName}', '${phoneNumber}', ${sexId}, '${dateOfBirth}', '${bvn}', ${stateId}, ${lgaId}, ${hubId}, '${governmentId}', ${identificationTypeId}, '${governmentIdImage}', '${uniqueOperatorId}')`;

  await db.query(queryInsertFieldOfficer);

  res.status(StatusCodes.CREATED).json({ message: 'Success' });
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
    field_officers_details.government_identification_image AS government_id_image, field_officers_details.unique_operator_id, field_officers_details.verified, field_officers_details.unique_field_officer_id
    FROM field_officers_details
    JOIN sex ON sex.id=field_officers_details.sex_id
    JOIN states ON states.id=field_officers_details.state_id
    JOIN lgas ON lgas.id=field_officers_details.lga_id
    JOIN hubs ON hubs.id=field_officers_details.hub_id
    JOIN government_id_types ON government_id_types.id=field_officers_details.government_identification_type_id
    WHERE unique_operator_id='${uniqueOperatorId}'
  `;
  const [data] = await db.query(queryGetAllFieldOfficers);
  res.status(StatusCodes.OK).json({ message: 'Success', data });
};

const getAllFieldOfficersAdmin = async (req, res) => {
  const { q } = req.query;

  let queryGetAllFieldOfficers = `
    SELECT field_officers_details.id, field_officers_details.full_name AS field_officer_name, field_officers_details.email, field_officers_details.phone_number, sex.sex, field_officers_details.date_of_birth, field_officers_details.bvn, states.state, lgas.lga, hubs.hub, field_officers_details.government_identification_id AS government_id, government_id_types.id_type AS government_id_type,
    field_officers_details.government_identification_image AS government_id_image, field_officers_details.verified, field_officers_details.unique_field_officer_id, 
    field_officers_details.unique_operator_id AS unique_operator_id, operators_details.full_name AS operator_name
    FROM field_officers_details
    JOIN sex ON sex.id=field_officers_details.sex_id
    JOIN states ON states.id=field_officers_details.state_id
    JOIN lgas ON lgas.id=field_officers_details.lga_id
    JOIN hubs ON hubs.id=field_officers_details.hub_id
    JOIN government_id_types ON government_id_types.id=field_officers_details.government_identification_type_id
    JOIN operators_details ON operators_details.unique_operator_id = field_officers_details.unique_operator_id
  `;

  if (q) {
    queryGetAllFieldOfficers = `${queryGetAllFieldOfficers} WHERE operators_details.unique_operator_id LIKE '%${q}%' OR operators_details.full_name LIKE '%${q}%'`;
  }

  const [data] = await db.query(queryGetAllFieldOfficers);
  res.status(StatusCodes.OK).json({ message: 'Success', data });
};

const generateTestQuestions = async (req, res) => {
  const { email } = req.body;
  const categories = [];
  const randomQuestions = [];

  let queryGetFieldOfficer = `SELECT * FROM field_officers_details WHERE email = '${email}'`;
  const [resultFieldOfficer] = await db.query(queryGetFieldOfficer);
  const [{ full_name: fieldOfficerName }] = resultFieldOfficer;

  if (!resultFieldOfficer.length)
    throw new BadRequestError('No field officer exists with this email');

  let queryGetSession = `SELECT * FROM sessions WHERE field_officer_email = '${email}'`;
  const [resultSession] = await db.query(queryGetSession);

  if (resultSession.length)
    throw new BadRequestError(
      'Test has already been generated for this field officer'
    );

  let queryGetCategories = `SELECT * FROM question_categories`;
  const [resultCategories] = await db.query(queryGetCategories);
  categories.push(...resultCategories);

  for (const { category } of categories) {
    let queryGetCategoryId = `SELECT * FROM question_categories WHERE category = '${category}'`;
    const [[{ id: categoryId }]] = await db.query(queryGetCategoryId);
    let queryGetRandomQuestions = `SELECT * FROM field_officers_questions WHERE category_id=${categoryId} ORDER BY rand() LIMIT 5`;
    const [resultRandomQuestions] = await db.query(queryGetRandomQuestions);
    randomQuestions.push(...resultRandomQuestions);
  }

  const password = generator.generate({
    length: 10,
    numbers: true,
  });

  let queryInsertSession = `INSERT INTO sessions (password, field_officer_email) VALUES ('${password}', '${email}')`;
  const [{ insertId: sessionId }] = await db.query(queryInsertSession);

  for (const { question, category_id: categoryId } of randomQuestions) {
    let queryGetQuestion = `SELECT * FROM field_officers_questions WHERE question = "${question}"`;
    const [[{ id: questionId }]] = await db.query(queryGetQuestion);
    let queryInsertSessionQuestion = `INSERT INTO sessions_questions (session_id, question_id, category_id) VALUES (${sessionId}, ${questionId}, ${categoryId})`;
    await db.query(queryInsertSessionQuestion);
  }

  res.status(StatusCodes.CREATED).json({
    message: 'Success',
    fieldOfficerName
  });
};

const loginTest = async (req, res) => {
  res.status(StatusCodes.OK).json({message: 'Success', status: 200})
}

module.exports = {
  recruitFieldOfficer,
  getAllFieldOfficers,
  getAllFieldOfficersAdmin,
  generateTestQuestions,
  loginTest,
};