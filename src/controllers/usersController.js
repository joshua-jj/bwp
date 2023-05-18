const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');

const completeOperatorProfile = async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    nationality,
    state,
    lga,
    sex,
    maritalStatus,
    dateOfBirth,
    nin,
    photo,
  } = req.body;

  const { email, role } = req.user;

  if (role !== 'operator') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  if (
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !nationality ||
    !state ||
    !lga ||
    !sex ||
    !maritalStatus ||
    !dateOfBirth ||
    !nin ||
    !photo
  ) {
    throw new BadRequestError('Please provide all fields.');
  }

  if (sex.toLowerCase() !== 'male' && sex.toLowerCase() !== 'female') {
    throw new BadRequestError(
      `${sex} is invalid. Please provide a valid sex (Male or Female)`
    );
  }

  let queryOperator = `SELECT * FROM operators_details WHERE phone_number='${phoneNumber}'`;
  let [result] = await db.query(queryOperator);

  if (result.length == 1)
    throw new BadRequestError('Phone Number already exists.');

  let queryOperatorId = `SELECT id FROM users WHERE email='${email}' and role='operator'`;
  let queryStateId = `SELECT id FROM states WHERE state='${state}'`;
  let queryLgaId = `SELECT id FROM lgas WHERE lga='${lga}'`;
  let queryLgaStateId = `SELECT state_id FROM lgas WHERE lga='${lga}'`;

  const [[{ id: userId }]] = await db.query(queryOperatorId);
  // console.log('userid',userId);
  const [[stateIdQuery]] = await db.query(queryStateId);
  const [[lgaIdQuery]] = await db.query(queryLgaId);

  // console.log('State id', stateId);

  // Verify valid state and LGA
  if (!stateIdQuery) throw new BadRequestError(`State is invalid`);
  if (!lgaIdQuery) throw new BadRequestError(`LGA is invalid`);

  const { id: stateId } = stateIdQuery;
  const { id: lgaId } = lgaIdQuery;
  const [[{ state_id: lgaStateId }]] = await db.query(queryLgaStateId);

  // Verify if LGA belongs to state
  if (stateId !== lgaStateId)
    throw new BadRequestError(`${lga} LGA does not belong to ${state} State`);

  let queryInsertOperatorData = `INSERT INTO operators_details (user_id, first_name, last_name, phone_number, email, nationality, state_id, lga_id, sex, marital_status, date_of_birth, nin, photo) VALUES (${userId}, '${firstName}', '${lastName}', '${phoneNumber}', '${email}', '${nationality}', ${stateId}, ${lgaId}, '${sex}', '${maritalStatus}', '${dateOfBirth}', '${nin}', '${photo}')`;

  await db.query(queryInsertOperatorData);
  res.status(StatusCodes.CREATED).json({ message: 'Awaiting verification' });
};

const verifyOperator = async (req, res) => {
  const { email, verified } = req.body;
  const { role } = req.user;

  if (role !== 'admin') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  let queryVerified = `SELECT * FROM operators_details WHERE email='${email}'`;
  let [[result]] = await db.query(queryVerified);

  if (verified && result.verified) {
    throw new BadRequestError('Operator already verified.');
  }

  const operatorId = String(result.id);
  const paddedId = operatorId.padStart(4, 0);
  const uniqueOperatorId = `${paddedId}-OP`;

  let queryUpdateOperator = `UPDATE operators_details SET verified=${verified}, unique_operator_id='${uniqueOperatorId}' WHERE email='${email}'`;
  await db.query(queryUpdateOperator);
  res.status(StatusCodes.OK).json({ message: 'Success' });
};

module.exports = {
  completeOperatorProfile,
  verifyOperator,
};
