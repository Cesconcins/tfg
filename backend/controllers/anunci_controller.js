const pool    = require('../config/db');
const model   = require('../models/anunci_model');
const filtres = require('../middlewares/filtres_anuncis');
// Importem NOMÉS el que necessitem del model de revisions
const { afegir: afegirRevisio } = require('../models/revisio_anunci_model');

// Llistat públic (o amb filtres via query). Per defecte, només 'validat' (gestionat al middleware).
async function llistar(req, res) {
  try {
    const rows = await filtres.llistarAmbFiltres(pool, req.query);
    res.json(rows);
  } catch (e) {
    console.error('[anuncis] Error llistant amb filtres:', e);
    res.status(500).json({ error: 'Error llistant anuncis' });
  }
}

async function detall(req, res) {
  try {
    const a = await model.obtenirPerId(req.params.id);
    if (!a) return res.status(404).json({ error: 'No trobat' });
    res.json(a);
  } catch (e) {
    console.error('[anuncis] Error detall:', e);
    res.status(500).json({ error: 'Error obtenint l’anunci' });
  }
}

async function crear(req, res) {
  try {
    const uid = req.usuari?.usuari_id;
    if (!uid) return res.status(401).json({ error: 'No autenticat' });
    const id = await model.crear(uid, req.body);
    res.status(201).json({ anunci_id: id });
  } catch (e) {
    console.error('[anuncis] Error creant:', e);
    res.status(500).json({ error: 'Error creant anunci' });
  }
}

async function actualitzar(req, res) {
  try {
    const ok = await model.actualitzar(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'No trobat o sense canvis' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[anuncis] Error actualitzant:', e);
    res.status(500).json({ error: 'Error actualitzant anunci' });
  }
}

async function eliminar(req, res) {
  try {
    const ok = await model.esborrar(req.params.id);
    if (!ok) return res.status(404).json({ error: 'No trobat' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[anuncis] Error eliminant:', e);
    res.status(500).json({ error: 'Error eliminant anunci' });
  }
}

/**
 * PATCH /anuncis/:id/estat
 * Body: { estat: 'validat' | 'rebutjat', motiu?: string }
 * Requereix: auth + adminOnly (a la ruta)
 */
async function canviarEstat(req, res) {
  try {
    const anunciId = Number(req.params.id);
    const { estat, motiu } = req.body || {};
    const admin = req.usuari;

    // Validacions bàsiques
    if (!admin || Number(admin.administrador) !== 1) {
      return res.status(403).json({ error: 'Només administradors' });
    }
    if (!Number.isFinite(anunciId)) {
      return res.status(400).json({ error: 'ID invàlid' });
    }
    if (!['validat', 'rebutjat'].includes(estat)) {
      return res.status(400).json({ error: 'Estat invàlid' });
    }
    if (estat === 'rebutjat' && (!motiu || !motiu.trim())) {
      return res.status(400).json({ error: 'Cal motiu per rebutjar' });
    }

    // 1) Update estat a la taula principal
    let r;
    try {
      [r] = await pool.execute(
        'UPDATE anuncis SET estat = ?, actualitzat_el = CURRENT_TIMESTAMP WHERE anunci_id = ?',
        [estat, anunciId]
      );
    } catch (dbErr) {
      console.error('[anuncis] UPDATE error:', {
        message: dbErr?.message,
        code: dbErr?.code,
        errno: dbErr?.errno,
        sqlMessage: dbErr?.sqlMessage,
        sqlState: dbErr?.sqlState
      });
      return res.status(500).json({ error: 'Error canviant estat' });
    }
    if (!r.affectedRows) {
      return res.status(404).json({ error: 'Anunci no trobat' });
    }

    // 2) Registre d’històric de revisió (no bloquejant si falla)
    try {
      await afegirRevisio({
        anunci_id: anunciId,
        usuari_id: admin.usuari_id,
        motiu: estat === 'rebutjat' ? motiu.trim() : null
      });
    } catch (e) {
      console.error('[revisio_anunci] insert error:', {
        message: e?.message,
        code: e?.code,
        errno: e?.errno,
        sqlMessage: e?.sqlMessage,
        sqlState: e?.sqlState
      });
      // NO bloquegem la resposta per un error d'històric
    }

    // 3) Retorna l’anunci actualitzat
    const a = await model.obtenirPerId(anunciId);
    res.json(a);
  } catch (e) {
    console.error('[anuncis] canviarEstat error:', e);
    res.status(500).json({ error: 'Error canviant estat' });
  }
}

async function canviarDisponibilitat(req, res) {
  try {
    const id = Number(req.params.id);
    const disp = String(req.body?.disponibilitat || '').trim();
    if (!['actiu','venut','baixa'].includes(disp)) {
      return res.status(400).json({ error: 'disponibilitat invàlida' });
    }
    const ok = await model.canviarDisponibilitat(id, disp);
    if (!ok) return res.status(404).json({ error: 'No trobat' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[anuncis] canviarDisponibilitat error:', e);
    res.status(500).json({ error: 'Error canviant disponibilitat' });
  }
}

async function anunciDestacat(req, res) {
  try {
    const admin = req.usuari;
    if (!admin || Number(admin.administrador) !== 1) {
      return res.status(403).json({ error: 'Només administradors' });
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID invàlid' });

    const raw = req.body?.destacat;
    const val = raw === true || raw === 1 || raw === '1' || raw === 'true';

    const ok = await model.anunciDestacat(id, val);
    if (!ok) return res.status(404).json({ error: 'No trobat' });

    // Opcional: retorna l’anunci actualitzat
    const a = await model.obtenirPerId(id);
    res.json(a);
  } catch (e) {
    console.error('[anuncis] anunciDestacat error:', e);
    res.status(500).json({ error: 'Error canviant destacat' });
  }
}

module.exports = {
  llistar,
  detall,
  crear,
  actualitzar,
  eliminar,
  canviarEstat,
  canviarDisponibilitat,
  anunciDestacat
};
