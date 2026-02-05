let itineraryMarkers = [];

function clearItineraryMarkers(map) {
  itineraryMarkers.forEach(m => map.removeLayer(m));
  itineraryMarkers = [];
}

function addItineraryMarkers(map, itinerary) {
  clearItineraryMarkers(map);

  itinerary.forEach(day => {
    day.attractions?.forEach(p => addMarker(map, p, "🏛"));
    day.food?.forEach(p => addMarker(map, p, "🍽"));
    if (day.stay) addMarker(map, day.stay, "🏨");
  });
}

function addMarker(map, place, emoji) {
  const marker = L.marker([place.lat, place.lng])
    .addTo(map)
    .bindPopup(`<strong>${emoji} ${place.name}</strong>`);

  itineraryMarkers.push(marker);
}


function enableItineraryMapSync(map) {
  document.addEventListener("click", e => {
    const item = e.target.closest(".place-item");
    if (!item) return;

    const lat = Number(item.dataset.lat);
    const lng = Number(item.dataset.lng);
    const name = item.dataset.name || "";

    if (isNaN(lat) || isNaN(lng)) return;

    map.setView([lat, lng], 15, { animate: true });

    L.popup()
      .setLatLng([lat, lng])
      .setContent(`<strong>${name}</strong>`)
      .openOn(map);
  });
}
