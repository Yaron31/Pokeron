/* ==============================================
   POKÉRON — UI, transitions, menus, options, braises
   ============================================== */

// --- État ---
let currentScreen = "press-start";
let currentSubmenu = "main";
let selectedIndex = 0;
let optionIndex = 0;
let introPlaying = true;
let introStarted = false;
const menuItems = document.querySelectorAll("#menu-list .menu-item");
const totalItems = menuItems.length;
const optionItems = document.querySelectorAll("#options-list .menu-item");
const totalOptions = optionItems.length;
let disabledIndexes = [1];

// --- Références DOM ---
const pressStartScreen = document.getElementById("press-start-screen");
const menuScreen = document.getElementById("menu-screen");
const waitingHint = document.getElementById("waiting-hint");
const starterScreen = document.getElementById("starter-screen");
const battleScreen = document.getElementById("battle-screen");
const resultScreen = document.getElementById("result-screen");

// ==============================================
// Intro — Premier clic lance l'animation + audio
// ==============================================
pressStartScreen.classList.add("intro-waiting");

function startIntro() {
  if (introStarted) return;
  introStarted = true;

  getAudioCtx().resume();
  waitingHint.style.display = "none";
  pressStartScreen.classList.remove("intro-waiting");
  restartCSSAnimations();

  playBuildUpSound();
  setTimeout(playSparkleSound, 3000);
  setTimeout(() => { charizardCry.play().catch(() => {}); }, 4200);
  setTimeout(playAnnounceSound, 5000);
  setTimeout(() => { titleTheme.play().catch(() => {}); }, 5500);
  setTimeout(() => { introPlaying = false; }, 7000);
}

function restartCSSAnimations() {
  const elements = pressStartScreen.querySelectorAll(
    ".intro-sprite, .intro-title, .intro-press-start, .sparkle, .roar-flash, .sprite"
  );
  elements.forEach(el => {
    const anim = el.style.animation;
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = anim || "";
  });
}

document.addEventListener("click", startIntro, { once: true });
document.addEventListener("keydown", startIntro, { once: true });
document.addEventListener("touchstart", startIntro, { once: true });

// ==============================================
// Transitions d'écrans
// ==============================================
function transitionToScreen(from, to, callback) {
  from.classList.add("fade-out");
  setTimeout(() => {
    from.classList.remove("active", "fade-out");
    to.classList.add("active", "fade-in");
    setTimeout(() => {
      to.classList.remove("fade-in");
      if (callback) callback();
    }, 500);
  }, 500);
}

function showMenu() {
  if (currentScreen !== "press-start" || introPlaying) return;
  currentScreen = "menu";

  pressStartScreen.classList.add("fade-out");
  fadeOutAudio(titleTheme, 500);

  setTimeout(() => {
    pressStartScreen.classList.remove("active", "fade-out");
    menuScreen.classList.add("active", "fade-in");
    gameTheme.currentTime = 0;
    gameTheme.play().catch(() => {});
    updateContinueStatus();
    setTimeout(() => { menuScreen.classList.remove("fade-in"); }, 500);
  }, 500);
}

function backToTitle() {
  if (currentScreen !== "menu") return;
  currentScreen = "press-start";

  menuScreen.classList.add("fade-out");
  fadeOutAudio(gameTheme, 500);

  setTimeout(() => {
    menuScreen.classList.remove("active", "fade-out");
    resetTitleScreen();
    pressStartScreen.classList.add("active", "fade-in");
    selectedIndex = 0;
    updateSelection();

    titleTheme.currentTime = 0;
    titleTheme.volume = 0.5;
    titleTheme.play().catch(() => {});

    setTimeout(() => { pressStartScreen.classList.remove("fade-in"); }, 500);
  }, 500);
}

function resetTitleScreen() {
  const sprite = document.querySelector("#press-start-screen .sprite");
  sprite.style.filter = "brightness(1)";
  sprite.style.animation = "float 3s ease-in-out infinite";

  const title = document.querySelector(".intro-title");
  title.style.opacity = "1";
  title.style.transform = "scale(1)";
  title.style.animation = "none";

  const pressStart = document.querySelector(".intro-press-start");
  pressStart.style.opacity = "1";
  pressStart.style.animation = "blink 1.2s step-end infinite";

  const spriteContainer = document.querySelector(".intro-sprite");
  spriteContainer.style.opacity = "1";
  spriteContainer.style.animation = "none";

  const flash = document.getElementById("roar-flash");
  flash.style.animation = "none";
  flash.style.opacity = "0";

  document.querySelectorAll(".sparkle").forEach(s => {
    s.style.animation = "none";
    s.style.opacity = "0";
  });
}

let resultEmbersInterval = null;

function transitionToBattle() {
  currentScreen = "battle";
  transitionToScreen(starterScreen, battleScreen, () => startBattle());
}

function transitionToBattleFromMenu() {
  currentScreen = "battle";
  fadeOutAudio(gameTheme, 500);
  transitionToScreen(menuScreen, battleScreen, () => startBattle());
}

function transitionToResult() {
  currentScreen = "result";
  transitionToScreen(battleScreen, resultScreen, null);
  if (!resultEmbersInterval) {
    resultEmbersInterval = startEmbers("result-embers");
  }
}

function transitionToBattleFromResult() {
  currentScreen = "battle";
  transitionToScreen(resultScreen, battleScreen, () => startBattle());
}

function transitionToMenu() {
  currentScreen = "menu";
  transitionToScreen(resultScreen, menuScreen, () => {
    gameTheme.currentTime = 0;
    gameTheme.play().catch(() => {});
    updateContinueStatus();
    if (!menuEmbersInterval) {
      menuEmbersInterval = startEmbers("menu-embers");
    }
  });
}

function transitionToMenuFromBattle() {
  currentScreen = "menu";
  transitionToScreen(battleScreen, menuScreen, () => {
    gameTheme.currentTime = 0;
    gameTheme.play().catch(() => {});
    updateContinueStatus();
    if (!menuEmbersInterval) {
      menuEmbersInterval = startEmbers("menu-embers");
    }
  });
}

// ==============================================
// Navigation menu
// ==============================================
function updateSelection() {
  menuItems.forEach((item, index) => {
    const cursor = item.querySelector(".cursor");
    const cursorRight = item.querySelector(".cursor-right");
    if (index === selectedIndex) {
      item.classList.add("selected");
      cursor.textContent = "►";
      if (cursorRight) cursorRight.textContent = "◄";
    } else {
      item.classList.remove("selected");
      cursor.textContent = " ";
      if (cursorRight) cursorRight.textContent = " ";
    }
    if (disabledIndexes.includes(index)) {
      item.classList.add("disabled");
    } else {
      item.classList.remove("disabled");
    }
  });
}

function navigate(direction) {
  let newIndex = selectedIndex + direction;
  if (newIndex < 0) newIndex = totalItems - 1;
  if (newIndex >= totalItems) newIndex = 0;
  selectedIndex = newIndex;
  updateSelection();
  playMenuTick();
}

function confirmSelection() {
  const selected = menuItems[selectedIndex];

  if (disabledIndexes.includes(selectedIndex)) {
    selected.style.animation = "none";
    selected.offsetHeight;
    selected.style.animation = "shake 0.3s ease";
    setTimeout(() => { selected.style.animation = ""; }, 300);
    return;
  }

  if (selectedIndex === 2) {
    showOptions();
    return;
  }

  const flash = document.createElement("div");
  flash.style.cssText = `
    position: fixed; inset: 0; background: white;
    z-index: 999; animation: flashAnim 0.4s ease-out forwards;
  `;
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
    switch (selectedIndex) {
      case 0:
        showStarterScreen();
        break;
      case 1:
        continueGame();
        break;
    }
  }, 400);
}

menuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    selectedIndex = index;
    updateSelection();
    confirmSelection();
  });
});

pressStartScreen.addEventListener("click", () => {
  showMenu();
});

const dynamicStyles = document.createElement("style");
dynamicStyles.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%      { transform: translateX(-4px); }
    75%      { transform: translateX(4px); }
  }
  @keyframes flashAnim {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
`;
document.head.appendChild(dynamicStyles);

// ==============================================
// Sous-menu Options
// ==============================================
const menuList = document.getElementById("menu-list");
const optionsList = document.getElementById("options-list");
const menuHint = document.querySelector(".menu-hint");

function showOptions() {
  currentSubmenu = "options";
  optionIndex = 0;
  menuList.style.display = "none";
  optionsList.style.display = "";
  menuHint.setAttribute("data-i18n", "optHint");
  menuHint.textContent = translations[settings.lang].optHint;
  updateOptionsDisplay();
  updateOptionSelection();
}

function hideOptions() {
  currentSubmenu = "main";
  optionsList.style.display = "none";
  menuList.style.display = "";
  menuHint.setAttribute("data-i18n", "menuHint");
  menuHint.textContent = translations[settings.lang].menuHint;
  playMenuTick();
}

function navigateOptions(direction) {
  let newIndex = optionIndex + direction;
  if (newIndex < 0) newIndex = totalOptions - 1;
  if (newIndex >= totalOptions) newIndex = 0;
  optionIndex = newIndex;
  updateOptionSelection();
  playMenuTick();
}

function updateOptionSelection() {
  optionItems.forEach((item, index) => {
    const cursor = item.querySelector(".cursor");
    const cursorRight = item.querySelector(".cursor-right");
    if (index === optionIndex) {
      item.classList.add("selected");
      cursor.textContent = "►";
      if (cursorRight) cursorRight.textContent = "◄";
    } else {
      item.classList.remove("selected");
      cursor.textContent = " ";
      if (cursorRight) cursorRight.textContent = " ";
    }
  });
}

function adjustOption(direction) {
  const opt = optionItems[optionIndex].dataset.opt;
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
  updateOptionsDisplay();
  playMenuTick();
}

function confirmOption() {
  const opt = optionItems[optionIndex].dataset.opt;
  if (opt === "back") {
    hideOptions();
  } else {
    adjustOption(1);
  }
}

function buildVolumeBar(level) {
  return "█".repeat(level) + "░".repeat(10 - level);
}

function updateOptionsDisplay() {
  optionItems.forEach(item => {
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

function applySettings() {
  const musicVol = settings.musicVol / 10;
  const sfxVol = settings.sfxVol / 10;
  titleTheme.volume = musicVol;
  gameTheme.volume = musicVol;
  charizardCry.volume = sfxVol;
}

function applyLanguage() {
  const t = translations[settings.lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });
  if (currentSubmenu === "options") {
    menuHint.textContent = t.optHint;
  } else {
    menuHint.textContent = t.menuHint;
  }
}

// Appliquer les réglages au démarrage
applySettings();
applyLanguage();
updateOptionsDisplay();

optionItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    optionIndex = index;
    updateOptionSelection();
    confirmOption();
  });
});

// ==============================================
// Système de braises / particules de feu
// ==============================================
function spawnEmber(container) {
  const ember = document.createElement("div");
  ember.classList.add("ember");

  const size = 2 + Math.random() * 4;
  ember.style.width = size + "px";
  ember.style.height = size + "px";
  ember.style.left = Math.random() * 100 + "%";

  const colors = [
    `rgba(255, ${60 + Math.random() * 80 | 0}, 0, ${0.7 + Math.random() * 0.3})`,
    `rgba(255, ${140 + Math.random() * 60 | 0}, 0, ${0.6 + Math.random() * 0.4})`,
    `rgba(255, ${200 + Math.random() * 55 | 0}, 50, ${0.5 + Math.random() * 0.5})`
  ];
  const color = colors[Math.random() * colors.length | 0];
  ember.style.background = color;
  ember.style.boxShadow = `0 0 ${size + 2}px ${size / 2}px ${color}`;

  const drift = (Math.random() - 0.5) * 60;
  ember.style.setProperty("--drift", drift + "px");

  const duration = 3 + Math.random() * 4;
  ember.style.animationDuration = duration + "s";
  ember.style.animationDelay = (Math.random() * 0.5) + "s";

  container.appendChild(ember);
  setTimeout(() => ember.remove(), (duration + 1) * 1000);
}

function startEmbers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  for (let i = 0; i < 20; i++) {
    setTimeout(() => spawnEmber(container), i * 100);
  }

  return setInterval(() => spawnEmber(container), 150);
}

// Démarrer les braises immédiatement sur l'intro
const introEmbersInterval = startEmbers("intro-embers");

// Démarrer les braises du menu quand on y arrive
let menuEmbersInterval = null;
const origShowMenu = showMenu;
showMenu = function () {
  origShowMenu();
  if (!menuEmbersInterval) {
    menuEmbersInterval = startEmbers("menu-embers");
  }
};

updateSelection();
