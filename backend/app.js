require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const usuarisRuta  = require('./rutes/rutes_usuaris');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// muntar totes les rutes d'usuaris sota /usuaris
app.use('/usuaris', usuarisRuta);

// ruta bàsica de prova
app.get('/', (_req, res) => res.send('API cavalls en marxa'));

app.listen(PORT, () =>
  console.log(`Servidor escoltant a http://localhost:${PORT}`)
);
