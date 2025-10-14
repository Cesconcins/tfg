// routes/rutes_imatges_anuncis.js
const express = require('express');
const router  = express.Router();

const upload        = require('../middlewares/upload');
const pool          = require('../config/db');
const auth          = require('../middlewares/auth');
const ownerOrAdmin  = require('../middlewares/propietariOAdminAnunci');
const path          = require('path');
const fs            = require('fs');

// GET /anuncis/:id/imatges  → llistat d’imatges (per galeria)
router.get('/:id/imatges', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      `SELECT imatge_id, filename, ordre
       FROM imatge_anunci
       WHERE anunci_id = ?
       ORDER BY ordre ASC, imatge_id ASC`, [id]
    );
    // afegim url pública
    const out = rows.map(r => ({ ...r, url: `/uploads/anuncis/${r.filename}` }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obtenint imatges' });
  }
});

// POST /anuncis/:id/imatges
router.post('/:id/imatges', auth, ownerOrAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const anunciId = Number(req.params.id);
    if (!req.files?.length) return res.status(400).json({ error: 'Cap fitxer rebut' });

    // ordre inicial
    const [[m]] = await pool.query(
      'SELECT COALESCE(MAX(ordre), -1) AS maxo FROM imatge_anunci WHERE anunci_id = ?',
      [anunciId]
    );
    let start = (m?.maxo ?? -1) + 1;

    // placeholders (?,?,?) per cada fila
    const placeholders = req.files.map(() => '(?,?,?)').join(', ');
    const params = [];
    req.files.forEach((f, i) => {
      params.push(anunciId, f.filename, start + i);
    });

    const sql = `INSERT INTO imatge_anunci (anunci_id, filename, ordre) VALUES ${placeholders}`;
    await pool.query(sql, params);

    res.status(201).json({
      ok: true,
      files: req.files.map(f => ({ filename: f.filename, url: `/uploads/anuncis/${f.filename}` }))
    });
  } catch (e) {
    console.error('POST /anuncis/:id/imatges', e);
    res.status(500).json({ error: 'Error pujant imatges' });
  }
});

// PATCH /anuncis/:id/imatges/ordre  (reordenar)
router.patch('/:id/imatges/ordre', auth, ownerOrAdmin, async (req, res) => {
  try {
    const anunciId = Number(req.params.id);
    const items = Array.isArray(req.body) ? req.body : [];
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const it of items) {
        await conn.execute(
          'UPDATE imatge_anunci SET ordre = ? WHERE imatge_id = ? AND anunci_id = ?',
          [Number(it.ordre) || 0, Number(it.imatge_id), anunciId]
        );
      }
      await conn.commit();
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error reordenant imatges' });
  }
});

// DELETE /anuncis/:id/imatges/:imgId  (eliminar)
router.delete('/:id/imatges/:imgId', auth, ownerOrAdmin, async (req, res) => {
  try {
    const anunciId = Number(req.params.id);
    const imgId    = Number(req.params.imgId);

    const [[row]] = await pool.query(
      'SELECT filename FROM imatge_anunci WHERE imatge_id = ? AND anunci_id = ?',
      [imgId, anunciId]
    );
    if (!row) return res.status(404).json({ error: 'Imatge no trobada' });

    await pool.execute(
      'DELETE FROM imatge_anunci WHERE imatge_id = ? AND anunci_id = ?',
      [imgId, anunciId]
    );

    // ESBORRA fitxer de disc (ruta correcta a backend/public/uploads/anuncis)
    const abs = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'anuncis', row.filename);
    fs.promises.unlink(abs).catch(() => {}); // no trenquis si no hi és

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminant imatge' });
  }
});

// GET /anuncis/:id/portada  → redirect a la primera imatge
router.get('/:id/portada', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      `SELECT filename
       FROM imatge_anunci
       WHERE anunci_id = ?
       ORDER BY ordre ASC, imatge_id ASC
       LIMIT 1`, [id]
    );
    if (!rows.length) return res.status(404).end();
    res.redirect(302, `/uploads/anuncis/${rows[0].filename}`);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obtenint portada' });
  }
});

module.exports = router;
