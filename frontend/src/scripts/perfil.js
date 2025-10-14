document.addEventListener('DOMContentLoaded', async () => {
  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // 1) Assegura que el markup del perfil és al DOM
  await new Promise(resolve => {
    if ($('#perfil-box')) return resolve();
    const id = setInterval(() => { if ($('#perfil-box')) { clearInterval(id); resolve(); } }, 30);
  });

  const msg = $('#perfil-msg');
  const err = $('#perfil-err');

  // 2) Referències als camps (null-safe)
  const spans  = {
    nom: $('[data-field="nom"]'),
    cognom: $('[data-field="cognom"]'),
    correu_electronic: $('[data-field="correu_electronic"]'),
    telefon: $('[data-field="telefon"]')
  };
  const inputs = {
    nom: $('[data-input="nom"]'),
    cognom: $('[data-input="cognom"]'),
    correu_electronic: $('[data-input="correu_electronic"]'),
    telefon: $('[data-input="telefon"]'),
    contrassenya: $('[data-input="contrassenya"]')
  };

  // (Opcional) debug si falta algun node
  Object.entries(spans).forEach(([k, el]) => { if (!el)  console.warn(`Falta <span data-field="${k}">`); });
  Object.entries(inputs).forEach(([k, el]) => { if (!el) console.warn(`Falta <input data-input="${k}">`); });

  const btnEdit = $('#btn-edit');
  const btnSave = $('#btn-save');
  const btnCancel = $('#btn-cancel');
  const btnDelete = $('#btn-delete');
  const pwBox = $('#pw-box');

  let user = null;

  // 3) Qui sóc (inclou correu i telèfon via middleware auth)
  const who = await fetch('http://localhost:3001/usuaris/whoami', { credentials: 'include' });
  if (who.status === 401) { location.href = '/src/pages/login.html'; return; }
  user = await who.json();

  const isAdmin = !!Number(user?.administrador);
  const cta = document.getElementById('admin-cta');
  if (cta) cta.classList.toggle('hidden', !isAdmin);

  const fill = (u) => {
    if (spans.nom) spans.nom.textContent = u.nom ?? '';
    if (spans.cognom) spans.cognom.textContent = u.cognom ?? '';
    if (spans.correu_electronic) spans.correu_electronic.textContent = u.correu_electronic ?? '';
    if (spans.telefon) spans.telefon.textContent = u.telefon ?? '-';

    if (inputs.nom) inputs.nom.value = u.nom ?? '';
    if (inputs.cognom) inputs.cognom.value = u.cognom ?? '';
    if (inputs.correu_electronic) inputs.correu_electronic.value = u.correu_electronic ?? '';
    if (inputs.telefon) inputs.telefon.value = u.telefon ?? '';
  };
  fill(user);

  if (user.administrador) { const cta = $('#admin-cta'); if (cta) cta.classList.remove('hidden'); }

  const setMode = (on) => {
    $$('.field-row .v').forEach(e => e.classList.toggle('hidden', on));
    $$('.field-row .i').forEach(e => e.classList.toggle('hidden', !on));
    if (btnEdit) btnEdit.classList.toggle('hidden', on);
    if (btnSave) btnSave.classList.toggle('hidden', !on);
    if (btnCancel) btnCancel.classList.toggle('hidden', !on);
    if (pwBox) pwBox.classList.toggle('hidden', !on);
    if (msg) msg.classList.add('hidden');
    if (err) err.classList.add('hidden');
  };

  btnEdit  && btnEdit.addEventListener('click', () => setMode(true));
  btnCancel&& btnCancel.addEventListener('click', () => { fill(user); if (inputs.contrassenya) inputs.contrassenya.value=''; setMode(false); });

  // 4) Desa canvis (→ /perfil)
  btnSave && btnSave.addEventListener('click', async () => {
    try {
      if (msg) msg.classList.add('hidden');
      if (err) err.classList.add('hidden');

      const payload = {
        nom: inputs.nom?.value.trim(),
        cognom: inputs.cognom?.value.trim(),
        telefon: inputs.telefon?.value.trim() || null
      };
      const pwd = inputs.contrassenya?.value.trim();
      if (pwd) payload.contrassenya = pwd;

      const res = await fetch('http://localhost:3001/usuaris/whoami', {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('No s’han pogut desar els canvis');

      user = await res.json();
      fill(user);
      if (inputs.contrassenya) inputs.contrassenya.value = '';
      if (msg) msg.classList.remove('hidden');
      setMode(false);
    } catch (e) {
      console.error(e);
      if (err) { err.textContent = 'Error desant canvis.'; err.classList.remove('hidden'); }
    }
  });

  // 5) Esborrar compte (→ /perfil)
  btnDelete && btnDelete.addEventListener('click', async () => {
    if (!confirm('Segur que vols esborrar el compte? Aquesta acció és irreversible.')) return;
    try {
      const res = await fetch('http://localhost:3001/usuaris/whoami', { method: 'DELETE', credentials:'include' });
      if (!res.ok) throw new Error('Error esborrant el compte');
      location.href = '/public/index.html';
    } catch (e) {
      console.error(e);
      alert('No s’ha pogut esborrar el compte.');
    }
  });

  // 6) Els meus anuncis (→ /perfil/anuncis)
  try {
    const r = await fetch('http://localhost:3001/perfil/anuncis', { credentials:'include' });
    const l = r.ok ? await r.json() : [];
    const cont = $('#meus-anuncis');
    if (cont) {
      cont.innerHTML = l.length ? '' : '<p>No tens anuncis.</p>';
      l.forEach(a => {
        const card = document.createElement('article');
        card.className = 'card-anunci';
        card.innerHTML = `
          <div class="card-img">
            <img src="/uploads/cavall_prova.jpg" alt="Foto ${a.nom}">
            ${a.destacat ? '<span class="badge">🏅 Destacat</span>' : ''}
          </div>
          <div class="card-body">
            <h3>${a.nom}</h3>
            <p class="sub">${a.raça || ''}</p>
            <p class="price">${Number(a.preu).toFixed(2)} €</p>
            <div class="tags">${(a.disciplines||[]).map(d=>`<span class="tag">${d.nom}</span>`).join('')}</div>
            <a class="btn-detail" href="/src/pages/detalls_anuncis.html?id=${a.anunci_id}">Ver más detalles</a>
          </div>`;
        cont.appendChild(card);
      });
    }
  } catch (e) {
    console.error(e);
    const cont = $('#meus-anuncis');
    if (cont) cont.innerHTML = '<p>Error carregant els teus anuncis.</p>';
  }
});
