function renderItinerary(tripPlan, city) {
  window.currentTripPlan = tripPlan;

  const container = document.getElementById("itinerary");
  if (!container) {
    console.error("❌ #itinerary container not found");
    return;
  }

  //Wrapper
  container.innerHTML = `
    <div class="itinerary-wrap" id="dayWrap"></div>
  `;

  const wrap = document.getElementById("dayWrap");

  //Day cards
  tripPlan.forEach(day => {
    wrap.insertAdjacentHTML("beforeend", renderDay(day));
  });

  //Show + animate map
  const mapEl = document.getElementById("map");
  if (mapEl && window.gsap) {
    mapEl.style.display = "block";

    gsap.fromTo(
      mapEl,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    setTimeout(() => {
      if (window.map) map.invalidateSize();
    }, 350);
  }

  //Init map
  if (city?.lat && city?.lon && typeof initMap === "function") {
    initMap(city.lat, city.lon);
  }

  //Markers
  if (typeof addItineraryMarkers === "function") {
    addItineraryMarkers(map, tripPlan);
  }

  //Animate cards
  if (window.gsap) {
    gsap.from(".day-card", {
      opacity: 0,
      y: 24,
      duration: 0.45,
      stagger: 0.12,
      ease: "power2.out"
    });
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
    <div class="place-group" style=" margin-bottom: 17px; padding: 10px;">
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

      <p class="place-address">${place.address || ""}</p>

      ${place.distance != null
        ? `<small>${place.distance.toFixed(1)} km from city center</small>`
        : ""
      }

      ${place.transport
        ? `
          <div class="transport-info">
            ${getTransportEmoji(place.transport.mode)}
            ${place.transport.mode}
            • ${place.transport.distance} km
            • ₹${place.transport.fare}
          </div>
        `
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

function getTransportEmoji(mode) {
  if (mode.includes("Auto")) return "🛺";
  if (mode.includes("Bus")) return "🚌";
  return "🚆";
}

const pdfBtn = document.getElementById("downloadPdfBtn");
if (pdfBtn) pdfBtn.disabled = false;
