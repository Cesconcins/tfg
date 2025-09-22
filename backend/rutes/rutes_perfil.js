const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const pool    = require('../config/db');

// Perfil simple
router.get('/', auth, (req, res) => {
    res.json(req.usuari);
});

// Els meus anuncis
router.get('/anuncis', auth, async (req, res) => {
    try {
        const uid = req.usuari.usuari_id;
        const [rows] = await pool.query(
            `SELECT a.anunci_id, a.nom, a.preu, a.descripcio, a.destacat, a.data_naixement, a.raca, a.lat, a.lon
            FROM anuncis a
            WHERE a.usuari_id = ?
            ORDER BY a.creat_el DESC`,
            [uid]
        );

        // Disciplines per a cada anunci
        for (const a of rows) {
            const [d] = await pool.query(
                `SELECT d.nom FROM anunci_disciplina ad
                JOIN disciplines d ON d.disciplina_id = ad.disciplina_id
                WHERE ad.anunci_id = ?`,
                [a.anunci_id]
            );
            a.disciplines = d.map(x => ({ nom: x.nom }));
        }

        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error obtenint anuncis de l’usuari' });
    }
});

router.put('/', auth, async (req, res) => {
    try {
        const { nom, cognom, telefon, contrassenya } = req.body;
        const cols = [], vals = [];

        if (typeof nom !== 'undefined') { cols.push('nom = ?'); vals.push(nom); }
        if (typeof cognom !== 'undefined') { cols.push('cognom = ?'); vals.push(cognom); }
        if (typeof telefon !== 'undefined') { cols.push('telefon = ?'); vals.push(telefon || null); }
        if (typeof contrassenya !== 'undefined' && contrassenya !== '') { cols.push('contrassenya = ?'); vals.push(contrassenya); }

        if (!cols.length) return res.status(400).json({ error: 'Sense canvis' });

        vals.push(req.usuari.usuari_id);
        await pool.execute(
            `UPDATE usuaris SET ${cols.join(', ')}, actualitzat_el=CURRENT_TIMESTAMP WHERE usuari_id = ?`,
            vals
        );

        // torna el perfil fresc
        const [[u]] = await pool.execute(
            `SELECT usuari_id, nom, cognom, correu_electronic, telefon, administrador
            FROM usuaris WHERE usuari_id = ?`,
            [req.usuari.usuari_id]
        );

        res.json(u);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error actualitzant perfil' });
    }
});

// Placeholder: esdeveniments (quan en tingui)
router.get('/esdeveniments', auth, async (_req, res) => {
    res.json([]); // De moment buit
});

// DELETE compte de l'usuari autenticat
router.delete('/', auth, async (req, res) => {
  const uid = req.usuari.usuari_id;
  try {
    // Si tens FK, pot fallar si hi ha anuncis. Senzill: desassocia i elimina sessions.
    await pool.execute('UPDATE anuncis SET usuari_id = NULL WHERE usuari_id = ?', [uid]);
    await pool.execute('DELETE FROM sessions WHERE usuari_id = ?', [uid]);
    await pool.execute('DELETE FROM usuaris WHERE usuari_id = ?', [uid]);

    // tanca cookie
    res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/; SameSite=Lax');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error esborrant el compte' });
  }
});


module.exports = router;
