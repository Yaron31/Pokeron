/* ==============================================
   POKERON — Debug Overlay (F2)
   Drag & drop + panneau pour repositionner
   les elements du combat
   ============================================== */

(function () {
  let overlayActive = false;
  let panel = null;
  let selectedIdx = -1;
  let dragging = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  const labels = [];
  const outlines = [];

  // Couleurs distinctes pour chaque element
  const COLORS = [
    "#FF4444", "#44FF44", "#4488FF", "#FFAA00", "#FF44FF",
    "#44FFFF", "#FF8844", "#88FF44", "#AA44FF", "#FFFF44"
  ];

  // Elements a rendre ajustables
  const DEBUG_ELEMENTS = [
    { name: "Joueur (dos)",     selector: ".trainer-player",  props: ["bottom","left","width","height"] },
    { name: "Rival",            selector: ".trainer-rival",   props: ["top","right","width","height"] },
    { name: "Base rival",       selector: ".trainer-base-img",props: ["bottom","left","width"] },
    { name: "Sprite ennemi",    selector: ".enemy-sprite",    props: ["top","right","width","height"] },
    { name: "Sprite joueur",    selector: ".player-sprite",   props: ["bottom","left","width","height"] },
    { name: "Platef. ennemie",  selector: ".enemy-platform",  props: ["top","right","width"] },
    { name: "Platef. joueur",   selector: ".player-platform", props: ["bottom","left","width"] },
    { name: "Info ennemi",      selector: ".enemy-info",      props: ["top","right"] },
    { name: "Info joueur",      selector: ".player-info",     props: ["bottom","left"] },
    { name: "Textbox",          selector: ".battle-textbox",  props: ["bottom","left","right"] },
  ];

  function getField() {
    return document.querySelector(".battle-field");
  }

  function getEl(idx) {
    const field = getField();
    if (!field) return null;
    // trainer-base-img est dans trainer-rival, chercher globalement dans battle-screen
    const screen = document.getElementById("battle-screen");
    return screen ? screen.querySelector(DEBUG_ELEMENTS[idx].selector) : null;
  }

  function getComputedProp(el, prop) {
    return getComputedStyle(el)[prop];
  }

  function pxToPercent(px, parentSize) {
    return ((px / parentSize) * 100).toFixed(1) + "%";
  }

  // --- Panneau lateral ---
  function createPanel() {
    panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.style.cssText = `
      position: fixed; top: 0; right: 0; width: 280px; height: 100vh;
      background: rgba(0,0,0,0.92); color: #fff; font-family: monospace;
      font-size: 11px; overflow-y: auto; z-index: 99999; padding: 8px;
      border-left: 2px solid #FFD700; user-select: none;
    `;

    // Titre
    const title = document.createElement("div");
    title.innerHTML = "<b>DEBUG OVERLAY</b> <span style='color:#888'>(F2 fermer)</span>";
    title.style.cssText = "padding: 6px 0 10px; border-bottom: 1px solid #444; margin-bottom: 8px;";
    panel.appendChild(title);

    // Liste des elements
    DEBUG_ELEMENTS.forEach((cfg, idx) => {
      const row = document.createElement("div");
      row.className = "debug-row";
      row.dataset.idx = idx;
      row.style.cssText = `
        padding: 6px; margin-bottom: 4px; border-radius: 4px; cursor: pointer;
        border-left: 4px solid ${COLORS[idx]}; background: rgba(255,255,255,0.05);
      `;
      // Checkbox de visibilite + nom
      const header = document.createElement("div");
      header.style.cssText = "display:flex;align-items:center;gap:6px;";
      header.innerHTML = `
        <input type="checkbox" checked data-vis-idx="${idx}"
          style="width:14px;height:14px;accent-color:${COLORS[idx]};cursor:pointer;">
        <b style="color:${COLORS[idx]}">${cfg.name}</b>
      `;
      row.appendChild(header);

      // Inputs pour chaque propriete
      const propsDiv = document.createElement("div");
      propsDiv.style.cssText = "margin-top: 4px;";
      cfg.props.forEach(prop => {
        const el = getEl(idx);
        const val = el ? getComputedProp(el, prop) : "?";
        const line = document.createElement("div");
        line.style.cssText = "display: flex; align-items: center; gap: 4px; margin: 2px 0;";
        line.innerHTML = `
          <span style="width:55px;color:#aaa">${prop}:</span>
          <input type="text" data-idx="${idx}" data-prop="${prop}" value="${val}"
            style="width:80px;background:#222;color:#fff;border:1px solid #555;
            padding:2px 4px;font-family:monospace;font-size:11px;border-radius:2px;">
        `;
        propsDiv.appendChild(line);
      });
      row.appendChild(propsDiv);

      row.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return; // checkboxes et inputs
        selectElement(idx);
      });

      panel.appendChild(row);
    });

    // Bouton Copier CSS
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "COPIER CSS";
    copyBtn.style.cssText = `
      display: block; width: 100%; margin-top: 12px; padding: 10px;
      background: #FFD700; color: #000; font-weight: bold; font-family: monospace;
      font-size: 12px; border: none; border-radius: 4px; cursor: pointer;
    `;
    copyBtn.addEventListener("click", copyCSS);
    panel.appendChild(copyBtn);

    // Gestion des inputs de propriete
    panel.addEventListener("input", (e) => {
      if (e.target.tagName !== "INPUT") return;
      // Checkbox de visibilite
      if (e.target.dataset.visIdx !== undefined) {
        const idx = parseInt(e.target.dataset.visIdx);
        const el = getEl(idx);
        if (el) {
          const visible = e.target.checked;
          el.style.opacity = visible ? "1" : "0";
          el.style.pointerEvents = visible ? "" : "none";
          // Griser la row dans le panneau
          const row = panel.querySelector(`.debug-row[data-idx="${idx}"]`);
          if (row) row.style.opacity = visible ? "1" : "0.4";
        }
        return;
      }
      // Input de propriete CSS
      const idx = parseInt(e.target.dataset.idx);
      const prop = e.target.dataset.prop;
      const el = getEl(idx);
      if (el) {
        el.style[prop] = e.target.value;
        updateLabel(idx);
      }
    });

    document.body.appendChild(panel);
  }

  function selectElement(idx) {
    selectedIdx = idx;
    // Mettre en surbrillance
    panel.querySelectorAll(".debug-row").forEach((row, i) => {
      row.style.background = i === idx ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)";
    });
    // Mettre a jour les inputs
    refreshInputs(idx);
  }

  function refreshInputs(idx) {
    const el = getEl(idx);
    if (!el) return;
    panel.querySelectorAll(`input[data-idx="${idx}"]`).forEach(input => {
      input.value = getComputedProp(el, input.dataset.prop);
    });
  }

  function refreshAllInputs() {
    DEBUG_ELEMENTS.forEach((_, idx) => refreshInputs(idx));
  }

  // --- Labels sur les elements ---
  function createLabels() {
    DEBUG_ELEMENTS.forEach((cfg, idx) => {
      const el = getEl(idx);
      if (!el) return;

      // Label
      const label = document.createElement("div");
      label.className = "debug-label";
      label.textContent = cfg.name;
      label.style.cssText = `
        position: absolute; top: -18px; left: 0; background: ${COLORS[idx]};
        color: #000; font-size: 9px; font-family: monospace; font-weight: bold;
        padding: 1px 4px; border-radius: 2px; z-index: 99998;
        pointer-events: none; white-space: nowrap;
      `;
      el.style.position = "absolute"; // s'assurer que le label relatif fonctionne
      el.appendChild(label);
      labels.push(label);

      // Bordure de debug
      const prevOutline = el.style.outline;
      el.style.outline = `2px dashed ${COLORS[idx]}`;
      outlines.push({ el, prevOutline });
    });
  }

  function updateLabel(idx) {
    // Rien de special a faire, les labels suivent l'element
  }

  // --- Drag & drop ---
  function enableDrag() {
    const field = getField();
    if (!field) return;

    DEBUG_ELEMENTS.forEach((cfg, idx) => {
      const el = getEl(idx);
      if (!el) return;

      el.style.cursor = "move";
      el.addEventListener("mousedown", (e) => {
        if (!overlayActive) return;
        if (e.target.tagName === "INPUT") return;
        e.preventDefault();
        e.stopPropagation();
        dragging = { idx, el };
        const rect = el.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        selectElement(idx);
      });
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging || !overlayActive) return;
      const field = getField();
      if (!field) return;
      const fieldRect = field.getBoundingClientRect();
      const el = dragging.el;

      // Calculer la nouvelle position en px relatif au field
      const newLeft = e.clientX - fieldRect.left - dragOffsetX;
      const newTop = e.clientY - fieldRect.top - dragOffsetY;

      // Appliquer en top/left (reset bottom/right pour eviter les conflits)
      el.style.top = newTop + "px";
      el.style.left = newLeft + "px";
      el.style.bottom = "auto";
      el.style.right = "auto";

      // Rafraichir le panneau
      refreshInputs(dragging.idx);
    });

    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = null;
    });
  }

  // --- Copier CSS ---
  function copyCSS() {
    const field = getField();
    if (!field) return;
    const fieldRect = field.getBoundingClientRect();
    let css = "/* === DEBUG: positions ajustees ===\n";
    css += "   Coller dans style.css */\n\n";

    DEBUG_ELEMENTS.forEach((cfg, idx) => {
      const el = getEl(idx);
      if (!el) return;
      const rect = el.getBoundingClientRect();

      css += `${cfg.selector} {\n`;
      cfg.props.forEach(prop => {
        const val = el.style[prop] || getComputedProp(el, prop);
        // Convertir px en % si la valeur est en px
        if (val && val.endsWith("px")) {
          const pxVal = parseFloat(val);
          if (prop === "top" || prop === "bottom" || prop === "height") {
            css += `  ${prop}: ${pxToPercent(pxVal, fieldRect.height)};\n`;
          } else {
            css += `  ${prop}: ${pxToPercent(pxVal, fieldRect.width)};\n`;
          }
        } else {
          css += `  ${prop}: ${val};\n`;
        }
      });
      css += "}\n\n";
    });

    navigator.clipboard.writeText(css).then(() => {
      const btn = panel.querySelector("button");
      const orig = btn.textContent;
      btn.textContent = "COPIE !";
      btn.style.background = "#44FF44";
      setTimeout(() => { btn.textContent = orig; btn.style.background = "#FFD700"; }, 1500);
    });
  }

  // --- Forcer visibilite ---
  function forceVisibility(visible) {
    DEBUG_ELEMENTS.forEach((cfg, idx) => {
      const el = getEl(idx);
      if (!el) return;
      if (visible) {
        // Sauvegarder le z-index original
        if (!el.dataset.debugOrigZIndex) {
          el.dataset.debugOrigZIndex = el.style.zIndex || "";
        }
        el.style.opacity = "1";
        el.style.visibility = "visible";
        el.style.pointerEvents = "auto"; // Override pointer-events:none
        el.style.zIndex = "9990";        // Au-dessus de tout pour pouvoir cliquer
        if (el.classList.contains("hidden")) {
          el.dataset.debugWasHidden = "1";
          el.classList.remove("hidden");
        }
        // Reset transform pour les trainers (sauf pendant le drag)
        if (cfg.selector.includes("trainer") && !cfg.selector.includes("base")) {
          el.style.transform = "none";
        }
      } else {
        // Restaurer l'etat original
        if (el.dataset.debugWasHidden === "1") {
          el.classList.add("hidden");
          delete el.dataset.debugWasHidden;
        }
        el.style.outline = "";
        el.style.cursor = "";
        el.style.pointerEvents = "";
        el.style.zIndex = el.dataset.debugOrigZIndex || "";
        delete el.dataset.debugOrigZIndex;
      }
    });
  }

  // --- Toggle overlay ---
  function toggleOverlay() {
    overlayActive = !overlayActive;

    if (overlayActive) {
      forceVisibility(true);
      createLabels();
      createPanel();
      enableDrag();
    } else {
      // Cleanup
      forceVisibility(false);
      labels.forEach(l => l.remove());
      labels.length = 0;
      outlines.forEach(({ el, prevOutline }) => { el.style.outline = prevOutline || ""; });
      outlines.length = 0;
      if (panel) { panel.remove(); panel = null; }
      selectedIdx = -1;
    }
  }

  // --- Activation via F2 ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
      e.preventDefault();
      toggleOverlay();
    }
  });
})();
