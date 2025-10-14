document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('filters-form');
  const selDis = document.getElementById('sel-disciplines');
  const qMun   = document.getElementById('q-mun');
  const qProv  = document.getElementById('q-prov');
  const qLat   = document.getElementById('q-lat');
  const qLon   = document.getElementById('q-lon');
  const qRadi  = document.getElementById('q-radi');
  const outRad = document.getElementById('q-radi-out');
  const btnReset = document.getElementById('btn-reset');

  const BASE_API = 'http://localhost:3001';
  const MAPBOX_TOKEN =
    document.querySelector('meta[name="mapbox-token"]')?.content || 'pk.eyJ1IjoiY2VzY29uY2lucyIsImEiOiJjbWMyYXprMzcwNmNvMmtxd2ZneXk3d2F3In0.qeJAnsLCCvTMvbs5_W_WBg';

  // --- helpers
  const buildNumber = v => (v === '' || v == null ? null : Number(v));
  const paramsFromURL = () => Object.fromEntries(new URLSearchParams(location.search));

  function setRangeValue(v) {
    if (v != null && v !== '') qRadi.value = v;
    outRad.textContent = `${qRadi.value} km`;
  }
  qRadi.addEventListener('input', () => outRad.textContent = `${qRadi.value} km`);

  // --- carregar disciplines i preseleccionar
  async function loadDisciplinesAndHydrate(q) {
    try {
      const r = await fetch(`${BASE_API}/disciplines`);
      const L = r.ok ? await r.json() : [];
      selDis.innerHTML = L.map(d => `<option value="${d.disciplina_id}">${d.nom}</option>`).join('');

      // preselecció si ve a l'URL
      if (q.disciplines) {
        const wanted = String(q.disciplines).split(',').map(s => s.trim());
        for (const opt of selDis.options) opt.selected = wanted.includes(opt.value);
      }
    } catch (e) {
      console.error('Error cargando disciplinas', e);
      selDis.innerHTML = '';
    }
  }

  // --- geocoding
  async function geocode(query, types='place,postcode,region') {
    if (!MAPBOX_TOKEN || !query) return null;
    const u = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    u.searchParams.set('access_token', MAPBOX_TOKEN);
    u.searchParams.set('language', 'es');
    u.searchParams.set('limit', '1');
    u.searchParams.set('types', types);
    const r = await fetch(u);
    if (!r.ok) return null;
    const j = await r.json();
    const f = j.features?.[0];
    if (!f) return null;
    const [lon, lat] = f.center || [];
    return { lat, lon };
  }

  // --- construir params a enviar
  async function buildParams() {
    const fd = new FormData(form);
    const params = {};

    // text
    ['nom','raca','capa'].forEach(k => {
      const v = fd.get(k)?.trim();
      if (v) params[k] = v;
    });

    // rangs
    ['preu_min','preu_max','alcada_min','alcada_max','pes_min','pes_max','edat_min','edat_max']
      .forEach(k => { const v = fd.get(k); if (v!=='' && v!=null) params[k] = v; });

    // sexe (múltiple)
    const sexes = [...form.querySelectorAll('input[name="sexe"]:checked')].map(i => i.value);
    if (sexes.length) params.sexe = sexes.join(',');

    // disciplines múltiples per id
    const ids = [...selDis.selectedOptions].map(o => o.value);
    if (ids.length) params.disciplines = ids.join(',');

    // Ubicació → geocode si hi ha municipi o província
    const radi = qRadi.value;
    const mun  = qMun.value.trim();
    const prov = qProv.value.trim();

    let coords = null;
    if (mun)  coords = await geocode(mun, 'place,postcode');
    else if (prov) coords = await geocode(prov, 'region,place');

    if (coords) {
      params.lat = coords.lat;
      params.lon = coords.lon;
      params.radi_km = radi;
      qLat.value = coords.lat;
      qLon.value = coords.lon;
    } else {
      qLat.value = ''; qLon.value = '';
      // si no hem pogut geocodificar, NO enviem radi/lat/lon → no s'aplica filtre de distància
    }

    return params;
  }

  // formulari des de l'URL
  function hydrateFormFromURL(q) {
    // text + rangs
    ['nom','raca','capa','preu_min','preu_max','alcada_min','alcada_max','pes_min','pes_max','edat_min','edat_max']
      .forEach(k => { if (q[k] != null) form.elements[k].value = q[k]; });

    // sexe
    if (q.sexe) {
      const selected = String(q.sexe).split(',').map(s => s.trim());
      form.querySelectorAll('input[name="sexe"]').forEach(chk => {
        chk.checked = selected.includes(chk.value);
      });
    }

    // ubicació visible
    if (q.radi_km != null) setRangeValue(q.radi_km); else setRangeValue(null);

    // (lat/lon ocults, si vens d’una URL ja geocodificada)
    if (q.lat) qLat.value = q.lat;
    if (q.lon) qLon.value = q.lon;
  }

  // --- submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const p = await buildParams();
      const qs = new URLSearchParams(p).toString();
      history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
      window.dispatchEvent(new CustomEvent('filters:changed', { detail: p }));
      // mantenim formulari
      hydrateFormFromURL(p);
    } catch (err) {
      console.error(err);
      alert('No se pudieron aplicar los filtros.');
    }
  });

  // --- reset
  btnReset.addEventListener('click', () => {
    form.reset();
    qLat.value = qLon.value = '';
    setRangeValue(50); // valor per defecte del teu slider
    history.replaceState(null, '', location.pathname);
    window.dispatchEvent(new CustomEvent('filters:changed', { detail: {} }));
  });

  // --- arrencada: hidrata des de l'URL, carrega disciplines i dispara cerca
  (async () => {
    const q = paramsFromURL();
    hydrateFormFromURL(q);
    await loadDisciplinesAndHydrate(q); // important: carregar + marcar opcions
    window.dispatchEvent(new CustomEvent('filters:changed', { detail: q }));
  })();
});
