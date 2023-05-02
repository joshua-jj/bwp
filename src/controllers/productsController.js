const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, ForbiddenError } = require('../errors');
const { products } = require('../data');

const selectProduct = async (req, res) => {
  const { product, seed } = req.body;
  const { id, role } = req.user;

  if (role !== 'operator') {
    throw new ForbiddenError('You are not allowed to access this route');
  }

  let queryOperator = `SELECT * FROM operators_biodata WHERE operator_id=${id}`;
  const [[result]] = await db.query(queryOperator);

  if (!result.verified) {
    throw new BadRequestError('Registration not yet completed');
  }

  if (product !== 'maize' && product !== 'rice') {
    throw new BadRequestError('Invalid product selected');
  }

  if (!products[product].includes(seed)) {
    throw new BadRequestError('Seed does not belong to product');
  }

  res.status(StatusCodes.CREATED).json({ mssg: 'Success' });
};

module.exports = { selectProduct };
