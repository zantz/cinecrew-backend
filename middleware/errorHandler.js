module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Erreur serveur';
  res.status(status).json({ error: message });
};
