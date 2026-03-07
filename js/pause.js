/* ==============================================
   POKÉRON — Menu Pause
   ============================================== */

let pauseOpen = false;
let pauseIndex = 0;
let quitConfirmOpen = false;
let quitConfirmIndex = 0; // 0 = OUI, 1 = NON
let pauseOptionsOpen = false;
let pauseOptIndex = 0;
const pauseOverlay = document.getElementById("pause-overlay");
const pauseItems = document.querySelectorAll(".pause-item");
const quitConfirm = document.getElementById("quit-confirm");
const pauseOptionsList = document.getElementById("pause-options-list");
const pauseOptItems = document.querySelectorAll(".pause-opt-item");
const totalPauseOpts = pauseOptItems.length;

function togglePause() {
  if (pauseOpen) {
    closePause();
  } else {
    openPause();
  }
}

function openPause() {
  pauseOpen = true;
  pauseIndex = 0;
  quitConfirmOpen = false;
  pauseOptionsOpen = false;
  quitConfirm.classList.add("hidden");
  pauseOptionsList.classList.add("hidden");
  document.getElementById("pause-list").classList.remove("hidden");
  pauseOverlay.classList.remove("hidden");
  updatePauseSelection();
}

function closePause() {
  pauseOpen = false;
  quitConfirmOpen = false;
  pauseOptionsOpen = false;
  quitConfirm.classList.add("hidden");
  pauseOptionsList.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
}

function updatePauseSelection() {
  pauseItems.forEach((item, i) => {
    const cursor = item.querySelector(".cursor");
    const cursorRight = item.querySelector(".cursor-right");
    if (i === pauseIndex) {
      item.classList.add("selected");
      if (cursor) cursor.textContent = "►";
      if (cursorRight) cursorRight.textContent = "◄";
    } else {
      item.classList.remove("selected");
      if (cursor) cursor.textContent = " ";
      if (cursorRight) cursorRight.textContent = " ";
    }
  });
}

function navigatePause(dir) {
  if (quitConfirmOpen) {
    quitConfirmIndex = quitConfirmIndex === 0 ? 1 : 0;
    document.getElementById("quit-yes").classList.toggle("selected", quitConfirmIndex === 0);
    document.getElementById("quit-no").classList.toggle("selected", quitConfirmIndex === 1);
    playMenuTick();
    return;
  }
  pauseIndex = (pauseIndex + dir + pauseItems.length) % pauseItems.length;
  updatePauseSelection();
  playMenuTick();
}

function confirmPauseSelection() {
  if (quitConfirmOpen) {
    if (quitConfirmIndex === 0) {
      // OUI — quitter le combat
      closePause();
      gameState.battleActive = false;
      transitionToMenuFromBattle();
    } else {
      // NON — fermer la confirmation
      quitConfirmOpen = false;
      quitConfirm.classList.add("hidden");
    }
    return;
  }

  const action = pauseItems[pauseIndex].dataset.action;
  switch (action) {
    case "resume":
      closePause();
      break;
    case "options":
      openPauseOptions();
      break;
    case "quit":
      quitConfirmOpen = true;
      quitConfirmIndex = 1; // NON par défaut (sécurité)
      quitConfirm.classList.remove("hidden");
      document.getElementById("quit-yes").classList.remove("selected");
      document.getElementById("quit-no").classList.add("selected");
      break;
  }
}

// --- Options dans le pause menu ---
function openPauseOptions() {
  pauseOptionsOpen = true;
  pauseOptIndex = 0;
  document.getElementById("pause-list").classList.add("hidden");
  pauseOptionsList.classList.remove("hidden");
  updatePauseOptionsDisplay();
  updatePauseOptSelection();
}

function closePauseOptions() {
  pauseOptionsOpen = false;
  pauseOptionsList.classList.add("hidden");
  document.getElementById("pause-list").classList.remove("hidden");
  playMenuTick();
}

function updatePauseOptSelection() {
  pauseOptItems.forEach((item, i) => {
    const cursor = item.querySelector(".cursor");
    const cursorRight = item.querySelector(".cursor-right");
    if (i === pauseOptIndex) {
      item.classList.add("selected");
      if (cursor) cursor.textContent = "►";
      if (cursorRight) cursorRight.textContent = "◄";
    } else {
      item.classList.remove("selected");
      if (cursor) cursor.textContent = " ";
      if (cursorRight) cursorRight.textContent = " ";
    }
  });
}

function navigatePauseOptions(direction) {
  pauseOptIndex = (pauseOptIndex + direction + totalPauseOpts) % totalPauseOpts;
  updatePauseOptSelection();
  playMenuTick();
}

function adjustPauseOption(direction) {
  const opt = pauseOptItems[pauseOptIndex].dataset.opt;
  if (opt === "musicVol") {
    settings.musicVol = Math.max(0, Math.min(10, settings.musicVol + direction));
  } else if (opt === "sfxVol") {
    settings.sfxVol = Math.max(0, Math.min(10, settings.sfxVol + direction));
  } else if (opt === "textSpeed") {
    settings.textSpeed = Math.max(1, Math.min(3, settings.textSpeed + direction));
  } else if (opt === "lang") {
    settings.lang = settings.lang === "fr" ? "en" : "fr";
    applyLanguage();
  } else if (opt === "back") {
    return;
  }
  applySettings();
  saveSettings();
  updatePauseOptionsDisplay();
  playMenuTick();
}

function confirmPauseOption() {
  const opt = pauseOptItems[pauseOptIndex].dataset.opt;
  if (opt === "back") {
    closePauseOptions();
  } else {
    adjustPauseOption(1);
  }
}

function updatePauseOptionsDisplay() {
  pauseOptItems.forEach(item => {
    const opt = item.dataset.opt;
    const valueEl = item.querySelector(".opt-value");
    if (!valueEl) return;
    if (opt === "musicVol") {
      valueEl.textContent = buildVolumeBar(settings.musicVol);
    } else if (opt === "sfxVol") {
      valueEl.textContent = buildVolumeBar(settings.sfxVol);
    } else if (opt === "textSpeed") {
      const labels = { 1: t("textSpeedSlow"), 2: t("textSpeedNormal"), 3: t("textSpeedFast") };
      valueEl.textContent = "◄ " + labels[settings.textSpeed] + " ►";
    } else if (opt === "lang") {
      valueEl.textContent = settings.lang === "fr" ? "FR" : "EN";
    }
  });
}

// --- Click handlers pause menu ---
pauseItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    if (!pauseOpen || pauseOptionsOpen) return;
    pauseIndex = i;
    updatePauseSelection();
    confirmPauseSelection();
  });
});

document.getElementById("quit-yes").addEventListener("click", () => {
  if (!quitConfirmOpen) return;
  quitConfirmIndex = 0;
  confirmPauseSelection();
});
document.getElementById("quit-no").addEventListener("click", () => {
  if (!quitConfirmOpen) return;
  quitConfirmIndex = 1;
  confirmPauseSelection();
});

pauseOptItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    if (!pauseOptionsOpen) return;
    pauseOptIndex = i;
    updatePauseOptSelection();
    confirmPauseOption();
  });
});
