document.addEventListener('DOMContentLoaded', () => {
    const mapSection   = document.getElementById('map-section');
    const adsSection   = document.getElementById('ads-section');
    const toggleBtn    = document.getElementById('toggle-view-btn');
  
    // Estat actual: 'map' o 'ads'
    let currentView = 'map';
  
    toggleBtn.addEventListener('click', () => {
      if (currentView === 'map') {
        // Mostrar anuncis
        mapSection.classList.add('hidden');
        adsSection.classList.remove('hidden');
  
        // Actualitza el text del botó
        toggleBtn.textContent = 'Mapa';
        currentView = 'ads';
      } else {
        // Mostrar mapa
        adsSection.classList.add('hidden');
        mapSection.classList.remove('hidden');
  
        // Text
        toggleBtn.textContent = 'Anuncis';
        currentView = 'map';
      }
    });
});
  