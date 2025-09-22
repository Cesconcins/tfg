// middlewares/auth.js
const pool = require('../config/db');

module.exports = async function auth(req, res, next) {
    try {
        const cookie = req.headers.cookie || '';
        const m = cookie.match(/(?:^|;\s*)sid=([^;]+)/);
        if (!m) return res.status(401).json({ error: 'No autenticado' });

        const sid = decodeURIComponent(m[1]);
        const [rows] = await pool.execute(`
            SELECT u.usuari_id,
                   u.nom,
                   u.cognom,
                   u.correu_electronic,
                   u.telefon,
                   u.administrador
            FROM sessions s
            JOIN usuaris  u ON u.usuari_id = s.usuari_id
            WHERE s.sessio_id = ?
                AND (s.expira_el IS NULL OR s.expira_el > NOW())
            LIMIT 1
        `, [sid]);

        if (!rows.length) return res.status(401).json({ error: 'Sesion invalida o expirada' });
        
        const u = rows[0];
        u.administrador = !!Number(u.administrador);
        req.usuari = u;
        
        next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error validando sesion' });
    }
};
