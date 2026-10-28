// Lebanon Wildfire Explorer
// Milestone 3: map, layers, pop-ups, A | B swipe.  Milestone 4: search, filters, statistics panel.

const [GeoJSONLayer, PopupTemplate] = await $arcgis.import([
  "@arcgis/core/layers/GeoJSONLayer.js",
  "@arcgis/core/PopupTemplate.js"
]);

const DATA = "data/app/"; // folder that holds the GeoJSON / JSON files

const viewElement = document.querySelector("arcgis-map");
await viewElement.viewOnReady();

// =====================================================================
// 1. Renderers
// =====================================================================
const A_COLORS = { "Very low": "#ffffb2", "Low": "#fecc5c", "Moderate": "#fd8d3c", "High": "#e31a1c", "Very high": "#800026" };
const B_COLORS = { "Very low": "#edf8e9", "Low": "#bae4b3", "Moderate": "#74c476", "High": "#31a354", "Very high": "#006d2c" };

function classRenderer(colors) {
  return {
    type: "unique-value",
    field: "class",
    uniqueValueInfos: Object.entries(colors).map(([value, color]) => ({
      value,
      label: value,
      symbol: { type: "simple-fill", color, outline: { color: [255, 255, 255, 0], width: 0 } }
    }))
  };
}

const firesRenderer = {
  type: "unique-value",
  field: "period",
  uniqueValueInfos: [
    {
      value: "before_oct2023",
      label: "Before Oct 2023",
      symbol: { type: "simple-marker", style: "circle", size: 4.5, color: [38, 50, 56, 0.75], outline: { color: [255, 255, 255, 0.6], width: 0.4 } }
    },
    {
      value: "oct2023_onward",
      label: "Oct 2023 onward",
      symbol: { type: "simple-marker", style: "circle", size: 4.5, color: [0, 172, 193, 0.85], outline: { color: [255, 255, 255, 0.6], width: 0.4 } }
    }
  ]
};

// near-transparent fill (not fully 0) so that clicking inside a polygon still opens its pop-up
function outlineRenderer(width, color) {
  return { type: "simple", symbol: { type: "simple-fill", color: [255, 255, 255, 0.01], outline: { color, width } } };
}

// =====================================================================
// 2. Pop-ups
// =====================================================================
const firePopup = new PopupTemplate({
  title: "Fire detection, {date}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "date", label: "Date" },
        { fieldName: "period", label: "Period" },
        { fieldName: "confidence", label: "Confidence" },
        { fieldName: "frp_mw", label: "Fire radiative power (MW)" },
        { fieldName: "daynight", label: "Day / night" },
        { fieldName: "elev_m", label: "Elevation (m)" },
        { fieldName: "land_cover", label: "Land cover (dominant within 190 m)" },
        { fieldName: "likelihood_A", label: "Layer A class" },
        { fieldName: "fuel_terrain_B", label: "Layer B class" }
      ]
    },
    { type: "text", text: "<small>A satellite hotspot, not a confirmed wildfire.</small>" }
  ]
});

function adminPopup(isDistrict) {
  const fieldInfos = [];
  if (isDistrict) fieldInfos.push({ fieldName: "governorate", label: "Governorate" });
  fieldInfos.push(
    { fieldName: "area_km2", label: "Area (km²)", format: { digitSeparator: true, places: 0 } },
    { fieldName: "det_before_oct2023", label: "Detections before Oct 2023" },
    { fieldName: "det_oct2023_onward", label: "Detections Oct 2023 onward" },
    { fieldName: "det_per100km2_per_yr_before", label: "Density before (per 100 km² per year)", format: { places: 1 } },
    { fieldName: "det_per100km2_per_yr_after", label: "Density Oct 2023 onward (per 100 km² per year)", format: { places: 1 } },
    { fieldName: "A_high_or_very_high_pct", label: "Layer A: % of area High or Very high", format: { places: 0 } },
    { fieldName: "B_high_or_very_high_pct", label: "Layer B: % of area High or Very high", format: { places: 0 } }
  );
  return new PopupTemplate({
    title: "{name}",
    content: [
      { type: "fields", fieldInfos },
      { type: "text", text: "<small>Small areas can show extreme densities because of a few detections.</small>" }
    ]
  });
}

const classPopup = new PopupTemplate({
  title: "{layer}",
  content: "Class: <b>{class}</b><br><small>Exploratory layer, not a validated wildfire prediction.</small>"
});

// =====================================================================
// 3. Layers (added bottom to top)
// =====================================================================
const layerB = new GeoJSONLayer({
  url: DATA + "layerB_fuel_terrain_classes.geojson",
  title: "Layer B: Fuel and terrain susceptibility (exploratory)",
  renderer: classRenderer(B_COLORS),
  popupTemplate: classPopup,
  opacity: 0.65,
  visible: false
});

const layerA = new GeoJSONLayer({
  url: DATA + "layerA_likelihood_classes.geojson",
  title: "Layer A: Historical detection likelihood",
  renderer: classRenderer(A_COLORS),
  popupTemplate: classPopup,
  opacity: 0.65
});

const districts = new GeoJSONLayer({
  url: DATA + "admin_districts.geojson",
  title: "Districts",
  renderer: outlineRenderer(0.8, [90, 90, 90, 0.8]),
  popupTemplate: adminPopup(true),
  visible: false
});

const governorates = new GeoJSONLayer({
  url: DATA + "admin_governorates.geojson",
  title: "Governorates",
  renderer: outlineRenderer(1.6, [40, 40, 40, 0.9]),
  popupTemplate: adminPopup(false)
});

const fires = new GeoJSONLayer({
  url: DATA + "fire_points.geojson",
  title: "Fire detections (VIIRS, 2015 to 2025)",
  renderer: firesRenderer,
  popupTemplate: firePopup
});

viewElement.map.addMany([layerB, layerA, districts, governorates, fires]);

// report any loading problem in the browser console (press F12 to see it)
[layerB, layerA, districts, governorates, fires].forEach((layer) => {
  layer.load().catch((error) => console.error("Could not load layer:", layer.title, error));
});

// =====================================================================
// 4. About dialog and side-panel toggle
// =====================================================================
const dialog = document.getElementById("aboutDialog");
document.getElementById("aboutBtn").addEventListener("click", () => dialog.showModal());
document.getElementById("closeAbout").addEventListener("click", () => dialog.close());

const panelBtn = document.getElementById("panelBtn");
function setPanel(open) {
  document.body.classList.toggle("panel-closed", !open);
  panelBtn.setAttribute("aria-expanded", String(open));
}
panelBtn.addEventListener("click", () => setPanel(document.body.classList.contains("panel-closed")));
if (window.innerWidth < 800) setPanel(false); // on phones the panel starts closed

// =====================================================================
// 5. Search: governorates and districts
// =====================================================================
const searchInput = document.getElementById("searchInput");
const searchMsg = document.getElementById("searchMsg");
const datalist = document.getElementById("placeNames");
const placeIndex = new Map(); // normalised name -> { name, layer, kind }

const normalise = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

async function loadNames(layer, kind) {
  await layer.load();
  const result = await layer.queryFeatures({ where: "1=1", outFields: ["name"], returnGeometry: false });
  result.features.forEach((feature) => {
    const name = feature.attributes.name;
    if (name && !placeIndex.has(normalise(name))) placeIndex.set(normalise(name), { name, layer, kind });
  });
}

try {
  await Promise.all([loadNames(governorates, "Governorate"), loadNames(districts, "District")]);
  datalist.innerHTML = [...placeIndex.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((place) => `<option value="${place.name}">${place.kind}</option>`)
    .join("");
} catch (error) {
  console.error("Could not build the search list:", error);
}

searchInput.addEventListener("change", async () => {
  const typed = normalise(searchInput.value);
  if (!typed) { searchMsg.textContent = "Pick a name from the list to zoom to it."; return; }

  let hit = placeIndex.get(typed);
  if (!hit) hit = [...placeIndex.entries()].find(([key]) => key.includes(typed))?.[1];
  if (!hit) { searchMsg.textContent = "No match. Pick a name from the list."; return; }

  const where = `name = '${hit.name.replace(/'/g, "''")}'`;
  const result = await hit.layer.queryFeatures({ where, outFields: ["*"], returnGeometry: true });
  const feature = result.features[0];
  if (!feature) { searchMsg.textContent = "Could not find that area."; return; }

  hit.layer.visible = true;
  searchMsg.textContent = `${hit.kind}: ${hit.name}`;
  await viewElement.view.goTo(feature.geometry.extent.clone().expand(1.3));
  viewElement.view.openPopup({ features: [feature], location: feature.geometry.extent.center });
});

// =====================================================================
// 6. Filters and statistics
// =====================================================================
const ALL_CONFIDENCE = ["nominal", "low", "high"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const A_ORDER = ["Very low", "Low", "Moderate", "High", "Very high"];
const PARTIAL_YEARS = [2015, 2025];

const filters = { period: "all", from: 2015, to: 2025, confidence: new Set(ALL_CONFIDENCE) };

// numbers that come from the dataset itself (dashboard_stats.json)
let datasetTotal = null;
let layerAHighShare = null; // % of Lebanon's area in Layer A classes High + Very high
try {
  const stats = await (await fetch(DATA + "dashboard_stats.json")).json();
  datasetTotal = stats.all.detections;
  const areaA = stats.layer_class_area_km2.A_likelihood;
  const totalArea = Object.values(areaA).reduce((sum, value) => sum + value, 0);
  layerAHighShare = ((areaA["High"] + areaA["Very high"]) / totalArea) * 100;
} catch (error) {
  console.warn("Could not read dashboard_stats.json (copy it into data/app/):", error);
}

// fill the two year drop-downs
const yearFrom = document.getElementById("yearFrom");
const yearTo = document.getElementById("yearTo");
for (let year = 2015; year <= 2025; year++) {
  const label = PARTIAL_YEARS.includes(year) ? `${year}*` : String(year);
  yearFrom.add(new Option(label, year));
  yearTo.add(new Option(label, year));
}

function buildWhere() {
  const parts = [];
  if (filters.period !== "all") parts.push(`period = '${filters.period}'`);
  parts.push(`year >= ${filters.from}`, `year <= ${filters.to}`);
  if (filters.confidence.size === 0) parts.push("1 = 0");
  else if (filters.confidence.size < ALL_CONFIDENCE.length) {
    parts.push(`confidence IN (${[...filters.confidence].map((c) => `'${c}'`).join(",")})`);
  }
  return parts.join(" AND ");
}

const countBy = (rows, key) =>
  rows.reduce((map, row) => map.set(row[key], (map.get(row[key]) || 0) + 1), new Map());

function drawBars(elementId, entries) {
  const max = Math.max(1, ...entries.map(([, count]) => count));
  document.getElementById(elementId).innerHTML = entries
    .map(([label, count]) => {
      const width = ((count / max) * 100).toFixed(1);
      return `<div class="bar-row"><span class="bar-label" title="${label}">${label}</span>` +
        `<span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>` +
        `<span class="bar-n">${count.toLocaleString()}</span></div>`;
    })
    .join("");
}

let statsRun = 0;
async function updateStats(where) {
  const run = ++statsRun;
  const result = await fires.queryFeatures({
    where,
    outFields: ["year", "month", "land_cover", "likelihood_A"],
    returnGeometry: false
  });
  if (run !== statsRun) return; // a newer filter change has already started

  const rows = result.features.map((feature) => feature.attributes);
  const total = rows.length;
  const summary = document.getElementById("statsSummary");

  let text = `<strong>${total.toLocaleString()}</strong> detections shown`;
  if (datasetTotal) text += ` of ${datasetTotal.toLocaleString()}`;
  if (total > 0 && layerAHighShare !== null) {
    const highA = rows.filter((row) => row.likelihood_A === "High" || row.likelihood_A === "Very high").length;
    text += `<br>${((highA / total) * 100).toFixed(0)}% fall in Layer A's High or Very high classes ` +
            `(those classes cover ${layerAHighShare.toFixed(0)}% of Lebanon's area).`;
  }
  if (total === 0) text += "<br>No detections match these filters.";
  summary.innerHTML = text;

  // by year (all years in the selected range, including zeros)
  const byYear = countBy(rows, "year");
  const yearEntries = [];
  for (let year = filters.from; year <= filters.to; year++) {
    yearEntries.push([PARTIAL_YEARS.includes(year) ? `${year}*` : String(year), byYear.get(year) || 0]);
  }
  drawBars("statsYear", yearEntries);

  // by month
  const byMonth = countBy(rows, "month");
  drawBars("statsMonth", MONTHS.map((name, index) => [name, byMonth.get(index + 1) || 0]));

  // by land cover (share of what is shown)
  const byLandCover = [...countBy(rows, "land_cover").entries()]
    .map(([name, count]) => [`${name ?? "Unknown"} (${total ? ((count / total) * 100).toFixed(0) : 0}%)`, count])
    .sort((a, b) => b[1] - a[1]);
  drawBars("statsLandCover", byLandCover);

  // by Layer A class
  const byA = countBy(rows, "likelihood_A");
  drawBars("statsLayerA", A_ORDER.map((name) => [name, byA.get(name) || 0]));
}

async function applyFilters() {
  const where = buildWhere();
  fires.definitionExpression = where;
  try {
    await updateStats(where);
  } catch (error) {
    console.error("Could not update the statistics (filter was:", where, ")", error);
    document.getElementById("statsSummary").textContent = "Could not update the statistics. See the browser console.";
  }
}

// wire up the controls
document.querySelectorAll('input[name="period"]').forEach((radio) =>
  radio.addEventListener("change", () => { filters.period = radio.value; applyFilters(); })
);
document.querySelectorAll('input[name="confidence"]').forEach((box) =>
  box.addEventListener("change", () => {
    if (box.checked) filters.confidence.add(box.value); else filters.confidence.delete(box.value);
    applyFilters();
  })
);
yearFrom.addEventListener("change", () => {
  filters.from = Number(yearFrom.value);
  if (filters.to < filters.from) { filters.to = filters.from; yearTo.value = filters.to; }
  applyFilters();
});
yearTo.addEventListener("change", () => {
  filters.to = Number(yearTo.value);
  if (filters.from > filters.to) { filters.from = filters.to; yearFrom.value = filters.from; }
  applyFilters();
});

function resetFilters() {
  filters.period = "all";
  filters.from = 2015;
  filters.to = 2025;
  filters.confidence = new Set(ALL_CONFIDENCE);
  document.querySelector('input[name="period"][value="all"]').checked = true;
  yearFrom.value = 2015;
  yearTo.value = 2025;
  document.querySelectorAll('input[name="confidence"]').forEach((box) => { box.checked = true; });
  applyFilters();
}
document.getElementById("resetBtn").addEventListener("click", resetFilters);

resetFilters(); // sets the starting state and draws the first statistics

// =====================================================================
// 7. Compare Layer A | Layer B with the Swipe component
// =====================================================================
const compareBtn = document.getElementById("compareBtn");
const swipeLabels = document.getElementById("swipeLabels");
let swipe = null;

compareBtn.addEventListener("click", async () => {
  if (!swipe) {
    // both layers must be visible for the swipe to show them
    layerA.visible = true;
    layerB.visible = true;

    swipe = document.createElement("arcgis-swipe");
    swipe.position = 50;           // start in the middle (percent)
    swipe.startLayers = [layerA];  // left side
    swipe.endLayers = [layerB];    // right side
    viewElement.append(swipe);

    swipeLabels.hidden = false;
    compareBtn.textContent = "Exit compare";
    compareBtn.setAttribute("aria-pressed", "true");
  } else {
    await swipe.destroy();
    swipe.remove();
    swipe = null;

    layerB.visible = false; // back to the default: A on, B off
    swipeLabels.hidden = true;
    compareBtn.textContent = "Compare A | B";
    compareBtn.setAttribute("aria-pressed", "false");
  }
});