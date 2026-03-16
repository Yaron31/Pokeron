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
    spriteFront: "assets/images/front_pokemon/front_charmander.png",
    spriteBack: "assets/images/back_pokemon/back_charmander.png",
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
    spriteFront: "assets/images/front_pokemon/front_charmeleon.png",
    spriteBack: "assets/images/back_pokemon/back_charmeleon.png",
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
    spriteFront: "assets/images/front_pokemon/front_charizard.png",
    spriteBack: "assets/images/back_pokemon/back_charizard.png",
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
    spriteFront: "assets/images/front_pokemon/front_squirtle.png",
    spriteBack: "assets/images/back_pokemon/back_squirtle.png",
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
    spriteFront: "assets/images/front_pokemon/front_wartortle.png",
    spriteBack: "assets/images/back_pokemon/back_wartortle.png",
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
    spriteFront: "assets/images/front_pokemon/front_blastoise.png",
    spriteBack: "assets/images/back_pokemon/back_blastoise.png",
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
    spriteFront: "assets/images/front_pokemon/front_bulbasaur.png",
    spriteBack: "assets/images/back_pokemon/back_bulbasaur.png",
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
    spriteFront: "assets/images/front_pokemon/front_ivysaur.png",
    spriteBack: "assets/images/back_pokemon/back_ivysaur.png",
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
    spriteFront: "assets/images/front_pokemon/front_venusaur.png",
    spriteBack: "assets/images/back_pokemon/back_venusaur.png",
    spriteOffset: {
      front: { x: "5px", y: "28px", scale: 1 },
      back:  { x: "44px", y: "-45px", scale: 1 }
    }
  },

  // ========== POKÉMON SAUVAGES (Gen 1) ==========

  rattata: {
    name: { fr: "Rattata", en: "Rattata" },
    type: "normal",
    typeName: { fr: "Normal", en: "Normal" },
    baseStats: { pv: 30, atk: 56, def: 35, atkSpe: 25, defSpe: 35, vitesse: 72 },
    catchRate: 255,
    learnset: [
      { level: 1,  move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Mimi-Queue", en: "Tail Whip" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 30, effect: "defDown" }},
      { level: 4,  move: { name: { fr: "Vive-Attaque", en: "Quick Attack" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 30 }},
      { level: 7,  move: { name: { fr: "Puissance", en: "Focus Energy" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 30, effect: "atkUp" }},
      { level: 10, move: { name: { fr: "Morsure", en: "Bite" }, type: "tenebres", category: "physique", power: 60, accuracy: 100, pp: 25 }},
      { level: 13, move: { name: { fr: "Poursuite", en: "Pursuit" }, type: "tenebres", category: "physique", power: 40, accuracy: 100, pp: 20 }},
      { level: 16, move: { name: { fr: "Croc de Mort", en: "Hyper Fang" }, type: "normal", category: "physique", power: 80, accuracy: 90, pp: 15 }},
      { level: 20, move: { name: { fr: "Damoclès", en: "Double-Edge" }, type: "normal", category: "physique", power: 120, accuracy: 100, pp: 15 }}
    ],
    evolvesTo: { key: "rattatac", level: 20 },
    color: "#A8A878", emoji: "🐭",
    spriteFront: "assets/images/front_pokemon/front_rattata.png",
    spriteBack: "assets/images/back_pokemon/back_rattata.png",
    spriteOffset: {
      front: { x: "0px", y: "50px", scale: 1.0 },
      back:  { x: "30px", y: "-10px", scale: 1.0 }
    }
  },
  rattatac: {
    name: { fr: "Rattatac", en: "Raticate" },
    type: "normal",
    typeName: { fr: "Normal", en: "Normal" },
    baseStats: { pv: 55, atk: 81, def: 60, atkSpe: 50, defSpe: 70, vitesse: 97 },
    catchRate: 127,
    learnset: null,
    color: "#A8A878", emoji: "🐭",
    spriteFront: "assets/images/front_pokemon/front_raticate.png",
    spriteBack: "assets/images/back_pokemon/back_raticate.png",
    spriteOffset: {
      front: { x: "0px", y: "40px", scale: 1.0 },
      back:  { x: "30px", y: "-20px", scale: 1.0 }
    }
  },

  roucool: {
    name: { fr: "Roucool", en: "Pidgey" },
    type: "normal",
    typeName: { fr: "Normal", en: "Normal" },
    baseStats: { pv: 40, atk: 45, def: 40, atkSpe: 35, defSpe: 35, vitesse: 56 },
    catchRate: 255,
    learnset: [
      { level: 1,  move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 5,  move: { name: { fr: "Jet de Sable", en: "Sand Attack" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 15, effect: "accuracyDown" }},
      { level: 9,  move: { name: { fr: "Tornade", en: "Gust" }, type: "vol", category: "speciale", power: 40, accuracy: 100, pp: 35 }},
      { level: 13, move: { name: { fr: "Vive-Attaque", en: "Quick Attack" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 30 }},
      { level: 17, move: { name: { fr: "Cyclone", en: "Whirlwind" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 20 }},
      { level: 21, move: { name: { fr: "Cru-Aile", en: "Wing Attack" }, type: "vol", category: "physique", power: 60, accuracy: 100, pp: 35 }},
      { level: 25, move: { name: { fr: "Aéropique", en: "Aerial Ace" }, type: "vol", category: "physique", power: 60, accuracy: 100, pp: 20 }}
    ],
    evolvesTo: { key: "roucoups", level: 18 },
    color: "#A8A878", emoji: "🐦",
    spriteFront: "assets/images/front_pokemon/front_pidgey.png",
    spriteBack: "assets/images/back_pokemon/back_pidgey.png",
    spriteOffset: {
      front: { x: "0px", y: "50px", scale: 1.0 },
      back:  { x: "30px", y: "-10px", scale: 1.0 }
    }
  },
  roucoups: {
    name: { fr: "Roucoups", en: "Pidgeotto" },
    type: "normal",
    typeName: { fr: "Normal", en: "Normal" },
    baseStats: { pv: 63, atk: 60, def: 55, atkSpe: 50, defSpe: 50, vitesse: 71 },
    catchRate: 120,
    learnset: null,
    color: "#A8A878", emoji: "🐦",
    spriteFront: "assets/images/front_pokemon/front_pidgeotto.png",
    spriteBack: "assets/images/back_pokemon/back_pidgeotto.png",
    spriteOffset: {
      front: { x: "0px", y: "30px", scale: 1.0 },
      back:  { x: "30px", y: "-20px", scale: 1.0 }
    }
  },

  pikachu: {
    name: { fr: "Pikachu", en: "Pikachu" },
    type: "electrik",
    typeName: { fr: "Électrik", en: "Electric" },
    baseStats: { pv: 35, atk: 55, def: 40, atkSpe: 50, defSpe: 50, vitesse: 90 },
    catchRate: 190,
    learnset: [
      { level: 1,  move: { name: { fr: "Éclair", en: "Thunder Shock" }, type: "electrik", category: "speciale", power: 40, accuracy: 100, pp: 30 }},
      { level: 1,  move: { name: { fr: "Rugissement", en: "Growl" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 40, effect: "atkDown" }},
      { level: 5,  move: { name: { fr: "Vive-Attaque", en: "Quick Attack" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 30 }},
      { level: 10, move: { name: { fr: "Cage-Éclair", en: "Thunder Wave" }, type: "electrik", category: "statut", power: 0, accuracy: 90, pp: 20, effect: "speedDown" }},
      { level: 13, move: { name: { fr: "Étincelle", en: "Spark" }, type: "electrik", category: "physique", power: 65, accuracy: 100, pp: 20 }},
      { level: 18, move: { name: { fr: "Queue de Fer", en: "Iron Tail" }, type: "acier", category: "physique", power: 100, accuracy: 75, pp: 15 }},
      { level: 21, move: { name: { fr: "Tonnerre", en: "Thunderbolt" }, type: "electrik", category: "speciale", power: 90, accuracy: 100, pp: 15 }},
      { level: 26, move: { name: { fr: "Fatal-Foudre", en: "Thunder" }, type: "electrik", category: "speciale", power: 110, accuracy: 70, pp: 10 }}
    ],
    color: "#F8D030", emoji: "⚡",
    spriteFront: "assets/images/front_pokemon/front_pikachu.png",
    spriteBack: "assets/images/back_pokemon/back_pikachu.png",
    spriteOffset: {
      front: { x: "0px", y: "45px", scale: 1.0 },
      back:  { x: "30px", y: "-15px", scale: 1.0 }
    }
  },

  chenipan: {
    name: { fr: "Chenipan", en: "Caterpie" },
    type: "insecte",
    typeName: { fr: "Insecte", en: "Bug" },
    baseStats: { pv: 45, atk: 30, def: 35, atkSpe: 20, defSpe: 20, vitesse: 45 },
    catchRate: 255,
    learnset: [
      { level: 1,  move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Sécrétion", en: "String Shot" }, type: "insecte", category: "statut", power: 0, accuracy: 95, pp: 40, effect: "speedDown" }},
      { level: 9,  move: { name: { fr: "Piqûre", en: "Bug Bite" }, type: "insecte", category: "physique", power: 60, accuracy: 100, pp: 20 }}
    ],
    evolvesTo: { key: "chrysacier", level: 7 },
    color: "#A8B820", emoji: "🐛",
    spriteFront: "assets/images/front_pokemon/front_caterpie.png",
    spriteBack: "assets/images/back_pokemon/back_caterpie.png",
    spriteOffset: {
      front: { x: "0px", y: "55px", scale: 1.0 },
      back:  { x: "30px", y: "-5px", scale: 1.0 }
    }
  },
  chrysacier: {
    name: { fr: "Chrysacier", en: "Metapod" },
    type: "insecte",
    typeName: { fr: "Insecte", en: "Bug" },
    baseStats: { pv: 50, atk: 20, def: 55, atkSpe: 25, defSpe: 25, vitesse: 30 },
    catchRate: 120,
    learnset: null,
    evolvesTo: { key: "papilusion", level: 10 },
    color: "#A8B820", emoji: "🐛",
    spriteFront: "assets/images/front_pokemon/front_metapod.png",
    spriteBack: "assets/images/back_pokemon/back_metapod.png",
    spriteOffset: {
      front: { x: "0px", y: "50px", scale: 1.0 },
      back:  { x: "30px", y: "-10px", scale: 1.0 }
    }
  },
  papilusion: {
    name: { fr: "Papilusion", en: "Butterfree" },
    type: "insecte",
    typeName: { fr: "Insecte", en: "Bug" },
    baseStats: { pv: 60, atk: 45, def: 50, atkSpe: 90, defSpe: 80, vitesse: 70 },
    catchRate: 45,
    learnset: [
      { level: 1,  move: { name: { fr: "Choc Mental", en: "Confusion" }, type: "psy", category: "speciale", power: 50, accuracy: 100, pp: 25 }},
      { level: 1,  move: { name: { fr: "Poudre Toxik", en: "Poison Powder" }, type: "poison", category: "statut", power: 0, accuracy: 75, pp: 35 }},
      { level: 1,  move: { name: { fr: "Poudre Dodo", en: "Sleep Powder" }, type: "plante", category: "statut", power: 0, accuracy: 75, pp: 15 }},
      { level: 12, move: { name: { fr: "Tornade", en: "Gust" }, type: "vol", category: "speciale", power: 40, accuracy: 100, pp: 35 }},
      { level: 16, move: { name: { fr: "Psyko", en: "Psybeam" }, type: "psy", category: "speciale", power: 65, accuracy: 100, pp: 20 }},
      { level: 22, move: { name: { fr: "Vent Argenté", en: "Silver Wind" }, type: "insecte", category: "speciale", power: 60, accuracy: 100, pp: 5 }},
      { level: 28, move: { name: { fr: "Bourdon", en: "Bug Buzz" }, type: "insecte", category: "speciale", power: 90, accuracy: 100, pp: 10 }}
    ],
    color: "#A8B820", emoji: "🦋",
    spriteFront: "assets/images/front_pokemon/front_butterfree.png",
    spriteBack: "assets/images/back_pokemon/back_butterfree.png",
    spriteOffset: {
      front: { x: "0px", y: "25px", scale: 1.0 },
      back:  { x: "30px", y: "-30px", scale: 1.0 }
    }
  },

  nidoranf: {
    name: { fr: "Nidoran♀", en: "Nidoran♀" },
    type: "poison",
    typeName: { fr: "Poison", en: "Poison" },
    baseStats: { pv: 55, atk: 47, def: 52, atkSpe: 40, defSpe: 40, vitesse: 41 },
    catchRate: 235,
    learnset: [
      { level: 1,  move: { name: { fr: "Griffe", en: "Scratch" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Rugissement", en: "Growl" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 40, effect: "atkDown" }},
      { level: 7,  move: { name: { fr: "Dard-Venin", en: "Poison Sting" }, type: "poison", category: "physique", power: 15, accuracy: 100, pp: 35 }},
      { level: 9,  move: { name: { fr: "Groz'Yeux", en: "Leer" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 30, effect: "defDown" }},
      { level: 13, move: { name: { fr: "Morsure", en: "Bite" }, type: "tenebres", category: "physique", power: 60, accuracy: 100, pp: 25 }},
      { level: 19, move: { name: { fr: "Double Pied", en: "Double Kick" }, type: "normal", category: "physique", power: 60, accuracy: 100, pp: 30 }},
      { level: 25, move: { name: { fr: "Direct Toxik", en: "Poison Jab" }, type: "poison", category: "physique", power: 80, accuracy: 100, pp: 20 }}
    ],
    evolvesTo: { key: "nidorina", level: 16 },
    color: "#A040A0", emoji: "♀",
    spriteFront: "assets/images/front_pokemon/front_nidoranf.png",
    spriteBack: "assets/images/back_pokemon/back_nidoranf.png",
    spriteOffset: {
      front: { x: "0px", y: "50px", scale: 1.0 },
      back:  { x: "30px", y: "-10px", scale: 1.0 }
    }
  },
  nidorina: {
    name: { fr: "Nidorina", en: "Nidorina" },
    type: "poison",
    typeName: { fr: "Poison", en: "Poison" },
    baseStats: { pv: 70, atk: 62, def: 67, atkSpe: 55, defSpe: 55, vitesse: 56 },
    catchRate: 120,
    learnset: null,
    color: "#A040A0", emoji: "♀",
    spriteFront: "assets/images/front_pokemon/front_nidorina.png",
    spriteBack: "assets/images/back_pokemon/back_nidorina.png",
    spriteOffset: {
      front: { x: "0px", y: "40px", scale: 1.0 },
      back:  { x: "30px", y: "-20px", scale: 1.0 }
    }
  },

  nidoranm: {
    name: { fr: "Nidoran♂", en: "Nidoran♂" },
    type: "poison",
    typeName: { fr: "Poison", en: "Poison" },
    baseStats: { pv: 46, atk: 57, def: 40, atkSpe: 40, defSpe: 40, vitesse: 50 },
    catchRate: 235,
    learnset: [
      { level: 1,  move: { name: { fr: "Griffe", en: "Scratch" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Groz'Yeux", en: "Leer" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 30, effect: "defDown" }},
      { level: 7,  move: { name: { fr: "Dard-Venin", en: "Poison Sting" }, type: "poison", category: "physique", power: 15, accuracy: 100, pp: 35 }},
      { level: 9,  move: { name: { fr: "Puissance", en: "Focus Energy" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 30, effect: "atkUp" }},
      { level: 13, move: { name: { fr: "Koud'Korne", en: "Horn Attack" }, type: "normal", category: "physique", power: 65, accuracy: 100, pp: 25 }},
      { level: 19, move: { name: { fr: "Double Pied", en: "Double Kick" }, type: "normal", category: "physique", power: 60, accuracy: 100, pp: 30 }},
      { level: 25, move: { name: { fr: "Direct Toxik", en: "Poison Jab" }, type: "poison", category: "physique", power: 80, accuracy: 100, pp: 20 }}
    ],
    evolvesTo: { key: "nidorino", level: 16 },
    color: "#A040A0", emoji: "♂",
    spriteFront: "assets/images/front_pokemon/front_nidoranm.png",
    spriteBack: "assets/images/back_pokemon/back_nidoranm.png",
    spriteOffset: {
      front: { x: "0px", y: "50px", scale: 1.0 },
      back:  { x: "30px", y: "-10px", scale: 1.0 }
    }
  },
  nidorino: {
    name: { fr: "Nidorino", en: "Nidorino" },
    type: "poison",
    typeName: { fr: "Poison", en: "Poison" },
    baseStats: { pv: 61, atk: 72, def: 57, atkSpe: 55, defSpe: 55, vitesse: 65 },
    catchRate: 120,
    learnset: null,
    color: "#A040A0", emoji: "♂",
    spriteFront: "assets/images/front_pokemon/front_nidorino.png",
    spriteBack: "assets/images/back_pokemon/back_nidorino.png",
    spriteOffset: {
      front: { x: "0px", y: "40px", scale: 1.0 },
      back:  { x: "30px", y: "-20px", scale: 1.0 }
    }
  },

  racaillou: {
    name: { fr: "Racaillou", en: "Geodude" },
    type: "roche",
    typeName: { fr: "Roche", en: "Rock" },
    baseStats: { pv: 40, atk: 80, def: 100, atkSpe: 30, defSpe: 30, vitesse: 20 },
    catchRate: 255,
    learnset: [
      { level: 1,  move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }},
      { level: 1,  move: { name: { fr: "Boul'Armure", en: "Defense Curl" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 40, effect: "defUp" }},
      { level: 6,  move: { name: { fr: "Jet-Pierres", en: "Rock Throw" }, type: "roche", category: "physique", power: 50, accuracy: 90, pp: 15 }},
      { level: 10, move: { name: { fr: "Ampleur", en: "Magnitude" }, type: "roche", category: "physique", power: 70, accuracy: 100, pp: 30 }},
      { level: 16, move: { name: { fr: "Destruction", en: "Self-Destruct" }, type: "normal", category: "physique", power: 200, accuracy: 100, pp: 5 }},
      { level: 21, move: { name: { fr: "Éboulement", en: "Rock Slide" }, type: "roche", category: "physique", power: 75, accuracy: 90, pp: 10 }},
      { level: 26, move: { name: { fr: "Séisme", en: "Earthquake" }, type: "roche", category: "physique", power: 100, accuracy: 100, pp: 10 }}
    ],
    evolvesTo: { key: "gravalanch", level: 25 },
    color: "#B8A038", emoji: "🪨",
    spriteFront: "assets/images/front_pokemon/front_geodude.png",
    spriteBack: "assets/images/back_pokemon/back_geodude.png",
    spriteOffset: {
      front: { x: "0px", y: "45px", scale: 1.0 },
      back:  { x: "30px", y: "-15px", scale: 1.0 }
    }
  },
  gravalanch: {
    name: { fr: "Gravalanch", en: "Graveler" },
    type: "roche",
    typeName: { fr: "Roche", en: "Rock" },
    baseStats: { pv: 55, atk: 95, def: 115, atkSpe: 45, defSpe: 45, vitesse: 35 },
    catchRate: 120,
    learnset: null,
    color: "#B8A038", emoji: "🪨",
    spriteFront: "assets/images/front_pokemon/front_graveler.png",
    spriteBack: "assets/images/back_pokemon/back_graveler.png",
    spriteOffset: {
      front: { x: "0px", y: "35px", scale: 1.0 },
      back:  { x: "30px", y: "-25px", scale: 1.0 }
    }
  },

  abra: {
    name: { fr: "Abra", en: "Abra" },
    type: "psy",
    typeName: { fr: "Psy", en: "Psychic" },
    baseStats: { pv: 25, atk: 20, def: 15, atkSpe: 105, defSpe: 55, vitesse: 90 },
    catchRate: 200,
    learnset: [
      { level: 1,  move: { name: { fr: "Téléport", en: "Teleport" }, type: "psy", category: "statut", power: 0, accuracy: 100, pp: 20 }},
      { level: 1,  move: { name: { fr: "Choc Mental", en: "Confusion" }, type: "psy", category: "speciale", power: 50, accuracy: 100, pp: 25 }},
      { level: 16, move: { name: { fr: "Psyko", en: "Psybeam" }, type: "psy", category: "speciale", power: 65, accuracy: 100, pp: 20 }},
      { level: 21, move: { name: { fr: "Coupe Psycho", en: "Psycho Cut" }, type: "psy", category: "physique", power: 70, accuracy: 100, pp: 20 }},
      { level: 26, move: { name: { fr: "Psyko", en: "Psychic" }, type: "psy", category: "speciale", power: 90, accuracy: 100, pp: 10 }}
    ],
    evolvesTo: { key: "kadabra", level: 16 },
    color: "#F85888", emoji: "🔮",
    spriteFront: "assets/images/front_pokemon/front_abra.png",
    spriteBack: "assets/images/back_pokemon/back_abra.png",
    spriteOffset: {
      front: { x: "0px", y: "45px", scale: 1.0 },
      back:  { x: "30px", y: "-15px", scale: 1.0 }
    }
  },
  kadabra: {
    name: { fr: "Kadabra", en: "Kadabra" },
    type: "psy",
    typeName: { fr: "Psy", en: "Psychic" },
    baseStats: { pv: 40, atk: 35, def: 30, atkSpe: 120, defSpe: 70, vitesse: 105 },
    catchRate: 100,
    learnset: null,
    color: "#F85888", emoji: "🔮",
    spriteFront: "assets/images/front_pokemon/front_kadabra.png",
    spriteBack: "assets/images/back_pokemon/back_kadabra.png",
    spriteOffset: {
      front: { x: "0px", y: "30px", scale: 1.0 },
      back:  { x: "30px", y: "-25px", scale: 1.0 }
    }
  },

  nosferapti: {
    name: { fr: "Nosferapti", en: "Zubat" },
    type: "poison",
    typeName: { fr: "Poison", en: "Poison" },
    baseStats: { pv: 40, atk: 45, def: 35, atkSpe: 30, defSpe: 40, vitesse: 55 },
    catchRate: 255,
    learnset: [
      { level: 1,  move: { name: { fr: "Vampirisme", en: "Leech Life" }, type: "insecte", category: "physique", power: 80, accuracy: 100, pp: 10 }},
      { level: 5,  move: { name: { fr: "Ultrason", en: "Supersonic" }, type: "normal", category: "statut", power: 0, accuracy: 55, pp: 20, effect: "accuracyDown" }},
      { level: 9,  move: { name: { fr: "Morsure", en: "Bite" }, type: "tenebres", category: "physique", power: 60, accuracy: 100, pp: 25 }},
      { level: 13, move: { name: { fr: "Cru-Aile", en: "Wing Attack" }, type: "vol", category: "physique", power: 60, accuracy: 100, pp: 35 }},
      { level: 17, move: { name: { fr: "Onde Folie", en: "Confuse Ray" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 10, effect: "accuracyDown" }},
      { level: 21, move: { name: { fr: "Tranch'Air", en: "Air Slash" }, type: "vol", category: "speciale", power: 75, accuracy: 95, pp: 15 }},
      { level: 25, move: { name: { fr: "Direct Toxik", en: "Poison Jab" }, type: "poison", category: "physique", power: 80, accuracy: 100, pp: 20 }}
    ],
    evolvesTo: { key: "nosferalto", level: 22 },
    color: "#A040A0", emoji: "🦇",
    spriteFront: "assets/images/front_pokemon/front_zubat.png",
    spriteBack: "assets/images/back_pokemon/back_zubat.png",
    spriteOffset: {
      front: { x: "0px", y: "40px", scale: 1.0 },
      back:  { x: "30px", y: "-15px", scale: 1.0 }
    }
  },
  nosferalto: {
    name: { fr: "Nosferalto", en: "Golbat" },
    type: "poison",
    typeName: { fr: "Poison", en: "Poison" },
    baseStats: { pv: 75, atk: 80, def: 70, atkSpe: 65, defSpe: 75, vitesse: 90 },
    catchRate: 90,
    learnset: null,
    color: "#A040A0", emoji: "🦇",
    spriteFront: "assets/images/front_pokemon/front_golbat.png",
    spriteBack: "assets/images/back_pokemon/back_golbat.png",
    spriteOffset: {
      front: { x: "0px", y: "25px", scale: 1.0 },
      back:  { x: "30px", y: "-30px", scale: 1.0 }
    }
  },

  magicarpe: {
    name: { fr: "Magicarpe", en: "Magikarp" },
    type: "eau",
    typeName: { fr: "Eau", en: "Water" },
    baseStats: { pv: 20, atk: 10, def: 55, atkSpe: 15, defSpe: 20, vitesse: 80 },
    catchRate: 255,
    learnset: [
      { level: 1,  move: { name: { fr: "Trempette", en: "Splash" }, type: "normal", category: "statut", power: 0, accuracy: 100, pp: 40 }},
      { level: 15, move: { name: { fr: "Charge", en: "Tackle" }, type: "normal", category: "physique", power: 40, accuracy: 100, pp: 35 }}
    ],
    evolvesTo: { key: "leviator", level: 20 },
    color: "#6890F0", emoji: "🐟",
    spriteFront: "assets/images/front_pokemon/front_magikarp.png",
    spriteBack: "assets/images/back_pokemon/back_magikarp.png",
    spriteOffset: {
      front: { x: "0px", y: "40px", scale: 1.0 },
      back:  { x: "30px", y: "-15px", scale: 1.0 }
    }
  },
  leviator: {
    name: { fr: "Léviator", en: "Gyarados" },
    type: "eau",
    typeName: { fr: "Eau", en: "Water" },
    baseStats: { pv: 95, atk: 125, def: 79, atkSpe: 60, defSpe: 100, vitesse: 81 },
    catchRate: 45,
    learnset: [
      { level: 1,  move: { name: { fr: "Morsure", en: "Bite" }, type: "tenebres", category: "physique", power: 60, accuracy: 100, pp: 25 }},
      { level: 1,  move: { name: { fr: "Draco-Rage", en: "Dragon Rage" }, type: "dragon", category: "speciale", power: 60, accuracy: 100, pp: 10 }},
      { level: 20, move: { name: { fr: "Cascade", en: "Waterfall" }, type: "eau", category: "physique", power: 80, accuracy: 100, pp: 15 }},
      { level: 24, move: { name: { fr: "Crocs Givre", en: "Ice Fang" }, type: "eau", category: "physique", power: 65, accuracy: 95, pp: 15 }},
      { level: 29, move: { name: { fr: "Hydrocanon", en: "Hydro Pump" }, type: "eau", category: "speciale", power: 110, accuracy: 80, pp: 5 }},
      { level: 33, move: { name: { fr: "Ouragan", en: "Hurricane" }, type: "vol", category: "speciale", power: 110, accuracy: 70, pp: 10 }}
    ],
    color: "#6890F0", emoji: "🐉",
    spriteFront: "assets/images/front_pokemon/front_gyarados.png",
    spriteBack: "assets/images/back_pokemon/back_gyarados.png",
    spriteOffset: {
      front: { x: "0px", y: "10px", scale: 1.0 },
      back:  { x: "30px", y: "-40px", scale: 1.0 }
    }
  }
};

const TYPE_CHART = {
  feu:      { plante: 2, eau: 0.5, feu: 0.5, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 2, vol: 1, electrik: 1, insecte: 2, roche: 0.5, psy: 1 },
  eau:      { feu: 2, plante: 0.5, eau: 0.5, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 1, vol: 1, electrik: 1, insecte: 1, roche: 2, psy: 1 },
  plante:   { eau: 2, feu: 0.5, plante: 0.5, normal: 1, dragon: 1, poison: 0.5, tenebres: 1, acier: 1, vol: 0.5, electrik: 1, insecte: 0.5, roche: 2, psy: 1 },
  normal:   { feu: 1, eau: 1, plante: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 0.5, vol: 1, electrik: 1, insecte: 1, roche: 0.5, psy: 1 },
  dragon:   { dragon: 2, feu: 1, eau: 1, plante: 1, normal: 1, poison: 1, tenebres: 1, acier: 0.5, vol: 1, electrik: 1, insecte: 1, roche: 1, psy: 1 },
  poison:   { plante: 2, poison: 0.5, feu: 1, eau: 1, normal: 1, dragon: 1, tenebres: 1, acier: 0, vol: 1, electrik: 1, insecte: 1, roche: 0.5, psy: 1 },
  tenebres: { psy: 2, tenebres: 0.5, feu: 1, eau: 1, plante: 1, normal: 1, dragon: 1, poison: 1, acier: 1, vol: 1, electrik: 1, insecte: 1, roche: 1 },
  acier:    { roche: 2, feu: 0.5, eau: 0.5, plante: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 0.5, vol: 1, electrik: 0.5, insecte: 1, psy: 1 },
  vol:      { plante: 2, insecte: 2, feu: 1, eau: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 0.5, vol: 1, electrik: 0.5, roche: 0.5, psy: 1 },
  electrik: { eau: 2, vol: 2, feu: 1, plante: 0.5, normal: 1, dragon: 0.5, poison: 1, tenebres: 1, acier: 1, electrik: 0.5, insecte: 1, roche: 1, psy: 1 },
  insecte:  { plante: 2, psy: 2, tenebres: 2, feu: 0.5, eau: 1, normal: 1, dragon: 1, poison: 0.5, acier: 0.5, vol: 0.5, electrik: 1, insecte: 1, roche: 1 },
  roche:    { feu: 2, vol: 2, insecte: 2, eau: 1, plante: 1, normal: 1, dragon: 1, poison: 1, tenebres: 1, acier: 0.5, electrik: 1, roche: 1, psy: 1 },
  psy:      { poison: 2, feu: 1, eau: 1, plante: 1, normal: 1, dragon: 1, tenebres: 0, acier: 0.5, vol: 1, electrik: 1, insecte: 1, roche: 1, psy: 0.5 }
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
  acier:    { fr: "ACIER",    en: "STEEL" },
  vol:      { fr: "VOL",      en: "FLYING" },
  electrik: { fr: "ÉLECTRIK", en: "ELECTRIC" },
  insecte:  { fr: "INSECTE",  en: "BUG" },
  roche:    { fr: "ROCHE",    en: "ROCK" },
  psy:      { fr: "PSY",      en: "PSYCHIC" }
};

// Chaînes d'évolution : remonte jusqu'à la forme de base pour trouver le learnset
const EVOLUTION_CHAINS = {
  reptincel: "salameche", dracaufeu: "salameche",
  carabaffe: "carapuce",  tortank: "carapuce",
  herbizarre: "bulbizarre", florizarre: "bulbizarre",
  rattatac: "rattata",
  roucoups: "roucool",
  chrysacier: "chenipan", papilusion: "chenipan",
  nidorina: "nidoranf",
  nidorino: "nidoranm",
  gravalanch: "racaillou",
  kadabra: "abra",
  nosferalto: "nosferapti",
  leviator: "magicarpe"
};

// Pool de Pokémon sauvages (formes de base uniquement)
const WILD_POOL = [
  "rattata", "roucool", "pikachu", "chenipan",
  "nidoranf", "nidoranm", "racaillou", "abra",
  "nosferapti", "magicarpe"
];

function getLearnset(key) {
  const data = POKEMON_DATA[key];
  if (data.learnset) return data.learnset;
  const baseKey = EVOLUTION_CHAINS[key];
  if (baseKey) return POKEMON_DATA[baseKey].learnset;
  return null;
}

// Définitions des objets (sac)
const ITEMS = {
  potion: {
    name: { fr: "Potion", en: "Potion" },
    healAmount: 20,
    descKey: "itemDesc_potion",
    icon: "assets/images/item/potion.png",
    type: "medicine"
  },
  pokeball: {
    name: { fr: "Poké Ball", en: "Poké Ball" },
    descKey: "itemDesc_pokeball",
    icon: "assets/images/item/pokeball_inventory.png",
    type: "ball"
  }
};

let gameState = {
  playerPokemon: null,
  enemyPokemon: null,
  combatNumber: 0,
  battleActive: false,
  team: [],
  inventory: { potion: Infinity, pokeball: Infinity },
  battleType: "rival",
  progressionRound: 1,
  wildBattlesRemaining: 0,
  wildBattlesTotal: 0,
  rivalStarterKey: null
};
