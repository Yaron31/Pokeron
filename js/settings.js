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
function serializePokemon(p) {
  return {
    key: p.key,
    level: p.level,
    stats: { ...p.stats },
    maxPv: p.maxPv,
    currentPv: p.currentPv,
    moves: p.moves.map(m => ({ ...m, name: m.name })),
    exp: p.exp
  };
}

function saveGame() {
  const p = gameState.playerPokemon;
  if (!p) return;
  const activeIndex = gameState.team.indexOf(gameState.playerPokemon);
  const data = {
    team: gameState.team.map(mon => serializePokemon(mon)),
    activeIndex: activeIndex >= 0 ? activeIndex : 0,
    combatNumber: gameState.combatNumber,
    inventory: { ...gameState.inventory },
    rivalStarterKey: gameState.rivalStarterKey,
    progressionRound: gameState.progressionRound,
    battleType: gameState.battleType,
    wildBattlesRemaining: gameState.wildBattlesRemaining,
    wildBattlesTotal: gameState.wildBattlesTotal,
    lang: settings.lang,
    musicVol: settings.musicVol,
    sfxVol: settings.sfxVol
  };
  localStorage.setItem("pokeron-save", JSON.stringify(data));
}

function rebuildPokemon(saved) {
  const template = POKEMON_DATA[saved.key];
  if (!template) return null;
  return {
    key: saved.key,
    name: template.name,
    type: template.type,
    typeName: template.typeName,
    color: template.color,
    emoji: template.emoji,
    level: saved.level,
    stats: saved.stats,
    maxPv: saved.maxPv,
    currentPv: saved.maxPv,
    spriteFront: template.spriteFront,
    spriteBack: template.spriteBack,
    spriteOffset: template.spriteOffset,
    moves: saved.moves,
    statModifiers: {},
    exp: saved.exp
  };
}

function loadGame() {
  try {
    const raw = localStorage.getItem("pokeron-save");
    if (!raw) return null;
    const data = JSON.parse(raw);

    // Compatibilité anciens saves (un seul Pokémon)
    if (data.playerPokemon && !data.team) {
      const mon = rebuildPokemon(data.playerPokemon);
      if (!mon) return null;
      return {
        playerPokemon: mon,
        team: [mon],
        combatNumber: data.combatNumber,
        rivalStarterKey: data.rivalStarterKey,
        progressionRound: data.progressionRound,
        battleType: data.battleType,
        wildBattlesRemaining: data.wildBattlesRemaining,
        wildBattlesTotal: data.wildBattlesTotal,
        lang: data.lang,
        musicVol: data.musicVol,
        sfxVol: data.sfxVol
      };
    }

    // Nouveau format : équipe complète
    const team = data.team.map(s => rebuildPokemon(s)).filter(Boolean);
    if (team.length === 0) return null;
    const activeIndex = Math.min(data.activeIndex || 0, team.length - 1);

    return {
      playerPokemon: team[activeIndex],
      team,
      combatNumber: data.combatNumber,
      rivalStarterKey: data.rivalStarterKey,
      progressionRound: data.progressionRound,
      battleType: data.battleType,
      wildBattlesRemaining: data.wildBattlesRemaining,
      wildBattlesTotal: data.wildBattlesTotal,
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
