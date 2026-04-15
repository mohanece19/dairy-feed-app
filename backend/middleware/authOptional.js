const jwt = require('jsonwebtoken');

module.exports = function authOptional(req, res, next) {
  const header = req.headers.authorization;

  // No token → continue as guest
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // invalid token → ignore instead of blocking
    req.user = null;
  }

  next();
};
