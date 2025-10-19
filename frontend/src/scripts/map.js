document.addEventListener('DOMContentLoaded', () => {
  // Si aquesta pàgina no té mapa, sortir i evitar errors
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  mapboxgl.accessToken = 'pk.eyJ1IjoiY2VzY29uY2lucyIsImEiOiJjbWMyYXprMzcwNmNvMmtxd2ZneXk3d2F3In0.qeJAnsLCCvTMvbs5_W_WBg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [1.727446, 41.2151504], //coordenades de Vilanova i la Geltrú
    zoom: 13.5
  });

  let userMarker = null;
  let userPopup = null;
  let userPos = null;       // ← posició usuari (si dóna permís)
  let allAnuncis = [];         // ← cache tots els anuncis

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      userPos = { lat: latitude, lon: longitude }; // guarda
      if (userMarker) userMarker.remove();
      userMarker = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);

      map.setCenter([longitude, latitude]);

      if (userPopup) userPopup.remove();
      userPopup = new mapboxgl.Popup({ offset: 25 })
        .setLngLat([longitude, latitude])
        .setText('You are here!')
        .addTo(map);

      updateSidebar(); // reordena per distància
    },
    (err) => { console.error("No s'ha pogut obtenir la posició de l'usuari", err); },
    { enableHighAccuracy: true, maximumAge: 3600000, timeout: 5000 }
  );

  fetch('http://localhost:3001/anuncis')
    .then(res => res.json())
    .then(anuncis => {
      allAnuncis = anuncis;

      anuncis.forEach(a => {
        const cavall = document.createElement('img');
        cavall.src = '/src/assets/horse-marker1.png'; // assegura ruta pública
        cavall.alt = a.nom;
        cavall.style.width  = '32px';
        cavall.style.height = '32px';
        cavall.style.cursor = 'pointer';

        new mapboxgl.Marker({ element: cavall, anchor: 'bottom' })
          .setLngLat([a.lon, a.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${a.nom}</strong><br>${Number(a.preu).toFixed(2)} €`)
          )
          .addTo(map);
      });

      updateSidebar(); // render inicial
    })
    .catch(err => console.error('Error carregant anuncis al mapa', err));

  function updateSidebar() {
    // clona per no mutar l’original
    const list = [...allAnuncis];

    // funció distància (km) Haversine
    const distKm = (la1, lo1, la2, lo2) => {
      const toRad = d => d * Math.PI / 180;
      const R = 6371;
      const dLat = toRad(la2 - la1);
      const dLon = toRad(lo2 - lo1);
      const a = Math.sin(dLat/2)**2 +
                Math.cos(toRad(la1)) * Math.cos(toRad(la2)) *
                Math.sin(dLon/2)**2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };

    list.sort((a, b) => {
      // 1) destacats primer
      if (a.destacat !== b.destacat) return a.destacat ? -1 : 1;

      // 2) si tenim userPos: per distància (menor → primer)
      if (userPos) {
        const da = distKm(userPos.lat, userPos.lon, a.lat, a.lon);
        const db = distKm(userPos.lat, userPos.lon, b.lat, b.lon);
        return da - db;
      }

      // 3) si no hi ha ubicació: per valoració (si existeix)
      const ra = (a.valoracio_mitjana ?? 0);
      const rb = (b.valoracio_mitjana ?? 0);
      if (ra !== rb) return rb - ra;

      // 4) tie-breaker estable: per nom
      return a.nom.localeCompare(b.nom);
    });

    renderSidebar(list);
  }

  function renderSidebar(list) {
    const cont = document.getElementById('sidebar');
    if (!cont) return;
    const tpl  = document.getElementById('card-template');
    cont.innerHTML = '';

    if (list.length === 0) {
      cont.innerHTML = '<p>No hi ha anuncis.</p>';
      return;
    }

    list.forEach(a => {
      const clone = tpl.content.cloneNode(true);

      // ESQUERRA
      const img = clone.querySelector('.card-img');
      const title = clone.querySelector('.card-title');
      const nom = a.nom || '';
      const racaCapa = [a.raca, a.capa].filter(Boolean).join(' ');
      title.textContent = racaCapa ? `${nom}, ${racaCapa}` : nom;

      img.src = `http://localhost:3001/anuncis/${a.anunci_id}/portada`;
      img.alt = `Foto de ${a.nom || 'anunci'}`;

      // DRETA · BADGE destacat
      const featured = clone.querySelector('.card-badge');
      if (a.destacat) featured.classList.remove('hidden');
      else featured.classList.add('hidden');

      const distLi = clone.querySelector('.li-dist');
      const distEl = clone.querySelector('.prop-dist');
      const distKm = calcDistKm(userPos, a);
      if (distKm != null) {
        distLi.style.display = '';
        distEl.textContent = `${distKm.toFixed(1)} km`;
      } else {
        distLi.style.display = 'none';
      }

      // Propietats
      const anys = a.data_naixement ? `${calculateAge(a.data_naixement)} años` : '—';
      clone.querySelector('.prop-edad').textContent  = anys;
      clone.querySelector('.prop-precio').textContent= a.preu!=null ? `${Number(a.preu).toFixed(2)} €` : '—';

      const discWrap = clone.querySelector('.prop-disciplines');
      const discs = (a.disciplines||[]);
      discWrap.innerHTML = discs.length
        ? discs.map(d=>`<span class="tag">${d.nom}</span>`).join('')
        : '—';

      // Enllaç a detalls
      const link = clone.querySelector('.btn-detail');
      link.href = `/src/pages/detalls_anuncis.html#id=${a.anunci_id}`;

      cont.appendChild(clone);
    });

  }

  // ajuda: calcular edat
  function calculateAge(dnaStr) {
    const dna = new Date(dnaStr), now = new Date();
    let age = now.getFullYear() - dna.getFullYear();
    dna.setFullYear(now.getFullYear());
    if (dna > now) age--;
    return age;
  }

  function calcDistKm(origin, a){
    if (!origin || a.lat == null || a.lon == null) return null;
    const toRad = x => x * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(a.lat - origin.lat);
    const dLon = toRad(a.lon - origin.lon);
    const la1 = toRad(origin.lat), la2 = toRad(a.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
    return R * 2 * Math.asin(Math.sqrt(h));
  }
});
