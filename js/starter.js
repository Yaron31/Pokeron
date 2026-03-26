/* ==============================================
   POKÉRON — Choix du starter & création Pokémon
   ============================================== */

let starterEmbersInterval = null;

// ==============================================
// Pokéball — 3 images séparées + CSS filter pour la couleur
// ==============================================
const POKEBALL_FRAMES_SRC = [
  "assets/images/menu/pokeball_close.PNG",
  "assets/images/menu/pokeball_semi-open.PNG",
  "assets/images/menu/pokeball_open.PNG"
];

// CSS hue-rotate pour chaque type (la Pokéball est rouge = hue 0°)
const TYPE_HUE_ROTATE = {
  "#F08030": "hue-rotate(18deg) saturate(2.5) brightness(1.2)",   // Feu → orange de Salamèche
  "#6890F0": "hue-rotate(195deg) saturate(2) brightness(1.5)",    // Eau → bleu clair de Carapuce
  "#78C850": "hue-rotate(90deg) saturate(2.2) brightness(1.5)"    // Plante → vert clair de Bulbizarre
};

// Offset individuel pour centrer chaque sprite dans sa Pokéball
const STARTER_SPRITE_OFFSET = {
  salameche:  { left: "24%", width: "72%" },
  carapuce:   { left: "5%",  width: "76%" },
  bulbizarre: { left: "8%",  width: "76%" }
};

// ==============================================
// Animation Pokéball (3 frames)
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
  const keys = ["salameche", "carapuce", "bulbizarre"];

  keys.forEach((key, idx) => {
    const data = POKEMON_DATA[key];

    const ball = document.createElement("div");
    ball.className = "pokeball-container";
    ball.dataset.pokemon = key;

    const pokeImg = document.createElement("img");
    pokeImg.className = "pokeball-sprite";
    pokeImg.alt = data.name[settings.lang] || data.name.fr;
    pokeImg.src = POKEBALL_FRAMES_SRC[0];
    pokeImg.style.filter = TYPE_HUE_ROTATE[data.color] || "";
    ball.appendChild(pokeImg);

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
  setTimeout(() => {
    oakTheme.currentTime = 0;
    oakTheme.play().catch(() => {});
  }, 500);
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
  fadeOutAudio(oakTheme, 500);
  playPokeballOpen();
  deleteSave();
  gameState.playerPokemon = createPokemonInstance(key, 5);
  gameState.team = [gameState.playerPokemon];
  gameState.combatNumber = 0;
  gameState.inventory = { potion: Infinity, pokeball: Infinity, xpcandy: Infinity };
  gameState.rivalStarterKey = MATCHUPS[key];
  gameState.progressionRound = 1;
  gameState.battleType = "rival";
  gameState.wildBattlesRemaining = 0;
  gameState.wildBattlesTotal = 0;
  generateRivalEnemy();
  transitionToBattle();
}

function continueGame() {
  const save = loadGame();
  if (!save) return;
  gameState.playerPokemon = save.playerPokemon;
  gameState.team = save.team || [gameState.playerPokemon];
  gameState.combatNumber = save.combatNumber;
  gameState.inventory = save.inventory || { potion: Infinity, pokeball: Infinity, xpcandy: Infinity };
  gameState.rivalStarterKey = save.rivalStarterKey ?? MATCHUPS[save.playerPokemon.key];
  gameState.progressionRound = save.progressionRound ?? 1;
  gameState.battleType = save.battleType ?? "rival";
  gameState.wildBattlesRemaining = save.wildBattlesRemaining ?? 0;
  gameState.wildBattlesTotal = save.wildBattlesTotal ?? 0;
  if (gameState.battleType === "wild" && gameState.wildBattlesRemaining > 0) {
    generateWildEnemy();
  } else {
    generateRivalEnemy();
  }
  transitionToBattleFromMenu();
}

function generateWildEnemy() {
  const avgLevel = Math.round(
    gameState.team.reduce((s, p) => s + p.level, 0) / gameState.team.length
  );
  const level = Math.max(2, avgLevel + Math.floor(Math.random() * 5) - 2);
  let key;
  do {
    key = WILD_POOL[Math.floor(Math.random() * WILD_POOL.length)];
  } while (key === gameState.lastWildKey && WILD_POOL.length > 1);
  gameState.lastWildKey = key;
  gameState.enemyPokemon = createPokemonInstance(key, level);
  gameState.battleType = "wild";
}

function generateRivalEnemy() {
  const round = gameState.progressionRound;
  const avgLevel = Math.round(gameState.team.reduce((s, p) => s + p.level, 0) / gameState.team.length);
  const rivalLevel = Math.max(5, avgLevel + Math.min(round, 3));
  const rivalKey = gameState.rivalStarterKey;
  gameState.enemyPokemon = createPokemonInstance(rivalKey, rivalLevel);
  gameState.battleType = "rival";
}

function startWildCycle() {
  gameState.team.forEach(p => restorePokemon(p));
  gameState.wildBattlesTotal = 3 + Math.floor(Math.random() * 4);
  gameState.wildBattlesRemaining = gameState.wildBattlesTotal;
  generateWildEnemy();
}

// ==============================================
// Création d'instance Pokémon
// ==============================================
function getMovesForLevel(dataKey, data, level) {
  const learnset = getLearnset(dataKey);
  if (learnset) {
    const available = learnset
      .filter(entry => entry.level <= level)
      .map(entry => ({ ...entry.move, currentPp: entry.move.pp }));
    return available.slice(-4);
  }
  if (data.moves) return data.moves.map(m => ({ ...m, currentPp: m.pp }));
  return [];
}

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
    spriteOffset: data.spriteOffset,
    level,
    stats: { ...stats },
    maxPv: stats.pv,
    currentPv: stats.pv,
    moves: getMovesForLevel(dataKey, data, level),
    statModifiers: {},
    exp: Math.pow(level, 3)
  };
}
