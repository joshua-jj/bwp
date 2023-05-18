const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');

const recruitFieldOfficers = async (req, res) => {
  const { id, email, role } = req.user;
  
  res.status(StatusCodes.OK).json({message: 'Success'})
};

module.exports = { recruitFieldOfficers };
