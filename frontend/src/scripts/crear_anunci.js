document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('anuncio-form');

  const BASE = 'http://localhost:3001';
  const galeria = document.getElementById('galeria');
  const fileInp = document.getElementById('file-imatges');

  if (!form) return;

  const errorBox = document.getElementById('form-error');
  const okBox = document.getElementById('form-ok');
  const selDisc = document.getElementById('sel-disciplines');

  const params = new URLSearchParams(location.search);
  const id = params.get('id'); // si hi és → edició

  let DISC_LIST = [];

  // 1) Carrega catàleg de disciplines i pinta <option>
  async function loadDisciplines() {
    const r = await fetch('http://localhost:3001/disciplines');
    if (!r.ok) throw new Error('No se pudieron cargar las disciplinas');
    DISC_LIST = await r.json(); // s'espera [{disciplina_id, nom}]
    selDisc.innerHTML = DISC_LIST
      .map(d => `<option value="${d.disciplina_id}">${d.nom}</option>`)
      .join('');
  }

  async function loadImages(anunciId) {
    if (!galeria) return;
    galeria.innerHTML = '';
    try {
      const r = await fetch(`${BASE}/anuncis/${anunciId}/imatges`);
      if (!r.ok) return;
      const L = await r.json(); // [{imatge_id, filename, ordre, url}]
      if (!L.length) {
        galeria.innerHTML = '<p style="color:#6b7280;">No hay imágenes subidas.</p>';
        return;
      }
      L.forEach(im => {
        const card = document.createElement('div');
        card.style.position = 'relative';
        card.innerHTML = `
          <img src="${im.url}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:.5rem;">
          <button data-del="${im.imatge_id}" class="btn-danger"
            style="position:absolute;top:6px;right:6px;padding:.25rem .4rem;font-size:.8rem;border-radius:.4rem;">×</button>
        `;
        galeria.appendChild(card);
      });
    } catch (e) {
      console.error('Error cargando galería:', e);
      galeria.innerHTML = '<p>Error cargando imágenes.</p>';
    }
  }

  // 2) Si és edició, carrega l’anunci i preomple
  async function loadAnunciIfEditing() {
    if (!id) return;
    const r = await fetch(`http://localhost:3001/anuncis/${id}`, { credentials:'include' });
    if (!r.ok) throw new Error('No se pudo cargar el anuncio');
    const a = await r.json();

    form.nom.value = a.nom || '';
    form.raca.value = a.raca || '';
    form.preu.value = a.preu ?? '';
    if (a.data_naixement) form.data_naixement.value = a.data_naixement.slice(0,10);
    form.capa.value = a.capa || '';
    form.alcada.value = a.alcada ?? '';
    form.pes.value = a.pes ?? '';
    form.sexe.value = a.sexe || '';
    form.lat.value = a.lat ?? '';
    form.lon.value = a.lon ?? '';
    form.descripcio.value = a.descripcio || '';

    // preselecciona disciplines
    // backend sol retornar a.disciplines com [{nom: '...'}] (sense id)
    const nomsSel = (a.disciplines || []).map(d => d.nom);
    const idsSel = DISC_LIST
      .filter(d => nomsSel.includes(d.nom))
      .map(d => String(d.disciplina_id));
    for (const opt of selDisc.options) {
      opt.selected = idsSel.includes(opt.value);
    }
  }

  try {
    await loadDisciplines();
    await loadAnunciIfEditing();
  } catch (e) {
    console.error(e);
    errorBox.textContent = e.message || 'Error inicial cargando datos.';
    errorBox.style.display = 'block';
  }

  mapboxgl.accessToken = 'pk.eyJ1IjoiY2VzY29uY2lucyIsImEiOiJjbWMyYXprMzcwNmNvMmtxd2ZneXk3d2F3In0.qeJAnsLCCvTMvbs5_W_WBg';

  const inCP = document.getElementById('cp');
  const inPob = document.getElementById('poblacio');
  const inAdr = document.getElementById('adreca');
  const inLat = document.getElementById('lat');
  const inLon = document.getElementById('lon');

  const btnGeo = document.getElementById('btn-geocode');
  const mapWrap = document.getElementById('mini-map');

  let map, marker;

  // Geocoder de Mapbox (buscador d'adreces)
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'Busca una dirección en España',
    countries: 'ES',
    types: 'address,place,postcode',
    language: 'es'
  });
  document.getElementById('geocoder').appendChild(geocoder.onAdd());

  // Quan l’usuari tria una adreça al geocoder
  geocoder.on('result', (e) => {
    const [lon, lat] = e.result.center;
    // Desa coordenades
    inLat.value = lat.toFixed(6);
    inLon.value = lon.toFixed(6);

    // Intenta emplenar CP i població a partir del context
    const ctx = e.result.context || [];
    const postcode = (ctx.find(c => c.id.startsWith('postcode')) || {}).text;
    const place    = (ctx.find(c => c.id.startsWith('place'))    || {}).text
                  || (ctx.find(c => c.id.startsWith('locality')) || {}).text
                  || (ctx.find(c => c.id.startsWith('district')) || {}).text;

    if (postcode && !inCP.value)  inCP.value  = postcode;
    if (place    && !inPob.value) inPob.value = place;
    if (!inAdr.value) inAdr.value = e.result.place_name;

    showMap(lat, lon);
  });

  // Botó que combina CP + Població + Adreça i llança el geocoder
  btnGeo?.addEventListener('click', () => {
    const q = [inAdr.value, inPob.value, inCP.value].filter(Boolean).join(', ');
    if (q) geocoder.query(q);
  });

  // Crea/actualitza el mini mapa amb marcador arrossegable
  function showMap(lat, lon) {
    if (!map) {
      map = new mapboxgl.Map({
        container: 'mini-map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lon, lat],
        zoom: 15
      });
      mapWrap.classList.remove('hidden');

      marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lon, lat])
        .addTo(map);

      marker.on('dragend', async () => {
        const { lat, lng } = marker.getLngLat();
        inLat.value = lat.toFixed(6);
        inLon.value = lng.toFixed(6);
        // (opcional) reverse geocoding per refrescar text
        try {
          const u = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address,place,postcode&language=es&access_token=${mapboxgl.accessToken}`;
          const r = await fetch(u);
          const j = await r.json();
          const f = j.features?.[0];
          if (f) {
            const ctx = f.context || [];
            const postcode = (ctx.find(c => c.id.startsWith('postcode')) || {}).text;
            const place = (ctx.find(c => c.id.startsWith('place')) || {}).text || (ctx.find(c => c.id.startsWith('locality')) || {}).text;
            if (postcode) inCP.value = postcode;
            if (place) inPob.value = place;
            inAdr.value = f.place_name;
          }
        } catch {}
      });
    } else {
      map.setCenter([lon, lat]);
      marker.setLngLat([lon, lat]);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    // Si s'ha escrit alguna part de l'adreça però no hi ha lat/lon, avisem
    const wroteAddr = !!(inAdr.value || inPob.value || inCP.value);
    if (wroteAddr && (!inLat.value || !inLon.value)) {
      errorBox.textContent = 'Selecciona una coincidencia o ajusta el marcador en el mapa para fijar lat/lon.';
      errorBox.style.display = 'block';
      return;
    }

    errorBox.style.display = 'none';
    okBox.classList.add('hidden');

    // Dades base del formulari
    const payload = Object.fromEntries(new FormData(form).entries());

    // Nombres buits → null; si no, Number()
    for (const k of ['preu','alcada','pes','lat','lon']) {
      if (payload[k] === '') payload[k] = null;
      else if (payload[k] != null) payload[k] = Number(payload[k]);
    }

    // Disciplines seleccionades (array d'IDs)
    payload.disciplines = Array.from(selDisc.selectedOptions).map(o => Number(o.value));

    try {
      const url    = id ? `http://localhost:3001/anuncis/${id}` : 'http://localhost:3001/anuncis';
      const method = id ? 'PUT' : 'POST';

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!r.ok) throw new Error(id ? 'Error guardando cambios' : 'Error creando anuncio');

      let anunciId = id;
      if (!anunciId) {
        const j = await r.json();
        anunciId = j.anunci_id; // ← backend retorna { anunci_id }
      }

      // Si hi ha fitxers seleccionats, els pugem ara
      if (fileInp.files && fileInp.files.length > 0) {
        const fd = new FormData();
        [...fileInp.files].forEach(f => fd.append('files', f));

        const up = await fetch(`${BASE}/anuncis/${anunciId}/imatges`, {
          method: 'POST',
          credentials: 'include',
          body: fd // NO posar Content-Type manualment
        });
        if (!up.ok) {
          console.error('Error subiendo imágenes');
          // no parem el flow; només informem
        }
      }

      okBox.classList.remove('hidden');
      setTimeout(() => location.href = '/src/pages/perfil.html', 700);
    } catch (e) {
      console.error(e);
      errorBox.textContent = e.message || 'Error en el formulario.';
      errorBox.style.display = 'block';
    }
  });

  galeria?.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-del]');
    if (!btn) return;
    const imgId = btn.getAttribute('data-del');
    if (!id) return; // només en edició

    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      const r = await fetch(`${BASE}/anuncis/${id}/imatges/${imgId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!r.ok) throw new Error('No se pudo eliminar la imagen');
      await loadImages(id);
    } catch (e) {
      console.error(e);
      alert('Error eliminando la imagen');
    }
  });
});
