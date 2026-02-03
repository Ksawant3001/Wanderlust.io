document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  if (!window.currentTripPlan || !window.currentTripPlan.length) {
    alert("Generate a trip first");
    return;
  }

  const pdfContainer = document.createElement("div");
  pdfContainer.style.padding = "20px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.fontSize = "12px";

  pdfContainer.innerHTML = buildPdfHtml(window.currentTripPlan);

  document.body.appendChild(pdfContainer);

  const options = {
    margin: 15,
    filename: "trip-itinerary.pdf",
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf()
    .set(options)
    .from(pdfContainer)
    .save()
    .then(() => {
      document.body.removeChild(pdfContainer);
    });
});
 
function buildPdfHtml(tripPlan) {
  return tripPlan
    .map(day => `
      <div style="margin-bottom: 20px;">
        <h2 style="margin-bottom: 6px;">Day ${day.day}</h2>

        ${renderPdfSection("Attractions", day.attractions)}
        ${renderPdfSection("Food", day.food)}
        ${renderPdfStay(day.stay)}

        <hr style="margin-top: 12px;" />
      </div>
    `)
    .join("");
}

function renderPdfSection(title, items = []) {
  if (!items.length) return "";

  return `
    <div style="margin-bottom: 8px;">
      <strong>${title}:</strong>
      <ul>
        ${items.map(i => `<li>${i.name}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderPdfStay(stay) {
  if (!stay) return "";

  return `
    <div style="margin-bottom: 8px;">
      <strong>Stay:</strong>
      <p>${stay.name}</p>
    </div>
  `;
}
