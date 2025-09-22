const pool = require('../config/db');

// ───────────── CREATE ──────────────────────────────────
async function createUser({ administrador = false, nom, cognom, telefon, correu_electronic, contrassenya }) {

  const sql = `
    INSERT INTO usuaris (administrador, nom, cognom, telefon, correu_electronic, contrassenya)
    VALUES (?,?,?,?,?,?)`;
  const [result] = await pool.execute(sql, [
    administrador,
    nom,
    cognom,
    telefon,
    correu_electronic,
    contrassenya
  ]);

  return result.insertId;
}

// ───────────── READ ────────────────────────────────────
async function getUserById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM usuaris WHERE usuari_id = ?', [id]
  );
  return rows[0] || null;
}

async function getAllUsers() {
  const [rows] = await pool.query('SELECT * FROM usuaris');
  return rows;
}

// ───────────── UPDATE ──────────────────────────────────
async function updateUser(id, fields) {
  const cols = [];
  const vals = [];

  if (fields.administrador !== undefined) cols.push('administrador = ?'); vals.push(fields.administrador);
  if (fields.nom !== undefined) cols.push('nom = ?'); vals.push(fields.nom);
  if (fields.cognom !== undefined) cols.push('cognom = ?'); vals.push(fields.cognom);
  if (fields.telefon !== undefined) { cols.push('telefon = ?'); vals.push(fields.telefon); }
  if (fields.correu_electronic !== undefined) cols.push('correu_electronic = ?'); vals.push(fields.correu_electronic);
  if (fields.contrassenya !== undefined) cols.push('contrassenya = ?'); vals.push(fields.contrassenya);

  if (cols.length === 0) return false;

  vals.push(id);
  const sql = `UPDATE usuaris SET ${cols.join(', ')} WHERE usuari_id = ?`;
  const [result] = await pool.execute(sql, vals);
  return result.affectedRows > 0;
}

// ───────────── DELETE ──────────────────────────────────
async function deleteUser(id) {
  const [result] = await pool.execute(
    'DELETE FROM usuaris WHERE usuari_id = ?', [id]
  );
  return result.affectedRows > 0;
}

// ───────────── LOGIN ────────────────────────────────────
async function loginUser(correu_electronic, contrassenya) {
  const sql = `
    SELECT usuari_id, administrador, nom, cognom, telefon, correu_electronic, creat_el, actualitzat_el
    FROM usuaris
    WHERE correu_electronic = ? AND contrassenya = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [correu_electronic, contrassenya]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser
};
