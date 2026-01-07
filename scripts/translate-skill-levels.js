/**
 * Script pour générer les traductions des niveaux de skills
 * basé sur les patterns de traduction pour chaque langue
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dictionnaires de traduction par langue
const translations = {
  FR: {
    Attack: "Attaque",
    Affinity: "Affinité",
    Defense: "Défense",
    Health: "Santé",
    Stamina: "Endurance",
    damage: "dégâts",
    resistance: "résistance",
    "Fire attack": "Attaque Feu",
    "Water attack": "Attaque Eau",
    "Ice attack": "Attaque Glace",
    "Thunder attack": "Attaque Foudre",
    "Dragon attack": "Attaque Dragon",
    "Fire resistance": "Résistance Feu",
    "Water resistance": "Résistance Eau",
    "Ice resistance": "Résistance Glace",
    "Thunder resistance": "Résistance Foudre",
    "Dragon resistance": "Résistance Dragon",
    "Poison buildup": "Accumulation Poison",
    "Paralysis buildup": "Accumulation Paralysie",
    "Sleep buildup": "Accumulation Sommeil",
    "Blast buildup": "Accumulation Explosion",
    "Stun buildup": "Accumulation Étourdissement",
    "while active": "quand actif",
    "while full": "quand plein",
    "when enraged": "quand enragé",
    Increases: "Augmente",
    Decreases: "Réduit",
    Reduces: "Réduit",
    "Slightly increases": "Augmente légèrement",
    "Moderately increases": "Augmente modérément",
    "Greatly increases": "Augmente grandement",
    "Significantly increases": "Augmente significativement",
    "Slightly decreases": "Réduit légèrement",
    "Moderately decreases": "Réduit modérément",
    "Greatly decreases": "Réduit grandement",
    "Slightly reduces": "Réduit légèrement",
    "Moderately reduces": "Réduit modérément",
    "Greatly reduces": "Réduit grandement",
    duration: "durée",
    chance: "chance",
    recovery: "récupération",
    "critical hits": "coups critiques",
    "damage dealt": "dégâts infligés",
    "damage taken": "dégâts subis",
    sharpness: "tranchant",
    "sharpness loss": "perte de tranchant",
    "elemental damage": "dégâts élémentaires",
    "elemental attack": "attaque élémentaire",
    Low: "Faible",
    Medium: "Moyen",
    High: "Élevé",
    Small: "Petit",
    Large: "Grand",
    Maximum: "Maximum",
    Nullifies: "Annule",
    Prevents: "Empêche",
    Extends: "Prolonge",
    effect: "effet",
    power: "puissance",
    guard: "garde",
    evading: "esquive",
    dodge: "esquive",
    "movement speed": "vitesse de déplacement",
  },

  ES: {
    Attack: "Ataque",
    Affinity: "Afinidad",
    Defense: "Defensa",
    Health: "Salud",
    Stamina: "Aguante",
    damage: "daño",
    resistance: "resistencia",
    "Fire attack": "Ataque Fuego",
    "Water attack": "Ataque Agua",
    "Ice attack": "Ataque Hielo",
    "Thunder attack": "Ataque Rayo",
    "Dragon attack": "Ataque Dragón",
    "Fire resistance": "Resistencia Fuego",
    "Water resistance": "Resistencia Agua",
    "Ice resistance": "Resistencia Hielo",
    "Thunder resistance": "Resistencia Rayo",
    "Dragon resistance": "Resistencia Dragón",
    "Poison buildup": "Acumulación Veneno",
    "Paralysis buildup": "Acumulación Parálisis",
    "Sleep buildup": "Acumulación Sueño",
    "Blast buildup": "Acumulación Explosión",
    "Stun buildup": "Acumulación Aturdimiento",
    "while active": "cuando está activo",
    "while full": "cuando está lleno",
    "when enraged": "cuando está enfurecido",
    Increases: "Aumenta",
    Decreases: "Reduce",
    Reduces: "Reduce",
    "Slightly increases": "Aumenta ligeramente",
    "Moderately increases": "Aumenta moderadamente",
    "Greatly increases": "Aumenta enormemente",
    "Significantly increases": "Aumenta significativamente",
    "Slightly decreases": "Reduce ligeramente",
    "Moderately decreases": "Reduce moderadamente",
    "Greatly decreases": "Reduce enormemente",
    "Slightly reduces": "Reduce ligeramente",
    "Moderately reduces": "Reduce moderadamente",
    "Greatly reduces": "Reduce enormemente",
    duration: "duración",
    chance: "probabilidad",
    recovery: "recuperación",
    "critical hits": "golpes críticos",
    "damage dealt": "daño infligido",
    "damage taken": "daño recibido",
    sharpness: "filo",
    "sharpness loss": "pérdida de filo",
    "elemental damage": "daño elemental",
    "elemental attack": "ataque elemental",
    Low: "Bajo",
    Medium: "Medio",
    High: "Alto",
    Small: "Pequeño",
    Large: "Grande",
    Maximum: "Máximo",
    Nullifies: "Anula",
    Prevents: "Previene",
    Extends: "Extiende",
    effect: "efecto",
    power: "poder",
    guard: "guardia",
    evading: "esquiva",
    dodge: "esquiva",
    "movement speed": "velocidad de movimiento",
  },

  DE: {
    Attack: "Angriff",
    Affinity: "Affinität",
    Defense: "Verteidigung",
    Health: "Gesundheit",
    Stamina: "Ausdauer",
    damage: "Schaden",
    resistance: "Resistenz",
    "Fire attack": "Feuer-Angriff",
    "Water attack": "Wasser-Angriff",
    "Ice attack": "Eis-Angriff",
    "Thunder attack": "Donner-Angriff",
    "Dragon attack": "Drachen-Angriff",
    "Fire resistance": "Feuer-Resistenz",
    "Water resistance": "Wasser-Resistenz",
    "Ice resistance": "Eis-Resistenz",
    "Thunder resistance": "Donner-Resistenz",
    "Dragon resistance": "Drachen-Resistenz",
    "Poison buildup": "Gift-Aufbau",
    "Paralysis buildup": "Paralyse-Aufbau",
    "Sleep buildup": "Schlaf-Aufbau",
    "Blast buildup": "Spreng-Aufbau",
    "Stun buildup": "Betäubungs-Aufbau",
    "while active": "wenn aktiv",
    "while full": "wenn voll",
    "when enraged": "wenn wütend",
    Increases: "Erhöht",
    Decreases: "Verringert",
    Reduces: "Reduziert",
    "Slightly increases": "Erhöht leicht",
    "Moderately increases": "Erhöht mäßig",
    "Greatly increases": "Erhöht stark",
    "Significantly increases": "Erhöht erheblich",
    "Slightly decreases": "Verringert leicht",
    "Moderately decreases": "Verringert mäßig",
    "Greatly decreases": "Verringert stark",
    "Slightly reduces": "Reduziert leicht",
    "Moderately reduces": "Reduziert mäßig",
    "Greatly reduces": "Reduziert stark",
    duration: "Dauer",
    chance: "Chance",
    recovery: "Erholung",
    "critical hits": "kritische Treffer",
    "damage dealt": "zugefügter Schaden",
    "damage taken": "erlittener Schaden",
    sharpness: "Schärfe",
    "sharpness loss": "Schärfeverlust",
    "elemental damage": "Elementarschaden",
    "elemental attack": "Elementarangriff",
    Low: "Niedrig",
    Medium: "Mittel",
    High: "Hoch",
    Small: "Klein",
    Large: "Groß",
    Maximum: "Maximum",
    Nullifies: "Neutralisiert",
    Prevents: "Verhindert",
    Extends: "Verlängert",
    effect: "Effekt",
    power: "Kraft",
    guard: "Block",
    evading: "Ausweichen",
    dodge: "Ausweichen",
    "movement speed": "Bewegungsgeschwindigkeit",
  },

  IT: {
    Attack: "Attacco",
    Affinity: "Affinità",
    Defense: "Difesa",
    Health: "Salute",
    Stamina: "Vigore",
    damage: "danni",
    resistance: "resistenza",
    "Fire attack": "Attacco Fuoco",
    "Water attack": "Attacco Acqua",
    "Ice attack": "Attacco Ghiaccio",
    "Thunder attack": "Attacco Tuono",
    "Dragon attack": "Attacco Drago",
    "Fire resistance": "Resistenza Fuoco",
    "Water resistance": "Resistenza Acqua",
    "Ice resistance": "Resistenza Ghiaccio",
    "Thunder resistance": "Resistenza Tuono",
    "Dragon resistance": "Resistenza Drago",
    "Poison buildup": "Accumulo Veleno",
    "Paralysis buildup": "Accumulo Paralisi",
    "Sleep buildup": "Accumulo Sonno",
    "Blast buildup": "Accumulo Esplosione",
    "Stun buildup": "Accumulo Stordimento",
    "while active": "quando attivo",
    "while full": "quando pieno",
    "when enraged": "quando infuriato",
    Increases: "Aumenta",
    Decreases: "Diminuisce",
    Reduces: "Riduce",
    "Slightly increases": "Aumenta leggermente",
    "Moderately increases": "Aumenta moderatamente",
    "Greatly increases": "Aumenta notevolmente",
    "Significantly increases": "Aumenta significativamente",
    "Slightly decreases": "Diminuisce leggermente",
    "Moderately decreases": "Diminuisce moderatamente",
    "Greatly decreases": "Diminuisce notevolmente",
    "Slightly reduces": "Riduce leggermente",
    "Moderately reduces": "Riduce moderatamente",
    "Greatly reduces": "Riduce notevolmente",
    duration: "durata",
    chance: "probabilità",
    recovery: "recupero",
    "critical hits": "colpi critici",
    "damage dealt": "danni inflitti",
    "damage taken": "danni subiti",
    sharpness: "affilatura",
    "sharpness loss": "perdita affilatura",
    "elemental damage": "danni elementali",
    "elemental attack": "attacco elementale",
    Low: "Basso",
    Medium: "Medio",
    High: "Alto",
    Small: "Piccolo",
    Large: "Grande",
    Maximum: "Massimo",
    Nullifies: "Annulla",
    Prevents: "Previene",
    Extends: "Estende",
    effect: "effetto",
    power: "potenza",
    guard: "guardia",
    evading: "schivata",
    dodge: "schivata",
    "movement speed": "velocità di movimento",
  },

  PT: {
    Attack: "Ataque",
    Affinity: "Afinidade",
    Defense: "Defesa",
    Health: "Saúde",
    Stamina: "Vigor",
    damage: "dano",
    resistance: "resistência",
    "Fire attack": "Ataque de Fogo",
    "Water attack": "Ataque de Água",
    "Ice attack": "Ataque de Gelo",
    "Thunder attack": "Ataque de Trovão",
    "Dragon attack": "Ataque de Dragão",
    "Fire resistance": "Resistência a Fogo",
    "Water resistance": "Resistência a Água",
    "Ice resistance": "Resistência a Gelo",
    "Thunder resistance": "Resistência a Trovão",
    "Dragon resistance": "Resistência a Dragão",
    "Poison buildup": "Acúmulo de Veneno",
    "Paralysis buildup": "Acúmulo de Paralisia",
    "Sleep buildup": "Acúmulo de Sono",
    "Blast buildup": "Acúmulo de Explosão",
    "Stun buildup": "Acúmulo de Atordoamento",
    "while active": "enquanto ativo",
    "while full": "quando cheio",
    "when enraged": "quando enfurecido",
    Increases: "Aumenta",
    Decreases: "Diminui",
    Reduces: "Reduz",
    "Slightly increases": "Aumenta levemente",
    "Moderately increases": "Aumenta moderadamente",
    "Greatly increases": "Aumenta muito",
    "Significantly increases": "Aumenta significativamente",
    "Slightly decreases": "Diminui levemente",
    "Moderately decreases": "Diminui moderadamente",
    "Greatly decreases": "Diminui muito",
    "Slightly reduces": "Reduz levemente",
    "Moderately reduces": "Reduz moderadamente",
    "Greatly reduces": "Reduz muito",
    duration: "duração",
    chance: "chance",
    recovery: "recuperação",
    "critical hits": "acertos críticos",
    "damage dealt": "dano causado",
    "damage taken": "dano recebido",
    sharpness: "afiação",
    "sharpness loss": "perda de afiação",
    "elemental damage": "dano elemental",
    "elemental attack": "ataque elemental",
    Low: "Baixo",
    Medium: "Médio",
    High: "Alto",
    Small: "Pequeno",
    Large: "Grande",
    Maximum: "Máximo",
    Nullifies: "Anula",
    Prevents: "Previne",
    Extends: "Estende",
    effect: "efeito",
    power: "poder",
    guard: "guarda",
    evading: "esquiva",
    dodge: "esquiva",
    "movement speed": "velocidade de movimento",
  },

  PL: {
    Attack: "Atak",
    Affinity: "Afinitet",
    Defense: "Obrona",
    Health: "Zdrowie",
    Stamina: "Wytrzymałość",
    damage: "obrażenia",
    resistance: "odporność",
    "Fire attack": "Atak Ognia",
    "Water attack": "Atak Wody",
    "Ice attack": "Atak Lodu",
    "Thunder attack": "Atak Pioruna",
    "Dragon attack": "Atak Smoka",
    "Poison buildup": "Narastanie Trucizny",
    "Paralysis buildup": "Narastanie Paraliżu",
    "Sleep buildup": "Narastanie Snu",
    "Blast buildup": "Narastanie Eksplozji",
    "while active": "gdy aktywne",
    "when enraged": "gdy wściekły",
    Increases: "Zwiększa",
    Decreases: "Zmniejsza",
    Reduces: "Redukuje",
    "Slightly increases": "Nieznacznie zwiększa",
    "Moderately increases": "Umiarkowanie zwiększa",
    "Greatly increases": "Znacznie zwiększa",
    "critical hits": "trafienia krytyczne",
    sharpness: "ostrość",
    "elemental damage": "obrażenia żywiołowe",
  },

  RU: {
    Attack: "Атака",
    Affinity: "Сродство",
    Defense: "Защита",
    Health: "Здоровье",
    Stamina: "Выносливость",
    damage: "урон",
    resistance: "сопротивление",
    "Fire attack": "Атака Огня",
    "Water attack": "Атака Воды",
    "Ice attack": "Атака Льда",
    "Thunder attack": "Атака Грома",
    "Dragon attack": "Атака Дракона",
    "Poison buildup": "Накопление Яда",
    "Paralysis buildup": "Накопление Паралича",
    "Sleep buildup": "Накопление Сна",
    "Blast buildup": "Накопление Взрыва",
    "while active": "когда активно",
    "when enraged": "когда в ярости",
    Increases: "Увеличивает",
    Decreases: "Уменьшает",
    Reduces: "Снижает",
    "Slightly increases": "Слегка увеличивает",
    "Moderately increases": "Умеренно увеличивает",
    "Greatly increases": "Сильно увеличивает",
    "critical hits": "критические удары",
    sharpness: "острота",
    "elemental damage": "стихийный урон",
  },
};

/**
 * Traduit une description EN vers une langue cible
 */
function translateDescription(enDesc, targetLang) {
  if (!enDesc) return "";
  if (!translations[targetLang]) return enDesc;

  let translatedDesc = enDesc;
  const patterns = translations[targetLang];

  // Trier par longueur décroissante pour éviter les conflits
  const sortedPatterns = Object.entries(patterns).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [en, translated] of sortedPatterns) {
    const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    translatedDesc = translatedDesc.replace(regex, translated);
  }

  return translatedDesc;
}

async function main() {
  const skillsPath = path.join(__dirname, "../src/data/skills.json");
  const skills = JSON.parse(fs.readFileSync(skillsPath, "utf-8"));

  let translatedCount = 0;
  let totalLevels = 0;

  // Toutes les langues à traduire
  const targetLangs = Object.keys(translations);

  console.log(`🚀 Translating skill levels for: ${targetLangs.join(", ")}`);

  for (const [skillKey, skillData] of Object.entries(skills)) {
    const enLevels = skillData.EN?.levels || {};

    if (Object.keys(enLevels).length === 0) continue;

    for (const lang of targetLangs) {
      // Skip si déjà des levels
      const existingLevels = skillData[lang]?.levels || {};
      if (Object.keys(existingLevels).length > 0) continue;

      // Traduire chaque niveau
      const translatedLevels = {};
      for (const [level, enDesc] of Object.entries(enLevels)) {
        translatedLevels[level] = translateDescription(enDesc, lang);
        totalLevels++;
      }

      // Mettre à jour
      if (!skills[skillKey][lang]) {
        skills[skillKey][lang] = {};
      }
      skills[skillKey][lang].levels = translatedLevels;
      translatedCount++;
    }
  }

  // Sauvegarder
  fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2), "utf-8");

  console.log(
    `✅ Translated ${translatedCount} skill/language combinations with ${totalLevels} total levels`
  );
  console.log(`   Saved to ${skillsPath}`);

  // Afficher quelques exemples
  console.log("\n📋 Examples (attack-boost):");
  const skill = skills["attack-boost"];
  for (const lang of targetLangs.slice(0, 4)) {
    console.log(`  ${lang}:`, skill[lang]?.levels);
  }
}

main().catch(console.error);
