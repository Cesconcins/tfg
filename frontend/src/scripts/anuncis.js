document.addEventListener('DOMContentLoaded', async () => {
  const cont = document.getElementById('ads-container');
  try {
    const res   = await fetch('http://localhost:3001/anuncis');
    const dades = await res.json();
    dades.forEach(a => {
      const card = document.createElement('div');
      card.className = 'card-anunci';
      card.innerHTML = `
        <div class="card-img">
          <img src="../../public/uploads/cavall_prova.jpg" alt="Foto ${a.nom}">
          ${a.destacat ? '<span class="badge">Destacat</span>' : ''}
        </div>
        <div class="card-body">
          <h3>${a.nom}</h3>
          <p class="sub">${a.raca} • ${calculateAge(a.data_naixement)} anys</p>
          <p class="price">${Number(a.preu).toFixed(2)} €</p>
          <div class="tags">
          ${
            (Array.isArray(a.disciplines) ? a.disciplines : [])
            .map(d => `<span class="tag">${d.nom ?? d}</span>`)
            .join('')
          }
          <p class="desc">${a.descripcio.slice(0,80)}…</p>
          <a href="detall.html?id=${a.anunci_id}" class="btn-detail">Veure detall</a>
        </div>`;
      cont.appendChild(card);
    });
  } catch(e){ console.error(e); cont.innerHTML='<p>Error carregant anuncis.</p>'; }
});

// Funcció simple per calcular edats
function calculateAge(dnaStr) {
  const dna=new Date(dnaStr), now=new Date();
  let age=now.getFullYear()-dna.getFullYear();
  dna.setFullYear(now.getFullYear());
  if (dna>now) age--;
  return age;
}
