document.addEventListener('DOMContentLoaded', async () => {
  const cont = document.getElementById('detall-cont');

  // Llegeix id de ?id=... o de #id=...
  function getAdId() {
    // 1) query
    const qsId = new URLSearchParams(location.search).get('id');
    if (qsId) return qsId;
    // 2) hash
    const raw = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const h = new URLSearchParams(raw);
    return h.get('id');
  }

  const id = getAdId();
  console.log('[detalls] id=', id); // debug

  if (!id) {
    cont.innerHTML = '<p>No se ha especificado ningún anuncio.</p>';
    return;
  }

  try {
    const r = await fetch(`http://localhost:3001/anuncis/${id}`, { credentials: 'include' });
    if (!r.ok) throw new Error('No se pudo cargar el anuncio');
    const a = await r.json();
    // Map de sexe (BBDD en català -> UI en castellà)
    const sexoES = (() => {
      const v = (a.sexe || '').toLowerCase();
      if (v === 'mascle') return 'Macho';
      if (v === 'femella') return 'Hembra';
      if (v === 'mascle castrat') return 'Macho castrado';
      return '';
    })();
    cont.innerHTML = `
      <article class="detail-card">
        <div class="detail-img">
          <img src="http://localhost:3001/anuncis/${a.anunci_id}/portada" alt="Foto ${a.nom}" style="max-width:100%;border-radius:.5rem;">
        </div>
        <div class="detail-body">
          <h2 style="margin-top:.5rem;">${a.nom || 'Sin nombre'}</h2>
          <p class="sub">${[a.raca || '', sexoES].filter(Boolean).join(' · ')}</p>
          ${a.preu != null ? `<p class="price" style="font-weight:600;">${Number(a.preu).toFixed(2)} €</p>` : ''}
          ${a.data_naixement ? `<p>Año de nacimiento: ${(new Date(a.data_naixement)).getFullYear()}</p>` : ''}
          ${a.alcada != null ? `<p>Alzada: ${a.alcada} m</p>` : ''}
          ${a.pes != null ? `<p>Peso: ${a.pes} kg</p>` : ''}
          ${a.capa ? `<p>Capa: ${a.capa}</p>` : ''}
          <p>${a.descripcio ? a.descripcio : ''}</p>
          ${(a.disciplines||[]).length
            ? `<div class="tags">${a.disciplines.map(d=>`<span class="tag">${d.nom}</span>`).join('')}</div>`
            : ''
          }
          ${a.lat!=null && a.lon!=null ? `<p>Ubicación: ${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}</p>` : ''}
        </div>
      </article>
    `;
      
    const BASE_API = 'http://localhost:3001';
    const urls = (a.imatges && a.imatges.length) ? a.imatges.map(im => `${BASE_API}${im.url}`): [`${BASE_API}/anuncis/${a.anunci_id}/portada`];
    const wrap = cont.querySelector('.detail-img');
    addImageCarousel(wrap, urls);
    

  } catch (e) {
    console.error(e);
    cont.innerHTML = '<p>Error cargando el anuncio.</p>';
  }

  // Crea un mini carrusel sobre la imatge existent
  function addImageCarousel(imgWrapEl, urls) {
    if (!imgWrapEl || !Array.isArray(urls) || urls.length === 0) return;

    // agafa la <img> que ja existeix al markup
    const img = imgWrapEl.querySelector('img');
    if (!img) return;

    // estat intern
    let i = 0;
    const setSrc = () => { img.src = urls[i]; };

    // només una imatge → no calen fletxes
    if (urls.length === 1) { setSrc(); return; }

    // construeix botons
    const mkBtn = (txt) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = txt;
      b.style.cssText = `
        position:absolute; top:50%; transform:translateY(-50%);
        background:rgba(0,0,0,.55); color:#fff; border:none; cursor:pointer;
        width:36px; height:36px; border-radius:999px; font-size:16px; line-height:36px;
      `;
      return b;
    };

    imgWrapEl.style.position = 'relative';
    const prev = mkBtn('◀'); prev.style.left  = '8px';
    const next = mkBtn('▶'); next.style.right = '8px';
    imgWrapEl.appendChild(prev);
    imgWrapEl.appendChild(next);

    // handlers
    prev.addEventListener('click', () => { i = (i - 1 + urls.length) % urls.length; setSrc(); });
    next.addEventListener('click', () => { i = (i + 1) % urls.length; setSrc(); });

    // navegació amb teclat (opcional)
    imgWrapEl.tabIndex = 0;
    imgWrapEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  prev.click();
      if (e.key === 'ArrowRight') next.click();
    });

    // arrencada
    setSrc();
  }

});
