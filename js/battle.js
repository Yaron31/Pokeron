/* ==============================================
   POKÉRON — Moteur de combat
   ============================================== */

// ==============================================
// Messages narratifs
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
// Calculs
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
// UI Combat
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
// Déroulement des tours
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
