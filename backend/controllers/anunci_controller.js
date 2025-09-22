// controllers/anunci_controller.js
const model = require('../models/anunci_model');

async function llistar(_req, res) {
  try {
    const anuncis = await model.llistar();
    res.json(anuncis);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obtenint anuncis' });
  }
}

async function detall(req, res) {
  try {
    const a = await model.obtenirPerId(req.params.id);
    if (!a) return res.status(404).json({ error: 'No trobat' });
    res.json(a);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obtenint l’anunci' });
  }
}

async function crear(req, res) {
  try {
    const uid = req.usuari.usuari_id;
    const id = await model.crear(uid, req.body);
    res.status(201).json({ anunci_id: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creant anunci' });
  }
}

async function actualitzar(req, res) {
  try {
    const ok = await model.actualitzar(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'No trobat o sense canvis' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualitzant anunci' });
  }
}

async function eliminar(req, res) {
  try {
    const ok = await model.esborrar(req.params.id);
    if (!ok) return res.status(404).json({ error: 'No trobat' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminant anunci' });
  }
}

async function canviarEstat(req, res) {
  try {
    const { estat } = req.body; // 'pendent' | 'validat' | 'rebutjat'
    const ok = await model.canviarEstat(req.params.id, estat);
    if (!ok) return res.status(404).json({ error: 'No trobat o estat invàlid' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error canviant estat' });
  }
}

module.exports = { llistar, detall, crear, actualitzar, eliminar, canviarEstat };
