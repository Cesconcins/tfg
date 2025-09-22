const pool = require('../config/db');

module.exports = async function propietariOAdmin(req, res, next) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      'SELECT anunci_id, usuari_id, estat FROM anuncis WHERE anunci_id = ?',
      [id]
    );
    const a = rows[0];
    if (!a) return res.status(404).json({ error: 'Anunci no trobat' });

    req.anunci = a;
    if (req.usuari?.administrador) return next();
    if (req.usuari && a.usuari_id === req.usuari.usuari_id) return next();
    return res.status(403).json({ error: 'Prohibit' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error validant permisos' });
  }
}

