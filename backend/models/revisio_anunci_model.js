
const pool = require('../config/db');

/**
 * Afegeix una entrada d'històric de revisió d'un anunci.
 * @param {Object} args
 * @param {number} args.anunci_id
 * @param {number} args.usuari_id   // admin que revisa
 * @param {string|null} args.motiu   // motiu si rebutjat; null si validat
 */
async function afegir({ anunci_id, usuari_id, motiu = null }) {
  const sql = `
    INSERT INTO revisio_anunci (anunci_id, usuari_id, motiu)
    VALUES (?, ?, ?)
  `;
  await pool.execute(sql, [anunci_id, usuari_id, motiu]);
}

// Llista l'històric de revisions d'un anunci (més recents primer).
async function llistarPerAnunci(anunci_id) {
  const [rows] = await pool.execute(
    `SELECT revisio_id, anunci_id, usuari_id, motiu, creat_el
     FROM revisio_anunci
     WHERE anunci_id = ?
     ORDER BY creat_el DESC`,
    [anunci_id]
  );
  return rows;
}

module.exports = { afegir, llistarPerAnunci };
