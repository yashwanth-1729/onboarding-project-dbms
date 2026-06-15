const jwt = require('jsonwebtoken');
const { JWT_SECRET, INTERNAL_KEY } = require('../config');

// Verify the JWT issued by Spring Boot (HS256, same secret). Optionally enforce
// a required role. Populates req.userEmail / req.userRole on success.
function authRequired(role) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or malformed token.' });
    }
    try {
      const decoded = jwt.verify(header.slice(7), JWT_SECRET);
      req.userEmail = decoded.sub;
      req.userRole = decoded.role;
      if (role && decoded.role !== role) {
        return res.status(403).json({ message: 'Forbidden: requires ' + role + ' role.' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
}

// Guard for server-to-server calls (Spring Boot logging activity). Spring Boot
// has no user JWT during events like login, so it authenticates with a shared key.
function internalOnly(req, res, next) {
  if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
    return res.status(403).json({ message: 'Forbidden: internal endpoint.' });
  }
  next();
}

module.exports = { authRequired, internalOnly };
