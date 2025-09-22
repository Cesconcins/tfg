const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const pool      = require('../config/db');

// Dashboard
router.get('/dashboard', auth, adminOnly, async (_req, res) => {
    try {
        const [[u]] = await pool.query('SELECT COUNT(*) AS total_usuaris FROM usuaris');
        const [[a]] = await pool.query('SELECT COUNT(*) AS total_anuncis FROM anuncis');
        res.json({ total_usuaris: u.total_usuaris, total_anuncis: a.total_anuncis });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error obtenint dashboard' });
    }
});

module.exports = router;
