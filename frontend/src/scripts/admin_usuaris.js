// /src/scripts/admin_usuaris.js
// UI en castellano; BBDD en català.

document.addEventListener('DOMContentLoaded', async () => {
  const BASE_API = 'http://localhost:3001';

  const contUsers = document.getElementById('admin-usuaris');

  // Toolbar dinàmica si no existeix
  if (contUsers && !document.getElementById('u-toolbar')) {
    const toolbar = document.createElement('div');
    toolbar.id = 'u-toolbar';
    toolbar.className = 'toolbar';
    toolbar.style.cssText = 'display:flex; gap:.5rem; align-items:center; margin:.5rem 0;';
    toolbar.innerHTML = `
      <label style="display:flex; gap:.5rem; align-items:center;">
        Estado
        <select id="u-actiu">
          <option value="tots">Todos</option>
          <option value="1">Activos</option>
          <option value="0">No Activos</option>
        </select>
      </label>
      <button id="u-refresh" class="btn-secondary">Actualizar</button>
      <button id="u-new" class="btn-primary">Nuevo</button>
    `;
    contUsers.parentElement.insertBefore(toolbar, contUsers);
  }

  const selActiu   = document.getElementById('u-actiu');
  const btnURef    = document.getElementById('u-refresh');
  const btnUNew    = document.getElementById('u-new');

  const badgeUser = (actiu) =>
    `<span class="badge" style="background:${actiu? '#10b981':'#9ca3af'};">${actiu? 'Activo':'Desactivado'}</span>`;

  const rowUserHTML = (u) => {
    const nomComplert = [u.nom, u.cognom].filter(Boolean).join(' ') || '(sin nombre)';
    const creat = u.creat_el ? new Date(u.creat_el).toLocaleDateString('es-ES') : '—';
    return `
      <article class="row-card user" data-uid="${u.usuari_id}">
        <div class="u-main">
          <h3 class="title" style="display:flex;gap:8px;align-items:center;margin:0;">
            ${nomComplert}
            <span class="badge" style="background:${u.actiu? '#10b981':'#9ca3af'};">
              ${u.actiu? 'Activo':'Desactivado'}
            </span>
            ${u.administrador ? '<span class="badge" style="background:#6366f1;">Admin</span>' : ''}
          </h3>
          <div class="meta">${u.correu_electronic || '—'}</div>
          <div class="meta">${u.telefon || '—'} · Alta: ${creat} · Anuncios: ${u.num_anuncis ?? 0}</div>
        </div>

        <div class="actions">
          <button class="btn"        data-uaction="edit"    data-uid="${u.usuari_id}">Editar</button>
          <button class="btn-ghost"  data-uaction="toggle"  data-uid="${u.usuari_id}">${u.actiu ? 'Desactivar':'Activar'}</button>
          <button class="btn-danger" data-uaction="delete"  data-uid="${u.usuari_id}">Eliminar</button>
        </div>
      </article>`;
  };


  const buildUsersURL = () => {
    const v = selActiu?.value || 'tots';
    let url = `${BASE_API}/usuaris/admin/llistat`;
    if (v === '1' || v === '0') url += `?actiu=${v}`;
    return url;
  };

  async function carregarUsers() {
    if (!contUsers) return;
    contUsers.innerHTML = '<p>Cargando usuarios…</p>';
    try {
      const r = await fetch(buildUsersURL(), { credentials: 'include' });
      const L = r.ok ? await r.json() : [];
      contUsers.innerHTML = L.length ? L.map(rowUserHTML).join('') : '<p>No hay usuarios.</p>';
    } catch (e) {
      console.error('Error cargando usuarios:', e);
      contUsers.innerHTML = '<p>Error cargando usuarios.</p>';
    }
  }

  selActiu?.addEventListener('change', carregarUsers);
  btnURef?.addEventListener('click', carregarUsers);

  btnUNew?.addEventListener('click', async () => {
    try {
      const nom  = prompt('Nombre:'); if (nom == null || !nom.trim()) return;
      const cognom = prompt('Apellidos:') || '';
      const correu = prompt('Email:'); if (correu == null || !correu.trim()) return;
      const tel   = prompt('Teléfono (opcional):') || null;
      const pwd   = prompt('Contraseña:'); if (pwd == null || !pwd.trim()) return;
      const esAdmin = confirm('¿Hacer administrador?');
      const actiu   = confirm('¿Cuenta activa?');

      const resp = await fetch(`${BASE_API}/usuaris/admin`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nom, cognom, correu_electronic: correu, telefon: tel,
          contrassenya: pwd, administrador: esAdmin, actiu
        })
      });
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`; try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
        console.error('Alta usuario error:', msg);
      }
      await carregarUsers();
    } catch (e) {
      console.error(e);
    }
  });

  contUsers?.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-uaction]');
    if (!btn) return;
    const uid = btn.getAttribute('data-uid');
    const acc = btn.getAttribute('data-uaction');

    try {
      if (acc === 'toggle') {
        const isDesactivar = btn.textContent.includes('Desactivar');
        const resp = await fetch(`${BASE_API}/usuaris/${uid}/actiu`, {
          method: 'PATCH',
          headers: { 'Content-Type':'application/json' },
          credentials: 'include',
          body: JSON.stringify({ actiu: !isDesactivar })
        });
        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`; try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
          console.error('Toggle actiu error:', msg);
        }
        await carregarUsers();
        return;
      }

      if (acc === 'delete') {
        if (!confirm('¿Eliminar este usuario?')) return;
        const resp = await fetch(`${BASE_API}/usuaris/${uid}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`; try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
          console.error('Eliminar usuario error:', msg);
        }
        await carregarUsers();
        return;
      }

      if (acc === 'edit') {
        const nom  = prompt('Nombre (dejar vacío para no cambiar):');
        const cognom = prompt('Apellidos (dejar vacío para no cambiar):');
        const correo = prompt('Email (dejar vacío para no cambiar):');
        const tel   = prompt('Teléfono (dejar vacío para no cambiar):');

        const payload = {};
        if (nom !== null && nom !== '') payload.nom = nom;
        if (cognom !== null && cognom !== '') payload.cognom = cognom;
        if (correo !== null && correo !== '') payload.correu_electronic = correo;
        if (tel !== null && tel !== '') payload.telefon = tel;

        const resp = await fetch(`${BASE_API}/usuaris/${uid}`, {
          method: 'PUT',
          headers: { 'Content-Type':'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`; try { const j = await resp.json(); if (j?.error) msg += ` · ${j.error}`; } catch {}
          console.error('Editar usuario error:', msg);
        }
        await carregarUsers();
        return;
      }
    } catch (e) {
      console.error('Acción usuario error:', e);
    }
  });

  await carregarUsers();
});
