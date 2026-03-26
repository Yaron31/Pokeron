/* ==============================================
   POKÉRON — Menu de combat (ATTAQUE/SAC/POKÉMON/FUITE)
   Machine à états + navigation clavier/souris
   ============================================== */

let battleMenuState = "none"; // "none" | "main" | "moves" | "bag" | "team"
let battleMenuIndex = 0;      // curseur dans le menu principal (0-3, grille 2x2)
let bagMenuIndex = 0;
let teamMenuIndex = 0;
let teamConfirmIndex = -1;    // index du Pokémon sélectionné pour confirmation de switch
let _playerActionResolve = null;

// ==============================================
// Utilitaires nom d'objet
// ==============================================
function itemName(itemKey) {
  return t("itemName_" + itemKey);
}

// ==============================================
// Affichage / masquage des panneaux
// ==============================================
function hideBattleMenus() {
  document.getElementById("battle-main-menu").classList.add("hidden");
  document.getElementById("battle-moves").classList.add("hidden");
  document.getElementById("battle-bag-panel").classList.add("hidden");
  document.getElementById("battle-team-panel").classList.add("hidden");
  battleMenuState = "none";
}

function showBattleMainMenu() {
  battleMenuState = "main";
  battleMenuIndex = 0;
  const menu = document.getElementById("battle-main-menu");
  menu.classList.remove("hidden");
  updateMainMenuSelection();
}

function updateMainMenuSelection() {
  const buttons = document.querySelectorAll("#battle-main-menu .menu-choice");
  buttons.forEach((btn, i) => {
    if (i === battleMenuIndex) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
}

// ==============================================
// Promise d'action joueur
// ==============================================
async function waitForPlayerAction() {
  hideBattleMenus();
  // Texte "Que va faire..." avec animation lettre par lettre
  await showMessage(t("whatWillDo", { name: pName(gameState.playerPokemon) }));
  // Puis montrer le menu
  showBattleMainMenu();

  return new Promise(resolve => {
    _playerActionResolve = resolve;
  });
}

function resolvePlayerAction(action) {
  if (_playerActionResolve) {
    const resolve = _playerActionResolve;
    _playerActionResolve = null;
    hideBattleMenus();
    resolve(action);
  }
}

// ==============================================
// Menu principal — handlers
// ==============================================
function confirmMainMenuChoice() {
  if (battleMenuIndex < 0) return;
  const choices = ["attack", "bag", "pokemon", "flee"];
  const choice = choices[battleMenuIndex];

  switch (choice) {
    case "attack":
      showMovesFromMenu();
      break;
    case "bag":
      showBagPanel();
      break;
    case "pokemon":
      showTeamPanel();
      break;
    case "flee":
      resolvePlayerAction({ type: "flee" });
      break;
  }
}

// Navigation grille 2x2
function navigateMainMenu(direction) {
  // Si aucun bouton sélectionné (souris partie), reprendre à 0
  if (battleMenuIndex < 0) battleMenuIndex = 0;

  switch (direction) {
    case "up":
      if (battleMenuIndex >= 2) battleMenuIndex -= 2;
      break;
    case "down":
      if (battleMenuIndex < 2) battleMenuIndex += 2;
      break;
    case "left":
      if (battleMenuIndex % 2 === 1) battleMenuIndex--;
      break;
    case "right":
      if (battleMenuIndex % 2 === 0) battleMenuIndex++;
      break;
  }
  updateMainMenuSelection();
  playMenuTick();
}

// Clic souris sur les boutons du menu principal
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".menu-choice");
  if (!btn || battleMenuState !== "main") return;

  const choice = btn.dataset.choice;
  const choices = ["attack", "bag", "pokemon", "flee"];
  battleMenuIndex = choices.indexOf(choice);
  updateMainMenuSelection();
  confirmMainMenuChoice();
});

// Synchroniser souris et clavier : mouseenter met à jour l'index
document.addEventListener("mouseenter", (e) => {
  if (!e.target || !e.target.closest) return;
  const btn = e.target.closest(".menu-choice");
  if (!btn || battleMenuState !== "main") return;
  const choices = ["attack", "bag", "pokemon", "flee"];
  const idx = choices.indexOf(btn.dataset.choice);
  if (idx !== -1 && idx !== battleMenuIndex) {
    battleMenuIndex = idx;
    updateMainMenuSelection();
  }
}, true);

// Quand la souris quitte le menu, retirer toute surbrillance
document.getElementById("battle-main-menu").addEventListener("mouseleave", () => {
  if (battleMenuState !== "main") return;
  battleMenuIndex = -1;
  updateMainMenuSelection();
});

// ==============================================
// Sous-menu ATTAQUE (moves)
// ==============================================
function showMovesFromMenu() {
  document.getElementById("battle-main-menu").classList.add("hidden");
  battleMenuState = "moves";
  renderMoveButtons();

  // Ajouter bouton RETOUR
  const movesDiv = document.getElementById("battle-moves");
  const backBtn = document.createElement("button");
  backBtn.className = "move-btn type-normal move-back-btn";
  backBtn.style.gridColumn = "1 / -1";
  backBtn.innerHTML = `<span class="move-name">${t("back")}</span>`;
  backBtn.addEventListener("click", () => {
    if (battlePaused) return;
    showBattleMainMenu();
  });
  movesDiv.appendChild(backBtn);
}

// ==============================================
// Sous-menu SAC
// ==============================================
function showBagPanel() {
  document.getElementById("battle-main-menu").classList.add("hidden");
  battleMenuState = "bag";
  bagMenuIndex = 0;
  renderBagItems();
  document.getElementById("battle-bag-panel").classList.remove("hidden");
}

function renderBagItems() {
  const list = document.getElementById("bag-item-list");
  list.innerHTML = "";

  const activeIndex = gameState.team.indexOf(gameState.playerPokemon);

  Object.keys(ITEMS).forEach((key, i) => {
    const item = ITEMS[key];
    const playerFull = gameState.playerPokemon.currentPv >= gameState.playerPokemon.maxPv;
    const disabled = item.type === "medicine" && playerFull;

    const li = document.createElement("li");
    li.dataset.itemKey = key;
    li.dataset.index = i;
    if (disabled) li.classList.add("disabled");
    if (i === bagMenuIndex) li.classList.add("selected");

    const name = item.name[settings.lang] || item.name.fr;
    li.innerHTML = `
      <span class="choice-cursor">${i === bagMenuIndex ? "►" : " "}</span>
      <img class="bag-item-icon" src="${item.icon}" alt="">
      <span>${name}</span>
      <span class="bag-item-qty">∞</span>
    `;

    li.addEventListener("click", () => {
      if (battlePaused) return;
      if (disabled) return;
      resolvePlayerAction({ type: "item", itemKey: key, targetIndex: activeIndex });
    });

    // Sync souris → clavier
    li.addEventListener("mouseenter", () => {
      if (battleMenuState !== "bag") return;
      if (i !== bagMenuIndex) {
        bagMenuIndex = i;
        updateBagSelection();
      }
    });

    list.appendChild(li);
  });

  // Mettre à jour la description initiale
  updateBagDescription();

  // Handler bouton retour
  const backBtn = document.querySelector(".bag-back-btn");
  backBtn.onclick = () => {
    if (battlePaused) return;
    document.getElementById("battle-bag-panel").classList.add("hidden");
    showBattleMainMenu();
  };
}

function updateBagSelection() {
  const items = document.querySelectorAll("#bag-item-list li");
  items.forEach((li, i) => {
    const cursor = li.querySelector(".choice-cursor");
    if (i === bagMenuIndex) {
      li.classList.add("selected");
      cursor.textContent = "►";
    } else {
      li.classList.remove("selected");
      cursor.textContent = " ";
    }
  });
  updateBagDescription();
}

function updateBagDescription() {
  const descEl = document.getElementById("bag-description");
  if (!descEl) return;
  const keys = Object.keys(ITEMS);
  if (bagMenuIndex >= 0 && bagMenuIndex < keys.length) {
    const item = ITEMS[keys[bagMenuIndex]];
    descEl.textContent = item.descKey ? t(item.descKey) : "";
  } else {
    descEl.textContent = "";
  }
}

function confirmBagChoice() {
  const items = Object.keys(ITEMS);
  if (bagMenuIndex >= items.length) return;

  const key = items[bagMenuIndex];
  const item = ITEMS[key];
  const playerFull = gameState.playerPokemon.currentPv >= gameState.playerPokemon.maxPv;

  if (item.type === "medicine" && playerFull) return;
  const activeIndex = gameState.team.indexOf(gameState.playerPokemon);
  resolvePlayerAction({ type: "item", itemKey: key, targetIndex: activeIndex });
}

// ==============================================
// Sous-menu POKÉMON (équipe style FireRed)
// ==============================================
function showTeamPanel() {
  document.getElementById("battle-main-menu").classList.add("hidden");
  battleMenuState = "team";
  teamMenuIndex = 0;
  teamConfirmIndex = -1;
  renderTeamList();
  document.getElementById("battle-team-panel").classList.remove("hidden");
}

function renderSlotContent(mon, isActive) {
  const hpPercent = Math.max(0, (mon.currentPv / mon.maxPv) * 100);
  let hpColor = "#4CAF50";
  if (hpPercent <= 25) hpColor = "#F44336";
  else if (hpPercent <= 50) hpColor = "#FFC107";

  const data = POKEMON_DATA[mon.key];

  return `
    <img class="team-slot-sprite" src="${data.spriteFront}" alt="${pName(mon)}">
    <div class="team-slot-info">
      <div class="team-slot-name">${pName(mon)}</div>
      <div class="team-slot-level">${t("levelAbbr")}${mon.level}</div>
      <div class="team-hp-row">
        <span class="team-hp-label">${t("hpLabel")}</span>
        <div class="team-hp-bar">
          <div class="team-hp-fill" style="width:${hpPercent}%;background:${hpColor}"></div>
        </div>
      </div>
      <div class="team-hp-text">${mon.currentPv}/${mon.maxPv}</div>
    </div>
  `;
}

function renderTeamList() {
  // Remplir les 6 slots (0 = actif à gauche, 1-5 = droite)
  for (let i = 0; i < 6; i++) {
    const slot = document.getElementById("team-slot-" + i);
    if (!slot) continue;

    slot.innerHTML = "";
    slot.className = i === 0 ? "team-slot team-slot-active" : "team-slot";
    slot.onclick = null;

    const mon = gameState.team[i];
    if (!mon) {
      slot.classList.add("empty");
      continue;
    }

    const isActive = mon === gameState.playerPokemon;
    const isFainted = mon.currentPv <= 0;
    if (isFainted) slot.classList.add("fainted");
    if (i === teamMenuIndex) slot.classList.add("selected");

    slot.innerHTML = renderSlotContent(mon, isActive);

    slot.addEventListener("click", () => {
      if (battlePaused) return;
      if (isActive || isFainted) return;
      if (teamConfirmIndex === i) {
        // Deuxième clic = confirmer le switch
        teamConfirmIndex = -1;
        document.querySelector(".team-prompt").textContent = t("chooseAPokemon");
        resolvePlayerAction({ type: "switch", targetIndex: i });
      } else {
        // Premier clic = sélectionner et demander confirmation
        teamConfirmIndex = i;
        teamMenuIndex = i;
        updateTeamSelection();
        document.querySelector(".team-prompt").textContent =
          t("confirmSwitch", { name: pName(mon) });
      }
    });

    // Synchroniser souris et clavier
    slot.addEventListener("mouseenter", () => {
      if (battleMenuState !== "team") return;
      if (i < gameState.team.length) {
        teamMenuIndex = i;
        updateTeamSelection();
      }
    });
  }

  // Handler bouton annuler
  const cancelBtn = document.querySelector(".team-cancel-btn");
  cancelBtn.onclick = () => {
    if (battlePaused) return;
    document.getElementById("battle-team-panel").classList.add("hidden");
    showBattleMainMenu();
  };
}

function updateTeamSelection() {
  for (let i = 0; i < 6; i++) {
    const slot = document.getElementById("team-slot-" + i);
    if (!slot) continue;
    if (i === teamMenuIndex) {
      slot.classList.add("selected");
    } else {
      slot.classList.remove("selected");
    }
  }
}

function confirmTeamChoice() {
  const mon = gameState.team[teamMenuIndex];
  if (!mon) return;
  if (mon === gameState.playerPokemon) return;
  if (mon.currentPv <= 0) return;
  if (teamConfirmIndex === teamMenuIndex) {
    // Déjà sélectionné → confirmer
    teamConfirmIndex = -1;
    document.querySelector(".team-prompt").textContent = t("chooseAPokemon");
    resolvePlayerAction({ type: "switch", targetIndex: teamMenuIndex });
  } else {
    // Sélectionner pour confirmation
    teamConfirmIndex = teamMenuIndex;
    document.querySelector(".team-prompt").textContent =
      t("confirmSwitch", { name: pName(mon) });
  }
}

// ==============================================
// Navigation clavier (appelée depuis controls.js)
// ==============================================
function handleBattleMenuKey(e) {
  if (battleMenuState === "main") {
    switch (e.key) {
      case "ArrowUp":    e.preventDefault(); navigateMainMenu("up"); break;
      case "ArrowDown":  e.preventDefault(); navigateMainMenu("down"); break;
      case "ArrowLeft":  e.preventDefault(); navigateMainMenu("left"); break;
      case "ArrowRight": e.preventDefault(); navigateMainMenu("right"); break;
      case "Enter":
      case " ":
        e.preventDefault();
        confirmMainMenuChoice();
        break;
    }
    return true;
  }

  if (battleMenuState === "moves") {
    // ESC → retour au menu principal
    if (e.key === "Escape") {
      e.preventDefault();
      showBattleMainMenu();
      return true;
    }
    // Les raccourcis 1-4 sont gérés dans le handler existant
    return false;
  }

  if (battleMenuState === "bag") {
    const itemCount = Object.keys(ITEMS).length;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (bagMenuIndex > 0) { bagMenuIndex--; updateBagSelection(); playMenuTick(); }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (bagMenuIndex < itemCount - 1) { bagMenuIndex++; updateBagSelection(); playMenuTick(); }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        confirmBagChoice();
        break;
      case "Escape":
        e.preventDefault();
        document.getElementById("battle-bag-panel").classList.add("hidden");
        showBattleMainMenu();
        break;
    }
    return true;
  }

  if (battleMenuState === "team") {
    const teamSize = gameState.team.length;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (teamMenuIndex > 0) { teamMenuIndex--; updateTeamSelection(); playMenuTick(); }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (teamMenuIndex < teamSize - 1) { teamMenuIndex++; updateTeamSelection(); playMenuTick(); }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        confirmTeamChoice();
        break;
      case "Escape":
        e.preventDefault();
        document.getElementById("battle-team-panel").classList.add("hidden");
        showBattleMainMenu();
        break;
    }
    return true;
  }

  return false;
}
