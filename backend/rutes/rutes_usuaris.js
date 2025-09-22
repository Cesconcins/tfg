const express  = require('express');
const router   = express.Router();
const usRepo   = require('../controllers/usuaris_CRUD');   // camí respecte a routes/
const pool     = require('../config/db');
const crypto   = require('crypto');
const auth     = require('../middlewares/auth')


// Retorna l'usuari autenticat
router.get('/whoami', auth, (req, res) => {
  res.json(req.usuari);
});

// CREATE ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nom, cognom, correu_electronic, contrassenya } = req.body;
    if (!nom || !cognom || !correu_electronic || typeof contrassenya === 'undefined') {
      return res.status(400).json({ error: 'Falten camps obligatoris' });
    }

    const id = await usRepo.createUser(req.body);
    res.status(201).json({ usuari_id: id });
  } catch (err) {
    console.error('Error creant usuari:', err);

    // Duplicat de correu
    if (err && (err.code === 'ER_DUP_ENTRY' || String(err.message).includes('Duplicate'))) {
      return res.status(409).json({ error: 'El correu ja està registrat' });
    }

    // Error de validació propagat
    if (err.status === 400) {
      return res.status(400).json({ error: err.message || 'Falten camps' });
    }

    res.status(500).json({ error: 'Error creant usuari' });
  }
});

// READ all ──────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    res.json(await usRepo.getAllUsers());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obtenint usuaris' });
  }
});

// READ one ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await usRepo.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuari no trobat' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error cercant usuari' });
  }
});

// UPDATE ───────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const ok = await usRepo.updateUser(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Usuari no trobat o sense canvis' });
    res.json({ missatge: 'Usuari actualitzat' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualitzant usuari' });
  }
});

// DELETE ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const ok = await usRepo.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Usuari no trobat' });
    res.json({ missatge: 'Usuari eliminat' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminant usuari' });
  }
});

// ───────────── LOGIN ────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { correu_electronic, contrassenya } = req.body;
    if (!correu_electronic || typeof contrassenya === 'undefined') {
      return res.status(400).json({ error: 'Falten camps' });
    }

    const usuari = await usRepo.loginUser(correu_electronic, contrassenya);
    if (!usuari) return res.status(401).json({ error: 'Credencials incorrectes' });

    // crea sessió i cookie
    const token = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO sessions (sessio_id, usuari_id, expira_el) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [token, usuari.usuari_id]
    );

    res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`);
    res.json(usuari); // sense contrassenya
  } catch (err) {
    console.error('Error /usuaris/login:', err);
    res.status(500).json({ error: 'Error al fer login' });
  }
});

// ───────────── LOGOUT ────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const cookie = req.headers.cookie || '';
    const m = cookie.match(/(?:^|;\s*)sid=([^;]+)/);
    if (m) {
      const sid = decodeURIComponent(m[1]);
      await pool.execute('DELETE FROM sessions WHERE sessio_id = ?', [sid]);
    }
    res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/; SameSite=Lax');
    res.json({ ok: true });
  } catch (e) {
    console.error('Error /usuaris/logout:', e);
    res.status(500).json({ error: 'Error fent logout' });
  }
});



module.exports = router;
