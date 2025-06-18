const express  = require('express');
const router   = express.Router();
const usRepo   = require('../controller/usuaris_CRUD');   // camí respecte a routes/

// CREATE ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const id = await usRepo.createUser(req.body);
    res.status(201).json({ usuari_id: id });
  } catch (err) {
    console.error(err);
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
    const usuari = await usRepo.loginUser(correu_electronic, contrassenya);
    if (!usuari) {
      return res.status(401).json({ error: 'Credencials incorrectes' });
    }
    // Retornem l’usuari (sense contrassenya)
    res.json(usuari);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al fer login' });
  }
});

module.exports = router;
