/**
 * Script pour scraper les armures de Monster Hunter Wilds
 * depuis https://mhwilds.gamertw.com/[lang]/armor
 *
 * La page utilise Next.js et les données sont dans __NEXT_DATA__
 *
 * Structure de sortie :
 * {
 *   "armor_set_id": {
 *     "EN": {
 *       name: "Rathalos α",
 *       rank: "HIGH",
 *       rarity: 6,
 *       pieces: {
 *         head: { name, defense, slots, skills, resistances },
 *         chest: { ... },
 *         arms: { ... },
 *         waist: { ... },
 *         legs: { ... }
 *       },
 *       setBonus: "...",
 *       groupSkill: "...",
 *       totalDefense: 240,
 *       resistances: { fire, water, thunder, ice, dragon }
 *     },
 *     "FR": { ... },
 *     ...
 *   }
 * }
 *
 * === UTILISATION ===
 * $ node scripts/scrape-armors.js
 * $ node scripts/scrape-armors.js --langs=EN,FR
 * $ node scripts/scrape-armors.js --limit=10
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://mhwilds.gamertw.com";

// Mapping des langues vers leurs codes URL
const LANG_URL_MAP = {
  EN: "en",
  JP: "", // Default/Chinese
  JA: "ja",
  KO: "ko",
  FR: "fr",
  IT: "it",
  DE: "de",
  ES: "es",
  RU: "ru",
  PL: "pl",
  PT: "pt",
  AR: "ar",
};

const LANG_ORDER = [
  "EN",
  "JP",
  "JA",
  "KO",
  "FR",
  "IT",
  "DE",
  "ES",
  "RU",
  "PL",
  "PT",
  "AR",
];

// Mapping des types de pièces
const PIECE_TYPE_MAP = {
  HELM: "head",
  BODY: "chest",
  ARM: "arms",
  WAIST: "waist",
  LEG: "legs",
};

const DELAY_MS = 400;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalise un nom d'armure pour créer un ID unique
 */
function normalizeArmorName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Construit l'URL de la liste des armures
 */
function buildArmorListUrl(lang) {
  const langCode = LANG_URL_MAP[lang];
  if (langCode === "") {
    return `${BASE_URL}/armor`;
  }
  return `${BASE_URL}/${langCode}/armor`;
}

/**
 * Construit l'URL d'un ensemble d'armure spécifique
 */
function buildArmorDetailUrl(lang, armorSlug) {
  const langCode = LANG_URL_MAP[lang];
  // Encoder le slug pour les caractères spéciaux (α, β, γ)
  const encodedSlug = encodeURIComponent(armorSlug);
  if (langCode === "") {
    return `${BASE_URL}/armor/${encodedSlug}`;
  }
  return `${BASE_URL}/${langCode}/armor/${encodedSlug}`;
}

/**
 * Extrait les données JSON de __NEXT_DATA__ dans la page
 */
function extractNextData(html) {
  const $ = cheerio.load(html);
  const scriptContent = $("#__NEXT_DATA__").html();

  if (!scriptContent) {
    return null;
  }

  try {
    return JSON.parse(scriptContent);
  } catch (e) {
    console.error("Failed to parse __NEXT_DATA__:", e.message);
    return null;
  }
}

/**
 * Scrape la liste des ensembles d'armure pour une langue donnée
 */
async function scrapeArmorList(lang) {
  const url = buildArmorListUrl(lang);
  console.log(`  Fetching armor list: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ⚠ HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    const nextData = extractNextData(html);

    if (!nextData) {
      console.warn(`  ⚠ Could not extract __NEXT_DATA__ from ${url}`);
      return null;
    }

    const pageProps = nextData.props?.pageProps || {};

    // Extraire les noms des ensembles depuis initialSeries
    const armorSeries = pageProps.initialSeries || [];
    const infoMap = pageProps.infoMap || {};

    return { armorSeries, infoMap };
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Scrape les détails d'un ensemble d'armure
 */
async function scrapeArmorDetail(lang, armorName) {
  // Convertir le nom en slug URL
  const slug = armorName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "");

  const url = buildArmorDetailUrl(lang, slug);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const nextData = extractNextData(html);

    if (!nextData) {
      return null;
    }

    const pageProps = nextData.props?.pageProps || {};
    return pageProps;
  } catch (error) {
    return null;
  }
}

/**
 * Parse les arguments de la ligne de commande
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    langs: null,
    limit: null,
  };

  for (const arg of args) {
    if (arg.startsWith("--langs=")) {
      options.langs = arg
        .substring(8)
        .split(",")
        .map((l) => l.trim().toUpperCase());
    }
    if (arg.startsWith("--limit=")) {
      options.limit = parseInt(arg.substring(8), 10);
    }
  }

  return options;
}

/**
 * Charge les skills existants pour faire la correspondance
 */
function loadExistingSkills() {
  const skillsPath = path.join(__dirname, "..", "src", "data", "skills.json");
  try {
    const data = fs.readFileSync(skillsPath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.warn("⚠ Could not load skills.json:", e.message);
    return {};
  }
}

/**
 * Trouve l'ID du skill correspondant au nom localisé
 */
function findSkillId(skillName, lang, skillsData) {
  const normalizedSearch = skillName.toLowerCase().trim();

  for (const [skillId, skillTranslations] of Object.entries(skillsData)) {
    // Vérifier dans la langue actuelle
    if (skillTranslations[lang]?.name?.toLowerCase() === normalizedSearch) {
      return skillId;
    }
    // Vérifier en EN comme fallback
    if (skillTranslations["EN"]?.name?.toLowerCase() === normalizedSearch) {
      return skillId;
    }
  }
  return null;
}

/**
 * Traite les données d'un ensemble d'armure
 */
function processArmorSet(pageProps, lang, skillsData) {
  const armorSet = pageProps.armorSet;
  const armorList = pageProps.armorList || [];
  const groupSkill = pageProps.groupSkill;
  const setBonus = pageProps.setBonus;

  if (!armorSet) {
    return null;
  }

  const result = {
    name: armorSet.Name,
    rank: armorSet.Rank,
    rarity: armorSet.Rarity,
    type: armorSet.Type, // Alpha, Beta, Gamma, etc.
    pieces: {},
    groupSkill: groupSkill || null,
    setBonus: setBonus || null,
    totalDefense: 0,
    resistances: {
      fire: 0,
      water: 0,
      thunder: 0,
      ice: 0,
      dragon: 0,
    },
  };

  // Traiter chaque pièce
  for (const piece of armorList) {
    const pieceType = PIECE_TYPE_MAP[piece.type];
    if (!pieceType) continue;

    // Parser les skills
    const skills = [];
    if (piece.skills && Array.isArray(piece.skills)) {
      for (const skill of piece.skills) {
        const skillName = skill.skill || skill.name;
        const skillLevel = skill.level || 1;
        const skillId = findSkillId(skillName, lang, skillsData);

        skills.push({
          name: skillName,
          level: skillLevel,
          skillId: skillId,
        });
      }
    }

    result.pieces[pieceType] = {
      name: piece.name,
      defense: piece.defense || 0,
      slots: piece.slots || [0, 0, 0],
      skills: skills,
      resistances: {
        fire: piece.resistances?.fire || 0,
        water: piece.resistances?.water || 0,
        thunder: piece.resistances?.thunder || 0,
        ice: piece.resistances?.ice || 0,
        dragon: piece.resistances?.dragon || 0,
      },
    };

    // Ajouter aux totaux
    result.totalDefense += piece.defense || 0;
    result.resistances.fire += piece.resistances?.fire || 0;
    result.resistances.water += piece.resistances?.water || 0;
    result.resistances.thunder += piece.resistances?.thunder || 0;
    result.resistances.ice += piece.resistances?.ice || 0;
    result.resistances.dragon += piece.resistances?.dragon || 0;
  }

  return result;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MH Wilds Armor Sets Scraper                            ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  const options = parseArgs();
  const skillsData = loadExistingSkills();
  console.log(
    `📚 Loaded ${Object.keys(skillsData).length} skills for matching`
  );

  // Déterminer les langues à scraper
  let langsToScrape = LANG_ORDER;
  if (options.langs) {
    langsToScrape = options.langs.filter((l) => LANG_URL_MAP[l] !== undefined);
    console.log(`🌐 Scraping languages: ${langsToScrape.join(", ")}`);
  } else {
    console.log(`🌐 Scraping all ${langsToScrape.length} languages`);
  }

  // D'abord, scraper EN pour obtenir la liste des armures
  console.log("\n📋 Fetching EN armor list to get all set names...\n");

  const enListResult = await scrapeArmorList("EN");

  if (!enListResult) {
    console.error("❌ Failed to fetch EN armor list. Aborting.");
    process.exit(1);
  }

  // Extraire la liste des ensembles d'armure
  const armorSeries = enListResult.armorSeries;
  console.log(`  Found ${armorSeries.length} armor sets in EN list`);

  // Appliquer la limite si spécifiée
  let armorSetsToProcess = armorSeries;
  if (options.limit && armorSetsToProcess.length > options.limit) {
    armorSetsToProcess = armorSetsToProcess.slice(0, options.limit);
    console.log(`  Limited to ${armorSetsToProcess.length} sets`);
  }

  const allArmors = {};
  const failedSets = [];

  // Traiter chaque ensemble d'armure pour chaque langue
  for (const armorSeriesItem of armorSetsToProcess) {
    const armorName = armorSeriesItem.Name;
    const armorId = normalizeArmorName(armorName);

    console.log(`\n📦 Processing: ${armorName}`);

    if (!allArmors[armorId]) {
      allArmors[armorId] = {};
    }

    for (const lang of langsToScrape) {
      const detailData = await scrapeArmorDetail(lang, armorName);

      if (detailData && detailData.armorSet) {
        const processed = processArmorSet(detailData, lang, skillsData);
        if (processed) {
          allArmors[armorId][lang] = processed;
          process.stdout.write(`  ✓ ${lang}`);
        } else {
          process.stdout.write(`  ⚠ ${lang}`);
        }
      } else {
        process.stdout.write(`  ✗ ${lang}`);
        if (lang === "EN") {
          failedSets.push(armorName);
        }
      }

      await sleep(DELAY_MS);
    }
    console.log("");
  }

  // Sauvegarder les armures
  const armorsPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "armors-full.json"
  );
  fs.writeFileSync(armorsPath, JSON.stringify(allArmors, null, 2), "utf-8");
  console.log(
    `\n✅ Saved ${Object.keys(allArmors).length} armor sets to ${armorsPath}`
  );

  // Créer un fichier de mapping simple pour référence rapide
  const armorSetNames = {};
  for (const [armorId, translations] of Object.entries(allArmors)) {
    if (translations.EN) {
      armorSetNames[armorId] = {
        name: translations.EN.name,
        rank: translations.EN.rank,
        rarity: translations.EN.rarity,
      };
    }
  }

  const namesPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "armor-names.json"
  );
  fs.writeFileSync(namesPath, JSON.stringify(armorSetNames, null, 2), "utf-8");
  console.log(`✅ Saved armor names mapping to ${namesPath}`);

  // Afficher un résumé
  console.log("\n📊 Summary:");
  const rankCount = {};
  for (const [, translations] of Object.entries(allArmors)) {
    const rank = translations.EN?.rank || "Unknown";
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  }
  for (const [rank, count] of Object.entries(rankCount).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`   ${rank}: ${count} sets`);
  }

  if (failedSets.length > 0) {
    console.log(`\n⚠ Failed to fetch ${failedSets.length} sets:`);
    failedSets.slice(0, 10).forEach((name) => console.log(`   - ${name}`));
    if (failedSets.length > 10) {
      console.log(`   ... and ${failedSets.length - 10} more`);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
