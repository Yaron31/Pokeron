/* ==============================================
   POKÉRON — Données Pokémon & État du jeu
   ============================================== */

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
    spriteBack: "assets/images/back_charmander.png",
    spriteOffset: {
      front: { x: "-8px", y: "0px", scale: 1 },
      back:  { x: "10px", y: "0px", scale: 1 }
    }
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
    spriteBack: "assets/images/back_squirtle.png",
    spriteOffset: {
      front: { x: "0px", y: "0px", scale: 1 },
      back:  { x: "5px", y: "0px", scale: 1 }
    }
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
    spriteBack: "assets/images/back_bulbasaur.png",
    spriteOffset: {
      front: { x: "-5px", y: "0px", scale: 1 },
      back:  { x: "5px", y: "0px", scale: 1 }
    }
  }
};

const TYPE_CHART = {
  feu:    { plante: 2, eau: 0.5, feu: 0.5, normal: 1 },
  eau:    { feu: 2, plante: 0.5, eau: 0.5, normal: 1 },
  plante: { eau: 2, feu: 0.5, plante: 0.5, normal: 1 },
  normal: { feu: 1, eau: 1, plante: 1, normal: 1 }
};

const MATCHUPS = { salameche: "bulbizarre", carapuce: "salameche", bulbizarre: "carapuce" };

const TYPE_NAMES = {
  feu:    { fr: "FEU",    en: "FIRE" },
  eau:    { fr: "EAU",    en: "WATER" },
  plante: { fr: "PLANTE", en: "GRASS" },
  normal: { fr: "NORMAL", en: "NORMAL" }
};

let gameState = {
  playerPokemon: null,
  enemyPokemon: null,
  combatNumber: 0,
  battleActive: false
};
