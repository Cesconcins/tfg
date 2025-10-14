const express = require('express');
const router = express.Router();
const usRepo = require('../controllers/usuaris_CRUD');
const pool = require('../config/db');
const crypto = require('crypto');
const auth = require('../middlewares/auth')
const adminOnly= require('../middlewares/admin');


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

// UPDATE perfil autenticat
router.put('/whoami', auth, async (req, res) => {
  try {
    const id = req.usuari.usuari_id;
    const ok = await usRepo.updateUser(id, req.body);
    if (!ok) return res.status(400).json({ error: 'Sense canvis o usuari inexistent' });
    const user = await usRepo.getUserById(id);
    if (user) delete user.contrassenya;
    res.json(user); // el front espera l'usuari actualitzat
  } catch (err) {
    console.error('PUT /usuaris/whoami', err);
    res.status(500).json({ error: 'Error actualitzant perfil' });
  }
});

// DELETE perfil autenticat
router.delete('/whoami', auth, async (req, res) => {
  try {
    const id = req.usuari.usuari_id;
    const ok = await usRepo.deleteUser(id);
    if (!ok) return res.status(404).json({ error: 'Usuari no trobat' });

    // tanca sessió
    const cookie = req.headers.cookie || '';
    const m = cookie.match(/(?:^|;\s*)sid=([^;]+)/);
    if (m) {
      const sid = decodeURIComponent(m[1]);
      await pool.execute('DELETE FROM sessions WHERE sessio_id = ?', [sid]);
    }
    res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/; SameSite=Lax');
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /usuaris/whoami', err);
    res.status(500).json({ error: 'Error eliminant perfil' });
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
 
    if (usuari.actiu === 0 || usuari.actiu === false) {
      return res.status(403).json({
        error: 'Tu cuenta ha sido desactivada por el administrador. Para cualquier duda, escriba a admin@gmail.com.'
      });
    }
    
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

// Llista d’usuaris per a ADMIN amb filtre actiu
router.get('/admin/llistat', auth, adminOnly, async (req, res) => {
  try {
    const q = req.query.actiu;
    const actiu = (q === '1' ? 1 : (q === '0' ? 0 : undefined));
    const rows = await usRepo.getAllUsers({ actiu });
    res.json(rows);
  } catch (err) {
    console.error('GET /usuaris/admin/llistat', err);
    res.status(500).json({ error: 'Error obtenint usuaris' });
  }
});

// Activar / desactivar conta (ADMIN)
router.patch('/:id/actiu', auth, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    const { actiu } = req.body || {};
    if (typeof actiu === 'undefined') return res.status(400).json({ error: 'Falta actiu' });

    const ok = await usRepo.setUserActive(id, !!actiu);
    if (!ok) return res.status(404).json({ error: 'Usuari no trobat' });
    const u = await usRepo.getUserById(id);
    if (u) delete u.contrassenya;
    res.json(u);
  } catch (err) {
    console.error('PATCH /usuaris/:id/actiu', err);
    res.status(500).json({ error: 'Error actualitzant estat' });
  }
});

// Editar un usuari qualsevol (ADMIN)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const ok = await usRepo.updateUser(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Usuari no trobat o sense canvis' });
    const user = await usRepo.getUserById(req.params.id);
    if (user) delete user.contrassenya;
    res.json(user);
  } catch (err) {
    console.error('PUT /usuaris/:id', err);
    res.status(500).json({ error: 'Error actualitzant usuari' });
  }
});

// Eliminar usuari (ADMIN)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const ok = await usRepo.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Usuari no trobat' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /usuaris/:id', err);
    res.status(500).json({ error: 'Error eliminant usuari' });
  }
});


module.exports = router;
