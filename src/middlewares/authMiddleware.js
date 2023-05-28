const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided.');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id, email, role } = decoded;
    req.user = { id, email, role };
    next();
  } catch (err) {
    throw new UnauthorizedError('Not authorized to access this route');
  }
};

module.exports = authenticateToken;
