const db = require('../db/connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} = require('../errors');

// Function to sign up operators

const signUp = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z])/;

  if (!email || !password || !confirmPassword) {
    throw new BadRequestError('Please provide all fields.');
  }

  if (!regexEmail.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  // Confirm if password contains at least 8 characters
  if (password.length < 8) {
    throw new BadRequestError('Password should contain at least 8 characters');
  }

  // Confirm if password contains at least 1 uppercase letter, 1 lowercase letter and 1 special character
  if (!regexPassword.test(password)) {
    throw new BadRequestError(
      'Password should contain at least 1 uppercase letter, 1 lowercase letter and 1 special character'
    );
  }

  let queryOperator = `SELECT * FROM users where email='${email}' and role='operator'`;
  let [result] = await db.query(queryOperator);

  if (result.length == 1) throw new BadRequestError('Email already exists.');

  if (password !== confirmPassword)
    throw new BadRequestError("Passwords don't match.");

  const hashedPassword = await bcrypt.hash(password, 10);
  let queryInsertOperator = `INSERT INTO users (email, password, role) VALUES ('${email}', '${hashedPassword}', 'operator')`;

  await db.query(queryInsertOperator);

  let query = `SELECT * FROM users WHERE email='${email}' and role='operator'`;
  [[result]] = await db.query(query);
  const { id } = result;
  const role = 'operator';
  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res.status(StatusCodes.CREATED).json({ message: 'User created', token });
};

// Function to log in operators

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError('Please provide email and password');

  let query = `SELECT * FROM users WHERE email='${email}' and role='operator'`;
  const [[result]] = await db.query(query);
  if (!result) throw new UnauthorizedError('Invalid username or password');

  let match = await bcrypt.compare(password, result.password);

  if (!match) throw new UnauthorizedError('Invalid username or password');
  const { id } = result;
  const role = 'operator';
  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res
    .status(StatusCodes.OK)
    .json({ message: `${email} logged in successfully`, token });
};

// Function for operators to complete profile

// const completeProfile = async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     phoneNumber,
//     nationality,
//     state,
//     lga,
//     sex,
//     maritalStatus,
//     dateOfBirth,
//     nin,
//     photo,
//   } = req.body;

//   const { email, role } = req.user;

//   if (role !== 'operator') {
//     throw new ForbiddenError('You are not allowed to access this route');
//   }

//   if (
//     !firstName ||
//     !lastName ||
//     !phoneNumber ||
//     !nationality ||
//     !state ||
//     !lga ||
//     !sex ||
//     !maritalStatus ||
//     !dateOfBirth ||
//     !nin ||
//     !photo
//   ) {
//     throw new BadRequestError('Please provide all fields.');
//   }

//   if (sex.toLowerCase() !== 'male' && sex.toLowerCase() !== 'female') {
//     throw new BadRequestError(
//       `${sex} is invalid. Please provide a valid sex (Male or Female)`
//     );
//   }

//   let queryOperator = `SELECT * FROM operators_details WHERE phone_number='${phoneNumber}'`;
//   let [result] = await db.query(queryOperator);

//   if (result.length == 1)
//     throw new BadRequestError('Phone Number already exists.');

//   let queryOperatorId = `SELECT id FROM users WHERE email='${email}' and role='operator'`;
//   let queryStateId = `SELECT id FROM states WHERE state='${state}'`;
//   let queryLgaId = `SELECT id FROM lgas WHERE lga='${lga}'`;
//   let queryLgaStateId = `SELECT state_id FROM lgas WHERE lga='${lga}'`;

//   const [[{ id: userId }]] = await db.query(queryOperatorId);
//   // console.log('userid',userId);
//   const [[stateIdQuery]] = await db.query(queryStateId);
//   const [[lgaIdQuery]] = await db.query(queryLgaId);

//   // console.log('State id', stateId);

//   // Verify valid state and LGA
//   if (!stateIdQuery) throw new BadRequestError(`State is invalid`);
//   if (!lgaIdQuery) throw new BadRequestError(`LGA is invalid`);

//   const { id: stateId } = stateIdQuery;
//   const { id: lgaId } = lgaIdQuery;
//   const [[{ state_id: lgaStateId }]] = await db.query(queryLgaStateId);

//   // Verify if LGA belongs to state
//   if (stateId !== lgaStateId)
//     throw new BadRequestError(`${lga} LGA does not belong to ${state} State`);

//   let queryInsertOperatorData = `INSERT INTO operators_details (user_id, first_name, last_name, phone_number, email, nationality, state_id, lga_id, sex, marital_status, date_of_birth, nin, photo) VALUES (${userId}, '${firstName}', '${lastName}', '${phoneNumber}', '${email}', '${nationality}', ${stateId}, ${lgaId}, '${sex}', '${maritalStatus}', '${dateOfBirth}', '${nin}', '${photo}')`;

//   await db.query(queryInsertOperatorData);
//   res.status(StatusCodes.CREATED).json({ message: 'Awaiting verification' });
// };

// Function to sign up admins

const signUpAdmin = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z])/;

  if (!email || !password || !confirmPassword) {
    throw new BadRequestError('Please provide all fields.');
  }

  if (!regexEmail.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  // Confirm if password contains at least 8 characters
  if (password.length < 8) {
    throw new BadRequestError('Password should contain at least 8 characters');
  }

  // Confirm if password contains at least 1 uppercase letter, 1 lowercase letter and 1 special character
  if (!regexPassword.test(password)) {
    throw new BadRequestError(
      'Password should contain at least 1 uppercase letter, 1 lowercase letter and 1 special character'
    );
  }

  let queryAdmin = `SELECT * FROM users where email='${email}' and role='admin'`;
  let [result] = await db.query(queryAdmin);

  if (result.length == 1) throw new BadRequestError('Email already exists.');

  if (password !== confirmPassword)
    throw new BadRequestError("Passwords don't match.");

  const hashedPassword = await bcrypt.hash(password, 10);
  let queryInsertAdmin = `INSERT INTO users (email, password, role) VALUES ('${email}', '${hashedPassword}', 'admin')`;

  await db.query(queryInsertAdmin);

  let query = `SELECT * FROM users WHERE email='${email}' and role='admin'`;
  [[result]] = await db.query(query);
  const { id } = result;
  const role = 'admin';
  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res.status(StatusCodes.CREATED).json({ message: 'Admin created', token });
};

// Function to log in admins

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError('Please provide email and password');

  let query = `SELECT * FROM users WHERE email='${email}' and role='admin'`;
  const [[result]] = await db.query(query);
  if (!result) throw new UnauthorizedError('Invalid username or password');

  let match = await bcrypt.compare(password, result.password);

  if (!match) throw new UnauthorizedError('Invalid username or password');
  const { id } = result;
  const role = 'admin';
  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res
    .status(StatusCodes.OK)
    .json({ message: `${email} logged in successfully`, token });
};

// const verifyOperator = async (req, res) => {
//   const { email, verified } = req.body;
//   const { role } = req.user;

//   if (role !== 'admin') {
//     throw new ForbiddenError('You are not allowed to access this route');
//   }

//   let queryVerified = `SELECT * FROM operators_details WHERE email='${email}'`;
//   let [[result]] = await db.query(queryVerified);

//   if (verified && result.verified) {
//     throw new BadRequestError('Operator already verified.');
//   }

//   const operatorId = String(result.id);
//   const paddedId = operatorId.padStart(4, 0);
//   const uniqueOperatorId = `${paddedId}-OP`;

//   let queryUpdateOperator = `UPDATE operators_details SET verified=${verified}, unique_operator_id='${uniqueOperatorId}' WHERE email='${email}'`;
//   await db.query(queryUpdateOperator);
//   res.status(StatusCodes.OK).json({ message: 'Success' });
// };

module.exports = {
  signUp,
  // completeProfile,
  login,
  signUpAdmin,
  loginAdmin,
  // verifyOperator,
};
