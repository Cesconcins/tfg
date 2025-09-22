document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('anuncio-form');
  if (!form) return;

  const errorBox = document.getElementById('form-error');
  const okBox    = document.getElementById('form-ok');

  const params = new URLSearchParams(location.search);
  const id = params.get('id'); // si hi és → editar

  // Si és edició, pre-carrega dades
  if (id) {
    try {
      const r = await fetch(`http://localhost:3001/anuncis/${id}`, { credentials:'include' });
      if (!r.ok) throw new Error('No se pudo cargar el anuncio');
      const a = await r.json();

      form.nom.value  = a.nom || '';
      form.raca.value = a.raca || '';
      form.preu.value = a.preu ?? '';
      if (a.data_naixement) form.data_naixement.value = a.data_naixement.slice(0,10);
      form.capa.value   = a.capa   || '';
      form.alcada.value = a.alcada ?? '';
      form.pes.value    = a.pes    ?? '';
      form.sexe.value   = a.sexe   || '';
      form.lat.value    = a.lat    ?? '';
      form.lon.value    = a.lon    ?? '';
      form.descripcio.value = a.descripcio || '';
    } catch (e) {
      console.error(e);
      errorBox.textContent = 'Error cargando el anuncio.';
      errorBox.style.display = 'block';
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    errorBox.style.display='none'; okBox.classList.add('hidden');

    const payload = Object.fromEntries(new FormData(form).entries());
    // converteix nombres buits a null
    for (const k of ['preu','alcada','pes','lat','lon']) {
      if (payload[k] === '') payload[k] = null;
      else if (payload[k] != null) payload[k] = Number(payload[k]);
    }

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

      okBox.classList.remove('hidden');

      // torna al perfil al cap d’uns segons
      setTimeout(() => location.href = '/src/pages/perfil.html', 700);
    } catch (e) {
      console.error(e);
      errorBox.textContent = e.message || 'Error en el formulario.';
      errorBox.style.display = 'block';
    }
  });
});
