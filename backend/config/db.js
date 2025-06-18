const mysql = require('mysql2/promise');


['DB_USER', 'DB_PASS', 'DB_NAME'].forEach(v => {
  if (!process.env[v]) {
    console.error(`Falta la variable d'entorn ${v}`);
    process.exit(1);
  }
});

const pool = mysql.createPool({
    host: 'localhost',
    user: 'cavalls',
    password: '',
    database: 'cavalls_db'
});

/* el .env no va amb passwords buides
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASS,
  database:           process.env.DB_NAME
});
*/

module.exports = pool;
