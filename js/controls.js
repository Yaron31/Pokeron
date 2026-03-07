/* ==============================================
   POKÉRON — Gestion clavier (starter + combat)
   ============================================== */

let starterIndex = 0;
function getStarterCards() { return document.querySelectorAll(".pokeball-container"); }

document.addEventListener("keydown", (e) => {
  // --- Écran titre ---
  if (currentScreen === "press-start") {
    if (introPlaying) return;
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      showMenu();
    }
    return;
  }

  // --- Menu principal ---
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

  // --- Choix du starter ---
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
