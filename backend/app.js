require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors = require('cors');

const usuarisRuta = require('./rutes/rutes_usuaris');
const anuncisRuta = require('./rutes/rutes_anuncis');
const perfilRuta = require('./rutes/rutes_perfil');
const adminRuta  = require('./rutes/rutes_admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173', credentials: true 
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));
app.use('/', express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

app.use('/usuaris', usuarisRuta);
app.use('/anuncis', anuncisRuta);
app.use('/perfil', perfilRuta);
app.use('/admin',  adminRuta);

app.listen(PORT, () =>
  console.log(`Servidor escoltant a http://localhost:${PORT}`)
);
