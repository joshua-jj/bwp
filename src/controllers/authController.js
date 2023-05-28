const db = require('../db/connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError } = require('../errors');

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

  if (result.length) throw new BadRequestError('Email already exists.');

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
  res
    .status(StatusCodes.CREATED)
    .json({ status: StatusCodes.CREATED, message: 'User created', token });
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
    .json({
      status: StatusCodes.OK,
      message: `${email} logged in successfully`,
      token,
    });
};

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

  if (result.length) throw new BadRequestError('Email already exists.');

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
  res
    .status(StatusCodes.CREATED)
    .json({ status: StatusCodes.CREATED, message: 'Admin created', token });
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
    .json({
      status: StatusCodes.OK,
      message: `${email} logged in successfully`,
      token,
    });
};

const loginTest = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide all fields.');
  }

  let queryGetCandidate = `SELECT * FROM sessions WHERE field_officer_email = '${email}'`;
  const [resultQueryCandidate] = await db.query(queryGetCandidate);

  if (!resultQueryCandidate.length)
    throw new BadRequestError('Invalid email');
  
  if (password !== resultQueryCandidate[0].password) throw new BadRequestError('Invalid password');
  const id = null;
  const role = 'candidate';

  const token = jwt.sign({ id, email, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });
  res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, message: 'Success', token });
};

module.exports = {
  signUp,
  login,
  signUpAdmin,
  loginAdmin,
  loginTest,
};
