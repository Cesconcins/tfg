document.addEventListener('DOMContentLoaded', async () => {
  // 1) Segueix mostrant el resum (ja ho tenies)
  try {
    const res = await fetch('http://localhost:3001/admin/dashboard', { credentials: 'include' });
    if (res.status === 401) { location.href = '/src/pages/login.html'; return; }
    if (res.status === 403) { location.href = '/src/pages/perfil.html'; return; }

    const d = await res.json();
    document.getElementById('n-usuaris').textContent = d.total_usuaris ?? '—';
    document.getElementById('n-anuncis').textContent = d.total_anuncis ?? '—';
  } catch (e) {
    console.error(e);
    alert('Error cargando el panel de administrador');
  }

  // 2) Llista d’anuncis amb accions d’admin
  const cont = document.getElementById('admin-anuncios');

  // helper: badge per estat
  const estatBadge = (estat) => {
    const map = {
      pendent:  {txt:'Pendiente', color:'#f59e0b'},
      validat:  {txt:'Validado',  color:'#10b981'},
      rebutjat: {txt:'Rechazado', color:'#ef4444'}
    };
    const v = map[estat] || {txt: estat, color:'#9ca3af'};
    return `<span class="badge" style="background:${v.color};">${v.txt}</span>`;
  };

  async function carregar() {
    cont.innerHTML = '<p>Cargando anuncios…</p>';
    try {
      // Llegim tots els anuncis (endpoint públic)
      const r = await fetch('http://localhost:3001/anuncis', { credentials:'include' });
      const L = r.ok ? await r.json() : [];
      if (!L.length) { cont.innerHTML = '<p>No hay anuncios.</p>'; return; }

      cont.innerHTML = '';
      L.forEach(a => {
        const card = document.createElement('article');
        card.className = 'card-anunci';
        card.dataset.id = a.anunci_id;

        card.innerHTML = `
          <div class="card-img">
            <img src="/uploads/cavall_prova.jpg" alt="Foto ${a.nom}">
            ${a.destacat ? '<span class="badge">🏅 Destacado</span>' : ''}
          </div>
          <div class="card-body">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:.5rem;">
              <h3 style="margin:0;">${a.nom}</h3>
              ${estatBadge(a.estat)}
            </div>

            <p class="sub">${a.raca || ''} · ${a.data_naixement ? (new Date(a.data_naixement)).getFullYear() : ''}</p>
            <p class="price" style="margin:.25rem 0;">${Number(a.preu).toFixed(2)} €</p>
            <div class="tags" style="margin-bottom:.5rem;">
              ${(a.disciplines||[]).map(d=>`<span class="tag">${d.nom}</span>`).join('')}
            </div>

            <div class="form-actions" style="gap:.5rem;">
              <a class="btn-secondary" href="/src/pages/detalls_anuncis.html?id=${a.anunci_id}">Ver detalle</a>
              <button class="btn-primary"  data-action="validar"  data-id="${a.anunci_id}">Validar</button>
              <button class="btn-secondary" data-action="rechazar" data-id="${a.anunci_id}">Rechazar</button>
              <button class="btn-danger"    data-action="eliminar" data-id="${a.anunci_id}">Eliminar</button>
            </div>
          </div>
        `;
        cont.appendChild(card);
      });

    } catch (e) {
      console.error(e);
      cont.innerHTML = '<p>Error cargando anuncios.</p>';
    }
  }

  // Accions: validar / rechazar / eliminar
  cont.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-action]');
    if (!btn) return;
    const id   = btn.getAttribute('data-id');
    const act  = btn.getAttribute('data-action');

    try {
      if (act === 'eliminar') {
        if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return;
        const r = await fetch(`http://localhost:3001/anuncis/${id}`, {
          method:'DELETE', credentials:'include'
        });
        if (!r.ok) throw new Error('No se pudo eliminar');
        // treu la card
        const card = cont.querySelector(`[data-id="${id}"]`);
        if (card) card.remove();
        return;
      }

      if (act === 'validar' || act === 'rechazar') {
        const nou = act === 'validar' ? 'validat' : 'rebutjat';
        const r = await fetch(`http://localhost:3001/anuncis/${id}/estat`, {
          method: 'PATCH',
          headers: { 'Content-Type':'application/json' },
          credentials: 'include',
          body: JSON.stringify({ estat: nou })
        });
        if (!r.ok) throw new Error('No se pudo cambiar el estado');

        // Actualitza només la badge d’estat de la card
        const card = cont.querySelector(`[data-id="${id}"]`);
        if (card) {
          const header = card.querySelector('.card-body > div');
          const oldBadge = header.querySelector('.badge:last-child');
          if (oldBadge) oldBadge.remove();
          header.insertAdjacentHTML('beforeend', 
            nou === 'validat'
              ? `<span class="badge" style="background:#10b981;">Validado</span>`
              : `<span class="badge" style="background:#ef4444;">Rechazado</span>`
          );
        }
        return;
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Acción no disponible');
    }
  });

  await carregar();
});
