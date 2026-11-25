// Draw & analyze: STEP 2 (sketching only).
// Adds a Sketch component connected to its own GraphicsLayer. Nothing here touches the analytical layers,
// the filters, the statistics or the search. Buffering and spatial analysis are added in later steps.

export async function initDraw({ viewElement }) {
  const [GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol] = await $arcgis.import([
    "@arcgis/core/layers/GraphicsLayer.js",
    "@arcgis/core/symbols/SimpleMarkerSymbol.js",
    "@arcgis/core/symbols/SimpleLineSymbol.js",
    "@arcgis/core/symbols/SimpleFillSymbol.js"
  ]);

  // ---------- page elements ----------
  const section = document.getElementById("drawSection");    // <details> that switches the mode on and off
  const sketch = document.getElementById("sketch");          // <arcgis-sketch>
  const status = document.getElementById("drawStatus");
  const deleteBtn = document.getElementById("deleteSelected");
  const clearBtn = document.getElementById("clearDrawings");
  const headerBtn = document.getElementById("drawBtn");
  const panelBtn = document.getElementById("panelBtn");

  // ---------- the user's own layer (separate from every analytical layer) ----------
  const sketchLayer = new GraphicsLayer({ id: "user-sketches", title: "My drawings", listMode: "hide" });
  viewElement.map.add(sketchLayer); // added last, so it draws above everything else

  // ---------- configure the Sketch component ----------
  await sketch.componentOnReady();
  sketch.layer = sketchLayer;
  sketch.defaultGraphicsLayerDisabled = true; // we supply our own layer
  sketch.creationMode = "update";             // a finished shape stays selected, so it can be moved or reshaped at once
  sketch.availableCreateTools = ["point", "polyline", "polygon", "rectangle", "circle"];

  const ACCENT = [180, 35, 24];
  sketch.pointSymbol = new SimpleMarkerSymbol({ style: "circle", size: 9, color: [...ACCENT, 0.9], outline: { color: [255, 255, 255], width: 1.5 } });
  sketch.polylineSymbol = new SimpleLineSymbol({ color: [...ACCENT, 1], width: 3 });
  sketch.polygonSymbol = new SimpleFillSymbol({ color: [...ACCENT, 0.15], outline: { color: [...ACCENT, 1], width: 2 } });

  // ---------- selection and status ----------
  let selected = []; // graphics currently selected for editing (used by the buffer step later)

  const kind = (graphic) => ({ point: "point", polyline: "line", polygon: "area" }[graphic.geometry?.type] || "shape");

  function showStatus() {
    const count = sketchLayer.graphics.length;
    let text = count === 0 ? "No shapes drawn yet." : `${count} shape${count === 1 ? "" : "s"} drawn.`;
    if (selected.length === 1) text += ` Selected: ${kind(selected[0])}. Drag to move, drag a handle to reshape.`;
    else if (selected.length > 1) text += ` ${selected.length} shapes selected.`;
    status.textContent = text;
    deleteBtn.disabled = selected.length === 0;
    clearBtn.disabled = count === 0;
  }

  sketch.addEventListener("arcgisCreate", (event) => {
    const { state, graphic } = event.detail;
    if (state === "complete" && graphic) selected = [graphic];
    if (state === "cancel") selected = [];
    showStatus();
  });

  sketch.addEventListener("arcgisUpdate", (event) => {
    const { state, graphics } = event.detail;
    selected = state === "complete" ? [] : graphics ? Array.from(graphics) : [];
    showStatus();
  });

  sketch.addEventListener("arcgisDelete", () => {
    selected = [];
    showStatus();
  });

  sketchLayer.graphics.on("change", showStatus);

  // ---------- delete selected, clear all ----------
  deleteBtn.addEventListener("click", async () => {
    const toRemove = selected.length ? selected : Array.from(sketch.updateGraphics ?? []);
    await sketch.cancel();             // ends the edit session first
    sketchLayer.removeMany(toRemove);
    selected = [];
    showStatus();
  });

  clearBtn.addEventListener("click", async () => {
    await sketch.cancel();
    sketchLayer.removeAll();           // only the user's own graphics; analytical layers are untouched
    selected = [];
    showStatus();
  });

  // ---------- mode: the <details> section open = drawing on ----------
  function applyMode() {
    const on = section.open;
    viewElement.popupDisabled = on;    // otherwise clicking a drawing would also open pop-ups of the layers beneath
    if (on) viewElement.view?.closePopup?.();
    headerBtn.setAttribute("aria-pressed", String(on));
    if (!on) sketch.cancel();
  }
  section.addEventListener("toggle", applyMode);

  headerBtn.addEventListener("click", () => {
    if (!section.open) {
      document.body.classList.remove("panel-closed");           // make sure the side panel is visible
      panelBtn?.setAttribute("aria-expanded", "true");
    }
    section.open = !section.open;
    if (section.open) section.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  showStatus();
  applyMode();

  // exposed for the next steps (buffer and analysis)
  return { sketch, sketchLayer, getSelected: () => selected };
}
