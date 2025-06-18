document.addEventListener('DOMContentLoaded', () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2VzY29vbmNpbnMiLCJhIjoiY2x6OXNlYWVhMGNycDJpc2FqOHIxcnptMSJ9.B5S4fz3B_IyesJNwlb2fXA';
  
    const map = new mapboxgl.Map({
        container: 'map',
        style:     'mapbox://styles/mapbox/streets-v12',
        center:    [2.24741, 41.45004],
        zoom:      13.5
    });
  
    let userMarker = null;
    let userPopup  = null;
  
    // Posició de l'usuari
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            if (userMarker) userMarker.remove();
            userMarker = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .addTo(map);
  
            map.setCenter([longitude, latitude]);
  
            if (userPopup) userPopup.remove();
            userPopup = new mapboxgl.Popup({ offset: 25 })
                .setLngLat([longitude, latitude])
                .setText('You are here!')
                .addTo(map);
        },
            (err) => { console.error("No s'ha pogut obtenir la posició de l'usuari", err); },
        {
            enableHighAccuracy: true,
            maximumAge:         3600000,
            timeout:            5000
        }
    );
});
  