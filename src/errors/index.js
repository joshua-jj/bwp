const CustomAPIError = require('./customError.js');
const BadRequestError = require('./badRequestError.js');
const UnauthorizedError = require('./unauthorizedError.js');
const NotFoundError = require('./notFoundError.js');
const ForbiddenError = require('./forbiddenError.js');

module.exports = {
  CustomAPIError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
};
