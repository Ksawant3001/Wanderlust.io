
function renderItinerary(tripPlan, city) {
  window.currentTripPlan = tripPlan;
  const container = document.getElementById("itinerary");
  if (!container) {
    console.error("❌ #itinerary container not found");
    return;
  }

  container.innerHTML = `
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3" id="dayRow"></div>
`;

  // Initialize map at city center
  if (city?.lat && city?.lon && typeof initMap === "function") {
    initMap(city.lat, city.lon);
  }

const row = document.getElementById("dayRow");

tripPlan.forEach(day => {
  row.insertAdjacentHTML(
    "beforeend",
    `<div class="col">${renderDay(day)}</div>`
  );
});

  // Add markers for all itinerary places (mapSync.js)
  if (typeof addItineraryMarkers === "function") {
    addItineraryMarkers(map, tripPlan);
  }
}


function renderDay(day) {
  return `
    <div class="day-card">
      <div class="day-card-header">
        <h3>Day ${day.day}</h3>
        <span class="trip-style-badge ${day.tripStyle}">
          ${day.tripStyle}
        </span>
      </div>

      ${renderPlaces(day.attractions, "🏛 Attractions")}
      ${renderPlaces(day.food, "🍽 Food")}
      ${renderStay(day.stay)}
    </div>
  `;
}

function renderPlaces(list = [], label) {
  if (!list.length) return "";

  return `
    <div class="place-group">
      <h4>${label}</h4>
      <div class="scroll-box">
        ${list.map(place => renderPlace(place)).join("")}
      </div>
    </div>
  `;
}


function renderPlace(place) {
  return `
    <div class="place-item"
         data-lat="${place.lat}"
         data-lng="${place.lng}"
         data-name="${place.name}">

      <h5>
        ${place.name}
        ${place.isTopPick ? `<span class="top-pick">Top Pick</span>` : ""}
      </h5>

      <p class="place-address">
        ${place.address || ""}
      </p>

      ${place.distance != null
        ? `<small>${place.distance.toFixed(1)} km away</small>`
        : ""
      }
    </div>
  `;
}


function renderStay(stay) {
  if (!stay) return "";

  return `
    <div class="place-group">
      <h4>🏨 Stay</h4>
      ${renderPlace(stay)}
    </div>
  `;
}

const pdfBtn = document.getElementById("downloadPdfBtn");
if (pdfBtn) pdfBtn.disabled = false;

