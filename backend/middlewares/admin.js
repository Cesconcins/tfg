module.exports = function adminOnly(req, res, next) {
  if (!req.usuari || !req.usuari.administrador) {
    return res.status(403).json({ error: 'Prohibit' });
  }
  next();
};