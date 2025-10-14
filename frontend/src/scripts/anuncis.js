document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('ads-container');
  if (!cont) return;

  function cardHTML(a){
    return `
      <article class="card-anunci">
        <div class="card-img">
          <img src="http://localhost:3001/anuncis/${a.anunci_id}/portada">
          ${a.destacat ? '<span class="badge">🏅 Destacado</span>' : ''}
        </div>
        <div class="card-body">
          <h3>${a.nom}</h3>
          <p class="sub">${a.raca || ''}</p>
          <p class="price">${Number(a.preu).toFixed(2)} €</p>
          ${a.distancia_km != null ? `<p class="dist">${a.distancia_km.toFixed(1)} km</p>` : ''}
          <div class="tags">${(a.disciplines||[]).map(d=>`<span class="tag">${d.nom}</span>`).join('')}</div>
          <a class="btn-detail" href="/src/pages/detalls_anuncis.html?id=${a.anunci_id}">Ver detalle</a>
        </div>
      </article>
    `;
  }

  async function carregar(paramsObj){
    const qs = new URLSearchParams(paramsObj || {}).toString();
    cont.innerHTML = '<p>Cargando…</p>';
    try {
      const r = await fetch(`http://localhost:3001/anuncis${qs ? `?${qs}` : ''}`);
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