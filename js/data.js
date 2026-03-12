/* ==============================================
   POKÉRON — Données Pokémon & État du jeu
   ============================================== */

const POKEMON_DATA = {
  salameche: {
    name: { fr: "Salamèche", en: "Charmander" },
    type: "feu",
    typeName: { fr: "Feu", en: "Fire" },
    baseStats: { pv: 39, atk: 52, def: 43, atkSpe: 60, defSpe: 50, vitesse: 65 },
    learnset: [
      { level: 1,  move: { name: { fr: "Griffe", en: "Scratch" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Rugissement", en: "Growl" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 40, effect: "atkDown" }},
      { level: 4,  move: { name: { fr: "Flammèche", en: "Ember" }, type: "feu", category: "speciale", power: 40, accuracy: 100, pp: 25 }},
      { level: 8,  move: { name: { fr: "Brouillard", en: "Smokescreen" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 20, effect: "accuracyDown" }},
      { level: 12, move: { name: { fr: "Draco-Souffle", en: "Dragon Breath" }, type: "dragon", category: "speciale", power: 60, accuracy: 100, pp: 20 }},
      { level: 17, move: { name: { fr: "Crocs Feu", en: "Fire Fang" }, type: "feu", category: "physique", power: 65, accuracy: 95, pp: 15 }},
      { level: 20, move: { name: { fr: "Tranche", en: "Slash" }, type: "normal", category: "physique", power: 70, accuracy: 100, pp: 20 }},
      { level: 24, move: { name: { fr: "Lance-Flammes", en: "Flamethrower" }, type: "feu", category: "speciale", power: 90, accuracy: 100, pp: 15 }},
      { level: 28, move: { name: { fr: "Grimace", en: "Scary Face" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 10, effect: "speedDown" }},
      { level: 32, move: { name: { fr: "Danse Flammes", en: "Fire Spin" }, type: "feu", category: "speciale", power: 35, accuracy: 85, pp: 15 }},
      { level: 36, move: { name: { fr: "Feu d'Enfer", en: "Inferno" }, type: "feu", category: "speciale", power: 100, accuracy: 50, pp: 5 }},
      { level: 40, move: { name: { fr: "Boutefeu", en: "Flare Blitz" }, type: "feu", category: "physique", power: 120, accuracy: 100, pp: 15 }},
    ],
    evolvesTo: { key: "reptincel", level: 16 },
    color: "#F08030", emoji: "🔥",
    spriteFront: "assets/images/front_charmander.png",
    spriteBack: "assets/images/back_charmander.png",
    spriteOffset: {
      front: { x: "21px", y: "43px", scale: 0.85 },
      back:  { x: "20px", y: "-50px", scale: 0.9 }
    }
  },
  reptincel: {
    name: { fr: "Reptincel", en: "Charmeleon" },
    type: "feu",
    typeName: { fr: "Feu", en: "Fire" },
    baseStats: { pv: 58, atk: 64, def: 58, atkSpe: 80, defSpe: 65, vitesse: 80 },
    learnset: null, // hérite de salameche
    evolvesTo: { key: "dracaufeu", level: 36 },
    color: "#F08030", emoji: "🔥",
    spriteFront: "assets/images/front_charmeleon.png",
    spriteBack: "assets/images/back_charmeleon.png",
    spriteOffset: {
      front: { x: "-11px", y: "44px", scale: 1 },
      back:  { x: "80px", y: "-62px", scale: 1 }
    }
  },
  dracaufeu: {
    name: { fr: "Dracaufeu", en: "Charizard" },
    type: "feu",
    typeName: { fr: "Feu", en: "Fire" },
    baseStats: { pv: 78, atk: 84, def: 78, atkSpe: 109, defSpe: 85, vitesse: 100 },
    learnset: null, // hérite de salameche
    color: "#F08030", emoji: "🔥",
    spriteFront: "assets/images/front_charizard.png",
    spriteBack: "assets/images/back_charizard.png",
    spriteOffset: {
      front: { x: "5px", y: "16px", scale: 1 },
      back:  { x: "56px", y: "-74px", scale: 1 }
    }
  },
  carapuce: {
    name: { fr: "Carapuce", en: "Squirtle" },
    type: "eau",
    typeName: { fr: "Eau", en: "Water" },
    baseStats: { pv: 44, atk: 48, def: 65, atkSpe: 50, defSpe: 64, vitesse: 43 },
    learnset: [
      { level: 1,  move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Mimi-Queue", en: "Tail Whip" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 30, effect: "defDown" }},
      { level: 3,  move: { name: { fr: "Pistolet à O", en: "Water Gun" }, type: "eau", category: "speciale", power: 40, accuracy: 100, pp: 25 }},
      { level: 6,  move: { name: { fr: "Repli", en: "Withdraw" }, type: "eau", category: "statut", power: 0, accuracy: 100, pp: 40, effect: "defUp" }},
      { level: 9,  move: { name: { fr: "Tour Rapide", en: "Rapid Spin" }, type: "normal", category: "physique", power: 50, accuracy: 100, pp: 40 }},
      { level: 12, move: { name: { fr: "Morsure", en: "Bite" }, type: "tenebres", category: "physique", power: 60, accuracy: 100, pp: 25 }},
      { level: 15, move: { name: { fr: "Vibraqua", en: "Water Pulse" }, type: "eau", category: "speciale", power: 60, accuracy: 100, pp: 20 }},
      { level: 18, move: { name: { fr: "Abri", en: "Protect" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 10 }},
      { level: 21, move: { name: { fr: "Danse Pluie", en: "Rain Dance" }, type: "eau", category: "statut", power: 0, accuracy: 100, pp: 5 }},
      { level: 24, move: { name: { fr: "Hydro-Queue", en: "Aqua Tail" }, type: "eau", category: "physique", power: 90, accuracy: 90, pp: 10 }},
      { level: 27, move: { name: { fr: "Exuviation", en: "Shell Smash" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 15 }},
      { level: 30, move: { name: { fr: "Mur de Fer", en: "Iron Defense" }, type: "acier", category: "statut", power: 0, accuracy: 100, pp: 15, effect: "defUp" }},
      { level: 33, move: { name: { fr: "Hydrocanon", en: "Hydro Pump" }, type: "eau", category: "speciale", power: 110, accuracy: 80, pp: 5 }},
      { level: 36, move: { name: { fr: "Coud'Krâne", en: "Skull Bash" }, type: "normal", category: "physique", power: 130, accuracy: 100, pp: 10 }},
    ],
    evolvesTo: { key: "carabaffe", level: 16 },
    color: "#6890F0", emoji: "💧",
    spriteFront: "assets/images/front_squirtle.png",
    spriteBack: "assets/images/back_squirtle.png",
    spriteOffset: {
      front: { x: "-18px", y: "57px", scale: 0.9 },
      back:  { x: "53px", y: "-26px", scale: 0.9 }
    }
  },
  carabaffe: {
    name: { fr: "Carabaffe", en: "Wartortle" },
    type: "eau",
    typeName: { fr: "Eau", en: "Water" },
    baseStats: { pv: 59, atk: 63, def: 80, atkSpe: 65, defSpe: 80, vitesse: 58 },
    learnset: null, // hérite de carapuce
    evolvesTo: { key: "tortank", level: 36 },
    color: "#6890F0", emoji: "💧",
    spriteFront: "assets/images/front_wartortle.png",
    spriteBack: "assets/images/back_wartortle.png",
    spriteOffset: {
      front: { x: "10px", y: "19px", scale: 1 },
      back:  { x: "37px", y: "-30px", scale: 1 }
    }
  },
  tortank: {
    name: { fr: "Tortank", en: "Blastoise" },
    type: "eau",
    typeName: { fr: "Eau", en: "Water" },
    baseStats: { pv: 79, atk: 83, def: 100, atkSpe: 85, defSpe: 105, vitesse: 78 },
    learnset: null, // hérite de carapuce
    color: "#6890F0", emoji: "💧",
    spriteFront: "assets/images/front_blastoise.png",
    spriteBack: "assets/images/back_blastoise.png",
    spriteOffset: {
      front: { x: "-3px", y: "34px", scale: 1 },
      back:  { x: "42px", y: "-45px", scale: 1 }
    }
  },
  bulbizarre: {
    name: { fr: "Bulbizarre", en: "Bulbasaur" },
    type: "plante",
    typeName: { fr: "Plante", en: "Grass" },
    baseStats: { pv: 45, atk: 49, def: 49, atkSpe: 65, defSpe: 65, vitesse: 45 },
    learnset: [
      { level: 1,  move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Rugissement", en: "Growl" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 40, effect: "atkDown" }},
      { level: 3,  move: { name: { fr: "Fouet Lianes", en: "Vine Whip" }, type: "plante", category: "physique", power: 45, accuracy: 100, pp: 25 }},
      { level: 6,  move: { name: { fr: "Croissance", en: "Growth" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 20, effect: "atkUp" }},
      { level: 9,  move: { name: { fr: "Vampigraine", en: "Leech Seed" }, type: "plante", category: "statut", power: 0, accuracy: 90, pp: 10 }},
      { level: 12, move: { name: { fr: "Tranch'Herbe", en: "Razor Leaf" }, type: "plante", category: "physique", power: 55, accuracy: 95, pp: 25 }},
      { level: 15, move: { name: { fr: "Poudre Dodo", en: "Sleep Powder" }, type: "plante", category: "statut", power: 0, accuracy: 75, pp: 15 }},
      { level: 15, move: { name: { fr: "Poudre Toxik", en: "Poison Powder" }, type: "poison", category: "statut", power: 0, accuracy: 75, pp: 35 }},
      { level: 18, move: { name: { fr: "Canon Graine", en: "Seed Bomb" }, type: "plante", category: "physique", power: 80, accuracy: 100, pp: 15 }},
      { level: 21, move: { name: { fr: "Bélier", en: "Take Down" }, type: "normal", category: "physique", power: 90, accuracy: 85, pp: 20 }},
      { level: 24, move: { name: { fr: "Doux Parfum", en: "Sweet Scent" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 20, effect: "accuracyDown" }},
      { level: 27, move: { name: { fr: "Synthèse", en: "Synthesis" }, type: "plante", category: "statut", power: 0, accuracy: 100, pp: 5 }},
      { level: 30, move: { name: { fr: "Soucigraine", en: "Worry Seed" }, type: "plante", category: "statut", power: 0, accuracy: 100, pp: 10 }},
      { level: 33, move: { name: { fr: "Damoclès", en: "Double-Edge" }, type: "normal", category: "physique", power: 120, accuracy: 100, pp: 15 }},
      { level: 36, move: { name: { fr: "Lance-Soleil", en: "Solar Beam" }, type: "plante", category: "speciale", power: 120, accuracy: 100, pp: 10 }},
    ],
    evolvesTo: { key: "herbizarre", level: 16 },
    color: "#78C850", emoji: "🌿",
    spriteFront: "assets/images/front_bulbasaur.png",
    spriteBack: "assets/images/back_bulbasaur.png",
    spriteOffset: {
      front: { x: "-2px", y: "61px", scale: 0.9 },
      back:  { x: "22px", y: "-9px", scale: 0.8 }
    }
  },
  herbizarre: {
    name: { fr: "Herbizarre", en: "Ivysaur" },
    type: "plante",
    typeName: { fr: "Plante", en: "Grass" },
    baseStats: { pv: 60, atk: 62, def: 63, atkSpe: 80, defSpe: 80, vitesse: 60 },
    learnset: null, // hérite de bulbizarre
    evolvesTo: { key: "florizarre", level: 32 },
    color: "#78C850", emoji: "🌿",
    spriteFront: "assets/images/front_ivysaur.png",
    spriteBack: "assets/images/back_ivysaur.png",
    spriteOffset: {
      front: { x: "10px", y: "52px", scale: 1 },
      back:  { x: "28px", y: "-46px", scale: 1 }
    }
  },
  florizarre: {
    name: { fr: "Florizarre", en: "Venusaur" },
    type: "plante",
    typeName: { fr: "Plante", en: "Grass" },
    baseStats: { pv: 80, atk: 82, def: 83, atkSpe: 100, defSpe: 100, vitesse: 80 },
    learnset: null, // hérite de bulbizarre
    color: "#78C850", emoji: "🌿",
    spriteFront: "assets/images/front_venusaur.png",
    spriteBack: "assets/images/back_venusaur.png",
    spriteOffset: {
      front: { x: "5px", y: "28px", scale: 1 },
      back:  { x: "44px", y: "-45px", scale: 1 }
    }
  }
};

const TYPE_CHART = {
  feu:      { plante: 2, eau: 0.5, feu: 0.5, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 1 },
  eau:      { feu: 2, plante: 0.5, eau: 0.5, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 1 },
  plante:   { eau: 2, feu: 0.5, plante: 0.5, normal: 1, dragon: 1, poison: 0.5, tenebres: 1, acier: 1 },
  normal:   { feu: 1, eau: 1, plante: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 1 },
  dragon:   { dragon: 2, feu: 1, eau: 1, plante: 1, normal: 1, poison: 1, tenebres: 1, acier: 1 },
  poison:   { plante: 2, poison: 0.5, feu: 1, eau: 1, normal: 1, dragon: 1, tenebres: 1, acier: 1 },
  tenebres: { feu: 1, eau: 1, plante: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 1 },
  acier:    { feu: 1, eau: 1, plante: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 1 }
};

const MATCHUPS = {
  salameche: "bulbizarre", reptincel: "herbizarre", dracaufeu: "florizarre",
  carapuce: "salameche",   carabaffe: "reptincel",  tortank: "dracaufeu",
  bulbizarre: "carapuce",  herbizarre: "carabaffe",  florizarre: "tortank"
};

const TYPE_NAMES = {
  feu:      { fr: "FEU",      en: "FIRE" },
  eau:      { fr: "EAU",      en: "WATER" },
  plante:   { fr: "PLANTE",   en: "GRASS" },
  normal:   { fr: "NORMAL",   en: "NORMAL" },
  dragon:   { fr: "DRAGON",   en: "DRAGON" },
  poison:   { fr: "POISON",   en: "POISON" },
  tenebres: { fr: "TÉNÈBRES", en: "DARK" },
  acier:    { fr: "ACIER",    en: "STEEL" }
};

// Chaînes d'évolution : remonte jusqu'à la forme de base pour trouver le learnset
const EVOLUTION_CHAINS = {
  reptincel: "salameche", dracaufeu: "salameche",
  carabaffe: "carapuce",  tortank: "carapuce",
  herbizarre: "bulbizarre", florizarre: "bulbizarre"
};

function getLearnset(key) {
  const data = POKEMON_DATA[key];
  if (data.learnset) return data.learnset;
  const baseKey = EVOLUTION_CHAINS[key];
  if (baseKey) return POKEMON_DATA[baseKey].learnset;
  return null;
}

let gameState = {
  playerPokemon: null,
  enemyPokemon: null,
  combatNumber: 0,
  battleActive: false
};
