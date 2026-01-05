/**
 * Script pour scraper les spécifications détaillées des skills
 * depuis https://mhwilds.gamertw.com/[lang]/skill/[skill-id]
 *
 * Structure de sortie :
 * {
 *   "skill_id": {
 *     "EN": { equipment: [{ type, name, skills }] },
 *     "FR": { equipment: [{ type, name, skills }] },
 *     ...
 *   }
 * }
 *
 * === UTILISATION ===
 * $ node scripts/scrape-skill-specs.js
 *
 * Options:
 *   --langs=EN,FR,JP    Scraper uniquement ces langues (par défaut: toutes)
 *   --skills=attack-boost,critical-eye    Scraper uniquement ces skills
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL pour les pages de détail des skills
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

// Ordre de scraping
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

// Délai entre les requêtes pour éviter le rate limiting
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convertit un ID de skill (underscore) vers le format URL (tiret)
 */
function skillIdToUrlSlug(skillId) {
  return skillId.replace(/_/g, "-");
}

/**
 * Construit l'URL de la page de détail d'un skill
 */
function buildSkillDetailUrl(skillId, lang) {
  const langCode = LANG_URL_MAP[lang];
  const urlSlug = skillIdToUrlSlug(skillId);
  if (langCode === "") {
    return `${BASE_URL}/skill/${urlSlug}`;
  }
  return `${BASE_URL}/${langCode}/skill/${urlSlug}`;
}

/**
 * Scrape les détails d'un skill pour une langue donnée
 */
async function scrapeSkillDetail(skillId, lang) {
  const url = buildSkillDetailUrl(skillId, lang);
  console.log(`  Scraping ${lang}: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`    ⚠ HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const equipment = [];

    // Patterns pour les types d'armes (EN et multi-langues)
    const weaponTypesPatterns = [
      // English
      { pattern: /^Bow\s+/i, type: "Bow" },
      { pattern: /^Charge Blade\s+/i, type: "Charge Blade" },
      { pattern: /^Dual Blades\s+/i, type: "Dual Blades" },
      { pattern: /^Great Sword\s+/i, type: "Great Sword" },
      { pattern: /^Gunlance\s+/i, type: "Gunlance" },
      { pattern: /^Hammer\s+/i, type: "Hammer" },
      { pattern: /^Heavy Bowgun\s+/i, type: "Heavy Bowgun" },
      { pattern: /^Hunting Horn\s+/i, type: "Hunting Horn" },
      { pattern: /^Insect Glaive\s+/i, type: "Insect Glaive" },
      { pattern: /^Lance\s+/i, type: "Lance" },
      { pattern: /^Light Bowgun\s+/i, type: "Light Bowgun" },
      { pattern: /^Long Sword\s+/i, type: "Long Sword" },
      { pattern: /^Switch Axe\s+/i, type: "Switch Axe" },
      { pattern: /^Sword & Shield\s+/i, type: "Sword & Shield" },
    ];

    // Trouver la section "Equipment with..." en cherchant les tables
    // La section équipement est généralement la 3ème table (après skill info et levels)
    const tables = $("table");

    // On saute les 2 premières tables (skill info et levels) et on prend la 3ème
    if (tables.length >= 3) {
      const equipmentTable = $(tables[2]);

      equipmentTable.find("tr").each((j, row) => {
        const $row = $(row);
        const cells = $row.find("td");

        if (cells.length >= 2) {
          const firstCell = $(cells[0]).text().trim();
          const secondCell = $(cells[1]).text().trim();

          // Ignorer si le firstCell ne contient pas de vrai nom d'équipement
          // (les lignes de niveau sont des chiffres seuls)
          if (/^[0-9]+$/.test(firstCell)) {
            return; // skip level rows
          }

          let type = "Unknown";
          let name = firstCell;

          // Essayer de détecter le type d'arme
          for (const wp of weaponTypesPatterns) {
            if (wp.pattern.test(firstCell)) {
              type = wp.type;
              name = firstCell.replace(wp.pattern, "").trim();
              break;
            }
          }

          if (name && secondCell && name.length > 2) {
            equipment.push({
              type: type,
              name: name,
              skills: secondCell,
            });
          }
        }
      });
    }

    return {
      equipment: equipment,
    };
  } catch (error) {
    console.error(`    ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Scrape tous les skills pour toutes les langues
 */
async function scrapeAllSkillSpecs(skillIds, langsToScrape) {
  const specs = {};
  const totalSkills = skillIds.length;
  const totalLangs = langsToScrape.length;

  console.log(
    `\n🚀 Starting to scrape ${totalSkills} skills in ${totalLangs} languages...`
  );
  console.log(`   Total requests: ~${totalSkills * totalLangs}\n`);

  for (let i = 0; i < skillIds.length; i++) {
    const skillId = skillIds[i];
    console.log(`\n[${i + 1}/${totalSkills}] Scraping skill: ${skillId}`);

    specs[skillId] = {};

    for (const lang of langsToScrape) {
      const detail = await scrapeSkillDetail(skillId, lang);
      if (detail) {
        specs[skillId][lang] = detail;
      }
      await sleep(DELAY_MS);
    }
  }

  return specs;
}

/**
 * Charge les skills existants depuis skills.json pour obtenir la liste des IDs
 */
function loadSkillIds() {
  const skillsPath = path.join(__dirname, "..", "src", "data", "skills.json");

  if (!fs.existsSync(skillsPath)) {
    console.error("❌ skills.json not found! Run scrape-skills.js first.");
    process.exit(1);
  }

  const skills = JSON.parse(fs.readFileSync(skillsPath, "utf-8"));
  return Object.keys(skills);
}

/**
 * Charge les specs existantes pour mise à jour incrémentale
 */
function loadExistingSpecs() {
  const specsPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "skill-specifications.json"
  );

  if (fs.existsSync(specsPath)) {
    return JSON.parse(fs.readFileSync(specsPath, "utf-8"));
  }

  return {};
}

/**
 * Sauvegarde les specs dans le fichier JSON
 */
function saveSpecs(specs) {
  const specsPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "skill-specifications.json"
  );
  fs.writeFileSync(specsPath, JSON.stringify(specs, null, 2), "utf-8");
  console.log(`\n✅ Saved to ${specsPath}`);
}

/**
 * Parse les arguments de la ligne de commande
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    langs: null,
    skills: null,
  };

  for (const arg of args) {
    if (arg.startsWith("--langs=")) {
      options.langs = arg
        .substring(8)
        .split(",")
        .map((l) => l.trim().toUpperCase());
    } else if (arg.startsWith("--skills=")) {
      options.skills = arg
        .substring(9)
        .split(",")
        .map((s) => s.trim().toLowerCase());
    }
  }

  return options;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MH Wilds Skill Specifications Scraper                  ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  const options = parseArgs();

  // Charger les IDs de skills depuis skills.json
  let skillIds = loadSkillIds();
  console.log(`📋 Found ${skillIds.length} skills in skills.json`);

  // Filtrer par skills si spécifié
  if (options.skills) {
    // Normaliser les inputs (tirets -> underscores) pour matcher les IDs dans skills.json
    const normalizedSkills = options.skills.map((s) => s.replace(/-/g, "_"));
    skillIds = skillIds.filter((id) => normalizedSkills.includes(id));
    console.log(`🎯 Filtering to ${skillIds.length} specified skills`);
  }

  // Déterminer les langues à scraper
  let langsToScrape = LANG_ORDER;
  if (options.langs) {
    langsToScrape = options.langs.filter((l) => LANG_URL_MAP[l] !== undefined);
    console.log(`🌐 Scraping languages: ${langsToScrape.join(", ")}`);
  } else {
    console.log(`🌐 Scraping all ${langsToScrape.length} languages`);
  }

  // Charger les specs existantes pour mise à jour incrémentale
  const existingSpecs = loadExistingSpecs();
  console.log(
    `📂 Loaded ${Object.keys(existingSpecs).length} existing skill specs`
  );

  // Scraper les données
  const newSpecs = await scrapeAllSkillSpecs(skillIds, langsToScrape);

  // Fusionner avec les specs existantes
  const mergedSpecs = { ...existingSpecs };
  for (const [skillId, langData] of Object.entries(newSpecs)) {
    if (!mergedSpecs[skillId]) {
      mergedSpecs[skillId] = {};
    }
    for (const [lang, data] of Object.entries(langData)) {
      mergedSpecs[skillId][lang] = data;
    }
  }

  // Sauvegarder
  saveSpecs(mergedSpecs);

  // Afficher un résumé
  const totalSpecs = Object.keys(mergedSpecs).length;
  console.log(`\n📊 Summary: ${totalSpecs} skill specifications saved`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
