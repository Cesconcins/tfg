// /src/scripts/admin.js
// UI en castellano; BBDD en catalán.

document.addEventListener('DOMContentLoaded', async () => {
  const BASE_API = 'http://localhost:3001';

  // ── 1) Guard de admin + resumen
  try {
    const who = await fetch(`${BASE_API}/admin/dashboard`, { credentials:'include' });
    if (who.status === 401) { location.href = '/src/pages/login.html'; return; }
    if (who.status === 403) { location.href = '/src/pages/perfil.html'; return; }
    const d = await who.json();
    const nU = document.getElementById('n-usuaris');
    const nA = document.getElementById('n-anuncis');
    if (nU) nU.textContent = d.total_usuaris ?? '—';
    if (nA) nA.textContent = d.total_anuncis ?? '—';
  } catch (e) {
    console.error('Error cargando dashboard admin:', e);
    return; // no mostrem alert per no molestar
  }

  // ── 2) UI refs + helpers
  const cont = document.getElementById('admin-anuncios');
  const selEstat = document.getElementById('f-estat');
  const btnRefresh = document.getElementById('btn-refresh');

  const ES_ESTAT = {
    pendent : { txt: 'Pendiente', color: '#f59e0b' },
    validat : { txt: 'Validado',  color: '#10b981' },
    rebutjat: { txt: 'Rechazado', color: '#ef4444' }
  };
  const badge = estat => {
    const v = ES_ESTAT[estat] || { txt: estat, color: '#9ca3af' };
    return `<span class="badge" style="background:${v.color};">${v.txt}</span>`;
  };

  function rowHTML(a) {
    const disc = (a.disciplines||[]).map(d => d.nom).join(', ');
    return `
      <article class="row-card" data-id="${a.anunci_id}">
        <img class="thumb" src="http://localhost:3001/anuncis/${a.anunci_id}/portada" alt="Foto ${a.nom}">
        <div>
          <h3 class="title" style="display:flex;gap:8px;align-items:center;margin:0;">
            ${a.nom || 'Sin nombre'}
            ${badge(a.estat)}
          </h3>
          <div class="meta">${a.raca || '—'} · ${a.sexe || '—'}</div>
          <div class="meta">${disc || ''}</div>
        </div>
        <div class="actions">
          <a class="btn" href="/src/pages/detalls_anuncis.html?id=${a.anunci_id}">Ver</a>
          <button class="btn"        data-action="validar"  data-id="${a.anunci_id}">Validar</button>
          <button class="btn-ghost"  data-action="rechazar" data-id="${a.anunci_id}">Rechazar</button>
          <button class="btn-danger" data-action="eliminar" data-id="${a.anunci_id}">Eliminar</button>
        </div>
      </article>
    `;
  }

  function buildURL() {
    // Mostra tots (all=1) i ordena per estat: pendent → validat → rebutjat
    let url = `${BASE_API}/anuncis?all=1&limit=500&estat_order=pendent,validat,rebutjat`;
    const v = selEstat?.value || 'tots';
    if (v !== 'tots') url += `&estat=${encodeURIComponent(v)}`;
    return url;
  }

  async function carregar() {
    cont.innerHTML = '<p>Cargando anuncios…</p>';
    try {
      const r = await fetch(buildURL(), { credentials:'include' });
      const L = r.ok ? await r.json() : [];
      if (!L.length) {
        const v = selEstat?.value || 'tots';
        cont.innerHTML = `<p>No hay anuncios${v!=='tots' ? ` en estado ${v}` : ''}.</p>`;
        return;
      }
      cont.innerHTML = L.map(rowHTML).join('');
    } catch (e) {
      console.error('Error cargando anuncios:', e);
      cont.innerHTML = '<p>Error cargando anuncios.</p>';
    }
  }

  selEstat?.addEventListener('change', carregar);
  btnRefresh?.addEventListener('click', carregar);

  // ── 3) Acciones admin
  cont.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-action]');
    if (!btn) return;

    const id   = btn.getAttribute('data-id');
    const acc  = btn.getAttribute('data-action');

    try {
      if (acc === 'validar') {
        const resp = await fetch(`${BASE_API}/anuncis/${id}/estat`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ estat: 'validat' })
        });
        if (!resp.ok) {
          // no alert: només consola
          let msg = `HTTP ${resp.status}`;
          try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
          console.error('Validar error:', msg);
        }
        // Recarrega per reflectir el nou estat i mantenir ordenació
        await carregar();
        return;
      }

      if (acc === 'rechazar') {
        const motiu = prompt('Indica el motivo del rechazo:');
        if (!motiu || !motiu.trim()) return;
        const resp = await fetch(`${BASE_API}/anuncis/${id}/estat`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ estat: 'rebutjat', motiu })
        });
        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`;
          try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
          console.error('Rechazar error:', msg);
        }
        await carregar();
        return;
      }

      if (acc === 'eliminar') {
        if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return;
        const resp = await fetch(`${BASE_API}/anuncis/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`;
          try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
          console.error('Eliminar error:', msg);
        }
        await carregar();
        return;
      }
    } catch (e) {
      // no alert; només consola
      console.error('Acción admin error:', e);
    }
  });

  
  await carregar();
});
