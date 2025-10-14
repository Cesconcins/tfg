const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

router.get('/', async (_req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT disciplina_id, nom FROM disciplines ORDER BY nom'
        );
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error obtenint disciplines' });
    }
});

module.exports = router;