const db = require('../db/connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, AuthorizationError } = require('../errors');

// Function to register new users

const signUp = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword) {
    throw new BadRequestError('Please provide all fields.');
  }

  let queryOperator = `SELECT * FROM operators where email='${email}'`;
  let [result] = await db.query(queryOperator);

  if (result.length == 1) throw new BadRequestError('Email already exists.');
  res.status(StatusCodes.CREATED).json({ mssg: 'User created' });
}

const completeProfile = async (req, res) => {
  // const { firstName, lastName, username, email, password, confirmPassword } = req.body;
  // if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
  //   throw new BadRequestError('Please provide all fields.');
  // }

  // if (username.includes(' ')) throw new BadRequestError('Username cannot contain whitespace');

  // if (password !== confirmPassword) throw new BadRequestError("Passwords don't match.");

  // let queryUser = `SELECT * FROM users where username='${username}'`;
  // let [result] = await db.query(queryUser);

  // if (result.length == 1) throw new BadRequestError('Username already exists.');

  // let queryEmail = `SELECT * FROM users where email='${email}'`;
  // [result] = await db.query(queryEmail);

  // if (result.length == 1) throw new BadRequestError('Email already exists.');

  // // Hash password
  // const hash = await bcrypt.hash(password, 10);
  // let queryInsertUser = `INSERT INTO users (first_name, last_name, username, email, password) VALUES ('${firstName}', '${lastName}','${username}', '${email}', '${hash}')`;

  // await db.query(queryInsertUser);
  // res.status(StatusCodes.CREATED).json({ mssg: 'User created' });
  res.status(StatusCodes.CREATED).json({ mssg: 'Profile verified' });
};


// Function to log in users

const login = async (req, res) => {
  const { username, password } = req.body;
  // if (!username || !password)
  //   throw new BadRequestError('Please provide username and password');

  // let query = `SELECT * FROM users WHERE username='${username}'`;
  // const [[result]] = await db.query(query);
  // if (!result) throw new AuthorizationError('Invalid username or password');

  // let match = await bcrypt.compare(password, result.password);

  // if (!match) throw new AuthorizationError('Invalid username or password');
  // const { id: userID, first_name: firstName } = result;
  // const token = jwt.sign({ userID, firstName }, process.env.ACCESS_TOKEN_SECRET, {
  //   expiresIn: '60d',
  // });
  // res.status(StatusCodes.OK).json({ mssg: result, token });
  res.status(StatusCodes.OK).json({ mssg: 'Logged in' });
};

module.exports = { signUp, completeProfile, login };
