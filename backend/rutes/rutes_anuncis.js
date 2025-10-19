const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/admin');
const ownerOrAdmin = require('../middlewares/propietariOAdminAnunci');
const ctrl = require('../controllers/anunci_controller');
const rev = require('../models/revisio_anunci_model');
const anunciController = require('../controllers/anunci_controller');


// Públic
router.get('/', ctrl.llistar);
router.get('/:id', ctrl.detall);

// Crea (cal login)
router.post('/',    auth, ctrl.crear);

// Edita / Esborra (propietari o admin)
router.put('/:id',    auth, ownerOrAdmin, ctrl.actualitzar);
router.delete('/:id', auth, ownerOrAdmin, ctrl.eliminar);

// Validació (només admin)
router.patch('/:id/estat', auth, adminOnly, ctrl.canviarEstat);

// Historial revisions admin
router.get('/:id/revisions', auth, adminOnly, async (req, res) => {
  try { res.json(await rev.llistarPerAnunci(req.params.id)); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Error obtenint revisions' }); }
});

router.patch('/:id/disponibilitat', auth, ownerOrAdmin, ctrl.canviarDisponibilitat);

router.patch('/:id/destacat', auth, adminOnly, anunciController.anunciDestacat);

module.exports = router;
