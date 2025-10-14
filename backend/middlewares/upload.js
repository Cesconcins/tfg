const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');


const DEST = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'anuncis');

function ensureDir(p) {
  try { fs.mkdirSync(p, { recursive: true }); } catch (_) {}
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureDir(DEST);
      cb(null, DEST);
    } catch (e) {
      cb(e);
    }
  },
  filename: (_req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${id}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const ok = /image\/(png|jpe?g|webp|gif)/i.test(file.mimetype);
  cb(ok ? null : new Error('Format d’imatge no vàlid'), ok);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } //5MB
});
