const express  = require('express');
const router   = express.Router();

const auth     = require('../middlewares/auth');
const adminOnly= require('../middlewares/admin');
const ownerOrAdmin = require('../middlewares/propietariOAdminAnunci');
const ctrl     = require('../controllers/anunci_controller');

// Públic
router.get('/',     ctrl.llistar);
router.get('/:id',  ctrl.detall);

// Crea (cal login)
router.post('/',    auth, ctrl.crear);

// Edita / Esborra (propietari o admin)
router.put('/:id',    auth, ownerOrAdmin, ctrl.actualitzar);
router.delete('/:id', auth, ownerOrAdmin, ctrl.eliminar);

// Validació (només admin)
router.patch('/:id/estat', auth, adminOnly, ctrl.canviarEstat);

module.exports = router;
