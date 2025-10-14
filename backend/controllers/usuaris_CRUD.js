const pool = require('../config/db');

// ───────────── CREATE ──────────────────────────────────
async function createUser({ administrador = false, nom, cognom, telefon, correu_electronic, contrassenya, actiu = true}) {

  const sql = `
    INSERT INTO usuaris (administrador, nom, cognom, telefon, correu_electronic, contrassenya, actiu)
    VALUES (?,?,?,?,?,?,?)`;
  const [result] = await pool.execute(sql, [
    administrador,
    nom,
    cognom,
    telefon,
    correu_electronic,
    contrassenya,
    actiu
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

async function getAllUsers({ actiu } = {}) {
  const params = [];
  let where = '';
  if (actiu === 0 || actiu === 1) { where = 'WHERE u.actiu = ?'; params.push(actiu); }

  const [rows] = await pool.query(
    `
    SELECT
      u.*,
      (SELECT COUNT(*) FROM anuncis a WHERE a.usuari_id = u.usuari_id) AS num_anuncis
    FROM usuaris u
    ${where}
    ORDER BY u.creat_el DESC
    `,
    params
  );
  return rows;
}

const toSQL = v => (v === undefined ? null : v);

// ───────────── UPDATE ──────────────────────────────────
async function updateUser(id, fields) {
  const cols = [];
  const vals = [];
  const add = (sqlFrag, v) => { cols.push(sqlFrag); vals.push(toSQL(v)); };

  if ('administrador' in fields) { add('administrador = ?', !!fields.administrador); }
  if ('nom' in fields) { add('nom = ?', fields.nom); }
  if ('cognom' in fields) { add('cognom = ?', fields.cognom); }
  if ('telefon' in fields) { add('telefon = ?', fields.telefon); }
  if ('correu_electronic' in fields) { add('correu_electronic = ?', fields.correu_electronic); }
  if ('contrassenya' in fields) { add('contrassenya = ?', fields.contrassenya); }
  if ('actiu' in fields) add('actiu = ?', !!fields.actiu);

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
    SELECT usuari_id, administrador, nom, cognom, telefon, correu_electronic, actiu, creat_el, actualitzat_el
    FROM usuaris
    WHERE correu_electronic = ? AND contrassenya = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [correu_electronic, contrassenya]);
  const u = rows[0] || null;
  if (u && !u.actiu) return null;
  return u;
}

// ───────────── PATCH actiu ─────────────────────────────
async function setUserActive(id, actiu) {
  const [r] = await pool.execute(
    'UPDATE usuaris SET actiu = ?, actualitzat_el = CURRENT_TIMESTAMP WHERE usuari_id = ?',
    [!!actiu, id]
  );
  return r.affectedRows > 0;
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser,
  setUserActive
};
