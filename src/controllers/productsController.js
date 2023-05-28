const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');

const selectProduct = async (req, res) => {
  const { product, seed } = req.body;
  const { email } = req.user;

  // if (role !== 'operator') {
  //   throw new ForbiddenError('You are not allowed to access this route');
  // }

  let queryProductId = `SELECT id FROM products WHERE product='${product}'`;
  let querySeedId = `SELECT id FROM seeds WHERE seed='${seed}'`;
  let querySeedProductId = `SELECT product_id FROM seeds WHERE seed='${seed}'`;

  const [[productIdQuery]] = await db.query(queryProductId);
  const [[seedIdQuery]] = await db.query(querySeedId);

  // Verify valid state and LGA
  if (!productIdQuery) throw new BadRequestError('Invalid product selected');
  if (!seedIdQuery) throw new BadRequestError(`Invalid seed selected`);

  const { id: productId } = productIdQuery;
  const { id: seedId } = seedIdQuery;
  const [[{ product_id: seedProductId }]] = await db.query(querySeedProductId);

  if (productId !== seedProductId)
    throw new BadRequestError(`${seed} does not belong to ${product}`);

  let queryUpdateOperator = `UPDATE operators_details SET product_id=${productId}, seed_id='${seedId}' WHERE email='${email}'`;
  await db.query(queryUpdateOperator);

  res
    .status(StatusCodes.CREATED)
    .json({ status: StatusCodes.CREATED, message: 'Success' });
};

module.exports = { selectProduct };
