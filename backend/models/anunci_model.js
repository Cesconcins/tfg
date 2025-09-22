const pool = require('../config/db');

function normalize(a) {
  return {
    ...a,
    destacat: a.destacat === 1 || a.destacat === '1' || a.destacat === true,
    preu: a.preu != null ? parseFloat(a.preu) : null,
    lat:  a.lat  != null ? parseFloat(a.lat)  : null,
    lon:  a.lon  != null ? parseFloat(a.lon)  : null
  };
}

async function llistar() {
  const [rows] = await pool.query(`
    SELECT anunci_id, usuari_id, nom, raca, preu, data_naixement,
           capa, alcada, pes, sexe, lat, lon, destacat, estat, descripcio,
           creat_el, actualitzat_el
    FROM anuncis
    ORDER BY creat_el DESC
  `);

  // adjuntem disciplines a cada anunci
  for (const a of rows) {
    const [d] = await pool.query(`
      SELECT d.nom
      FROM anunci_disciplina ad
      JOIN disciplines d ON d.disciplina_id = ad.disciplina_id
      WHERE ad.anunci_id = ?
    `, [a.anunci_id]);
    a.disciplines = d.map(x => ({ nom: x.nom }));
  }
  return rows.map(normalize);
}

async function obtenirPerId(id) {
  const [[a]] = await pool.query(`
    SELECT anunci_id, usuari_id, nom, raca, preu, data_naixement,
           capa, alcada, pes, sexe, lat, lon, destacat, estat, descripcio,
           creat_el, actualitzat_el
    FROM anuncis
    WHERE anunci_id = ?
  `, [id]);
  if (!a) return null;

  const [d] = await pool.query(`
    SELECT d.nom
    FROM anunci_disciplina ad
    JOIN disciplines d ON d.disciplina_id = ad.disciplina_id
    WHERE ad.anunci_id = ?
  `, [id]);
  a.disciplines = d.map(x => ({ nom: x.nom }));

  return normalize(a);
}

async function crear(usuari_id, body) {
  const {
    nom, raca, preu, data_naixement,
    capa, alcada, pes, sexe,
    lat, lon, descripcio, destacat = false
  } = body;

  const estat = 'pendent'; // nou anunci → pendent de validació

  const [res] = await pool.execute(`
    INSERT INTO anuncis
      (usuari_id, nom, raca, preu, data_naixement, capa, alcada, pes, sexe,
       lat, lon, destacat, estat, descripcio)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    usuari_id, nom, raca, preu, data_naixement || null,
    capa || null, alcada || null, pes || null, sexe || null,
    lat || null, lon || null, !!destacat, estat, descripcio || null
  ]);

  return res.insertId;
}

async function actualitzar(id, body) {
  const cols = [], vals = [];

  const allow = ['nom','raca','preu','data_naixement','capa','alcada','pes','sexe',
                 'lat','lon','descripcio','destacat'];
  for (const k of allow) {
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      cols.push(`${k} = ?`);
      vals.push(body[k]);
    }
  }

  // una edició torna a estat pendent (revisió)
  cols.push('estat = ?'); vals.push('pendent');

  if (!cols.length) return false;
  vals.push(id);

  const [r] = await pool.execute(
    `UPDATE anuncis SET ${cols.join(', ')}, actualitzat_el = CURRENT_TIMESTAMP WHERE anunci_id = ?`,
    vals
  );
  return r.affectedRows > 0;
}

async function esborrar(id) {
  const [r] = await pool.execute('DELETE FROM anuncis WHERE anunci_id = ?', [id]);
  return r.affectedRows > 0;
}

async function canviarEstat(id, nouEstat) {
  const [r] = await pool.execute(
    'UPDATE anuncis SET estat = ?, actualitzat_el = CURRENT_TIMESTAMP WHERE anunci_id = ?',
    [nouEstat, id]
  );
  return r.affectedRows > 0;
}

module.exports = {
  llistar,
  obtenirPerId,
  crear,
  actualitzar,
  esborrar,
  canviarEstat
};
