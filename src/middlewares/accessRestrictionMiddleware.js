const db = require('../db/connect');
const { ForbiddenError } = require('../errors');

const restrictAccessOperator = async (req, res, next) => {
  const { id, role } = req.user;

  if (role !== 'operator') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  let queryOperator = `SELECT * FROM operators_details WHERE user_id=${id}`;
  const [[result]] = await db.query(queryOperator);

  if (!result || !result.verified) {
    throw new ForbiddenError(
      'You have not been verified. You cannot perform this operation.'
    );
  }

  next();
};

const restrictAccessAdmin = async (req, res, next) => {
  const { role } = req.user;

  if (role !== 'admin') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  next();
};

const restrictAccessTestCandidate = async (req, res, next) => {
  const { role } = req.user;

  if (role !== 'candidate') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  next();
};

module.exports = {
  restrictAccessOperator,
  restrictAccessAdmin,
  restrictAccessTestCandidate,
};
