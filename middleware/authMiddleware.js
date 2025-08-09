const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ msg: 'Accès refusé' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    return next();
  } catch (e) {
    return res.status(401).json({ msg: 'Token invalide' });
  }
}

module.exports = auth;
