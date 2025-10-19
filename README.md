# Plataforma d’anuncis de cavalls (TFG)

Aplicació web per publicar, cercar i visualitzar anuncis de cavalls, amb **API REST (Express + MariaDB)** i **frontend** servit com a fitxers estàtics. Inclou mapa interactiu (Mapbox GL JS), filtres i documentació d’API (Swagger).

## Taula de continguts
- [Requisits](#requisits)
- [Instal·lació de dependències](#instal·lació-de-dependències)
- [Base de dades](#base-de-dades)
- [Configuració del backend](#configuració-del-backend)
- [Arrencada](#arrencada)
- [Estructura de carpetes](#estructura-de-carpetes)
- [Mapbox (token)](#mapbox-token)
- [Llicència](#llicència)

---

## Requisits

**Sistema:** Ubuntu (o Linux equivalent)

**Node.js i npm (via nvm)**
```bash
# Instal·lar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"

# Instal·lar Node.js
nvm install 22

# Verificar versions
node -v
npm -v
```

**MariaDB**
```bash
# Actualitzar paquets
sudo apt update

# Instal·lar servidor i client
sudo apt install -y mariadb-server mariadb-client

# Assegurar la instal·lació
sudo mariadb-secure-installation

# Arrencar i habilitar el servei
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Comprovar accés
mariadb -u root -p
```

*(Opcional)* **DBeaver** per inspeccionar l’esquema:
```bash
sudo snap install dbeaver-ce
```

---

## Instal·lació de dependències

Clona el repositori i entra al directori:
```bash
git clone https://github.com/Cesconcins/tfg.git
cd tfg
```

---

## Base de dades

**1) Crear esquema i usuari d’aplicació (a la consola de MariaDB):**
```sql
CREATE DATABASE IF NOT EXISTS cavalls_db;
CREATE USER IF NOT EXISTS 'Jordi'@'localhost' IDENTIFIED BY 'JordiGarciaUPC';
GRANT ALL PRIVILEGES ON cavalls_db.* TO 'Jordi'@'localhost';
FLUSH PRIVILEGES;
```

**2) Importar el dump:**
```bash
mysql -u Jordi -p -h localhost -D cavalls_db < cavalls_db_dump.sql
```

---

## Configuració del backend

Crea el fitxer `backend/.env` amb els valors d’entorn:
```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=username
DB_PASS=password
DB_NAME=name_of_database
APP_PORT=3001
```

Instal·la dependències del backend:
```bash
cd backend
npm install
```

*(Opcional)* Documentació d’API (si el projecte inclou Swagger): `http://localhost:3001/docs`

---

## Arrencada

### Backend
**Desenvolupament** (hot reload si està definit):
```bash
npm run dev
```

**Producció**:
```bash
npm run build
npm start
```

El backend escolta a:
```
http://localhost:3001
```

### Frontend
En una altra terminal:
```bash
cd ../frontend
npx serve -l 5173
```

Accedeix via navegador:
```
http://localhost:5173
```

---

## Estructura de carpetes

```
servei-web/
├─ backend/
│  ├─ app.js
│  ├─ .env
│  ├─ package.json
│  ├─ config/
│  │  └─ db.js
│  ├─ models/
│  ├─ rutes/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ docs.js
│  └─ openapi.yaml
└─ frontend/
   ├─ public/upload/anuncis/
   ├─ src/
   │  ├─ assets/
   │  │  └─ styles.css
   │  ├─ components/
   │  ├─ pages/
   │  ├─ scripts/
   └─ index.html
```

---

## Mapbox (token)

Per al mapa interactiu cal un **access token** de Mapbox GL JS.

Exemple d’ús al client:
```js
mapboxgl.accessToken = 'pk.xxx...';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [2.24741, 41.45004],
  zoom: 13.5
});
```

> En producció, utilitza variables d’entorn (build) per evitar exposar el token al repositori.

---

## Llicència

Aquest projecte es distribueix sota **Apache License 2.0**.  
Consulta el fitxer [`LICENSE`](./LICENSE) per al text complet.
