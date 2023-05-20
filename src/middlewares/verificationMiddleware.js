const db = require('../db/connect');
const { ForbiddenError } = require('../errors');

const checkVerification = async (req, res, next) => {
  const { id, role } = req.user;
  if (role !== 'operator') return next();
  let queryOperator = `SELECT * FROM operators_details WHERE user_id=${id}`;
  const [[result]] = await db.query(queryOperator);

  if (!result || !result.verified) {
    throw new ForbiddenError(
      'You have not been verified. You cannot perform this operation.'
    );
  }

  next();
};

module.exports = checkVerification;
