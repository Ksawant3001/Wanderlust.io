let selectedCity = null;

const cityInput = document.getElementById("cityInput");
const autocompleteList = document.getElementById("autocompleteList");

let debounceTimer = null;

cityInput.addEventListener("input", e => {
  const query = e.target.value.trim();

  // 🔒 If selected city matches input, do nothing
  if (selectedCity && query === selectedCity.name) {
    return;
  }

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    if (!query) {
      hideAutocomplete();
      return;
    }

      selectedCity = null;

    searchCities(query);
  }, 300);
});

async function searchCities(query) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/geocode?text=${encodeURIComponent(query)}`
    );
    const data = await res.json();

    if (!Array.isArray(data) || !data.length) {
      hideAutocomplete();
      return;
    }

    autocompleteList.innerHTML = data
      .map(f => {
        const name =
          f.properties.city ||
          f.properties.name ||
          f.properties.formatted;

        const lat = f.geometry.coordinates[1];
        const lon = f.geometry.coordinates[0];

        return `
          <div class="autocomplete-item"
               data-name="${name}"
               data-lat="${lat}"
               data-lon="${lon}">
            ${f.properties.formatted}
          </div>
        `;
      })
      .join("");

    autocompleteList.classList.add("open");
  } catch (err) {
    console.error("❌ City autocomplete failed", err);
    hideAutocomplete();
  }
}

cityInput.addEventListener("focus", () => {
  if (!cityInput.value.trim()) {
    hideAutocomplete();
  }
});

autocompleteList.addEventListener("click", e => {
  const item = e.target.closest(".autocomplete-item");
  if (!item) return;

  selectedCity = {
    name: item.dataset.name,
    lat: Number(item.dataset.lat),
    lon: Number(item.dataset.lon)
  };

  cityInput.value = selectedCity.name;

  hideAutocomplete();

  console.log("✅ Selected city:", selectedCity);
});


document.addEventListener("click", e => {
  if (
    !e.target.closest("#cityInput") &&
    !e.target.closest("#autocompleteList")
  ) {
    hideAutocomplete();
  }
});


function hideAutocomplete() {
  autocompleteList.classList.remove("open");
  autocompleteList.innerHTML = "";
}

window.getSelectedCity = function () {
  return selectedCity;
};
