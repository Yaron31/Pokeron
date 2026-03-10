/* ==============================================
   POKÉRON — Réglages & Sauvegarde
   ============================================== */

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
        currentPv: p.maxPv,
        spriteFront: template.spriteFront,
        spriteBack: template.spriteBack,
        spriteOffset: template.spriteOffset,
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
