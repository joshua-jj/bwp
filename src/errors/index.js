const CustomAPIError = require('./customError.js');
const BadRequestError = require('./badRequestError.js');
const AuthorizationError = require('./unauthenticatedError.js');
const NotFoundError = require('./notFoundError.js');

module.exports = {
  CustomAPIError,
  BadRequestError,
  AuthorizationError,
  NotFoundError,
};
