const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');

const recruitFieldOfficer = async (req, res) => {
  const {
    fullName,
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

  const { id: userId, role } = req.user;

  if (role !== 'operator') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  if (
    !fullName ||
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

  if (sex.toLowerCase() !== 'male' && sex.toLowerCase() !== 'female') {
    throw new BadRequestError(
      `${sex} is invalid. Please provide a valid sex (Male or Female)`
    );
  }

  let queryOperator = `SELECT * FROM field_officers_details WHERE phone_number='${phoneNumber}'`;
  let [result] = await db.query(queryOperator);

  if (result.length == 1)
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

  let queryInsertFieldOfficer = `INSERT INTO field_officers_details (full_name, phone_number, sex_id, date_of_birth, bvn, state_id, lga_id, hub_id, government_identification_id, government_identification_type_id, government_identification_image, unique_operator_id) VALUES ('${fullName}', '${phoneNumber}', ${sexId}, '${dateOfBirth}', '${bvn}', ${stateId}, ${lgaId}, ${hubId}, '${governmentId}', ${identificationTypeId}, '${governmentIdImage}', '${uniqueOperatorId}')`;

  await db.query(queryInsertFieldOfficer);

  res.status(StatusCodes.CREATED).json({ message: 'Success' });
};

const getAllFieldOfficers = async (req, res) => {
  const { id: userId, role } = req.user;
  if (role !== 'operator') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  let queryUniqueOperatorId = `SELECT unique_operator_id FROM operators_details WHERE user_id='${userId}'`;
  const [[{ unique_operator_id: uniqueOperatorId }]] = await db.query(
    queryUniqueOperatorId
  );

  let queryGetAllFieldOfficers = `
    SELECT field_officers_details.id, field_officers_details.full_name, field_officers_details.phone_number, sex.sex, field_officers_details.date_of_birth, field_officers_details.bvn, 
    states.state, lgas.lga, hubs.hub, field_officers_details.government_identification_id AS government_id, government_id_types.id_type AS government_id_type,
    field_officers_details.government_identification_image AS government_id_image, field_officers_details.unique_operator_id, field_officers_details.verified, field_officers_details.unique_field_officer_id
    FROM field_officers_details
    JOIN sex ON sex.id=field_officers_details.sex_id
    JOIN states ON states.id=field_officers_details.state_id
    JOIN lgas ON lgas.id=field_officers_details.lga_id
    JOIN hubs ON hubs.id=field_officers_details.hub_id
    JOIN government_id_types ON government_id_types.id=field_officers_details.government_identification_type_id
    WHERE unique_operator_id='${uniqueOperatorId}';
  `;
  const [fieldOfficers] = await db.query(queryGetAllFieldOfficers);
  res.status(StatusCodes.OK).json({ message: 'Success', fieldOfficers });
};

const getAllFieldOfficersAdmin = async (req, res) => {
  const { role } = req.user;
  
  if (role !== 'admin') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  res.status(StatusCodes.OK).json({ message: 'Success' });
};

module.exports = {
  recruitFieldOfficer,
  getAllFieldOfficers,
  getAllFieldOfficersAdmin
};
