document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('ads-container');
  if (!cont) return;
  
  function calculateAge(dnaStr) {
    if (!dnaStr) return null;
    const dna = new Date(dnaStr), now = new Date();
    let age = now.getFullYear() - dna.getFullYear();
    // Ajust si encara no ha fet els anys enguany
    const tmp = new Date(dna); tmp.setFullYear(now.getFullYear());
    if (tmp > now) age--;
    return age;
  }

  function disciplinesTags(arr){
    const L = Array.isArray(arr) ? arr : [];
    if (!L.length) return '—';
    return L
      .map(d => {
        const nom = (d && typeof d === 'object') ? d.nom : d;
        return `<span class="tag">${String(nom ?? '').trim()}</span>`;
      })
      .join('');
  }

  function formatSex(val) {
    if (val == null) return '—';
    const v = String(val).trim().toLowerCase().replace(/\s+/g, ' ');
    if (v === 'mascle') return 'Macho';
    if (v === 'mascle castrat') return 'Macho castrado';
    if (v === 'femella') return 'Hembra';
    return '—';
  }

  function cardHTML(a){
    const age = calculateAge(a.data_naixement);

    // NOTA: mantenim el layout vertical (estils propis d’anuncis),
    // però mostrem la mateixa info que a la portada
    return `
      <article class="card-anunci">
        <div class="card-img">
          <img src="http://localhost:3001/anuncis/${a.anunci_id}/portada" alt="${a.nom || 'anunci'}">
          ${a.destacat ? '<span class="badge">🏅 Destacado</span>' : ''}
        </div>

        <div class="card-body">
          <h3>${a.nom ?? ''}</h3>
          <p class="sub">${[a.raca, a.capa].filter(Boolean).join(' ')}</p>

          <ul class="card-props">
            <li><strong>Disciplinas:</strong> <span class="prop-disciplines">${disciplinesTags(a.disciplines)}</span></li>
            <li><strong>Edad:</strong> <span class="prop-edad">${age != null ? `${age} años` : '—'}</span></li>
            <li><strong>Precio:</strong> <span class="prop-precio">${a.preu!=null ? `${Number(a.preu).toFixed(2)} €` : '—'}</span></li>
            <li><strong>Sexo:</strong> <span class="prop-sexo">${formatSex(a.sexe)}</span></li>
          </ul>

          <a class="btn-detail" href="/src/pages/detalls_anuncis.html#id=${a.anunci_id}">Ver detalles</a>
        </div>
      </article>
    `;
  }

  async function carregar(paramsObj){
    const qs = new URLSearchParams(paramsObj || {}).toString();
    cont.innerHTML = '<p>Cargando…</p>';
    try {
      const r = await fetch(`http://localhost:3001/anuncis${qs ? `?${qs}` : ''}`, { credentials: 'include' });
      const L = r.ok ? await r.json() : [];
      if (!L.length) { cont.innerHTML = '<p>No hay anuncios que cumplan los filtros.</p>'; return; }
      cont.innerHTML = L.map(cardHTML).join('');
    } catch (e){
      console.error(e);
      cont.innerHTML = '<p>Error cargando anuncios.</p>';
    }
  }

  // Reacciona als canvis de filtres
  window.addEventListener('filters:changed', (ev) => {
    carregar(ev.detail || {});
  });

  // Carrega inicial si s’entra amb ?query
  const initial = Object.fromEntries(new URLSearchParams(location.search));
  carregar(initial);
});