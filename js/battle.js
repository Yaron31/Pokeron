/* ==============================================
   POKÉRON — Moteur de combat
   ============================================== */

// ==============================================
// Messages narratifs + système pause/resume
// ==============================================
const messageQueue = [];
let messageResolve = null;
let typewriterDone = false;
let typewriterInterval = null;

// --- État pause combat ---
let battlePaused = false;

// Typewriter : état sauvegardé pour pause/resume
let _twText = "";
let _twIndex = 0;
let _twResolve = null;

// Delay pausable
let _delayTimer = null;
let _delayResolve = null;
let _delayRemaining = 0;
let _delayStart = 0;

function pauseBattle() {
  battlePaused = true;
  // Pause typewriter
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }
  // Pause delay
  if (_delayTimer) {
    clearTimeout(_delayTimer);
    _delayRemaining -= (Date.now() - _delayStart);
    _delayTimer = null;
  }
}

function resumeBattle() {
  battlePaused = false;
  // Resume typewriter
  if (!typewriterDone && _twResolve) {
    const textEl = document.getElementById("battle-text");
    typewriterInterval = setInterval(() => {
      if (_twIndex < _twText.length) {
        textEl.textContent += _twText[_twIndex];
        _twIndex++;
      } else {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        typewriterDone = true;
        _twResolve();
        _twResolve = null;
      }
    }, TEXT_SPEED_MS[settings.textSpeed] || 30);
  }
  // Resume delay
  if (_delayResolve && _delayRemaining > 0) {
    const resolve = _delayResolve;
    _delayStart = Date.now();
    _delayTimer = setTimeout(() => {
      _delayTimer = null;
      _delayResolve = null;
      resolve();
    }, _delayRemaining);
  }
}

let _pendingStatGains = null;
let _pendingEvolution = null;

function queueMessage(text) {
  messageQueue.push(text);
}

async function processMessages() {
  const movesDiv = document.getElementById("battle-moves");
  movesDiv.classList.add("hidden");

  for (const msg of messageQueue) {
    await showMessage(msg);
    await waitForClick();
    if (_pendingStatGains) {
      await showStatGainsPanel(_pendingStatGains.gains, _pendingStatGains.stats);
      _pendingStatGains = null;
    }
    if (_pendingNewMoves.length > 0) {
      const movesToLearn = [..._pendingNewMoves];
      _pendingNewMoves = [];
      for (const move of movesToLearn) {
        await handleLearnMove(gameState.playerPokemon, move);
      }
    }
  }
  messageQueue.length = 0;

  // Évolution après tous les messages
  if (_pendingEvolution) {
    const evoKey = _pendingEvolution;
    _pendingEvolution = null;
    await evolve(gameState.playerPokemon, evoKey);
  }

  // Ne plus afficher les moves ici — c'est battleLoop/showBattleMainMenu qui gère
}

function showMessage(text) {
  return new Promise(resolve => {
    if (typewriterInterval) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
    }
    const textEl = document.getElementById("battle-text");
    textEl.textContent = "";
    typewriterDone = false;
    _twText = text;
    _twIndex = 0;
    _twResolve = resolve;

    typewriterInterval = setInterval(() => {
      if (_twIndex < text.length) {
        textEl.textContent += text[_twIndex];
        _twIndex++;
      } else {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        typewriterDone = true;
        _twResolve = null;
        resolve();
      }
    }, TEXT_SPEED_MS[settings.textSpeed] || 30);

    messageResolve = () => {
      if (!typewriterDone) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        textEl.textContent = text;
        typewriterDone = true;
        _twResolve = null;
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
  if (battlePaused) return;
  if (messageResolve) {
    const fn = messageResolve;
    messageResolve = null;
    fn();
  }
});

// ==============================================
// Calculs
// ==============================================
const STAT_STAGE_MULTIPLIERS = [2/8, 2/7, 2/6, 2/5, 2/4, 2/3, 1, 3/2, 4/2, 5/2, 6/2, 7/2, 8/2];

function getEffectiveStat(pokemon, stat) {
  const base = pokemon.stats[stat];
  const stage = pokemon.statModifiers?.[stat] || 0;
  return Math.floor(base * STAT_STAGE_MULTIPLIERS[stage + 6]);
}

function calculateDamage(attacker, defender, move) {
  const level = attacker.level;
  const atk = getEffectiveStat(attacker, move.category === "physique" ? "atk" : "atkSpe");
  const def = getEffectiveStat(defender, move.category === "physique" ? "def" : "defSpe");
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
// UI Combat
// ==============================================
function applySpriteOffset(container, offset) {
  if (!offset) return;
  const img = container.querySelector(".sprite-img");
  if (!img) return;
  const x = offset.x || "0px";
  const y = offset.y || "0px";
  const s = offset.scale || 1;
  img.style.transform = `translate(${x}, ${y}) scale(${s})`;
}

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

function updateXpBar(pokemon) {
  const nextLevelExp = Math.pow(pokemon.level + 1, 3);
  const prevLevelExp = Math.pow(pokemon.level, 3);
  const pct = Math.min(100, ((pokemon.exp - prevLevelExp) / (nextLevelExp - prevLevelExp)) * 100);
  document.getElementById("player-xp").style.width = Math.max(0, pct) + "%";
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
  applySpriteOffset(playerSprite, p.spriteOffset?.back);
  playerSprite.style.opacity = "1";
  playerSprite.style.transform = "";

  document.getElementById("enemy-name").textContent = pName(e);
  document.getElementById("enemy-level").textContent = `${t("levelAbbr")}${e.level}`;
  const enemySprite = document.getElementById("enemy-sprite");
  enemySprite.textContent = "";
  enemySprite.style.backgroundColor = "";
  enemySprite.innerHTML = `<img src="${e.spriteFront}" alt="${pName(e)}" class="sprite-img">`;
  applySpriteOffset(enemySprite, e.spriteOffset?.front);
  enemySprite.style.opacity = "1";
  enemySprite.style.transform = "";

  updateHpBar("player", p);
  updateHpBar("enemy", e);
  updateXpBar(p);
}

const CATEGORY_ICONS = { physique: "★", speciale: "◎", statut: "☽" };
const TYPE_COLORS = {
  feu: "#F08030", eau: "#6890F0", plante: "#78C850",
  normal: "#A8A878", dragon: "#7038F8", poison: "#A040A0",
  tenebres: "#705848", acier: "#B8B8D0"
};
// Mapping effect → nom de stat pour les sprites
const STAT_EFFECT_MAP = {
  atkUp: "attack", atkDown: "attack",
  defUp: "defense", defDown: "defense",
  accuracyDown: "accuracy",
  speedDown: "speed"
};

// Images de patterns par stat (chevrons Gen III)
const STAT_EFFECT_IMGS = {
  attack:      "assets/images/stat_effects/stat_effects_atk.PNG",
  defense:     "assets/images/stat_effects/stat_effects_def.PNG",
  speed:       "assets/images/stat_effects/stat_effects_speed.PNG",
  accuracy:    "assets/images/stat_effects/stat_effects_accuracy.PNG",
  spAttack:    "assets/images/stat_effects/stat_effects_spe_atk.PNG",
  spDefense:   "assets/images/stat_effects/stat_effects_spe_def.PNG",
  evasiveness: "assets/images/stat_effects/stat_effects_evasiveness.PNG",
  mix:         "assets/images/stat_effects/stat_effects_mix.PNG"
};

function renderMoveButtons() {
  const movesDiv = document.getElementById("battle-moves");
  movesDiv.innerHTML = "";
  movesDiv.classList.remove("hidden");

  gameState.playerPokemon.moves.forEach((move, i) => {
    const btn = document.createElement("button");
    btn.className = "move-btn type-" + move.type;
    const typeName = TYPE_NAMES[move.type]?.[settings.lang] || move.type.toUpperCase();
    const catIcon = CATEGORY_ICONS[move.category] || "";
    btn.innerHTML = `
      <span class="move-name">${moveName(move)}</span>
      <span class="move-type-label type-${move.type}">${typeName}</span>
      <span class="move-category-icon cat-${move.category}"><span>${catIcon}</span></span>
      <span class="move-pp">PP ${move.currentPp}/${move.pp}</span>`;
    btn.addEventListener("click", () => {
      if (battlePaused) return;
      if (!gameState.battleActive) return;
      if (move.currentPp <= 0) return;
      resolvePlayerAction({ type: "attack", moveIndex: i });
    });
    movesDiv.appendChild(btn);
  });
}

// ==============================================
// Animation d'entrée en combat (style FireRed)
// ==============================================

// Utilitaire : lance une animation WAAPI, attend la fin, puis commit le style final
// dans la couche inline et annule l'animation pour éviter que fill:forwards
// ne bloque les futurs changements de style.transform
async function animateAndCommit(el, keyframes, options) {
  const anim = el.animate(keyframes, { ...options, fill: "forwards" });
  await anim.finished;
  anim.commitStyles();
  anim.cancel();
  return anim;
}

async function setupBattleIntro() {
  // Cacher les Pokémon, plateformes et infos pendant l'intro
  document.getElementById("enemy-sprite").style.opacity = "0";
  document.getElementById("player-sprite").style.opacity = "0";
  document.querySelector(".enemy-platform").style.opacity = "0";
  document.querySelector(".player-platform").style.opacity = "0";
  document.querySelector(".enemy-info").style.opacity = "0";
  document.querySelector(".player-info").style.opacity = "0";
  document.getElementById("battle-moves").classList.add("hidden");

  // Charger directement les sprites (fonds déjà transparents)
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerPlayerImg = document.getElementById("trainer-player-img");
  trainerPlayerImg.src = "assets/images/dresseur/back_player.png";
  trainerPlayer.classList.remove("hidden");
  trainerPlayer.style.transform = "translateX(-200%)";

  const trainerRival = document.getElementById("trainer-rival");
  const trainerRivalImg = document.getElementById("trainer-rival-img");
  const rivalBaseImg = document.getElementById("rival-base-img");
  trainerRivalImg.src = "assets/images/dresseur/rival_front.png";
  rivalBaseImg.src = "assets/images/battlebase/rival_battlebase.png";
  trainerRival.classList.remove("hidden");
  trainerRival.style.transform = "translateX(200%)";
}

async function slideInTrainers() {
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerRival = document.getElementById("trainer-rival");

  // Slide-in simultané avec commit des styles à la fin
  await Promise.all([
    animateAndCommit(trainerPlayer, [
      { transform: "translateX(-200%)" },
      { transform: "translateX(0)" }
    ], { duration: 800, easing: "ease-out" }),
    animateAndCommit(trainerRival, [
      { transform: "translateX(200%)" },
      { transform: "translateX(0)" }
    ], { duration: 800, easing: "ease-out" }),
  ]);
}

async function rivalSendPokemon() {
  const field = document.querySelector(".battle-field");
  const trainerRival = document.getElementById("trainer-rival");
  const enemySprite = document.getElementById("enemy-sprite");
  const enemyPlatform = document.querySelector(".enemy-platform");

  // Position de départ de la pokéball (depuis le rival)
  const rivalRect = trainerRival.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();

  // Créer la pokéball
  const pokeball = document.createElement("img");
  pokeball.src = "assets/images/menu/pokeball_close.PNG";
  pokeball.className = "pokeball-throw";
  pokeball.style.left = (rivalRect.left - fieldRect.left + rivalRect.width / 2) + "px";
  pokeball.style.top = (rivalRect.top - fieldRect.top + rivalRect.height / 2) + "px";
  field.appendChild(pokeball);

  // Position cible (centre zone ennemi)
  const targetX = fieldRect.width * 0.75;
  const targetY = fieldRect.height * 0.45;
  const startX = parseFloat(pokeball.style.left);
  const startY = parseFloat(pokeball.style.top);
  const dx = targetX - startX;
  const dy = targetY - startY;

  // Arc parabolique de la pokéball
  const pokeAnim = pokeball.animate([
    { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
    { transform: `translate(${dx * 0.5}px, ${dy - 80}px) rotate(360deg)`, offset: 0.4 },
    { transform: `translate(${dx}px, ${dy}px) rotate(720deg)`, offset: 0.85 },
    { transform: `translate(${dx}px, ${dy + 8}px) rotate(720deg)`, offset: 0.92 },
    { transform: `translate(${dx}px, ${dy}px) rotate(720deg)`, offset: 1 },
  ], { duration: 600, easing: "ease-in-out", fill: "forwards" });

  // Slide-out du rival en parallèle (fire-and-forget, commit styles à la fin)
  const rivalSlideOut = trainerRival.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(200%)" }
  ], { duration: 500, easing: "ease-in", fill: "forwards" });
  rivalSlideOut.finished.then(() => { rivalSlideOut.commitStyles(); rivalSlideOut.cancel(); });

  await pokeAnim.finished;

  // Flash blanc
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: absolute; left: ${targetX - 40}px; top: ${targetY - 40}px;
    width: 80px; height: 80px; background: white; border-radius: 50%;
    z-index: 14; animation: flashBurst 350ms ease-out forwards;
  `;
  field.appendChild(flash);

  // Supprimer la pokéball
  pokeball.remove();

  // Faire apparaître la plateforme et le Pokémon ennemi
  enemyPlatform.style.opacity = "1";
  enemyPlatform.style.transition = "opacity 200ms";

  await delay(150);

  enemySprite.style.opacity = "1";
  enemySprite.style.animation = "pokemonAppear 400ms ease-out forwards";

  // Info ennemi apparaît
  document.querySelector(".enemy-info").style.opacity = "1";
  document.querySelector(".enemy-info").style.transition = "opacity 300ms";

  await delay(500);
  flash.remove();
  enemySprite.style.animation = "";
}

async function playerSendPokemon() {
  const field = document.querySelector(".battle-field");
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerPlayerImg = document.getElementById("trainer-player-img");
  const playerSprite = document.getElementById("player-sprite");
  const playerPlatform = document.querySelector(".player-platform");

  // Jouer le GIF de lancer (fond déjà transparent)
  trainerPlayerImg.src = "assets/images/dresseur/gif_player_throw_ball.gif";
  await delay(600);
  // Figer sur la frame actuelle pour éviter la boucle du GIF
  try {
    const c = document.createElement("canvas");
    c.width = trainerPlayerImg.naturalWidth;
    c.height = trainerPlayerImg.naturalHeight;
    c.getContext("2d").drawImage(trainerPlayerImg, 0, 0);
    trainerPlayerImg.src = c.toDataURL("image/png");
  } catch (e) { /* Le GIF boucle mais sera caché par le slide-out */ }

  // Position de la pokéball (depuis le joueur)
  const playerRect = trainerPlayer.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();

  const pokeball = document.createElement("img");
  pokeball.src = "assets/images/menu/pokeball_close.PNG";
  pokeball.className = "pokeball-throw";
  pokeball.style.left = (playerRect.left - fieldRect.left + playerRect.width * 0.7) + "px";
  pokeball.style.top = (playerRect.top - fieldRect.top + playerRect.height * 0.2) + "px";
  field.appendChild(pokeball);

  // Position cible (centre zone joueur)
  const targetX = fieldRect.width * 0.22;
  const targetY = fieldRect.height * 0.65;
  const startX = parseFloat(pokeball.style.left);
  const startY = parseFloat(pokeball.style.top);
  const dx = targetX - startX;
  const dy = targetY - startY;

  // Arc parabolique
  const pokeAnim = pokeball.animate([
    { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
    { transform: `translate(${dx * 0.5}px, ${dy - 100}px) rotate(-360deg)`, offset: 0.4 },
    { transform: `translate(${dx}px, ${dy}px) rotate(-720deg)`, offset: 0.85 },
    { transform: `translate(${dx}px, ${dy + 8}px) rotate(-720deg)`, offset: 0.92 },
    { transform: `translate(${dx}px, ${dy}px) rotate(-720deg)`, offset: 1 },
  ], { duration: 600, easing: "ease-in-out", fill: "forwards" });

  // Slide-out du joueur (fire-and-forget, commit styles à la fin)
  const playerSlideOut = trainerPlayer.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-200%)" }
  ], { duration: 500, easing: "ease-in", fill: "forwards" });
  playerSlideOut.finished.then(() => { playerSlideOut.commitStyles(); playerSlideOut.cancel(); });

  await pokeAnim.finished;

  // Flash blanc
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: absolute; left: ${targetX - 40}px; top: ${targetY - 40}px;
    width: 80px; height: 80px; background: white; border-radius: 50%;
    z-index: 14; animation: flashBurst 350ms ease-out forwards;
  `;
  field.appendChild(flash);
  pokeball.remove();

  // Plateforme et Pokémon joueur
  playerPlatform.style.opacity = "1";
  playerPlatform.style.transition = "opacity 200ms";

  await delay(150);

  playerSprite.style.opacity = "1";
  playerSprite.style.animation = "pokemonAppear 400ms ease-out forwards";

  // Info joueur apparaît
  document.querySelector(".player-info").style.opacity = "1";
  document.querySelector(".player-info").style.transition = "opacity 300ms";

  await delay(500);
  flash.remove();
  playerSprite.style.animation = "";
}

function cleanupBattleIntro() {
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerRival = document.getElementById("trainer-rival");
  if (trainerPlayer) trainerPlayer.classList.add("hidden");
  if (trainerRival) trainerRival.classList.add("hidden");
}

// ==============================================
// Déroulement des tours
// ==============================================
async function startBattle() {
  gameState.battleActive = true;
  gameState.combatNumber++;
  const currentBattleTheme = gameState.battleType === "wild" ? wildBattleTheme : battleTheme;
  currentBattleTheme.currentTime = 0;
  currentBattleTheme.play().catch(() => {});

  setupBattleUI();

  if (gameState.battleType === "rival") {
    // Intro rival complète (slide-in trainers, pokéball arc)
    await setupBattleIntro();
    await slideInTrainers();
    queueMessage(t("trainerWantsBattle"));
    await processMessages();
    await rivalSendPokemon();
    queueMessage(t("trainerSends", { name: pName(gameState.enemyPokemon) }));
    await processMessages();
    await playerSendPokemon();
    queueMessage(t("goPlayer", { name: pName(gameState.playerPokemon) }));
    await processMessages();
    cleanupBattleIntro();
  } else {
    // Intro sauvage : Pokémon apparaît directement, pas de rival
    await setupWildIntro();
    queueMessage(t("wildAppears", { name: pName(gameState.enemyPokemon) }));
    await processMessages();
    await playerSendPokemon();
    queueMessage(t("goPlayer", { name: pName(gameState.playerPokemon) }));
    await processMessages();
    cleanupBattleIntro();
  }

  gameState.battleActive = true;
  await battleLoop();
}

async function setupWildIntro() {
  // Cacher les éléments pendant l'intro
  document.getElementById("enemy-sprite").style.opacity = "0";
  document.getElementById("player-sprite").style.opacity = "0";
  document.querySelector(".enemy-platform").style.opacity = "0";
  document.querySelector(".player-platform").style.opacity = "0";
  document.querySelector(".enemy-info").style.opacity = "0";
  document.querySelector(".player-info").style.opacity = "0";
  document.getElementById("battle-moves").classList.add("hidden");

  // Pas de rival en combat sauvage
  document.getElementById("trainer-rival").classList.add("hidden");

  // Positionner le dresseur joueur (nécessaire pour l'animation de lancer)
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerPlayerImg = document.getElementById("trainer-player-img");
  trainerPlayerImg.src = "assets/images/dresseur/back_player.png";
  trainerPlayer.classList.remove("hidden");
  trainerPlayer.style.transform = "translateX(0)";

  // Faire apparaître le Pokémon ennemi directement avec un fade-in
  const enemySprite = document.getElementById("enemy-sprite");
  const enemyPlatform = document.querySelector(".enemy-platform");
  const enemyInfo = document.querySelector(".enemy-info");

  await delay(300);

  enemyPlatform.style.transition = "opacity 0.4s";
  enemyPlatform.style.opacity = "1";
  enemySprite.style.transition = "opacity 0.4s, transform 0.4s";
  enemySprite.style.transform = "scale(0.3)";
  enemySprite.style.opacity = "1";

  await delay(50);
  enemySprite.style.transform = "scale(1)";
  await delay(400);

  enemySprite.style.transition = "";
  enemySprite.style.transform = "";
  enemyPlatform.style.transition = "";

  enemyInfo.style.transition = "opacity 0.3s";
  enemyInfo.style.opacity = "1";
  await delay(300);
  enemyInfo.style.transition = "";
}

// Boucle de combat : attend une action → exécute le tour → recommence
async function battleLoop() {
  while (gameState.battleActive) {
    try {
      const action = await waitForPlayerAction();
      const continueLoop = await executeTurn(action);
      if (!continueLoop) break;
    } catch (err) {
      console.error("battleLoop error:", err);
      if (currentScreen === "battle") gameState.battleActive = true;
    }
  }
}

async function executeTurn(action) {
  gameState.battleActive = false;
  hideBattleMenus();

  const p = gameState.playerPokemon;
  const e = gameState.enemyPokemon;

  if (action.type === "flee") {
    if (gameState.battleType === "wild") {
      await showMessage(t("fleeSuccess"));
      await waitForClick();
      if (gameState.wildBattlesRemaining > 0) gameState.wildBattlesRemaining--;
      await endBattle(null);
      return false;
    }
    await showMessage(t("cantFlee"));
    await waitForClick();
    gameState.battleActive = true;
    return true;
  }

  if (action.type === "item") {
    const consumed = await useItem(action.itemKey, action.targetIndex);
    if (!consumed) { gameState.battleActive = true; return true; }
    // Ennemi attaque après
    if (e.currentPv > 0 && p.currentPv > 0) {
      const aiMove = aiChooseMove(e, p);
      await executeAttack({ mon: e, move: aiMove, target: p, isPlayer: false });
      if (p.currentPv <= 0) {
        if (gameState.team.some(m => m !== p && m.currentPv > 0)) {
          await forceSwitch();
          gameState.battleActive = true;
          return true;
        } else { await endBattle(false); return false; }
      }
    }
    gameState.battleActive = true;
    return true;
  }

  if (action.type === "switch") {
    await switchPokemon(action.targetIndex);
    // Ennemi attaque après
    if (e.currentPv > 0 && gameState.playerPokemon.currentPv > 0) {
      const aiMove = aiChooseMove(e, gameState.playerPokemon);
      await executeAttack({ mon: e, move: aiMove, target: gameState.playerPokemon, isPlayer: false });
      if (gameState.playerPokemon.currentPv <= 0) {
        if (gameState.team.some(m => m !== gameState.playerPokemon && m.currentPv > 0)) {
          await forceSwitch();
          gameState.battleActive = true;
          return true;
        } else { await endBattle(false); return false; }
      }
    }
    gameState.battleActive = true;
    return true;
  }

  // action.type === "attack"
  const playerMove = p.moves[action.moveIndex];
  const aiMove = aiChooseMove(e, p);
  const playerFirst = getEffectiveStat(p, "vitesse") >= getEffectiveStat(e, "vitesse");

  const first = playerFirst
    ? { mon: p, move: playerMove, target: e, isPlayer: true }
    : { mon: e, move: aiMove, target: p, isPlayer: false };
  const second = playerFirst
    ? { mon: e, move: aiMove, target: p, isPlayer: false }
    : { mon: p, move: playerMove, target: e, isPlayer: true };

  await executeAttack(first);
  if (first.target.currentPv <= 0) {
    if (first.target === e) {
      await endBattle(true);
      return false;
    }
    // Joueur KO
    if (gameState.team.some(m => m !== gameState.playerPokemon && m.currentPv > 0)) {
      await forceSwitch();
      gameState.battleActive = true;
      return true;
    } else { await endBattle(false); return false; }
  }

  await executeAttack(second);
  if (second.target.currentPv <= 0) {
    if (second.target === e) {
      await endBattle(true);
      return false;
    }
    // Joueur KO
    if (gameState.team.some(m => m !== gameState.playerPokemon && m.currentPv > 0)) {
      await forceSwitch();
      gameState.battleActive = true;
      return true;
    } else { await endBattle(false); return false; }
  }

  gameState.battleActive = true;
  return true;
}

// Utiliser un objet du sac
async function useItem(itemKey, targetIndex) {
  const item = ITEMS[itemKey];

  if (item.type === "ball") {
    if (gameState.battleType !== "wild") {
      await showMessage(t("cantUseBall"));
      await waitForClick();
      return false;
    }
    const caught = await attemptCapture();
    if (caught) {
      await endBattle("captured");
      return true;
    }
    return true;
  }

  const target = gameState.team[targetIndex];

  if (item.type === "xp_boost") {
    await showMessage(t("usedItem", { name: pName(target), item: itemName(itemKey) }));
    await waitForClick();
    target.exp += item.xpAmount;
    await showMessage(t("expGain", { name: pName(target), exp: item.xpAmount }));
    await waitForClick();
    // Vérifier level up
    while (target.exp >= Math.pow(target.level + 1, 3)) {
      target.level++;
      const data = POKEMON_DATA[target.key];
      const stats = data.baseStats;
      target.maxPv = stats.pv + target.level * 2;
      target.atk = stats.atk + Math.floor(target.level * 0.5);
      target.def = stats.def + Math.floor(target.level * 0.5);
      target.currentPv = Math.min(target.currentPv + 5, target.maxPv);
      await showMessage(t("levelUp", { name: pName(target), level: target.level }));
      await waitForClick();
    }
    if (target === gameState.playerPokemon) {
      updateHpBar("player", target);
      updateXpBar(target);
    }
    return true;
  }

  if (item.healAmount) {
    const before = target.currentPv;
    target.currentPv = Math.min(target.maxPv, target.currentPv + item.healAmount);
    const healed = target.currentPv - before;

    await showMessage(t("usedItem", { name: pName(gameState.playerPokemon), item: itemName(itemKey) }));
    await waitForClick();

    if (healed > 0) {
      await showMessage(t("healedHp", { name: pName(target), amount: healed }));
      updateHpBar("player", gameState.playerPokemon);
      await waitForClick();
    }
  }

  return true;
}

// ==============================================
// Capture de Pokémon sauvage
// ==============================================
async function attemptCapture() {
  const e = gameState.enemyPokemon;
  const data = POKEMON_DATA[e.key];
  const catchRate = data.catchRate || 127;

  // Formule Gen3 : plus les PV sont bas, plus c'est facile
  const hpFactor = (3 * e.maxPv - 2 * e.currentPv) / (3 * e.maxPv);
  const modifiedRate = Math.min(255, catchRate * hpFactor);

  // Capture garantie si le taux modifié atteint 255
  if (modifiedRate >= 255) {
    await animateCapture(3, true);
    await showMessage(t("pokemonCaught", { name: pName(e) }));
    await waitForClick();
    return true;
  }

  // Probabilité par shake (formule Gen3 avec racine carrée)
  const shakeProbability = Math.sqrt(Math.sqrt(modifiedRate / 255));

  // Calculer combien de shakes réussis (0-3)
  let shakes = 0;
  for (let i = 0; i < 3; i++) {
    if (Math.random() < shakeProbability) shakes++;
    else break;
  }
  const caught = shakes === 3;

  // Animation de la pokéball
  await animateCapture(shakes, caught);

  if (caught) {
    await showMessage(t("pokemonCaught", { name: pName(e) }));
    await waitForClick();
    return true;
  } else {
    await showMessage(t("pokemonBrokeFree"));
    await waitForClick();
    return false;
  }
}

async function animateCapture(shakes, caught) {
  const field = document.querySelector(".battle-field");
  const fieldRect = field.getBoundingClientRect();
  const enemySprite = document.getElementById("enemy-sprite");
  const enemyPlatform = document.querySelector(".enemy-platform");
  const platformRect = enemyPlatform.getBoundingClientRect();

  // Slide-in du dresseur joueur puis GIF de lancer
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerPlayerImg = document.getElementById("trainer-player-img");
  trainerPlayer.classList.remove("hidden");
  trainerPlayer.style.transform = "translateX(-200%)";
  trainerPlayerImg.src = "assets/images/dresseur/back_player.png";

  await animateAndCommit(trainerPlayer, [
    { transform: "translateX(-200%)" },
    { transform: "translateX(0)" }
  ], { duration: 400, easing: "ease-out" });

  trainerPlayerImg.src = "assets/images/dresseur/gif_player_throw_ball.gif";
  await delay(600);
  // Figer le GIF
  try {
    const c = document.createElement("canvas");
    c.width = trainerPlayerImg.naturalWidth;
    c.height = trainerPlayerImg.naturalHeight;
    c.getContext("2d").drawImage(trainerPlayerImg, 0, 0);
    trainerPlayerImg.src = c.toDataURL("image/png");
  } catch (e) {}

  // Position de départ depuis le sprite du dresseur
  const playerRect = trainerPlayer.getBoundingClientRect();
  const startX = playerRect.left - fieldRect.left + playerRect.width * 0.7;
  const startY = playerRect.top - fieldRect.top + playerRect.height * 0.2;

  // Cible : centre de la battlebase ennemie
  const targetX = platformRect.left - fieldRect.left + platformRect.width / 2;
  const targetY = platformRect.top - fieldRect.top + platformRect.height * 0.4;

  // Créer la pokéball
  const pokeball = document.createElement("img");
  pokeball.src = "assets/images/menu/pokeball_close.PNG";
  pokeball.className = "pokeball-throw";
  pokeball.style.left = startX + "px";
  pokeball.style.top = startY + "px";
  field.appendChild(pokeball);

  // Arc parabolique vers la battlebase (plus lent : 900ms)
  const dx = targetX - startX;
  const dy = targetY - startY;
  const arcAnim = pokeball.animate([
    { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
    { transform: `translate(${dx * 0.5}px, ${dy - 120}px) rotate(360deg)`, offset: 0.4 },
    { transform: `translate(${dx}px, ${dy}px) rotate(720deg)`, offset: 0.85 },
    { transform: `translate(${dx}px, ${dy + 8}px) rotate(720deg)`, offset: 0.92 },
    { transform: `translate(${dx}px, ${dy}px) rotate(720deg)`, offset: 1 }
  ], { duration: 900, easing: "ease-in-out", fill: "forwards" });

  // Cacher le dresseur pendant l'arc
  const slideOut = trainerPlayer.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-200%)" }
  ], { duration: 500, easing: "ease-in", fill: "forwards" });
  slideOut.finished.then(() => {
    slideOut.commitStyles();
    slideOut.cancel();
    trainerPlayer.classList.add("hidden");
  });

  await arcAnim.finished;

  // Flash blanc + ennemi disparaît dans la ball
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: absolute; left: ${targetX - 40}px; top: ${targetY - 40}px;
    width: 80px; height: 80px; background: white; border-radius: 50%;
    z-index: 14; animation: flashBurst 350ms ease-out forwards;
  `;
  field.appendChild(flash);

  enemySprite.style.transition = "opacity 0.2s, transform 0.2s";
  enemySprite.style.opacity = "0";
  enemySprite.style.transform = "scale(0.1)";
  await delay(350);
  flash.remove();
  enemySprite.style.transition = "";

  // Fixer la pokéball à sa position finale d'arc
  pokeball.getAnimations().forEach(a => {
    a.commitStyles();
    a.cancel();
  });
  // Repositionner proprement sur la battlebase
  pokeball.style.left = (targetX - 20) + "px";
  pokeball.style.top = targetY + "px";
  pokeball.style.transform = "";

  // Secousses (0 à 3)
  for (let i = 0; i < shakes; i++) {
    await delay(800);
    const shakeAnim = pokeball.animate([
      { transform: "rotate(0deg)" },
      { transform: "rotate(-20deg)" },
      { transform: "rotate(20deg)" },
      { transform: "rotate(-10deg)" },
      { transform: "rotate(0deg)" }
    ], { duration: 400, easing: "ease-in-out" });
    await shakeAnim.finished;
  }

  if (caught) {
    await delay(600);

    // Son "cling" synthétisé
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => ctx.close(), 600);
    } catch (e) { /* audio unavailable */ }

    // Flash blanc léger
    const clingFlash = document.createElement("div");
    const pbRect = pokeball.getBoundingClientRect();
    const flRect = field.getBoundingClientRect();
    const cx = pbRect.left - flRect.left + pbRect.width / 2;
    const cy = pbRect.top - flRect.top + pbRect.height / 2;
    clingFlash.style.cssText = `
      position: absolute; left: ${cx - 30}px; top: ${cy - 30}px;
      width: 60px; height: 60px; background: rgba(255,255,255,0.9);
      border-radius: 50%; z-index: 16; pointer-events: none;
    `;
    field.appendChild(clingFlash);
    clingFlash.animate([
      { transform: "scale(0.3)", opacity: 1 },
      { transform: "scale(1.5)", opacity: 0 }
    ], { duration: 400, easing: "ease-out", fill: "forwards" });

    // Étoiles qui éclatent depuis la pokéball
    const starAngles = [0, 72, 144, 216, 288];
    const stars = starAngles.map(angle => {
      const star = document.createElement("div");
      const rad = angle * Math.PI / 180;
      star.textContent = "★";
      star.style.cssText = `
        position: absolute; left: ${cx}px; top: ${cy}px;
        font-size: 14px; color: #FFD700; z-index: 17;
        pointer-events: none; text-shadow: 0 0 4px #FFF;
      `;
      field.appendChild(star);
      star.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(rad) * 40}px, ${Math.sin(rad) * 40}px) scale(0.3)`, opacity: 0 }
      ], { duration: 500, easing: "ease-out", fill: "forwards" });
      return star;
    });

    await delay(500);
    clingFlash.remove();
    stars.forEach(s => s.remove());
    pokeball.remove();
  } else {
    await delay(300);
    pokeball.remove();
    enemySprite.style.transition = "opacity 0.3s, transform 0.3s";
    enemySprite.style.opacity = "1";
    enemySprite.style.transform = "scale(1)";
    await delay(300);
    enemySprite.style.transition = "";
    enemySprite.style.transform = "";
  }
}

// Animation de rappel — laser rouge/blanc, sprite devient blanc puis rétrécit
async function animateRecall() {
  const playerSprite = document.getElementById("player-sprite");
  const spriteImg = playerSprite.querySelector(".sprite-img");

  // Son de rappel (bip descendant)
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { /* audio unavailable */ }

  // Sprite devient blanc/rouge puis rétrécit
  if (spriteImg) {
    spriteImg.animate([
      { filter: "brightness(1) saturate(1)", transform: spriteImg.style.transform || "scale(1)" },
      { filter: "brightness(3) saturate(0.3) sepia(1) hue-rotate(-30deg)", transform: spriteImg.style.transform || "scale(1)", offset: 0.3 },
      { filter: "brightness(5) saturate(0)", transform: "scale(0.1) translateY(20px)", opacity: 0 }
    ], { duration: 500, easing: "ease-in", fill: "forwards" });
  }

  playerSprite.animate([
    { opacity: 1 },
    { opacity: 1, offset: 0.3 },
    { opacity: 0 }
  ], { duration: 500, easing: "ease-in", fill: "forwards" });

  await delay(500);
  playerSprite.style.opacity = "0";
}

// Lancer une pokéball pour envoyer un Pokémon (réutilisable)
async function throwAndSendPokemon() {
  const field = document.querySelector(".battle-field");
  const fieldRect = field.getBoundingClientRect();
  const trainerPlayer = document.getElementById("trainer-player");
  const trainerPlayerImg = document.getElementById("trainer-player-img");
  const playerSprite = document.getElementById("player-sprite");

  // Afficher le dresseur
  trainerPlayer.classList.remove("hidden");
  trainerPlayer.style.transform = "translateX(0)";
  trainerPlayerImg.src = "assets/images/dresseur/back_player.png";

  // GIF de lancer
  trainerPlayerImg.src = "assets/images/dresseur/gif_player_throw_ball.gif";
  await delay(600);
  // Figer le GIF
  try {
    const c = document.createElement("canvas");
    c.width = trainerPlayerImg.naturalWidth;
    c.height = trainerPlayerImg.naturalHeight;
    c.getContext("2d").drawImage(trainerPlayerImg, 0, 0);
    trainerPlayerImg.src = c.toDataURL("image/png");
  } catch (e) {}

  // Pokéball
  const playerRect = trainerPlayer.getBoundingClientRect();
  const pokeball = document.createElement("img");
  pokeball.src = "assets/images/menu/pokeball_close.PNG";
  pokeball.className = "pokeball-throw";
  pokeball.style.left = (playerRect.left - fieldRect.left + playerRect.width * 0.7) + "px";
  pokeball.style.top = (playerRect.top - fieldRect.top + playerRect.height * 0.2) + "px";
  field.appendChild(pokeball);

  const targetX = fieldRect.width * 0.22;
  const targetY = fieldRect.height * 0.65;
  const startX = parseFloat(pokeball.style.left);
  const startY = parseFloat(pokeball.style.top);
  const dx = targetX - startX;
  const dy = targetY - startY;

  const pokeAnim = pokeball.animate([
    { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
    { transform: `translate(${dx * 0.5}px, ${dy - 100}px) rotate(-360deg)`, offset: 0.4 },
    { transform: `translate(${dx}px, ${dy}px) rotate(-720deg)`, offset: 0.85 },
    { transform: `translate(${dx}px, ${dy + 8}px) rotate(-720deg)`, offset: 0.92 },
    { transform: `translate(${dx}px, ${dy}px) rotate(-720deg)`, offset: 1 },
  ], { duration: 600, easing: "ease-in-out", fill: "forwards" });

  // Slide-out du dresseur
  const slideOut = trainerPlayer.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-200%)" }
  ], { duration: 500, easing: "ease-in", fill: "forwards" });
  slideOut.finished.then(() => {
    slideOut.commitStyles();
    slideOut.cancel();
    trainerPlayer.classList.add("hidden");
  });

  await pokeAnim.finished;

  // Flash blanc
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: absolute; left: ${targetX - 40}px; top: ${targetY - 40}px;
    width: 80px; height: 80px; background: white; border-radius: 50%;
    z-index: 14; animation: flashBurst 350ms ease-out forwards;
  `;
  field.appendChild(flash);
  pokeball.remove();

  // Pokémon apparaît
  playerSprite.style.opacity = "1";
  playerSprite.style.animation = "pokemonAppear 400ms ease-out forwards";

  await delay(500);
  flash.remove();
  playerSprite.style.animation = "";
  playerSprite.style.transform = "";
}

// Changer de Pokémon
async function switchPokemon(targetIndex) {
  const old = gameState.playerPokemon;
  const next = gameState.team[targetIndex];

  await showMessage(t("comeBack", { name: pName(old) }));
  await waitForClick();

  // Animation de rappel (laser rouge/blanc)
  await animateRecall();

  // Changer le pokémon actif
  gameState.playerPokemon = next;
  next.statModifiers = {};
  setupBattleUI();

  // Lancer le nouveau Pokémon avec GIF + pokéball
  await throwAndSendPokemon();

  await showMessage(t("goPlayer", { name: pName(next) }));
  await waitForClick();
}

// Switch forcé quand le Pokémon actif est KO mais l'équipe a des survivants
async function forceSwitch() {
  const index = await promptForceSwitch();
  await switchToFainted(index);
}

// Panel d'équipe en mode forcé — pas de cancel, seuls les vivants sont cliquables
function promptForceSwitch() {
  return new Promise(resolve => {
    // Garde défensive : si aucun survivant, ne pas ouvrir le panel
    const hasSurvivor = gameState.team.some(m => m !== gameState.playerPokemon && m.currentPv > 0);
    if (!hasSurvivor) { resolve(-1); return; }

    const panel = document.getElementById("battle-team-panel");
    const prompt = panel.querySelector(".team-prompt");
    const cancelBtn = panel.querySelector(".team-cancel-btn");

    prompt.textContent = t("sendWhichPokemon");
    cancelBtn.style.display = "none";

    for (let i = 0; i < 6; i++) {
      const slot = document.getElementById("team-slot-" + i);
      const mon = gameState.team[i];
      if (!mon) {
        slot.innerHTML = "";
        slot.classList.add("empty");
        continue;
      }
      slot.classList.remove("empty", "fainted", "selected");
      const isFainted = mon.currentPv <= 0;
      if (isFainted) slot.classList.add("fainted");
      slot.innerHTML = renderSlotContent(mon, mon === gameState.playerPokemon);

      if (!isFainted && mon !== gameState.playerPokemon) {
        slot.onclick = () => {
          panel.classList.add("hidden");
          cleanupForceListeners();
          resolve(i);
        };
      } else {
        slot.onclick = null;
      }
    }

    function cleanupForceListeners() {
      for (let i = 0; i < 6; i++) {
        document.getElementById("team-slot-" + i).onclick = null;
      }
      cancelBtn.style.display = "";
      prompt.textContent = t("chooseAPokemon");
    }

    panel.classList.remove("hidden");
  });
}

// Switch sans "Reviens !" (le Pokémon est KO)
async function switchToFainted(targetIndex) {
  const next = gameState.team[targetIndex];
  if (!next) return;

  // Le sprite KO est déjà tombé, on le cache
  const playerSprite = document.getElementById("player-sprite");
  playerSprite.style.opacity = "0";

  // Changer le pokémon actif
  gameState.playerPokemon = next;
  next.statModifiers = {};
  setupBattleUI();

  // Lancer le nouveau Pokémon avec GIF + pokéball
  await throwAndSendPokemon();

  await showMessage(t("goPlayer", { name: pName(next) }));
  await waitForClick();
}

const ATTACK_SLIDE_MS = 350;
const HIT_ANIM_MS = 400;

function delay(ms) {
  return new Promise(resolve => {
    _delayResolve = resolve;
    _delayRemaining = ms;
    _delayStart = Date.now();
    _delayTimer = setTimeout(() => {
      _delayTimer = null;
      _delayResolve = null;
      resolve();
    }, ms);
  });
}

// Animation projectile pour attaques spéciales
async function animateProjectile(attackerEl, defenderEl, color) {
  const field = document.querySelector(".battle-field");
  const fieldRect = field.getBoundingClientRect();
  const startRect = attackerEl.getBoundingClientRect();
  const endRect = defenderEl.getBoundingClientRect();

  const proj = document.createElement("div");
  proj.className = "projectile";
  proj.style.setProperty("--projectile-color", color);
  field.appendChild(proj);

  const startX = startRect.left + startRect.width / 2 - fieldRect.left;
  const startY = startRect.top + startRect.height / 2 - fieldRect.top;
  const endX = endRect.left + endRect.width / 2 - fieldRect.left;
  const endY = endRect.top + endRect.height / 2 - fieldRect.top;

  const anim = proj.animate([
    { left: startX + "px", top: startY + "px", opacity: 1 },
    { left: endX + "px", top: endY + "px", opacity: 1 }
  ], { duration: 400, easing: "ease-in" });

  await anim.finished;
  proj.remove();
}

// Animation stat Gen III — canvas compositing (compatible file://, pas de CORS)
async function animateStatEffect(targetEl, isBuff, effect) {
  try {
    const statName = STAT_EFFECT_MAP[effect] || "attack";
    const imgUrl = STAT_EFFECT_IMGS[statName];
    if (!imgUrl) return;

    const spriteImg = targetEl.querySelector(".sprite-img");
    if (!spriteImg) return;

    // Pré-charger l'image de pattern
    const patternImg = new Image();
    patternImg.src = imgUrl;
    await new Promise((resolve, reject) => {
      if (patternImg.complete) return resolve();
      patternImg.onload = resolve;
      patternImg.onerror = reject;
    });

    // Créer le canvas overlay
    const canvas = document.createElement("canvas");
    const rect = targetEl.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      z-index: 15; pointer-events: none; image-rendering: pixelated;
    `;
    targetEl.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // Position exacte du sprite via getBoundingClientRect (pas de parsing manual)
    const spriteRect = spriteImg.getBoundingClientRect();
    const containerRect = targetEl.getBoundingClientRect();
    const drawX = spriteRect.left - containerRect.left;
    const drawY = spriteRect.top - containerRect.top;
    const drawW = spriteRect.width;
    const drawH = spriteRect.height;
    const containerW = canvas.width;
    const containerH = canvas.height;

    // Paramètres d'animation
    const duration = 2000;
    const scrollDist = isBuff ? -200 : 200;
    const patternTileH = patternImg.height * (drawW / patternImg.width);
    const startTime = performance.now();

    await new Promise(resolve => {
      function frame(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Opacité : fade in (0-10%), stay (10-85%), fade out (85-100%)
        let opacity;
        if (t < 0.1) opacity = (t / 0.1) * 0.7;
        else if (t < 0.85) opacity = 0.7;
        else opacity = 0.7 * (1 - (t - 0.85) / 0.15);

        const scrollY = scrollDist * t;

        ctx.clearRect(0, 0, containerW, containerH);
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = "source-over";

        // Dessiner le pattern en tuiles verticales avec scroll
        const tileCount = Math.ceil(drawH / patternTileH) + 2;
        const baseY = scrollY % patternTileH;
        ctx.save();
        ctx.beginPath();
        ctx.rect(drawX, drawY, drawW, drawH);
        ctx.clip();
        for (let i = -1; i < tileCount; i++) {
          ctx.drawImage(patternImg, drawX, drawY + baseY + i * patternTileH, drawW, patternTileH);
        }
        ctx.restore();

        // Découper à la silhouette du sprite (destination-in)
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(spriteImg, drawX, drawY, drawW, drawH);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;

        if (t < 1) requestAnimationFrame(frame);
        else { canvas.remove(); resolve(); }
      }
      requestAnimationFrame(frame);
    });
  } catch (err) {
    console.error("animateStatEffect error:", err);
  }
}

async function executeAttack({ mon, move, target, isPlayer }) {
  move.currentPp = Math.max(0, move.currentPp - 1);

  // Step 1 : Afficher message d'attaque et attendre clic
  await showMessage(t("usesMove", { pokemon: pName(mon), move: moveName(move) }));
  await waitForClick();

  // Step 1b : Vérification précision
  const accStage = mon.statModifiers?.accuracy || 0;
  const accMultiplier = STAT_STAGE_MULTIPLIERS[accStage + 6];
  const effectiveAccuracy = (move.accuracy || 100) * accMultiplier;
  if (Math.random() * 100 >= effectiveAccuracy) {
    await showMessage(t("attackMissed"));
    await waitForClick();
    return;
  }

  // Step 1c : Branche statut
  if (move.category === "statut") {
    await applyStatusEffect(move, mon, target, isPlayer);
    return;
  }

  // Step 2 : Animation selon catégorie
  const attackerEl = document.getElementById(isPlayer ? "player-sprite" : "enemy-sprite");
  const defenderEl = document.getElementById(isPlayer ? "enemy-sprite" : "player-sprite");
  const hitColor = TYPE_COLORS[move.type] || "white";

  if (move.category === "speciale") {
    // Spéciale : projectile coloré (pas de slide)
    playAttackSound();
    await animateProjectile(attackerEl, defenderEl, hitColor);
  } else {
    // Physique : slide classique
    const slideClass = isPlayer ? "attack-slide-right" : "attack-slide-left";
    playAttackSound();
    attackerEl.classList.add(slideClass);
    await delay(ATTACK_SLIDE_MS);
    attackerEl.classList.remove(slideClass);
  }

  // Step 3 : Calcul dégâts
  const { damage, multiplier } = calculateDamage(mon, target, move);
  target.currentPv = Math.max(0, target.currentPv - damage);

  // Step 4 : Défenseur flashe (coloré) + tremble + barre PV
  defenderEl.style.setProperty("--hit-color", hitColor);
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
// Moves de statut
// ==============================================
async function applyStatusEffect(move, user, target, isPlayer) {
  if (!target.statModifiers) target.statModifiers = {};
  if (!user.statModifiers) user.statModifiers = {};

  let statLabel = "";
  let isBuff = false;
  switch (move.effect) {
    case "atkDown":
      target.statModifiers.atk = Math.max(-6, (target.statModifiers.atk || 0) - 1);
      statLabel = t("atkLabel");
      break;
    case "defDown":
      target.statModifiers.def = Math.max(-6, (target.statModifiers.def || 0) - 1);
      statLabel = t("defLabel");
      break;
    case "accuracyDown":
      target.statModifiers.accuracy = Math.max(-6, (target.statModifiers.accuracy || 0) - 1);
      statLabel = t("accuracyLabel");
      break;
    case "speedDown":
      target.statModifiers.vitesse = Math.max(-6, (target.statModifiers.vitesse || 0) - 1);
      statLabel = t("vitLabel");
      break;
    case "atkUp":
      user.statModifiers.atk = Math.min(6, (user.statModifiers.atk || 0) + 1);
      statLabel = t("atkLabel");
      isBuff = true;
      break;
    case "defUp":
      user.statModifiers.def = Math.min(6, (user.statModifiers.def || 0) + 1);
      statLabel = t("defLabel");
      isBuff = true;
      break;
  }

  // Animation chevrons Gen III sur le Pokémon ciblé
  if (statLabel) {
    const targetEl = isBuff
      ? document.getElementById(isPlayer ? "player-sprite" : "enemy-sprite")
      : document.getElementById(isPlayer ? "enemy-sprite" : "player-sprite");
    playAttackSound();
    await animateStatEffect(targetEl, isBuff, move.effect);

    if (isBuff) {
      await showMessage(t("statRose", { name: pName(user), stat: statLabel }));
    } else {
      await showMessage(t("statFell", { name: pName(target), stat: statLabel }));
    }
    await waitForClick();
  }
}

// ==============================================
// Apprentissage de moves
// ==============================================
let _pendingNewMoves = [];

async function handleLearnMove(pokemon, newMove) {
  if (pokemon.moves.length < 4) {
    pokemon.moves.push({ ...newMove, currentPp: newMove.pp });
    await showMessage(t("learnedMove", { name: pName(pokemon), move: moveName(newMove) }));
    await waitForClick();
  } else {
    await showMessage(t("wantsToLearn", { name: pName(pokemon), move: moveName(newMove) }));
    await waitForClick();
    await showMessage(t("butCantLearn", { name: pName(pokemon) }));
    await waitForClick();
    const choice = await showMoveReplacementUI(pokemon, newMove);
    if (choice === -1) {
      await showMessage(t("didNotLearn", { name: pName(pokemon), move: moveName(newMove) }));
      await waitForClick();
    } else {
      const oldMove = pokemon.moves[choice];
      await showMessage(t("forgotMove", { name: pName(pokemon), move: moveName(oldMove) }));
      await waitForClick();
      pokemon.moves[choice] = { ...newMove, currentPp: newMove.pp };
      await showMessage(t("learnedMove", { name: pName(pokemon), move: moveName(newMove) }));
      await waitForClick();
    }
  }
}

function showMoveReplacementUI(pokemon, newMove) {
  return new Promise(resolve => {
    const movesDiv = document.getElementById("battle-moves");
    movesDiv.classList.remove("hidden");
    movesDiv.innerHTML = "";

    const textEl = document.getElementById("battle-text");
    textEl.textContent = t("replaceWhich", { move: moveName(newMove) });

    pokemon.moves.forEach((move, i) => {
      const btn = document.createElement("button");
      btn.className = "move-btn type-" + move.type;
      const typeName = TYPE_NAMES[move.type]?.[settings.lang] || move.type.toUpperCase();
      const catIcon = CATEGORY_ICONS[move.category] || "";
      btn.innerHTML = `
        <span class="move-name">${moveName(move)}</span>
        <span class="move-type-label type-${move.type}">${typeName}</span>
        <span class="move-category-icon cat-${move.category}"><span>${catIcon}</span></span>
        <span class="move-pp">PP ${move.currentPp}/${move.pp}</span>`;
      btn.addEventListener("click", () => {
        movesDiv.classList.add("hidden");
        resolve(i);
      });
      movesDiv.appendChild(btn);
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "move-btn type-normal";
    cancelBtn.style.gridColumn = "1 / -1";
    cancelBtn.innerHTML = `<span class="move-name">${t("dontLearn")}</span>`;
    cancelBtn.addEventListener("click", () => {
      movesDiv.classList.add("hidden");
      resolve(-1);
    });
    movesDiv.appendChild(cancelBtn);
  });
}

// ==============================================
// Fin de combat + EXP + Level Up
// ==============================================
async function endBattle(playerWon) {
  gameState.battleActive = false;
  hideBattleMenus();
  const currentBTheme = gameState.battleType === "wild" ? wildBattleTheme : battleTheme;
  const currentVTheme = gameState.battleType === "wild" ? wildVictoryTheme : victoryTheme;
  fadeOutAudio(currentBTheme, 500);

  if (playerWon === null) {
    // Fuite — pas d'XP, transition directe
    showResult(null);
    return;
  }

  // Capture réussie
  if (playerWon === "captured") {
    setTimeout(() => {
      currentVTheme.currentTime = 0;
      currentVTheme.play().catch(() => {});
    }, 500);

    if (gameState.battleType === "wild") {
      gameState.wildBattlesRemaining--;
    }

    const captured = gameState.enemyPokemon;
    captured.statModifiers = {};

    if (gameState.team.length < 6) {
      gameState.team.push(captured);
      await showMessage(t("pokemonAddedToTeam", { name: pName(captured) }));
      await waitForClick();
    } else {
      await showMessage(t("teamFull", { name: pName(captured) }));
      await waitForClick();
      const replaceIndex = await promptTeamReplace(captured);
      if (replaceIndex >= 0) {
        const released = gameState.team[replaceIndex];
        gameState.team[replaceIndex] = captured;
        if (gameState.playerPokemon === released) {
          gameState.playerPokemon = captured;
        }
        await showMessage(t("pokemonReplaced", { old: pName(released), new: pName(captured) }));
        await waitForClick();
      } else {
        await showMessage(t("pokemonReleased", { name: pName(captured) }));
        await waitForClick();
      }
    }

    saveGame();
    showResult(true);
    return;
  }

  if (playerWon) {
    setTimeout(() => {
      currentVTheme.currentTime = 0;
      currentVTheme.play().catch(() => {});
    }, 500);
    const p = gameState.playerPokemon;
    const e = gameState.enemyPokemon;
    await gainExp(p, e.level);
    await processMessages();

    if (gameState.battleType === "wild") {
      gameState.wildBattlesRemaining--;
    }
    saveGame();
    showResult(true);
  } else {
    showResult(false);
  }
}

// Prompt de remplacement d'équipe (quand équipe pleine après capture)
function promptTeamReplace(newPokemon) {
  return new Promise(resolve => {
    const panel = document.getElementById("battle-team-panel");
    const prompt = panel.querySelector(".team-prompt");
    const cancelBtn = panel.querySelector(".team-cancel-btn");

    prompt.textContent = t("replacePrompt");
    cancelBtn.textContent = t("releasePokemon");

    // Rendre les slots
    for (let i = 0; i < 6; i++) {
      const slot = document.getElementById("team-slot-" + i);
      const mon = gameState.team[i];
      if (!mon) {
        slot.innerHTML = "";
        slot.classList.add("empty");
        continue;
      }
      slot.classList.remove("empty", "fainted", "selected");
      slot.innerHTML = renderSlotContent(mon, mon === gameState.playerPokemon);

      slot.onclick = () => {
        panel.classList.add("hidden");
        cleanupReplaceListeners();
        resolve(i);
      };
    }

    const onCancel = () => {
      panel.classList.add("hidden");
      cleanupReplaceListeners();
      resolve(-1);
    };
    cancelBtn.onclick = onCancel;

    function cleanupReplaceListeners() {
      for (let i = 0; i < 6; i++) {
        document.getElementById("team-slot-" + i).onclick = null;
      }
      cancelBtn.onclick = null;
      // Restaurer le texte original
      prompt.textContent = t("chooseAPokemon");
      cancelBtn.textContent = t("cancel");
    }

    panel.classList.remove("hidden");
  });
}

function showResult(won) {
  const titleEl = document.getElementById("result-title");
  const summaryEl = document.getElementById("result-summary");
  const buttonsEl = document.getElementById("result-buttons");

  summaryEl.innerHTML = "";
  buttonsEl.innerHTML = "";

  // --- Défaite ---
  if (won === false) {
    playDefeatSound();
    titleEl.textContent = t("defeat");
    summaryEl.innerHTML = `
      <div style="text-align:center">
        ${t("pokemonFainted")}<br>
        <span class="result-battle-count">${t("battlesWon", { count: gameState.combatNumber - 1 })}</span>
      </div>
    `;
    buttonsEl.append(createResultBtn(t("backToMenu"), false, () => transitionToMenu()));
    transitionToResult();
    return;
  }

  // --- Fuite (won === null) ou Victoire (won === true) ---
  const p = gameState.playerPokemon;

  if (won === true) {
    titleEl.textContent = t("victory");
  } else {
    titleEl.textContent = "";
  }

  // Victoire rival → round terminé, lancer cycle sauvage
  if (won === true && gameState.battleType === "rival") {
    const round = gameState.progressionRound;
    summaryEl.innerHTML = `
      <div class="result-pokemon-line">${pName(p)} ${t("levelAbbr")}${p.level}</div>
      <div class="result-battle-count">${t("roundComplete", { round })}</div>
      <div class="result-saved-msg" id="saved-msg">${t("saved")}</div>
    `;
    gameState.progressionRound++;
    saveGame();

    const nextBtn = createResultBtn(t("continueAdventure"), false, () => {
      startWildCycle();
      transitionToBattleFromResult();
    });
    const teamBtn = createResultBtn(t("manageTeam"), true, () => openTeamManager());
    const saveBtn = createResultBtn(t("save"), true, () => {
      saveGame();
      const msg = document.getElementById("saved-msg");
      if (msg) { msg.classList.add("visible"); setTimeout(() => msg.classList.remove("visible"), 2000); }
    });
    const menuBtn = createResultBtn(t("backToMenu"), true, () => transitionToMenu());
    buttonsEl.append(nextBtn, teamBtn, saveBtn, menuBtn);
    transitionToResult();
    return;
  }

  // Victoire/fuite sauvage — combats restants ?
  if (gameState.battleType === "wild") {
    if (gameState.wildBattlesRemaining > 0) {
      // Encore des combats sauvages
      summaryEl.innerHTML = `
        <div class="result-pokemon-line">${won ? pName(p) + " " + t("levelAbbr") + p.level : ""}</div>
        <div class="result-battle-count">${t("wildBattlesLeft", { count: gameState.wildBattlesRemaining })}</div>
      `;
      const nextBtn = createResultBtn(t("nextWildBattle"), false, () => {
        gameState.team.forEach(pk => restorePokemon(pk));
        generateWildEnemy();
        transitionToBattleFromResult();
      });
      const teamBtn = createResultBtn(t("manageTeam"), true, () => openTeamManager());
      const menuBtn = createResultBtn(t("backToMenu"), true, () => transitionToMenu());
      buttonsEl.append(nextBtn, teamBtn, menuBtn);
    } else {
      // Plus de combats sauvages → soin auto → rival
      gameState.team.forEach(pk => restorePokemon(pk));
      saveGame();

      summaryEl.innerHTML = `
        <div class="result-pokemon-line">${won ? pName(p) + " " + t("levelAbbr") + p.level : ""}</div>
        <div class="result-battle-count">${t("teamHealed")}</div>
        <div class="result-saved-msg" id="saved-msg">${t("saved")}</div>
      `;
      const nextBtn = createResultBtn(t("faceRival"), false, () => {
        generateRivalEnemy();
        transitionToBattleFromResult();
      });
      const teamBtn = createResultBtn(t("manageTeam"), true, () => openTeamManager());
      const saveBtn = createResultBtn(t("save"), true, () => {
        saveGame();
        const msg = document.getElementById("saved-msg");
        if (msg) { msg.classList.add("visible"); setTimeout(() => msg.classList.remove("visible"), 2000); }
      });
      const menuBtn = createResultBtn(t("backToMenu"), true, () => transitionToMenu());
      buttonsEl.append(nextBtn, teamBtn, saveBtn, menuBtn);
    }
    transitionToResult();
    return;
  }

  // Fallback (ne devrait pas arriver)
  transitionToResult();
}

// Gestionnaire d'équipe entre combats (swap + items)
function openTeamManager() {
  const panel = document.getElementById("battle-team-panel");
  const prompt = panel.querySelector(".team-prompt");
  const cancelBtn = panel.querySelector(".team-cancel-btn");

  let selectedIndex = -1;
  prompt.textContent = t("manageTeamPrompt");
  cancelBtn.textContent = t("done");

  function renderManagerSlots() {
    for (let i = 0; i < 6; i++) {
      const slot = document.getElementById("team-slot-" + i);
      const mon = gameState.team[i];
      if (!mon) {
        slot.innerHTML = "";
        slot.className = i === 0 ? "team-slot team-slot-active empty" : "team-slot empty";
        slot.onclick = null;
        continue;
      }
      slot.className = i === 0 ? "team-slot team-slot-active" : "team-slot";
      if (mon.currentPv <= 0) slot.classList.add("fainted");
      if (i === selectedIndex) slot.classList.add("selected");
      const isFirst = i === 0;
      slot.innerHTML = renderSlotContent(mon, isFirst);

      slot.onclick = () => {
        if (selectedIndex === -1) {
          // Premier clic : sélectionner
          selectedIndex = i;
          prompt.textContent = t("swapWith", { name: pName(mon) });
          renderManagerSlots();
        } else if (selectedIndex === i) {
          // Même slot : désélectionner
          selectedIndex = -1;
          prompt.textContent = t("manageTeamPrompt");
          renderManagerSlots();
        } else {
          // Swap les deux Pokémon
          const temp = gameState.team[selectedIndex];
          gameState.team[selectedIndex] = gameState.team[i];
          gameState.team[i] = temp;
          // Mettre à jour playerPokemon si nécessaire
          gameState.playerPokemon = gameState.team[0];
          selectedIndex = -1;
          prompt.textContent = t("manageTeamPrompt");
          saveGame();
          renderManagerSlots();
        }
      };
    }
  }

  renderManagerSlots();

  cancelBtn.onclick = () => {
    panel.classList.add("hidden");
    for (let i = 0; i < 6; i++) {
      document.getElementById("team-slot-" + i).onclick = null;
    }
    cancelBtn.onclick = null;
    prompt.textContent = t("chooseAPokemon");
    cancelBtn.textContent = t("cancel");
  };

  panel.classList.remove("hidden");
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
  pokemon.statModifiers = {};
}

async function gainExp(winner, loserLevel) {
  const expGained = loserLevel * 10;
  winner.exp += expGained;
  queueMessage(t("expGain", { name: pName(winner), exp: expGained }));

  // While loop : gère les multi-level-ups
  while (winner.exp >= Math.pow(winner.level + 1, 3)) {
    // Phase 1 : remplir a 100%
    const fill = document.getElementById("player-xp");
    fill.style.width = "100%";
    await new Promise(r => setTimeout(r, 500));

    // Phase 2 : reset instantane a 0%
    fill.style.transition = "none";
    fill.style.width = "0%";
    fill.offsetWidth; // force reflow
    fill.style.transition = "width 0.5s ease";

    // Level up
    levelUp(winner);

    // Vérifier évolution
    const data = POKEMON_DATA[winner.key];
    if (data.evolvesTo && winner.level >= data.evolvesTo.level) {
      _pendingEvolution = data.evolvesTo.key;
    }
  }
  updateXpBar(winner);
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
  _pendingStatGains = { gains, stats: { ...pokemon.stats } };

  // Vérifier si un move est appris à ce niveau (remonte la chaîne d'évo)
  const learnset = getLearnset(pokemon.key);
  if (learnset) {
    const newMoves = learnset.filter(entry => entry.level === pokemon.level);
    for (const entry of newMoves) {
      _pendingNewMoves.push(entry.move);
    }
  }
}

function showStatGainsPanel(gains, stats) {
  return new Promise(resolve => {
    const popup = document.getElementById("stat-gains-popup");
    const box = popup.querySelector(".stat-gains-box");
    const labels = [
      [t("hpLabel"), gains.pv, stats.pv],
      [t("atkLabel"), gains.atk, stats.atk],
      [t("defLabel"), gains.def, stats.def],
      [t("atkSpeLabel"), gains.atkSpe, stats.atkSpe],
      [t("defSpeLabel"), gains.defSpe, stats.defSpe],
      [t("vitLabel"), gains.vitesse, stats.vitesse],
    ];
    // Phase 1 : gains
    box.innerHTML = labels.map(([l, g]) =>
      `<div class="stat-gains-row"><span class="stat-label">${l}</span><span class="stat-value">+ ${g}</span></div>`
    ).join("");
    popup.classList.remove("hidden");

    const onClick1 = () => {
      document.removeEventListener("click", onClick1);
      // Phase 2 : stats totales
      box.innerHTML = labels.map(([l, , s]) =>
        `<div class="stat-gains-row"><span class="stat-label">${l}</span><span class="stat-value">${s}</span></div>`
      ).join("");

      const onClick2 = () => {
        document.removeEventListener("click", onClick2);
        popup.classList.add("hidden");
        resolve();
      };
      setTimeout(() => document.addEventListener("click", onClick2, { once: true }), 100);
    };
    setTimeout(() => document.addEventListener("click", onClick1, { once: true }), 100);
  });
}

// ==============================================
// Évolution
// ==============================================
async function evolve(pokemon, newKey) {
  const newData = POKEMON_DATA[newKey];
  const oldKey = pokemon.key;
  const oldData = POKEMON_DATA[oldKey];
  const oldName = pName(pokemon);

  // Message d'annonce
  await showMessage(t("evolving", { name: oldName }));

  // Animation : flash + clignotement sprite
  await showEvolutionAnimation(pokemon, newData);

  // Mettre à jour l'instance
  pokemon.key = newKey;
  pokemon.type = newData.type;
  pokemon.spriteFront = newData.spriteFront;
  pokemon.spriteBack = newData.spriteBack;
  pokemon.spriteOffset = newData.spriteOffset;
  pokemon.color = newData.color;

  // Recalculer les stats avec les nouveaux baseStats
  for (const stat of ["pv", "atk", "def", "atkSpe", "defSpe", "vitesse"]) {
    const diff = newData.baseStats[stat] - oldData.baseStats[stat];
    pokemon.stats[stat] += Math.max(1, Math.floor(diff * 2 * pokemon.level / 100));
  }
  pokemon.maxPv = pokemon.stats.pv;
  pokemon.currentPv = pokemon.maxPv; // full heal à l'évolution

  // Mettre à jour le sprite et l'UI
  setupBattleUI();
  playLevelUpSound();

  await showMessage(t("evolved", { old: oldName, new: pName(pokemon) }));
  await waitForClick();
}

async function showEvolutionAnimation(pokemon, newData) {
  const playerSprite = document.getElementById("player-sprite");
  const img = playerSprite.querySelector(".sprite-img");
  if (!img) return;

  const oldSrc = img.src;
  const newSrc = newData.spriteBack;

  // Phase 1 : flash blanc + clignotement entre ancien et nouveau sprite
  playerSprite.classList.add("evolving");

  const flickerCount = 10;
  const flickerMs = 200;
  for (let i = 0; i < flickerCount; i++) {
    img.src = (i % 2 === 0) ? newSrc : oldSrc;
    await delay(flickerMs);
  }

  // Phase 2 : stabiliser sur le nouveau sprite
  img.src = newSrc;
  playerSprite.classList.remove("evolving");
}

// ==============================================
// Debug overlay — F2 pour ajuster les offsets en jeu
// Onglets par chaîne d'évolution + aperçu comparatif
// ==============================================
let _debugOpen = false;
let _debugPanel = null;
let _dbgPlayerKey = null;
let _dbgEnemyKey = null;

const DEBUG_CHAINS = {
  FEU:    ["salameche", "reptincel", "dracaufeu"],
  EAU:    ["carapuce", "carabaffe", "tortank"],
  PLANTE: ["bulbizarre", "herbizarre", "florizarre"]
};

document.addEventListener("keydown", (e) => {
  if (e.key === "F2" && currentScreen === "battle") {
    e.preventDefault();
    _debugOpen ? closeDebugOverlay() : openDebugOverlay();
  }
});

function _dbgEnsureOffset(key) {
  const data = POKEMON_DATA[key];
  if (!data.spriteOffset) data.spriteOffset = { front: {x:"0px",y:"0px",scale:1}, back: {x:"0px",y:"0px",scale:1} };
  if (!data.spriteOffset.front) data.spriteOffset.front = {x:"0px",y:"0px",scale:1};
  if (!data.spriteOffset.back) data.spriteOffset.back = {x:"0px",y:"0px",scale:1};
  return data.spriteOffset;
}

function openDebugOverlay() {
  _debugOpen = true;
  if (_debugPanel) { _debugPanel.remove(); _debugPanel = null; }

  const panel = document.createElement("div");
  panel.id = "debug-panel";
  panel.style.cssText = `
    position: fixed; top: 0; right: 0; z-index: 999;
    background: rgba(0,0,0,0.92); color: #fff; padding: 10px;
    font-family: "Press Start 2P", monospace; font-size: 7px;
    max-height: 100vh; overflow-y: auto; width: 280px;
  `;

  // --- Onglets chaîne ---
  const tabs = document.createElement("div");
  tabs.style.cssText = "display:flex;gap:4px;margin-bottom:8px";
  const contentArea = document.createElement("div");

  let activeChain = null;

  function parseVal(v) { return parseFloat(v) || 0; }

  // Track quel Pokémon est affiché (peut différer de gameState en mode debug)
  _dbgPlayerKey = gameState.playerPokemon?.key || null;
  _dbgEnemyKey = gameState.enemyPokemon?.key || null;

  function _dbgSwapSprite(key, side) {
    const data = POKEMON_DATA[key];
    const off = _dbgEnsureOffset(key);
    if (side === "back") {
      const container = document.getElementById("player-sprite");
      container.innerHTML = `<img src="${data.spriteBack}" alt="${data.name.fr}" class="sprite-img">`;
      applySpriteOffset(container, off.back);
      document.getElementById("player-name").textContent = data.name[settings.lang] || data.name.fr;
      _dbgPlayerKey = key;
    } else {
      const container = document.getElementById("enemy-sprite");
      container.innerHTML = `<img src="${data.spriteFront}" alt="${data.name.fr}" class="sprite-img">`;
      applySpriteOffset(container, off.front);
      document.getElementById("enemy-name").textContent = data.name[settings.lang] || data.name.fr;
      _dbgEnemyKey = key;
    }
  }

  function applyLiveIfOnField(key, side) {
    const off = POKEMON_DATA[key].spriteOffset;
    if (_dbgPlayerKey === key && side === "back") {
      applySpriteOffset(document.getElementById("player-sprite"), off.back);
    }
    if (_dbgEnemyKey === key && side === "front") {
      applySpriteOffset(document.getElementById("enemy-sprite"), off.front);
    }
  }

  function renderChain(chainName) {
    activeChain = chainName;
    contentArea.innerHTML = "";
    const keys = DEBUG_CHAINS[chainName];

    // --- Aperçu comparatif des 3 formes ---
    const preview = document.createElement("div");
    preview.style.cssText = "display:flex;justify-content:space-around;align-items:flex-end;margin-bottom:10px;padding:8px;background:rgba(255,255,255,0.05);border-radius:4px;height:90px";
    keys.forEach(key => {
      const data = POKEMON_DATA[key];
      const off = _dbgEnsureOffset(key);
      const wrap = document.createElement("div");
      wrap.style.cssText = "text-align:center;flex:1";
      const img = document.createElement("img");
      img.src = data.spriteFront;
      img.alt = data.name.fr;
      img.dataset.dbgKey = key;
      img.style.cssText = `width:60px;height:60px;object-fit:contain;image-rendering:pixelated;transform:scale(${off.front.scale||1})`;
      const label = document.createElement("div");
      label.style.cssText = "margin-top:2px;font-size:5px;color:#aaa";
      label.textContent = data.name.fr;
      wrap.appendChild(img);
      wrap.appendChild(label);
      preview.appendChild(wrap);
    });
    contentArea.appendChild(preview);

    // --- Sliders pour chaque forme ---
    keys.forEach(key => {
      const data = POKEMON_DATA[key];
      const off = _dbgEnsureOffset(key);

      const section = document.createElement("div");
      section.style.cssText = "margin-bottom:8px;border:1px solid #333;padding:6px;border-radius:3px";

      const titleRow = document.createElement("div");
      titleRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px";

      const title = document.createElement("span");
      title.style.cssText = "color:#ffcc00;font-size:8px";
      title.textContent = data.name.fr;
      titleRow.appendChild(title);

      const swapBtns = document.createElement("div");
      swapBtns.style.cssText = "display:flex;gap:3px";
      const btnStyle = "font-family:inherit;font-size:5px;padding:2px 4px;border:none;color:#fff;cursor:pointer;border-radius:2px";

      const backBtn = document.createElement("button");
      backBtn.textContent = "◄ BACK";
      backBtn.style.cssText = btnStyle + ";background:#2a6db5";
      backBtn.addEventListener("click", () => _dbgSwapSprite(key, "back"));
      swapBtns.appendChild(backBtn);

      const frontBtn = document.createElement("button");
      frontBtn.textContent = "FRONT ►";
      frontBtn.style.cssText = btnStyle + ";background:#b52a6d";
      frontBtn.addEventListener("click", () => _dbgSwapSprite(key, "front"));
      swapBtns.appendChild(frontBtn);

      titleRow.appendChild(swapBtns);
      section.appendChild(titleRow);

      ["back", "front"].forEach(side => {
        const sideLabel = document.createElement("div");
        sideLabel.style.cssText = "color:#888;margin:4px 0 2px;font-size:6px";
        sideLabel.textContent = side.toUpperCase();
        section.appendChild(sideLabel);

        const offset = off[side];

        ["x", "y"].forEach(axis => {
          const val = parseVal(offset[axis]);
          const row = document.createElement("div");
          row.style.cssText = "display:flex;align-items:center;gap:3px;margin:2px 0";
          row.innerHTML = `
            <span style="width:12px;color:#aaa">${axis.toUpperCase()}</span>
            <input type="range" min="-120" max="120" value="${val}" style="flex:1;height:5px">
            <span style="width:32px;text-align:right;color:#ffcc00" class="dbg-val">${val}</span>
          `;
          row.querySelector("input").addEventListener("input", (ev) => {
            const v = parseInt(ev.target.value);
            row.querySelector(".dbg-val").textContent = v;
            offset[axis] = v + "px";
            applyLiveIfOnField(key, side);
          });
          section.appendChild(row);
        });

        // Scale slider
        const sRow = document.createElement("div");
        sRow.style.cssText = "display:flex;align-items:center;gap:3px;margin:2px 0";
        sRow.innerHTML = `
          <span style="width:12px;color:#aaa">S</span>
          <input type="range" min="0.3" max="2" step="0.05" value="${offset.scale||1}" style="flex:1;height:5px">
          <span style="width:32px;text-align:right;color:#ffcc00" class="dbg-val">${offset.scale||1}</span>
        `;
        sRow.querySelector("input").addEventListener("input", (ev) => {
          const v = parseFloat(ev.target.value);
          sRow.querySelector(".dbg-val").textContent = v.toFixed(2);
          offset.scale = v;
          applyLiveIfOnField(key, side);
          // Mettre à jour l'aperçu comparatif
          const prevImg = contentArea.querySelector(`img[data-dbg-key="${key}"]`);
          if (prevImg && side === "front") prevImg.style.transform = `scale(${v})`;
        });
        section.appendChild(sRow);
      });

      contentArea.appendChild(section);
    });

    // --- Bouton COPIER toute la chaîne ---
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "COPIER " + chainName;
    copyBtn.style.cssText = "font-family:inherit;font-size:7px;padding:6px 10px;background:#cf4014;color:#fff;border:none;cursor:pointer;width:100%;margin-top:4px";
    copyBtn.addEventListener("click", () => {
      const lines = keys.map(key => {
        const off = POKEMON_DATA[key].spriteOffset;
        return `${key}: {\n  front: { x: "${off.front.x}", y: "${off.front.y}", scale: ${off.front.scale||1} },\n  back:  { x: "${off.back.x}", y: "${off.back.y}", scale: ${off.back.scale||1} }\n}`;
      });
      const txt = lines.join("\n");
      navigator.clipboard.writeText(txt).catch(() => {});
      console.log("=== " + chainName + " ===\n" + txt);
      copyBtn.textContent = "COPIÉ !";
      setTimeout(() => copyBtn.textContent = "COPIER " + chainName, 1500);
    });
    contentArea.appendChild(copyBtn);

    // Surligner l'onglet actif
    tabs.querySelectorAll("button").forEach(b => {
      b.style.background = b.dataset.chain === chainName ? "#cf4014" : "#333";
    });
  }

  // --- Onglet TEXTBOX ---
  function renderTextboxControls() {
    activeChain = "TEXTBOX";
    contentArea.innerHTML = "";

    const textbox = document.querySelector(".battle-textbox");
    const battleText = document.getElementById("battle-text");
    const platform = document.querySelector(".player-platform");
    const computed = getComputedStyle(textbox);

    const section = document.createElement("div");
    section.style.cssText = "border:1px solid #333;padding:6px;border-radius:3px";

    const title = document.createElement("div");
    title.style.cssText = "color:#ffcc00;font-size:8px;margin-bottom:6px";
    title.textContent = "BATTLE TEXTBOX";
    section.appendChild(title);

    const sliders = [
      { label: "Y", prop: "translateY", min: -200, max: 200, step: 1,
        get: () => { const m = textbox.style.transform?.match(/translateY\((-?\d+)px\)/); return m ? parseInt(m[1]) : 0; },
        set: (v) => { textbox.style.transform = `translateY(${v}px)`; }
      },
      { label: "H", prop: "minHeight", min: 40, max: 300, step: 1,
        get: () => parseInt(computed.minHeight) || 80,
        set: (v) => { textbox.style.minHeight = v + "px"; }
      },
      { label: "W", prop: "margin", min: 0, max: 30, step: 1,
        get: () => { const v = computed.left; return Math.round(parseFloat(v) / textbox.offsetParent.offsetWidth * 100) || 10; },
        set: (v) => { textbox.style.left = v + "%"; textbox.style.right = v + "%"; }
      },
      { label: "PAD", prop: "padding", min: 0, max: 40, step: 1,
        get: () => parseInt(computed.paddingTop) || 20,
        set: (v) => { textbox.style.padding = v + "px"; }
      },
      { label: "TXT", prop: "fontSize", min: 8, max: 30, step: 1,
        get: () => parseInt(getComputedStyle(battleText).fontSize) || 17,
        set: (v) => { battleText.style.fontSize = v + "px"; }
      }
    ];

    // Séparateur pour player platform
    const platTitle = document.createElement("div");
    platTitle.style.cssText = "color:#ffcc00;font-size:8px;margin:8px 0 4px";
    platTitle.textContent = "PLAYER PLATFORM";

    const platSlider = { label: "B-Y", min: -50, max: 50, step: 1,
      get: () => { const v = getComputedStyle(platform).bottom; const ph = platform.offsetParent?.offsetHeight || 1; return Math.round(parseFloat(v) / ph * 100) || -15; },
      set: (v) => { platform.style.bottom = v + "%"; }
    };

    sliders.forEach(s => {
      const val = s.get();
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:3px;margin:2px 0";
      row.innerHTML = `
        <span style="width:24px;color:#aaa">${s.label}</span>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}" style="flex:1;height:5px">
        <span style="width:32px;text-align:right;color:#ffcc00" class="dbg-val">${val}</span>
      `;
      row.querySelector("input").addEventListener("input", (ev) => {
        const v = parseFloat(ev.target.value);
        row.querySelector(".dbg-val").textContent = v;
        s.set(v);
      });
      section.appendChild(row);
    });

    contentArea.appendChild(section);

    // Section player platform
    const platSection = document.createElement("div");
    platSection.style.cssText = "border:1px solid #333;padding:6px;border-radius:3px;margin-top:6px";
    platSection.appendChild(platTitle);

    const pVal = platSlider.get();
    const pRow = document.createElement("div");
    pRow.style.cssText = "display:flex;align-items:center;gap:3px;margin:2px 0";
    pRow.innerHTML = `
      <span style="width:24px;color:#aaa">${platSlider.label}</span>
      <input type="range" min="${platSlider.min}" max="${platSlider.max}" step="${platSlider.step}" value="${pVal}" style="flex:1;height:5px">
      <span style="width:32px;text-align:right;color:#ffcc00" class="dbg-val">${pVal}</span>
    `;
    pRow.querySelector("input").addEventListener("input", (ev) => {
      const v = parseFloat(ev.target.value);
      pRow.querySelector(".dbg-val").textContent = v;
      platSlider.set(v);
    });
    platSection.appendChild(pRow);
    contentArea.appendChild(platSection);

    // Bouton COPIER CSS
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "COPIER CSS";
    copyBtn.style.cssText = "font-family:inherit;font-size:7px;padding:6px 10px;background:#cf4014;color:#fff;border:none;cursor:pointer;width:100%;margin-top:4px";
    copyBtn.addEventListener("click", () => {
      const wVal = sliders.find(s => s.label === "W")?.get() || 10;
      const css = `.battle-textbox {\n  transform: translateY(${sliders[0].get()}px);\n  min-height: ${sliders[1].get()}px;\n  left: ${wVal}%;\n  right: ${wVal}%;\n  padding: ${sliders[3].get()}px;\n}\n#battle-text {\n  font-size: ${sliders[4].get()}px;\n}\n.player-platform {\n  bottom: ${platSlider.get()}%;\n}`;
      navigator.clipboard.writeText(css).catch(() => {});
      console.log("=== TEXTBOX + PLATFORM CSS ===\n" + css);
      copyBtn.textContent = "COPIÉ !";
      setTimeout(() => copyBtn.textContent = "COPIER CSS", 1500);
    });
    contentArea.appendChild(copyBtn);

    // Surligner l'onglet actif
    tabs.querySelectorAll("button").forEach(b => {
      b.style.background = b.dataset.chain === "TEXTBOX" ? "#cf4014" : "#333";
    });
  }

  // Créer les onglets (chaînes d'évolution + TEXTBOX)
  Object.keys(DEBUG_CHAINS).forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.dataset.chain = name;
    btn.style.cssText = "font-family:inherit;font-size:7px;padding:4px 8px;border:none;color:#fff;cursor:pointer;flex:1;background:#333";
    btn.addEventListener("click", () => renderChain(name));
    tabs.appendChild(btn);
  });

  // Onglet TEXTBOX
  const tbxBtn = document.createElement("button");
  tbxBtn.textContent = "TXT";
  tbxBtn.dataset.chain = "TEXTBOX";
  tbxBtn.style.cssText = "font-family:inherit;font-size:7px;padding:4px 8px;border:none;color:#fff;cursor:pointer;flex:1;background:#333";
  tbxBtn.addEventListener("click", () => renderTextboxControls());
  tabs.appendChild(tbxBtn);

  panel.appendChild(tabs);
  panel.appendChild(contentArea);

  const hint = document.createElement("div");
  hint.style.cssText = "color:#555;margin-top:6px;font-size:6px;text-align:center";
  hint.textContent = "F2 pour fermer";
  panel.appendChild(hint);

  document.body.appendChild(panel);
  _debugPanel = panel;

  // Ouvrir sur la chaîne du joueur actuel
  const playerKey = gameState.playerPokemon?.key || "salameche";
  const startChain = Object.entries(DEBUG_CHAINS).find(([, keys]) => keys.includes(playerKey));
  renderChain(startChain ? startChain[0] : "FEU");
}

function closeDebugOverlay() {
  _debugOpen = false;
  if (_debugPanel) _debugPanel.style.display = "none";
}
