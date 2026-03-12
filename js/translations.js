/* ==============================================
   POKÉRON — Traductions FR/EN
   ============================================== */

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
    vitLabel: "Vitesse",
    accuracyLabel: "Précision",
    attackMissed: "L'attaque a échoué !",
    statFell: "{stat} de {name} baisse !",
    statRose: "{stat} de {name} augmente !",
    learnedMove: "{name} apprend {move} !",
    wantsToLearn: "{name} veut apprendre {move}.",
    butCantLearn: "Mais {name} connaît déjà 4 attaques.",
    replaceWhich: "Oublier quelle attaque pour {move} ?",
    forgotMove: "{name} oublie {move}...",
    didNotLearn: "{name} n'a pas appris {move}.",
    dontLearn: "Ne pas apprendre",
    evolving: "{name} évolue !",
    evolved: "Félicitations ! {old} évolue en {new} !"
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
    vitLabel: "Speed",
    accuracyLabel: "Accuracy",
    attackMissed: "The attack missed!",
    statFell: "{name}'s {stat} fell!",
    statRose: "{name}'s {stat} rose!",
    learnedMove: "{name} learned {move}!",
    wantsToLearn: "{name} wants to learn {move}.",
    butCantLearn: "But {name} already knows 4 moves.",
    replaceWhich: "Forget which move for {move}?",
    forgotMove: "{name} forgot {move}...",
    didNotLearn: "{name} did not learn {move}.",
    dontLearn: "Don't learn",
    evolving: "{name} is evolving!",
    evolved: "Congratulations! {old} evolved into {new}!"
  }
};

// --- Fonctions de traduction ---
function t(key, params = {}) {
  let text = translations[settings.lang]?.[key] ?? translations.fr[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, v);
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
