document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    const root = document.getElementById('detall');
    const tpl  = document.getElementById('detall-template');

    if (!id) { root.textContent = 'No s’ha indicat cap anunci.'; return; }

    try {
        const res = await fetch(`http://localhost:3001/anuncis/${id}`);
        if (res.status === 404) { root.textContent = 'Anunci no trobat.'; return; }
        if (!res.ok) throw new Error('Error al servidor');

        const a = await res.json();

        const node = tpl.content.cloneNode(true);

        // Omplir camps
        node.querySelector('.detall-img').alt         = `Foto de ${a.nom}`;
        node.querySelector('.detall-nom').textContent = a.nom;
        if (a.destacat) node.querySelector('.badgetop').classList.remove('hidden');

        node.querySelector('.detall-preu').textContent = `${Number(a.preu).toFixed(2)} €`;
        node.querySelector('.detall-desc').textContent = a.descripcio || '';

        node.querySelector('.detall-raca').textContent   = a.raça ?? '-';
        node.querySelector('.detall-edat').textContent   = `${calculateAge(a.data_naixement)} anys`;
        node.querySelector('.detall-alcada').textContent = a.alçada ?? '-';
        node.querySelector('.detall-pes').textContent    = a.pes ?? '-';
        node.querySelector('.detall-sexe').textContent   = a.sexe ?? '-';
        node.querySelector('.detall-ubicacio').textContent =
            (a.lat != null && a.lon != null) ? `${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}` : '-';

        // Disciplines
        const tags = node.querySelector('.detall-disciplines');
        (a.disciplines || []).forEach(d => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = d.nom;
            tags.appendChild(span);
        });

        root.appendChild(node);

        // Mapa
        if (a.lat != null && a.lon != null) initMapDetall(a.lon, a.lat, a.nom, a.preu);
        else document.getElementById('map-detall').outerHTML = '<p>No hi ha coordenades.</p>';

    } catch (err) {
        console.error(err);
        root.textContent = 'Error carregant l’anunci.';
    }
});

function calculateAge(dnaStr) {
    if (!dnaStr) return '-';
    const dna = new Date(dnaStr), now = new Date();
    let age = now.getFullYear() - dna.getFullYear();
    dna.setFullYear(now.getFullYear());
    if (dna > now) age--;
    return age;
}

function initMapDetall(lon, lat, nom, preu) {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiY2VzY29uY2lucyIsImEiOiJjbWMyYXprMzcwNmNvMmtxd2ZneXk3d2F3In0.qeJAnsLCCvTMvbs5_W_WBg';

    const map = new mapboxgl.Map({
        container: 'map-detall',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lon, lat],
        zoom: 13
    });

    const icon = document.createElement('img');
    icon.src   = '/src/assets/horse-marker1.png';
    icon.alt   = nom;
    icon.style.width = '28px';
    icon.style.height = '28px';

    // Popup sense HTML (DOM pur)
    const wrap = document.createElement('div');
    const img  = document.createElement('img');
    img.src = '/uploads/cavall_prova.jpg';
    img.alt = `Foto ${nom}`;
    img.style.width = '120px';
    img.style.height = '80px';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    img.style.marginBottom = '.25rem';
    const strong = document.createElement('strong'); strong.textContent = nom;
    const br = document.createElement('br');
    const price = document.createTextNode(`${Number(preu).toFixed(2)} €`);
    wrap.append(img, strong, br, price);

    new mapboxgl.Marker({ element: icon, anchor: 'bottom' })
        .setLngLat([lon, lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setDOMContent(wrap))
        .addTo(map);
}
