require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors = require('cors');

const usuarisRuta = require('./rutes/rutes_usuaris');
const anuncisRuta = require('./rutes/rutes_anuncis');
const perfilRuta = require('./rutes/rutes_perfil');
const adminRuta  = require('./rutes/rutes_admin');
const disciplinesRuta = require('./rutes/rutes_disciplines');
const rutesImatgesAnuncis = require('./rutes/rutes_imatges_anuncis');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173', credentials: true 
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads/anuncis')));
app.use('/', express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

app.use('/usuaris', usuarisRuta);
app.use('/anuncis', anuncisRuta);
app.use('/perfil', perfilRuta);
app.use('/admin',  adminRuta);
app.use('/disciplines', disciplinesRuta);
app.use('/anuncis', rutesImatgesAnuncis);

app.listen(PORT, () =>
  console.log(`Servidor escoltant a http://localhost:${PORT}`)
);
