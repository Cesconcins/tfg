// src/scripts/detalls_anuncis.js
// Galeria bàsica (anar endavant/enrere + fletxes del teclat)
// i dades del venedor (lectura robusta i missatge en castellà)

document.addEventListener('DOMContentLoaded', () => {
  const main  = document.getElementById('galeria-main');
  const title = document.getElementById('title-row');
  const dades = document.getElementById('bloc-dades');
  const desc  = document.getElementById('bloc-desc');
  const cont  = document.getElementById('bloc-contacte');
  if (!main || !title || !dades || !desc || !cont) return; // hooks definits a l'HTML actual

  const BASE_API = 'http://localhost:3001';

  // ── Helpers ────────────────────────────────────────────────────────────
  function getAdId() {
    const q = new URLSearchParams(location.search).get('id');
    if (q) return q;
    const raw = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    return new URLSearchParams(raw).get('id');
  }

  function calculateAge(dnaStr) {
    if (!dnaStr) return null;
    const dna = new Date(dnaStr), now = new Date();
    let age = now.getFullYear() - dna.getFullYear();
    const tmp = new Date(dna); tmp.setFullYear(now.getFullYear());
    if (tmp > now) age--;
    return age;
  }

  // BBDD en català → UI castellà (només tres casos)
  function formatSexCATtoES(val) {
    if (val == null) return '—';
    const v = String(val).trim().toLowerCase().replace(/\s+/g,' ');
    if (v === 'mascle') return 'Macho';
    if (v === 'mascle castrat') return 'Macho castrado';
    if (v === 'femella') return 'Hembra';
    return '—';
  }

  function disciplinesTags(arr){
    const L = Array.isArray(arr) ? arr : [];
    if (!L.length) return '—';
    return L.map(d => `<span class="tag">${(d && d.nom) ? d.nom : String(d)}</span>`).join('');
  }

  async function fetchJSON(url){
    const r = await fetch(url, { credentials: 'include' });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // ── Galeria bàsica (sense miniatures) ──────────────────────────────────
  function renderGallery(urls, a){
    // Fallback dur: portada si no hi ha llista d’imatges
    if (!Array.isArray(urls) || urls.length === 0) {
      urls = [`${BASE_API}/anuncis/${a.anunci_id}/portada`];
    }

    let i = 0;
    const setImg = () => {
      // HTML minimal: imatge + botons prev/next + comptador
      main.innerHTML = `
        <img src="${urls[i]}" alt="Foto ${a.nom || ''}">
        <div class="gallery-nav">
          <button type="button" aria-label="Anterior" data-nav="prev">◀</button>
          <button type="button" aria-label="Siguiente" data-nav="next">▶</button>
        </div>
        <div class="gallery-counter">${i+1}/${urls.length}</div>
      `;

      const prev = main.querySelector('[data-nav="prev"]');
      const next = main.querySelector('[data-nav="next"]');
      prev.addEventListener('click', () => { i = (i - 1 + urls.length) % urls.length; setImg(); });
      next.addEventListener('click', () => { i = (i + 1) % urls.length; setImg(); });
    };

    // Suport teclat
    window.addEventListener('keydown', (e) => {
      if (urls.length <= 1) return;
      if (e.key === 'ArrowLeft')  { i = (i - 1 + urls.length) % urls.length; setImg(); }
      if (e.key === 'ArrowRight') { i = (i + 1) % urls.length; setImg(); }
    });

    setImg();
  }

  // ── Títol ──────────────────────────────────────────────────────────────
  function renderTitle(a){
    const breedLine = [a.raca, a.capa].filter(Boolean).join(' ');
    title.innerHTML = `
      <div>
        <h1>${a.nom || ''}</h1>
        <div class="title-sub">${breedLine}</div>
      </div>
      ${a.destacat ? '<span class="featured-badge">🏅 Destacado</span>' : '<span></span>'}
    `;
  }

  // ── Dades ràpides + Descripció ─────────────────────────────────────────
  function renderDades(a){
    const age  = calculateAge(a.data_naixement);
    const sexe = formatSexCATtoES(a.sexe);
    const preu = (a.preu!=null) ? `${Number(a.preu).toFixed(2)} €` : '—';

    const rows = [
      ['Precio', preu],
      ['Sexo', sexe],
      ['Edad', age!=null ? `${age} años` : '—'],
      a.alcada != null ? ['Alzada', `${a.alcada} cm`] : null,
      a.pes    != null ? ['Peso', `${a.pes} kg`] : null,
      ['Disciplinas', `<div class="disc-wrap">${disciplinesTags(a.disciplines||[])}</div>`],
      a.localitat || a.provincia ? ['Ubicación', [a.localitat, a.provincia].filter(Boolean).join(', ')] : null
    ].filter(Boolean);

    dades.innerHTML = `
      <h3>Información principal</h3>
      <div class="quick-grid">
        ${rows.map(([k,v]) => `
          <div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>
        `).join('')}
      </div>
    `;
  }

  function renderDesc(a){
    const txt = a.descripcio?.trim();
    desc.innerHTML = `
      <h3>Descripción</h3>
      ${txt ? `<p>${txt}</p>` : `<p>El anunciante no ha añadido ninguna descripción.</p>`}
    `;
  }

  // ── Contacte (castellà) ────────────────────────────────────────────────
  function renderContacte(autor){
    if (!autor) {
      cont.innerHTML = `<h3>Contacto</h3><p>No se ha podido obtener la información del vendedor.</p>`;
      return;
    }
    const nombre    = autor.nom || autor.nombre || '';
    const apellidos = autor.cognoms || autor.apellidos || '';
    const nomCompl  = [nombre, apellidos].filter(Boolean).join(' ');
    const email     = autor.email || autor.correu || autor.correo || '';

    cont.innerHTML = `
      <h3>Contacto</h3>
      <div class="name">${nomCompl || '—'}</div>
      <div class="email">${email ? `<a href="mailto:${email}">${email}</a>` : '—'}</div>
    `;
  }

  // ── Flux principal ─────────────────────────────────────────────────────
  (async function init(){
    const id = getAdId();
    if (!id) { main.innerHTML = '<p>Falta el identificador del anuncio.</p>'; return; }

    try {
      // 1) Dades de l'anunci
      const a = await fetchJSON(`${BASE_API}/anuncis/${id}`);

      // 2) Imatges: usa a.imatges (si hi ha) o la portada
      let urls = [];
      if (Array.isArray(a.imatges) && a.imatges.length) {
        urls = a.imatges.map(im => {
          const raw = (im && typeof im === 'object') ? im.url : im;
          return String(raw).startsWith('http') ? raw : `${BASE_API}${raw}`;
        });
      } else {
        urls = [`${BASE_API}/anuncis/${a.anunci_id}/portada`];
      }

      // 3) Autor: prova camp inclòs o endpoint dedicat
      let autor = a.usuari || a.user || a.autor || null;
      if (!autor) {
        try { autor = await fetchJSON(`${BASE_API}/anuncis/${id}/autor`); }
        catch { /* si falla, es mostrarà l’error en renderContacte */ }
      }

      // Render
      renderGallery(urls, a);
      renderTitle(a);
      renderDades(a);
      renderDesc(a);
      renderContacte(autor);

    } catch (e) {
      console.error(e);
      main.innerHTML = '<p>Error cargando el anuncio.</p>';
    }
  })();
});
