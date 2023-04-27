const db = require('../db/connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} = require('../errors');
const { stateData, stateLgasData } = require('../statesLgas');

// Function to sign up users

const signUp = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (!email || !password || !confirmPassword) {
    throw new BadRequestError('Please provide all fields.');
  }

  if (!regex.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  let queryOperator = `SELECT * FROM operators where email='${email}'`;
  let [result] = await db.query(queryOperator);

  if (result.length == 1) throw new BadRequestError('Email already exists.');

  if (password !== confirmPassword)
    throw new BadRequestError("Passwords don't match.");

  const hashedPassword = await bcrypt.hash(password, 10);
  let queryInsertOperator = `INSERT INTO operators (email, password) VALUES ('${email}', '${hashedPassword}')`;

  await db.query(queryInsertOperator);

  let query = `SELECT * FROM operators WHERE email='${email}'`;
  [[result]] = await db.query(query);
  const { id } = result;
  const role = 'operator';
  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res.status(StatusCodes.CREATED).json({ mssg: 'User created', token });
};

// Function to log in users

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError('Please provide email and password');

  let query = `SELECT * FROM operators WHERE email='${email}'`;
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
    .json({ mssg: `${email} logged in successfully`, token });
};

const completeProfile = async (req, res) => {
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

  let queryOperator = `SELECT * FROM operators_biodata WHERE phone_number='${phoneNumber}'`;
  let [result] = await db.query(queryOperator);

  if (result.length == 1)
    throw new BadRequestError('Phone Number already exists.');

  if (!stateData.includes(state)) throw new BadRequestError(`State is invalid`);

  if (!stateLgasData[state].includes(lga))
    throw new BadRequestError(`${lga} LGA does not belong to ${state} State`);

  let queryOperatorId = `SELECT id FROM operators WHERE email='${email}'`;
  let queryStateId = `SELECT id FROM states WHERE state='${state}'`;
  let queryLgaId = `SELECT id FROM lgas WHERE lga='${lga}'`;

  const [[{ id: operatorId }]] = await db.query(queryOperatorId);
  const [[{ id: stateId }]] = await db.query(queryStateId);
  const [[{ id: lgaId }]] = await db.query(queryLgaId);

  let queryInsertOperator = `INSERT INTO operators_biodata (operator_id, first_name, last_name, phone_number, email, nationality, state_id, lga_id, sex, marital_status, date_of_birth, nin, photo) VALUES (${operatorId}, '${firstName}', '${lastName}', '${phoneNumber}', '${email}', '${nationality}', ${stateId}, ${lgaId}, '${sex}', '${maritalStatus}', '${dateOfBirth}', '${nin}', '${photo}')`;

  await db.query(queryInsertOperator);
  res.status(StatusCodes.CREATED).json({ mssg: 'Awaiting verification' });
};

// Function to sign up admins

const signUpAdmin = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (!email || !password || !confirmPassword) {
    throw new BadRequestError('Please provide all fields.');
  }

  if (!regex.test(email)) {
    throw new BadRequestError('Please provide a valid email');
  }

  let queryAdmin = `SELECT * FROM admins where email='${email}'`;
  let [result] = await db.query(queryAdmin);

  if (result.length == 1) throw new BadRequestError('Email already exists.');

  if (password !== confirmPassword)
    throw new BadRequestError("Passwords don't match.");

  const hashedPassword = await bcrypt.hash(password, 10);
  let queryInsertAdmin = `INSERT INTO admins (email, password) VALUES ('${email}', '${hashedPassword}')`;

  await db.query(queryInsertAdmin);

  let query = `SELECT * FROM admins WHERE email='${email}'`;
  [[result]] = await db.query(query);
  const { id } = result;
  const role = 'admin';
  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res.status(StatusCodes.CREATED).json({ mssg: 'Admin created', token });
};

// Function to log in users

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError('Please provide email and password');

  let query = `SELECT * FROM admins WHERE email='${email}'`;
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
    .json({ mssg: `${email} logged in successfully`, token });
};

const verifyOperator = async (req, res) => {
  const { email, verified } = req.body;
  const { role } = req.user;

  if (role !== 'admin') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  let queryVerified = `SELECT verified FROM operators_biodata WHERE email='${email}'`;
  let [[result]] = await db.query(queryVerified);

  if (result.verified === 1) {
    throw new BadRequestError('Operator already verified.');
  }

  let queryUpdateVerified = `UPDATE operators_biodata SET verified=${verified} WHERE email='${email}'`;
  await db.query(queryUpdateVerified);
  res.status(StatusCodes.OK).json({ mssg: 'Operator verified' });
};

module.exports = {
  signUp,
  completeProfile,
  login,
  signUpAdmin,
  loginAdmin,
  verifyOperator,
};
