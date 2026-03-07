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
let disabledIndexes = [1];

// ==============================================
// Données Pokémon
// ==============================================
const POKEMON_DATA = {
  salameche: {
    name: { fr: "Salamèche", en: "Charmander" },
    type: "feu",
    typeName: { fr: "Feu", en: "Fire" },
    baseStats: { pv: 39, atk: 52, def: 43, atkSpe: 60, defSpe: 50, vitesse: 65 },
    moves: [
      { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, pp: 35 },
      { name: { fr: "Flammèche", en: "Ember" }, type: "feu", category: "speciale", power: 40, pp: 25 }
    ],
    color: "#F08030", emoji: "🔥",
    spriteFront: "assets/images/front_charmander.png",
    spriteBack: "assets/images/back_charmander.png"
  },
  carapuce: {
    name: { fr: "Carapuce", en: "Squirtle" },
    type: "eau",
    typeName: { fr: "Eau", en: "Water" },
    baseStats: { pv: 44, atk: 48, def: 65, atkSpe: 50, defSpe: 64, vitesse: 43 },
    moves: [
      { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, pp: 35 },
      { name: { fr: "Pistolet à O", en: "Water Gun" }, type: "eau", category: "speciale", power: 40, pp: 25 }
    ],
    color: "#6890F0", emoji: "💧",
    spriteFront: "assets/images/front_squirtle.png",
    spriteBack: "assets/images/back_squirtle.png"
  },
  bulbizarre: {
    name: { fr: "Bulbizarre", en: "Bulbasaur" },
    type: "plante",
    typeName: { fr: "Plante", en: "Grass" },
    baseStats: { pv: 45, atk: 49, def: 49, atkSpe: 65, defSpe: 65, vitesse: 45 },
    moves: [
      { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, pp: 35 },
      { name: { fr: "Fouet Lianes", en: "Vine Whip" }, type: "plante", category: "speciale", power: 45, pp: 25 }
    ],
    color: "#78C850", emoji: "🌿",
    spriteFront: "assets/images/front_bulbasaur.png",
    spriteBack: "assets/images/back_bulbasaur.png"
  }
};

const TYPE_CHART = {
  feu:    { plante: 2, eau: 0.5, feu: 0.5, normal: 1 },
  eau:    { feu: 2, plante: 0.5, eau: 0.5, normal: 1 },
  plante: { eau: 2, feu: 0.5, plante: 0.5, normal: 1 },
  normal: { feu: 1, eau: 1, plante: 1, normal: 1 }
};

const MATCHUPS = { salameche: "bulbizarre", carapuce: "salameche", bulbizarre: "carapuce" };

let gameState = {
  playerPokemon: null,
  enemyPokemon: null,
  combatNumber: 0,
  battleActive: false
};

// --- Réglages ---
const defaultSettings = { musicVol: 5, sfxVol: 7, lang: "fr", textSpeed: 2 };
const TEXT_SPEED_MS = { 1: 55, 2: 30, 3: 10 };
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

// --- Sauvegarde de partie ---
function saveGame() {
  const p = gameState.playerPokemon;
  if (!p) return;
  const data = {
    playerPokemon: {
      key: p.key,
      level: p.level,
      stats: { ...p.stats },
      maxPv: p.maxPv,
      currentPv: p.currentPv,
      moves: p.moves.map(m => ({ ...m, name: m.name })),
      exp: p.exp
    },
    combatNumber: gameState.combatNumber,
    lang: settings.lang,
    musicVol: settings.musicVol,
    sfxVol: settings.sfxVol
  };
  localStorage.setItem("pokeron-save", JSON.stringify(data));
}

function loadGame() {
  try {
    const raw = localStorage.getItem("pokeron-save");
    if (!raw) return null;
    const data = JSON.parse(raw);
    const p = data.playerPokemon;
    const template = POKEMON_DATA[p.key];
    if (!template) return null;
    // Reconstruit l'instance complète depuis le template + la save
    return {
      playerPokemon: {
        key: p.key,
        name: template.name,
        type: template.type,
        typeName: template.typeName,
        color: template.color,
        emoji: template.emoji,
        level: p.level,
        stats: p.stats,
        maxPv: p.maxPv,
        currentPv: p.currentPv,
        moves: p.moves,
        exp: p.exp
      },
      combatNumber: data.combatNumber,
      lang: data.lang,
      musicVol: data.musicVol,
      sfxVol: data.sfxVol
    };
  } catch { return null; }
}

function hasSaveData() {
  return localStorage.getItem("pokeron-save") !== null;
}

function deleteSave() {
  localStorage.removeItem("pokeron-save");
}

function updateContinueStatus() {
  if (hasSaveData()) {
    disabledIndexes = [];
    menuItems[1].querySelector(".disabled-tag")?.remove();
  } else {
    if (!disabledIndexes.includes(1)) disabledIndexes.push(1);
  }
  updateSelection();
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
    textSpeed: "TEXTE",
    textSpeedSlow: "LENT",
    textSpeedNormal: "NORMAL",
    textSpeedFast: "RAPIDE",
    back: "RETOUR",
    pressStart: "Appuie sur START...",
    waitingHint: "Clique n'importe ou...",
    menuHint: "↑↓ Naviguer   ENTRÉE Sélectionner   ÉCHAP Retour",
    optHint: "↑↓ Naviguer   ◄► Ajuster   ÉCHAP Retour",
    // Starter
    starterTitle: "Choisis ton Pokémon !",
    // Combat
    wildAppears: "Un {name} sauvage apparaît !",
    whatWillDo: "Que va faire {name} ?",
    usesMove: "{pokemon} utilise {move} !",
    superEffective: "C'est super efficace !",
    notEffective: "Ce n'est pas très efficace...",
    loses: "{name} perd {damage} PV !",
    fainted: "{name} est K.O. !",
    // EXP
    expGain: "{name} gagne {exp} points d'EXP !",
    levelUp: "{name} monte au niveau {level} !",
    statGains: "PV +{pv}  Atk +{atk}  Déf +{def}",
    // Résultat
    victory: "VICTOIRE !",
    defeat: "DÉFAITE...",
    pokemonFainted: "Ton Pokémon est K.O.",
    battlesWon: "Combats gagnés : {count}",
    nextBattle: "Combat suivant",
    backToMenu: "Retour au menu",
    battleNumber: "Combat #{num}",
    levelAbbr: "Nv.",
    hpLabel: "PV",
    // Pause
    resume: "REPRENDRE",
    quitBattle: "MENU PRINCIPAL",
    quitConfirm: "Quitter le combat ?",
    yes: "OUI",
    no: "NON",
    // Écran victoire
    save: "SAUVEGARDER",
    saved: "Partie sauvegardée !",
    battleCount: "Combats : {count}",
    statsTitle: "STATS",
    atkLabel: "Atk",
    defLabel: "Déf",
    atkSpeLabel: "Atk Spé",
    defSpeLabel: "Déf Spé",
    vitLabel: "Vitesse"
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
    textSpeed: "TEXT",
    textSpeedSlow: "SLOW",
    textSpeedNormal: "NORMAL",
    textSpeedFast: "FAST",
    back: "BACK",
    pressStart: "Press START...",
    waitingHint: "Click anywhere...",
    menuHint: "↑↓ Navigate   ENTER Select   ESC Back",
    optHint: "↑↓ Navigate   ◄► Adjust   ESC Back",
    // Starter
    starterTitle: "Choose your Pokémon!",
    // Battle
    wildAppears: "A wild {name} appeared!",
    whatWillDo: "What will {name} do?",
    usesMove: "{pokemon} uses {move}!",
    superEffective: "It's super effective!",
    notEffective: "It's not very effective...",
    loses: "{name} loses {damage} HP!",
    fainted: "{name} fainted!",
    // EXP
    expGain: "{name} gains {exp} EXP points!",
    levelUp: "{name} grew to level {level}!",
    statGains: "HP +{pv}  Atk +{atk}  Def +{def}",
    // Result
    victory: "VICTORY!",
    defeat: "DEFEAT...",
    pokemonFainted: "Your Pokémon fainted.",
    battlesWon: "Battles won: {count}",
    nextBattle: "Next battle",
    backToMenu: "Back to menu",
    battleNumber: "Battle #{num}",
    levelAbbr: "Lv.",
    hpLabel: "HP",
    // Pause
    resume: "RESUME",
    quitBattle: "MAIN MENU",
    quitConfirm: "Quit the battle?",
    yes: "YES",
    no: "NO",
    // Victory screen
    save: "SAVE",
    saved: "Game saved!",
    battleCount: "Battles: {count}",
    statsTitle: "STATS",
    atkLabel: "Atk",
    defLabel: "Def",
    atkSpeLabel: "Sp. Atk",
    defSpeLabel: "Sp. Def",
    vitLabel: "Speed"
  }
};

// --- Fonctions de traduction ---
function t(key, params = {}) {
  let text = translations[settings.lang]?.[key] ?? translations.fr[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

function pName(pokemon) {
  const data = POKEMON_DATA[pokemon.key];
  return data.name[settings.lang] ?? data.name.fr;
}

function moveName(move) {
  if (typeof move.name === "object") return move.name[settings.lang] ?? move.name.fr;
  return move.name;
}

// --- Références DOM ---
const pressStartScreen = document.getElementById("press-start-screen");
const menuScreen = document.getElementById("menu-screen");
const waitingHint = document.getElementById("waiting-hint");

// --- Audio (fichiers) ---
const charizardCry = new Audio("assets/sons/charizard-cry.mp3");
const titleTheme = new Audio("assets/sons/title-theme.mp3");
const gameTheme = new Audio("assets/sons/1-04. Game Tutorial.mp3");
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

// --- Sons de combat ---
function playAttackSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2 * settings.sfxVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(now);
  src.stop(now + 0.15);
}

function playHitSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
  gain.gain.setValueAtTime(0.25 * settings.sfxVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playPokeballOpen() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
  gain.gain.setValueAtTime(0.15 * settings.sfxVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playVictoryJingle() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // Do-Mi-Sol-Do (octave)
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const t = now + i * 0.35;
    gain.gain.setValueAtTime(0.15 * settings.sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function playDefeatSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [440, 349, 294]; // La-Fa-Ré (descendant)
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = now + i * 0.4;
    gain.gain.setValueAtTime(0.15 * settings.sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

function playLevelUpSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // gamme Do majeur
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const t = now + i * 0.1;
    gain.gain.setValueAtTime(0.1 * settings.sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
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
        showStarterScreen();
        break;
      case 1:
        continueGame();
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

// ==============================================
// Références DOM — Écrans de jeu
// ==============================================
const starterScreen = document.getElementById("starter-screen");
const battleScreen = document.getElementById("battle-screen");
const resultScreen = document.getElementById("result-screen");

// ==============================================
// Choix du starter
// ==============================================
let starterEmbersInterval = null;

// Les fonds des sprites ont été supprimés directement dans les fichiers PNG
// → plus besoin de removeSpriteBg() au runtime

// ==============================================
// Pokéball — 3 images séparées + CSS filter pour la couleur
// ==============================================
const POKEBALL_FRAMES_SRC = [
  "assets/images/pokeball_close.PNG",
  "assets/images/pokeball_semi-open.PNG",
  "assets/images/pokeball_open.PNG"
];

// CSS hue-rotate pour chaque type (la Pokéball est rouge = hue 0°)
// hue-rotate ne touche que les couleurs saturées → noir/blanc/gris restent intacts
// Couleurs basées sur les Pokémon eux-mêmes
const TYPE_HUE_ROTATE = {
  "#F08030": "hue-rotate(18deg) saturate(2.5) brightness(1.2)",   // Feu → orange de Salamèche
  "#6890F0": "hue-rotate(195deg) saturate(2) brightness(1.5)",    // Eau → bleu clair de Carapuce
  "#78C850": "hue-rotate(90deg) saturate(2.2) brightness(1.5)"    // Plante → vert clair de Bulbizarre
};

// Offset individuel pour centrer chaque sprite dans sa Pokéball
// (les pattes servent de point d'ancrage)
const STARTER_SPRITE_OFFSET = {
  salameche:  { left: "24%", width: "72%" },  // gros décalage droite — pattes loin de la flamme
  carapuce:   { left: "5%",  width: "76%" },  // plus à gauche
  bulbizarre: { left: "8%",  width: "76%" }   // un poil plus à gauche
};

// ==============================================
// Animation Pokéball (3 frames)
// ==============================================
// Animation Pokéball (3 images : close → semi-open → open)
// ==============================================
function animatePokeball(container, open) {
  const sprite = container.querySelector(".pokeball-sprite");
  if (!sprite) return;

  if (container._animTimer) {
    clearTimeout(container._animTimer);
    container._animTimer = null;
  }

  if (open) {
    sprite.src = POKEBALL_FRAMES_SRC[1];
    container._animTimer = setTimeout(() => {
      sprite.src = POKEBALL_FRAMES_SRC[2];
      container._animTimer = setTimeout(() => {
        container.classList.add("open");
        container._animTimer = null;
      }, 100);
    }, 140);
  } else {
    container.classList.remove("open");
    container._animTimer = setTimeout(() => {
      sprite.src = POKEBALL_FRAMES_SRC[1];
      container._animTimer = setTimeout(() => {
        sprite.src = POKEBALL_FRAMES_SRC[0];
        container._animTimer = null;
      }, 100);
    }, 80);
  }
}

// ==============================================
// Rendu des starters (Pokéballs PNG + CSS filter)
// ==============================================
let keyboardNavActive = false;

function renderStarterCards() {
  const container = document.querySelector(".starter-choices");
  const title = document.querySelector(".starter-title");
  if (title) title.textContent = t("starterTitle");
  if (!container) return;

  container.querySelectorAll(".pokeball-container").forEach(c => {
    if (c._animTimer) clearTimeout(c._animTimer);
  });
  container.innerHTML = "";
  const keys = Object.keys(POKEMON_DATA);

  keys.forEach((key, idx) => {
    const data = POKEMON_DATA[key];

    const ball = document.createElement("div");
    ball.className = "pokeball-container";
    ball.dataset.pokemon = key;

    // Image Pokéball (frame fermée) + filtre CSS pour la couleur du type
    const pokeImg = document.createElement("img");
    pokeImg.className = "pokeball-sprite";
    pokeImg.alt = data.name[settings.lang] || data.name.fr;
    pokeImg.src = POKEBALL_FRAMES_SRC[0];
    pokeImg.style.filter = TYPE_HUE_ROTATE[data.color] || "";
    ball.appendChild(pokeImg);

    // Sprite Pokémon (caché, apparaît quand ouvert)
    const pokemonImg = document.createElement("img");
    pokemonImg.className = "pokeball-pokemon";
    pokemonImg.alt = data.name[settings.lang] || data.name.fr;
    pokemonImg.src = data.spriteFront;
    const offset = STARTER_SPRITE_OFFSET[key] || {};
    if (offset.left) pokemonImg.style.left = offset.left;
    if (offset.width) pokemonImg.style.width = offset.width;
    ball.appendChild(pokemonImg);

    ball.addEventListener("click", () => selectStarter(key));

    ball.addEventListener("mouseenter", () => {
      keyboardNavActive = false;
      starterIndex = idx;
      updateStarterFocus();
    });

    container.appendChild(ball);
  });

  container.addEventListener("mouseleave", () => {
    if (!keyboardNavActive) {
      closeAllPokeballs();
    }
  });
}

function closeAllPokeballs() {
  getStarterCards().forEach(c => {
    if (c.classList.contains("open") || c._animTimer) {
      animatePokeball(c, false);
    }
  });
}

function showStarterScreen() {
  menuScreen.classList.add("fade-out");
  fadeOutAudio(gameTheme, 500);
  starterIndex = 0;
  renderStarterCards();

  setTimeout(() => {
    menuScreen.classList.remove("active", "fade-out");
    starterScreen.classList.add("active", "fade-in");
    currentScreen = "starter";
    if (!starterEmbersInterval) {
      starterEmbersInterval = startEmbers("starter-embers");
    }
    setTimeout(() => starterScreen.classList.remove("fade-in"), 500);
  }, 500);
}

function selectStarter(key) {
  playPokeballOpen();
  deleteSave();
  gameState.playerPokemon = createPokemonInstance(key, 5);
  gameState.combatNumber = 0;
  generateEnemy();
  transitionToBattle();
}

function continueGame() {
  const save = loadGame();
  if (!save) return;
  // Restaure les settings sauvegardés
  settings.lang = save.lang;
  settings.musicVol = save.musicVol;
  settings.sfxVol = save.sfxVol;
  saveSettings();
  applyLanguage();
  // Restaure le Pokémon et l'état
  gameState.playerPokemon = save.playerPokemon;
  gameState.combatNumber = save.combatNumber;
  generateEnemy();
  transitionToBattleFromMenu();
}

function generateEnemy() {
  const playerKey = gameState.playerPokemon.key;
  const enemyKey = MATCHUPS[playerKey];
  const level = gameState.playerPokemon.level;
  gameState.enemyPokemon = createPokemonInstance(enemyKey, level);
  gameState.combatNumber++;
}

// ==============================================
// Création d'instance Pokémon
// ==============================================
function createPokemonInstance(dataKey, level) {
  const data = POKEMON_DATA[dataKey];
  const stats = {};
  for (const [stat, base] of Object.entries(data.baseStats)) {
    if (stat === "pv") {
      stats[stat] = Math.floor((base * 2 * level) / 100) + level + 10;
    } else {
      stats[stat] = Math.floor((base * 2 * level) / 100) + 5;
    }
  }
  return {
    key: dataKey,
    name: data.name,
    type: data.type,
    color: data.color,
    emoji: data.emoji,
    spriteFront: data.spriteFront,
    spriteBack: data.spriteBack,
    level,
    stats: { ...stats },
    maxPv: stats.pv,
    currentPv: stats.pv,
    moves: data.moves.map(m => ({ ...m, currentPp: m.pp })),
    exp: 0
  };
}

// ==============================================
// Transitions entre écrans de jeu
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

// ==============================================
// Moteur de combat — Messages narratifs
// ==============================================
const messageQueue = [];
let messageResolve = null;
let typewriterDone = false;
let typewriterInterval = null;

function queueMessage(text) {
  messageQueue.push(text);
}

async function processMessages() {
  const movesDiv = document.getElementById("battle-moves");
  movesDiv.classList.add("hidden");

  for (const msg of messageQueue) {
    await showMessage(msg);
    await waitForClick();
  }
  messageQueue.length = 0;
  movesDiv.classList.remove("hidden");
}

function showMessage(text) {
  return new Promise(resolve => {
    const textEl = document.getElementById("battle-text");
    textEl.textContent = "";
    typewriterDone = false;
    let i = 0;

    typewriterInterval = setInterval(() => {
      if (i < text.length) {
        textEl.textContent += text[i];
        i++;
      } else {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        typewriterDone = true;
        resolve();
      }
    }, TEXT_SPEED_MS[settings.textSpeed] || 30);

    // Permet de skip le typewriter en cliquant
    messageResolve = () => {
      if (!typewriterDone) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        textEl.textContent = text;
        typewriterDone = true;
        messageResolve = null;
        resolve();
      }
    };
  });
}

function waitForClick() {
  return new Promise(resolve => {
    messageResolve = resolve;
  });
}

document.getElementById("battle-textbox").addEventListener("click", () => {
  if (messageResolve) {
    const fn = messageResolve;
    messageResolve = null;
    fn();
  }
});

// ==============================================
// Moteur de combat — Calculs
// ==============================================
function calculateDamage(attacker, defender, move) {
  const level = attacker.level;
  const atk = move.category === "physique" ? attacker.stats.atk : attacker.stats.atkSpe;
  const def = move.category === "physique" ? defender.stats.def : defender.stats.defSpe;
  const typeMultiplier = TYPE_CHART[move.type]?.[defender.type] ?? 1;
  const baseDmg = Math.floor(((2 * level / 5 + 2) * move.power * atk / def) / 50 + 2);
  const damage = Math.floor(baseDmg * typeMultiplier);
  return { damage: Math.max(1, damage), multiplier: typeMultiplier };
}

function aiChooseMove(enemy, player) {
  const moves = enemy.moves.filter(m => m.currentPp > 0);
  if (moves.length === 0) return enemy.moves[0];
  if (Math.random() < 0.8) {
    return moves.reduce((best, m) =>
      calculateDamage(enemy, player, m).damage > calculateDamage(enemy, player, best).damage ? m : best
    );
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

// ==============================================
// Moteur de combat — UI
// ==============================================
function updateHpBar(who, pokemon) {
  const pct = Math.max(0, (pokemon.currentPv / pokemon.maxPv) * 100);
  const fill = document.getElementById(who + "-hp");
  fill.style.width = pct + "%";

  if (pct > 50) fill.style.background = "linear-gradient(to bottom, #58D058, #30A830)";
  else if (pct > 20) fill.style.background = "linear-gradient(to bottom, #F8D030, #E0A820)";
  else fill.style.background = "linear-gradient(to bottom, #F85858, #D03030)";

  if (who === "player") {
    document.getElementById("player-hp-text").textContent =
      `${Math.max(0, pokemon.currentPv)}/${pokemon.maxPv}`;
  }
}

function setupBattleUI() {
  const p = gameState.playerPokemon;
  const e = gameState.enemyPokemon;

  document.getElementById("player-name").textContent = pName(p);
  document.getElementById("player-level").textContent = `${t("levelAbbr")}${p.level}`;
  const playerSprite = document.getElementById("player-sprite");
  playerSprite.textContent = "";
  playerSprite.style.backgroundColor = "";
  playerSprite.innerHTML = `<img src="${p.spriteBack}" alt="${pName(p)}" class="sprite-img">`;

  document.getElementById("enemy-name").textContent = pName(e);
  document.getElementById("enemy-level").textContent = `${t("levelAbbr")}${e.level}`;
  const enemySprite = document.getElementById("enemy-sprite");
  enemySprite.textContent = "";
  enemySprite.style.backgroundColor = "";
  enemySprite.innerHTML = `<img src="${e.spriteFront}" alt="${pName(e)}" class="sprite-img">`;

  updateHpBar("player", p);
  updateHpBar("enemy", e);

  renderMoveButtons();
}

function renderMoveButtons() {
  const movesDiv = document.getElementById("battle-moves");
  movesDiv.innerHTML = "";
  movesDiv.classList.remove("hidden");

  gameState.playerPokemon.moves.forEach((move, i) => {
    const btn = document.createElement("button");
    btn.className = `move-btn type-${move.type}`;
    btn.innerHTML = `<span>${moveName(move)}</span><span class="move-pp">PP ${move.currentPp}/${move.pp}</span>`;
    btn.addEventListener("click", () => {
      if (!gameState.battleActive) return;
      if (move.currentPp <= 0) return;
      playerChooseMove(i);
    });
    movesDiv.appendChild(btn);
  });
}

// ==============================================
// Moteur de combat — Déroulement des tours
// ==============================================
async function startBattle() {
  gameState.battleActive = true;
  setupBattleUI();
  queueMessage(t("wildAppears", { name: pName(gameState.enemyPokemon) }));
  await processMessages();
  document.getElementById("battle-text").textContent =
    t("whatWillDo", { name: pName(gameState.playerPokemon) });
}

async function playerChooseMove(moveIndex) {
  if (!gameState.battleActive) return;
  gameState.battleActive = false;

  const movesDiv = document.getElementById("battle-moves");
  movesDiv.classList.add("hidden");

  const playerMove = gameState.playerPokemon.moves[moveIndex];
  const aiMove = aiChooseMove(gameState.enemyPokemon, gameState.playerPokemon);

  const p = gameState.playerPokemon;
  const e = gameState.enemyPokemon;
  const playerFirst = p.stats.vitesse >= e.stats.vitesse;

  const first = playerFirst
    ? { mon: p, move: playerMove, target: e, isPlayer: true }
    : { mon: e, move: aiMove, target: p, isPlayer: false };
  const second = playerFirst
    ? { mon: e, move: aiMove, target: p, isPlayer: false }
    : { mon: p, move: playerMove, target: e, isPlayer: true };

  // Premier attaquant
  await executeAttack(first);
  if (first.target.currentPv <= 0) {
    await endBattle(first.target === e);
    return;
  }

  // Second attaquant
  await executeAttack(second);
  if (second.target.currentPv <= 0) {
    await endBattle(second.target === e);
    return;
  }

  movesDiv.classList.remove("hidden");
  gameState.battleActive = true;
  document.getElementById("battle-text").textContent =
    t("whatWillDo", { name: pName(p) });
  renderMoveButtons();
}

const ATTACK_SLIDE_MS = 350;
const HIT_ANIM_MS = 400;
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function executeAttack({ mon, move, target, isPlayer }) {
  move.currentPp = Math.max(0, move.currentPp - 1);

  // Step 1 : Afficher message d'attaque et attendre clic
  await showMessage(t("usesMove", { pokemon: pName(mon), move: moveName(move) }));
  await waitForClick();

  // Step 2 : Attaquant glisse vers l'avant
  const attackerEl = document.getElementById(isPlayer ? "player-sprite" : "enemy-sprite");
  const defenderEl = document.getElementById(isPlayer ? "enemy-sprite" : "player-sprite");
  const slideClass = isPlayer ? "attack-slide-right" : "attack-slide-left";

  playAttackSound();
  attackerEl.classList.add(slideClass);
  await delay(ATTACK_SLIDE_MS);
  attackerEl.classList.remove(slideClass);

  // Step 3 : Calcul dégâts
  const { damage, multiplier } = calculateDamage(mon, target, move);
  target.currentPv = Math.max(0, target.currentPv - damage);

  // Step 4 : Défenseur flashe + tremble + barre PV
  defenderEl.classList.add("hit-flash", "damage-shake");
  playHitSound();
  updateHpBar("player", gameState.playerPokemon);
  updateHpBar("enemy", gameState.enemyPokemon);
  await delay(HIT_ANIM_MS);
  defenderEl.classList.remove("hit-flash", "damage-shake");

  // Step 5 : Efficacité (si applicable)
  if (multiplier > 1) {
    await showMessage(t("superEffective"));
    await waitForClick();
  } else if (multiplier < 1) {
    await showMessage(t("notEffective"));
    await waitForClick();
  }

  // Step 6 : K.O. si nécessaire
  if (target.currentPv <= 0) {
    await showMessage(t("fainted", { name: pName(target) }));
    await waitForClick();
  }
}

// ==============================================
// Fin de combat + EXP + Level Up
// ==============================================
async function endBattle(playerWon) {
  gameState.battleActive = false;

  if (playerWon) {
    const p = gameState.playerPokemon;
    const e = gameState.enemyPokemon;
    gainExp(p, e.level);
    await processMessages();
    saveGame();
    showResult(true);
  } else {
    showResult(false);
  }
}

function showResult(won) {
  const titleEl = document.getElementById("result-title");
  const summaryEl = document.getElementById("result-summary");
  const buttonsEl = document.getElementById("result-buttons");

  summaryEl.innerHTML = "";
  buttonsEl.innerHTML = "";

  if (won) {
    const p = gameState.playerPokemon;
    playVictoryJingle();
    titleEl.textContent = t("victory");

    // Résumé complet
    summaryEl.innerHTML = `
      <div class="result-pokemon-line">${pName(p)} ${t("levelAbbr")}${p.level}</div>
      <div class="result-stats">
        <div class="result-stat">${t("hpLabel")}: <span>${p.currentPv}/${p.maxPv}</span></div>
        <div class="result-stat">${t("atkLabel")}: <span>${p.stats.atk}</span></div>
        <div class="result-stat">${t("defLabel")}: <span>${p.stats.def}</span></div>
        <div class="result-stat">${t("atkSpeLabel")}: <span>${p.stats.atkSpe}</span></div>
        <div class="result-stat">${t("defSpeLabel")}: <span>${p.stats.defSpe}</span></div>
        <div class="result-stat">${t("vitLabel")}: <span>${p.stats.vitesse}</span></div>
      </div>
      <div class="result-battle-count">${t("battleCount", { count: gameState.combatNumber })}</div>
      <div class="result-saved-msg" id="saved-msg">${t("saved")}</div>
    `;

    // 4 boutons
    const nextBtn = createResultBtn(t("nextBattle"), false, () => {
      restorePokemon(p);
      generateEnemy();
      transitionToBattleFromResult();
    });
    const saveBtn = createResultBtn(t("save"), true, () => {
      saveGame();
      const msg = document.getElementById("saved-msg");
      if (msg) { msg.classList.add("visible"); setTimeout(() => msg.classList.remove("visible"), 2000); }
    });
    const optBtn = createResultBtn(t("options"), true, () => {
      // Retourne au menu avec options ouvertes
      transitionToMenu();
    });
    const menuBtn = createResultBtn(t("backToMenu"), true, () => {
      transitionToMenu();
    });

    buttonsEl.append(nextBtn, saveBtn, optBtn, menuBtn);
  } else {
    playDefeatSound();
    titleEl.textContent = t("defeat");
    summaryEl.innerHTML = `
      <div style="text-align:center">
        ${t("pokemonFainted")}<br>
        <span class="result-battle-count">${t("battlesWon", { count: gameState.combatNumber - 1 })}</span>
      </div>
    `;
    buttonsEl.append(createResultBtn(t("backToMenu"), false, () => transitionToMenu()));
  }

  transitionToResult();
}

function createResultBtn(text, secondary, onclick) {
  const btn = document.createElement("button");
  btn.className = "result-btn" + (secondary ? " secondary" : "");
  btn.textContent = text;
  btn.onclick = onclick;
  return btn;
}

function restorePokemon(pokemon) {
  pokemon.currentPv = pokemon.maxPv;
  pokemon.moves.forEach(m => { m.currentPp = m.pp; });
}

function gainExp(winner, loserLevel) {
  const expGained = loserLevel * 15;
  winner.exp += expGained;
  queueMessage(t("expGain", { name: pName(winner), exp: expGained }));

  const nextLevelExp = Math.pow(winner.level + 1, 3);
  if (winner.exp >= nextLevelExp) {
    levelUp(winner);
  }
}

function levelUp(pokemon) {
  pokemon.level++;
  const data = POKEMON_DATA[pokemon.key];
  const gains = {};
  for (const stat of ["pv", "atk", "def", "atkSpe", "defSpe", "vitesse"]) {
    const bonus = Math.floor(data.baseStats[stat] / 50) + Math.floor(Math.random() * 4);
    pokemon.stats[stat] += bonus;
    gains[stat] = bonus;
  }
  pokemon.maxPv = pokemon.stats.pv;
  playLevelUpSound();
  queueMessage(t("levelUp", { name: pName(pokemon), level: pokemon.level }));
  queueMessage(t("statGains", { pv: gains.pv, atk: gains.atk, def: gains.def }));
}

// ==============================================
// Menu Pause
// ==============================================
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

// ==============================================
// Gestion clavier étendue (starter + combat)
// ==============================================
let starterIndex = 0;
function getStarterCards() { return document.querySelectorAll(".pokeball-container"); }

document.addEventListener("keydown", (e) => {
  if (currentScreen === "starter") {
    switch (e.key) {
      case "ArrowLeft": {
        e.preventDefault();
        keyboardNavActive = true;
        const total = getStarterCards().length || 3;
        starterIndex = (starterIndex - 1 + total) % total;
        updateStarterFocus();
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        keyboardNavActive = true;
        const total = getStarterCards().length || 3;
        starterIndex = (starterIndex + 1) % total;
        updateStarterFocus();
        break;
      }
      case "Enter":
      case " ":
        e.preventDefault();
        selectStarter(getStarterCards()[starterIndex].dataset.pokemon);
        break;
      case "Escape":
        e.preventDefault();
        backToMenuFromStarter();
        break;
    }
  }

  if (currentScreen === "battle") {
    // Menu pause
    if (e.key === "Escape") {
      e.preventDefault();
      if (pauseOpen) {
        if (pauseOptionsOpen) {
          closePauseOptions();
        } else if (quitConfirmOpen) {
          quitConfirmOpen = false;
          quitConfirm.classList.add("hidden");
        } else {
          closePause();
        }
      } else if (gameState.battleActive) {
        openPause();
      }
      return;
    }

    // Navigation pause
    if (pauseOpen) {
      // Sous-menu options
      if (pauseOptionsOpen) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            navigatePauseOptions(-1);
            break;
          case "ArrowDown":
            e.preventDefault();
            navigatePauseOptions(1);
            break;
          case "ArrowLeft":
            e.preventDefault();
            adjustPauseOption(-1);
            break;
          case "ArrowRight":
            e.preventDefault();
            adjustPauseOption(1);
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            confirmPauseOption();
            break;
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigatePause(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          navigatePause(1);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          if (quitConfirmOpen) {
            e.preventDefault();
            navigatePause(0); // toggle OUI/NON
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          confirmPauseSelection();
          break;
      }
      return;
    }

    // Raccourcis combat
    if (gameState.battleActive) {
      const moves = gameState.playerPokemon.moves;
      if (e.key === "1" && moves[0] && moves[0].currentPp > 0) {
        e.preventDefault();
        playerChooseMove(0);
      } else if (e.key === "2" && moves[1] && moves[1].currentPp > 0) {
        e.preventDefault();
        playerChooseMove(1);
      }
    }
  }
});

function updateStarterFocus() {
  getStarterCards().forEach((c, i) => {
    if (i === starterIndex) {
      if (!c.classList.contains("open")) {
        animatePokeball(c, true);
      }
    } else {
      if (c.classList.contains("open") || c._animTimer) {
        animatePokeball(c, false);
      }
    }
  });
  playMenuTick();
}

function backToMenuFromStarter() {
  currentScreen = "menu";
  transitionToScreen(starterScreen, menuScreen, () => {
    gameTheme.currentTime = 0;
    gameTheme.play().catch(() => {});
    if (!menuEmbersInterval) {
      menuEmbersInterval = startEmbers("menu-embers");
    }
  });
}
