// middlewares/filtres_anuncis.js
const buildNumber = v => (v === '' || v == null ? null : Number(v));

function buildListQuery(q) {
  const where = [];
  const params = [];
  let select = `
    SELECT
      a.anunci_id, a.usuari_id, a.nom, a.raca, a.preu, a.data_naixement,
      a.capa, a.alcada, a.pes, a.sexe, a.lat, a.lon, a.destacat,
      a.estat, a.disponibilitat, a.venut_el, a.creat_el, a.actualitzat_el,
      GROUP_CONCAT(DISTINCT d.nom ORDER BY d.nom SEPARATOR ',') AS disciplines_txt
    FROM anuncis a
    LEFT JOIN anunci_disciplina ad ON ad.anunci_id = a.anunci_id
    LEFT JOIN disciplines d       ON d.disciplina_id = ad.disciplina_id
  `;

  // ─────────────────────────────────────────────────────────────
  // ESTAT
  // Públic (per defecte): només validats.
  // Admin (sense canviar controladors): si arriba ?all=1 o ?estat=..., no es força 'validat'.
  const isAll = q.all === '1' || q.all === 1 || q.all === true;
  const estatQ = typeof q.estat === 'string' ? q.estat.trim() : '';
  const estatValid = ['pendent','validat','rebutjat','eliminat'].includes(estatQ);

  if (!isAll && !estatValid) {
    // llistat públic
    where.push(`a.estat = 'validat'`);
  } else if (estatValid) {
    // filtre explícit per admin
    where.push('a.estat = ?');
    params.push(estatQ);
  }
  // si ?all=1 → sense filtre d'estat

  // ─────────────────────────────────────────────────────────────
  // DISPONIBILITAT
  const dispQ = (q.disponibilitat ?? '').toString().trim();
  const disponibilitatValida = ['actiu','venut','baixa'].includes(dispQ);
  if (!isAll && !disponibilitatValida) {
    where.push(`a.disponibilitat = 'actiu'`);
  } else if (disponibilitatValida) {
    where.push('a.disponibilitat = ?'); params.push(dispQ);
  }

  // ─────────────────────────────────────────────────────────────
  // TEXTUALS
  if (q.nom)  { where.push('a.nom  LIKE ?'); params.push(`%${q.nom}%`); }
  if (q.raca) { where.push('a.raca LIKE ?'); params.push(`%${q.raca}%`); }
  if (q.capa) { where.push('a.capa LIKE ?'); params.push(`%${q.capa}%`); }

  // ─────────────────────────────────────────────────────────────
  // RANGS
  const preuMin   = buildNumber(q.preu_min);
  const preuMax   = buildNumber(q.preu_max);
  const alcMin    = buildNumber(q.alcada_min);
  const alcMax    = buildNumber(q.alcada_max);
  const pesMin    = buildNumber(q.pes_min);
  const pesMax    = buildNumber(q.pes_max);
  const edatMin   = buildNumber(q.edat_min);
  const edatMax   = buildNumber(q.edat_max);

  if (preuMin != null) { where.push('a.preu >= ?');   params.push(preuMin); }
  if (preuMax != null) { where.push('a.preu <= ?');   params.push(preuMax); }
  if (alcMin  != null) { where.push('a.alcada >= ?'); params.push(alcMin); }
  if (alcMax  != null) { where.push('a.alcada <= ?'); params.push(alcMax); }
  if (pesMin  != null) { where.push('a.pes >= ?');    params.push(pesMin); }
  if (pesMax  != null) { where.push('a.pes <= ?');    params.push(pesMax); }

  // Sexe (llista)
  if (q.sexe) {
    const arr = (Array.isArray(q.sexe) ? q.sexe : String(q.sexe).split(','))
      .map(s => s.trim()).filter(Boolean);
    if (arr.length) {
      where.push(`a.sexe IN (${arr.map(()=>'?').join(',')})`);
      params.push(...arr);
    }
  }

  // Edat → data_naixement
  if (edatMin != null) {
    where.push('a.data_naixement <= DATE_SUB(CURDATE(), INTERVAL ? YEAR)');
    params.push(edatMin);
  }
  if (edatMax != null) {
    where.push('a.data_naixement >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)');
    params.push(edatMax);
  }

  // Disciplines (almenys una)
  if (q.disciplines) {
    const ids = (Array.isArray(q.disciplines) ? q.disciplines : String(q.disciplines).split(','))
      .map(Number).filter(Boolean);
    if (ids.length) {
      where.push(`ad.disciplina_id IN (${ids.map(()=>'?').join(',')})`);
      params.push(...ids);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Radi
  const lat0 = buildNumber(q.lat), lon0 = buildNumber(q.lon), radi = buildNumber(q.radi_km);
  let orderParts = [];
  if (lat0 != null && lon0 != null && radi != null) {
    select = `
      SELECT
        a.anunci_id, a.usuari_id, a.nom, a.raca, a.preu, a.data_naixement,
        a.capa, a.alcada, a.pes, a.sexe, a.lat, a.lon, a.destacat,
        a.estat, a.disponibilitat, a.venut_el, a.creat_el, a.actualitzat_el,
        GROUP_CONCAT(DISTINCT d.nom ORDER BY d.nom SEPARATOR ',') AS disciplines_txt,
        ( 6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(a.lat)) *
            COS(RADIANS(a.lon) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(a.lat))
          ) ) AS distancia_km
      FROM anuncis a
      LEFT JOIN anunci_disciplina ad ON ad.anunci_id = a.anunci_id
      LEFT JOIN disciplines d       ON d.disciplina_id = ad.disciplina_id
    `;
    // per al SELECT
    params.unshift(lat0, lon0, lat0);
    // per al WHERE
    where.push(`
      ( 6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(a.lat)) *
          COS(RADIANS(a.lon) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(a.lat))
        ) ) <= ?
    `);
    params.push(lat0, lon0, lat0, radi);
    where.push('a.lat IS NOT NULL AND a.lon IS NOT NULL');
    orderParts.push('distancia_km ASC');
  }

  // ─────────────────────────────────────────────────────────────
  // ORDENACIÓ
  // 1) Per estat personalitzat (?estat_order=a,b,c) — útil per admin
  if (q.estat_order) {
    const ordre = String(q.estat_order).split(',').map(s=>s.trim()).filter(Boolean);
    if (ordre.length) {
      orderParts.unshift(`FIELD(a.estat, ${ordre.map(()=>'?').join(',')})`);
      params.push(...ordre);
    }
  }

  // 2) Ordenació secundària (?sort=creat_el | -creat_el | actualitzat_el | -preu | anunci_id …)
  const secondary = q.sort?.toString() || '';
  if (secondary) {
    const col = secondary.replace(/^-/, '');
    if (['creat_el','actualitzat_el','preu','anunci_id'].includes(col)) {
      orderParts.push(`a.${col} ${secondary.startsWith('-') ? 'DESC' : 'ASC'}`);
    }
  }

  // 3) Per defecte: públic → destacat + recent; admin → recent
  if (!orderParts.length) {
    if (!isAll && !estatValid) {
      orderParts = ['a.destacat DESC', 'a.creat_el DESC'];
    } else {
      orderParts = ['a.creat_el DESC'];
    }
  }

  const limit  = Number(q.limit || 60);
  const offset = Number(q.offset || 0);

  const sql = `
    ${select}
    WHERE ${where.length ? where.join(' AND ') : '1=1'}
    GROUP BY a.anunci_id
    ORDER BY ${orderParts.join(', ')}
    LIMIT ${limit} OFFSET ${offset}
  `;
  return { sql, params };
}

function postProcess(rows) {
  return rows.map(r => ({
    ...r,
    disciplines: r.disciplines_txt
      ? r.disciplines_txt.split(',').map(n => ({ nom: n }))
      : []
  }));
}

async function llistarAmbFiltres(pool, q) {
  const { sql, params } = buildListQuery(q);
  const [rows] = await pool.query(sql, params);
  return postProcess(rows);
}

module.exports = { buildListQuery, llistarAmbFiltres };
