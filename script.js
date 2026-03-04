/* ==============================================
   POKÉRON — Interactions Menu GBA Rouge Feu
   Flammes immédiates → clic → intro + audio → menu
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
const disabledIndexes = [1];

// --- Réglages ---
const defaultSettings = { musicVol: 5, sfxVol: 7, lang: "fr" };
let settings = loadSettings();

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("pokeron-settings"));
    return saved ? { ...defaultSettings, ...saved } : { ...defaultSettings };
  } catch { return { ...defaultSettings }; }
}

function saveSettings() {
  localStorage.setItem("pokeron-settings", JSON.stringify(settings));
}

// --- Traductions ---
const translations = {
  fr: {
    subtitle: "Rouge Feu",
    newGame: "NOUVELLE PARTIE",
    continue: "CONTINUER",
    noSave: "(pas de sauvegarde)",
    options: "OPTIONS",
    musicVol: "MUSIQUE",
    sfxVol: "EFFETS",
    lang: "LANGUE",
    back: "RETOUR",
    pressStart: "Appuie sur START...",
    waitingHint: "Clique n'importe ou...",
    menuHint: "↑↓ Naviguer   ENTRÉE Sélectionner   ÉCHAP Retour",
    optHint: "↑↓ Naviguer   ◄► Ajuster   ÉCHAP Retour"
  },
  en: {
    subtitle: "Fire Red",
    newGame: "NEW GAME",
    continue: "CONTINUE",
    noSave: "(no save data)",
    options: "OPTIONS",
    musicVol: "MUSIC",
    sfxVol: "SFX",
    lang: "LANGUAGE",
    back: "BACK",
    pressStart: "Press START...",
    waitingHint: "Click anywhere...",
    menuHint: "↑↓ Navigate   ENTER Select   ESC Back",
    optHint: "↑↓ Navigate   ◄► Adjust   ESC Back"
  }
};

// --- Références DOM ---
const pressStartScreen = document.getElementById("press-start-screen");
const menuScreen = document.getElementById("menu-screen");
const waitingHint = document.getElementById("waiting-hint");

// --- Audio (fichiers) ---
const charizardCry = new Audio("assets/charizard-cry.mp3");
const titleTheme = new Audio("assets/title-theme.mp3");
const gameTheme = new Audio("assets/1-04. Game Tutorial.mp3");
gameTheme.loop = true;
gameTheme.volume = 0.5;
titleTheme.loop = true;
titleTheme.volume = 0.5;
charizardCry.volume = 0.7;

// --- Audio Context pour sons synthétisés ---
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Son de scintillement — tintement magique/féerique
function playSparkleSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  // Notes hautes douces qui se superposent (comme des étoiles)
  const notes = [2637, 3136, 3520, 4186]; // Mi7, Sol7, La7, Do8
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    // Attaque douce, déclin lent = son féerique
    const t = now + i * 0.15;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    // Légère harmonique pour la brillance
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2; // octave au-dessus
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.03, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);
    osc2.start(t);
    osc2.stop(t + 0.5);
  });
}

// Son d'aspiration — whoosh qui aspire l'énergie avant la musique
function playAnnounceSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 0.6;

  // Bruit blanc filtré qui monte en fréquence = effet d'aspiration
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Filtre passe-bande qui monte = son qui "aspire"
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 5;
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(3000, now + duration);

  // Volume qui monte puis coupe net
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + duration * 0.85);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);

  // Ton grave qui descend en même temps = aspiration
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(300, now);
  sub.frequency.exponentialRampToValueAtTime(80, now + duration);
  subGain.gain.setValueAtTime(0.01, now);
  subGain.gain.exponentialRampToValueAtTime(0.12, now + duration * 0.8);
  subGain.gain.linearRampToValueAtTime(0, now + duration);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + duration);
}

// Son de build-up — aspiration continue de 0s jusqu'au cri (4.2s)
// Monte progressivement en volume et en fréquence
function playBuildUpSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 4.2; // dure jusqu'au moment du cri

  // Couche 1 : bruit blanc filtré qui monte lentement
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 3;
  // Fréquence monte lentement : 100Hz → 2000Hz
  filter.frequency.setValueAtTime(100, now);
  filter.frequency.exponentialRampToValueAtTime(2000, now + duration);

  const gain = ctx.createGain();
  // Volume monte très progressivement puis coupe net au moment du cri
  gain.gain.setValueAtTime(0.005, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);

  // Couche 2 : ton grave continu qui monte = tension
  const drone = ctx.createOscillator();
  const droneGain = ctx.createGain();
  drone.type = "sawtooth";
  drone.frequency.setValueAtTime(40, now);
  drone.frequency.exponentialRampToValueAtTime(150, now + duration);
  droneGain.gain.setValueAtTime(0.005, now);
  droneGain.gain.exponentialRampToValueAtTime(0.08, now + duration - 0.05);
  droneGain.gain.linearRampToValueAtTime(0, now + duration);

  drone.connect(droneGain);
  droneGain.connect(ctx.destination);
  drone.start(now);
  drone.stop(now + duration);
}

// ==============================================
// Page ouverte : flammes visibles, tout le reste en pause.
// Premier clic/touche : lance l'intro + audio ensemble.
// ==============================================
pressStartScreen.classList.add("intro-waiting");

function startIntro() {
  if (introStarted) return;
  introStarted = true;

  // Débloquer AudioContext
  getAudioCtx().resume();

  // Cacher le hint
  waitingHint.style.display = "none";

  // Relancer les animations CSS : retirer la pause
  pressStartScreen.classList.remove("intro-waiting");

  // Forcer un restart des animations en retirant/rajoutant les éléments animés
  // (les animations avec delay reprennent à 0 grâce au reflow)
  restartCSSAnimations();

  // Timeline audio synchronisée avec les animations CSS
  playBuildUpSound();                                                // 0s→4.2s aspiration
  setTimeout(playSparkleSound, 3000);                                // 3.0s sparkle
  setTimeout(() => { charizardCry.play().catch(() => {}); }, 4200);  // 4.2s cri
  setTimeout(playAnnounceSound, 5000);                               // 5.0s annonce
  setTimeout(() => { titleTheme.play().catch(() => {}); }, 5500);    // 5.5s musique
  setTimeout(() => { introPlaying = false; }, 7000);                 // 7.0s inputs OK
}

// Forcer le restart de toutes les animations CSS du press-start-screen
function restartCSSAnimations() {
  const elements = pressStartScreen.querySelectorAll(
    ".intro-sprite, .intro-title, .intro-press-start, .sparkle, .roar-flash, .sprite"
  );
  elements.forEach(el => {
    const anim = el.style.animation;
    el.style.animation = "none";
    el.offsetHeight; // force reflow
    el.style.animation = anim || "";
  });
}

// Écouter clic/touche/tap
document.addEventListener("click", startIntro, { once: true });
document.addEventListener("keydown", startIntro, { once: true });
document.addEventListener("touchstart", startIntro, { once: true });

// ==============================================
// Transitions d'écrans
// ==============================================
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

function fadeOutAudio(audio, duration) {
  const startVol = audio.volume;
  const steps = 20;
  const stepTime = duration / steps;
  let step = 0;
  const fade = setInterval(() => {
    step++;
    audio.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      clearInterval(fade);
      audio.pause();
      audio.volume = startVol;
    }
  }, stepTime);
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
    }
  });
}

// Son de navigation menu — style GBA "ting"
function playMenuTick() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  // Note haute et brillante — "ting" métallique
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1320, now);

  // Attaque instantanée, déclin rapide = "ting" net
  const sfxLevel = 0.08 * (settings.sfxVol / 10);
  gain.gain.setValueAtTime(sfxLevel, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
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

  // Options : pas de flash, transition directe
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
        alert("Nouvelle partie lancee !\n\nBienvenue dans le monde Pokemon !");
        break;
    }
  }, 400);
}

// ==============================================
// Clavier
// ==============================================
document.addEventListener("keydown", (e) => {
  if (currentScreen === "press-start") {
    if (introPlaying) return;
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      showMenu();
    }
    return;
  }

  if (currentScreen === "menu") {
    if (currentSubmenu === "options") {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigateOptions(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateOptions(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          adjustOption(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          adjustOption(1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          confirmOption();
          break;
        case "Escape":
          e.preventDefault();
          hideOptions();
          break;
      }
    } else {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigate(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          navigate(1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          confirmSelection();
          break;
        case "Escape":
          e.preventDefault();
          backToTitle();
          break;
      }
    }
  }
});

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
  // Mettre à jour le hint selon le sous-menu actif
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

// Clics sur les items d'options
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

  // Taille aléatoire : 2px à 6px
  const size = 2 + Math.random() * 4;
  ember.style.width = size + "px";
  ember.style.height = size + "px";

  // Position horizontale aléatoire
  ember.style.left = Math.random() * 100 + "%";

  // Couleur — mélange orange/rouge/jaune
  const colors = [
    `rgba(255, ${60 + Math.random() * 80 | 0}, 0, ${0.7 + Math.random() * 0.3})`,
    `rgba(255, ${140 + Math.random() * 60 | 0}, 0, ${0.6 + Math.random() * 0.4})`,
    `rgba(255, ${200 + Math.random() * 55 | 0}, 50, ${0.5 + Math.random() * 0.5})`
  ];
  const color = colors[Math.random() * colors.length | 0];
  ember.style.background = color;
  ember.style.boxShadow = `0 0 ${size + 2}px ${size / 2}px ${color}`;

  // Dérive horizontale aléatoire (variable CSS)
  const drift = (Math.random() - 0.5) * 60;
  ember.style.setProperty("--drift", drift + "px");

  // Durée de montée : 3s à 7s
  const duration = 3 + Math.random() * 4;
  ember.style.animationDuration = duration + "s";

  // Léger délai aléatoire pour décaler les particules
  ember.style.animationDelay = (Math.random() * 0.5) + "s";

  container.appendChild(ember);

  // Nettoyage après la fin de l'animation
  setTimeout(() => ember.remove(), (duration + 1) * 1000);
}

function startEmbers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Batch initial pour ne pas avoir un écran vide
  for (let i = 0; i < 20; i++) {
    setTimeout(() => spawnEmber(container), i * 100);
  }

  // Spawn continu
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
