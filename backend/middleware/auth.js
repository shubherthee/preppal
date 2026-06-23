const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'preppal_secret_key_change_this_12345';

module.exports = function attachUser(req, res, next) {
  // Only protect API routes
  if (!req.path.startsWith('/api')) {
    return next();
  }

  // Allow login, register, and health endpoints without tokens
  if (req.path.endsWith('/users/login') || req.path.endsWith('/users/register') || req.path.endsWith('/health')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // decoded payload has the user ID
    req.userRole = decoded.role; // decoded payload has the user role
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
