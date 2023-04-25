const jwt = require('jsonwebtoken');
const { AuthorizationError } = require('../errors');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new AuthorizationError('No token provided.');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { userID, firstName } = decoded;
      req.user = { userID, firstName };
      next();
    } catch (err) {
      throw new AuthorizationError('Not authorized to access this route');
    }
}

module.exports = authenticateToken;