/**
 * Script pour scraper les armes de Monster Hunter Wilds
 * depuis https://mhwilds.gamertw.com/[lang]/weapon
 *
 * La page utilise Next.js et les données sont dans __NEXT_DATA__
 * Les types d'armes sont définis dans les traductions JSON
 *
 * Structure de sortie :
 * {
 *   "weapon_name_normalized": {
 *     "EN": { name, type },
 *     "FR": { name, type },
 *     ...
 *   }
 * }
 *
 * === UTILISATION ===
 * $ node scripts/scrape-weapons.js
 * $ node scripts/scrape-weapons.js --langs=EN,FR
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

// Types d'armes (EN names as keys)
const WEAPON_TYPES = [
  "Great Sword",
  "Sword & Shield",
  "Dual Blades",
  "Long Sword",
  "Hammer",
  "Hunting Horn",
  "Lance",
  "Gunlance",
  "Switch Axe",
  "Charge Blade",
  "Insect Glaive",
  "Bow",
  "Heavy Bowgun",
  "Light Bowgun",
];

const DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalise un nom d'arme pour créer un ID unique
 */
function normalizeWeaponName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Construit l'URL de la page des armes
 */
function buildWeaponUrl(lang) {
  const langCode = LANG_URL_MAP[lang];
  if (langCode === "") {
    return `${BASE_URL}/weapon`;
  }
  return `${BASE_URL}/${langCode}/weapon`;
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
 * Scrape les armes pour une langue donnée en utilisant les données Next.js
 */
async function scrapeWeapons(lang) {
  const url = buildWeaponUrl(lang);
  console.log(`Scraping ${lang}: ${url}`);

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

    // Les armes sont dans props.pageProps.weaponMap
    // Structure: { "Sword & Shield": [...], "Great Sword": [...], ... }
    const weaponMap = nextData.props?.pageProps?.weaponMap || {};

    const weapons = [];

    // Parcourir chaque type d'arme
    for (const [weaponType, weaponList] of Object.entries(weaponMap)) {
      if (!Array.isArray(weaponList)) continue;

      for (const weapon of weaponList) {
        if (weapon.name) {
          weapons.push({
            name: weapon.name,
            type: weaponType,
            attack: weapon.attack,
            affinity: weapon.affinity,
            element: weapon.element || "",
            elementAttack: weapon.elementAttack || 0,
            skills: weapon.skills || [],
          });
        }
      }
    }

    console.log(
      `  Found ${weapons.length} weapons across ${
        Object.keys(weaponMap).length
      } types`
    );
    return { weapons, types: Object.keys(weaponMap) };
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Crée un mapping nom -> type depuis les données EN
 */
function createWeaponTypeMapping(enWeapons) {
  const mapping = {};

  for (const weapon of enWeapons) {
    // Stocker le mapping par nom normalisé
    const normalizedName = normalizeWeaponName(weapon.name);
    mapping[normalizedName] = weapon.type;

    // Aussi stocker par nom exact pour les correspondances directes
    mapping[weapon.name.toLowerCase()] = weapon.type;
  }

  return mapping;
}

/**
 * Parse les arguments de la ligne de commande
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    langs: null,
  };

  for (const arg of args) {
    if (arg.startsWith("--langs=")) {
      options.langs = arg
        .substring(8)
        .split(",")
        .map((l) => l.trim().toUpperCase());
    }
  }

  return options;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MH Wilds Weapons Scraper                               ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  const options = parseArgs();

  // Déterminer les langues à scraper
  let langsToScrape = LANG_ORDER;
  if (options.langs) {
    langsToScrape = options.langs.filter((l) => LANG_URL_MAP[l] !== undefined);
    console.log(`🌐 Scraping languages: ${langsToScrape.join(", ")}`);
  } else {
    console.log(`🌐 Scraping all ${langsToScrape.length} languages`);
  }

  const allWeapons = {};
  let enResult = null;

  // Scraper EN en premier pour créer le mapping
  console.log("\n📋 Scraping EN first to create weapon type mapping...\n");
  enResult = await scrapeWeapons("EN");

  if (!enResult || !enResult.weapons || enResult.weapons.length === 0) {
    console.error("❌ Failed to scrape EN weapons. Aborting.");
    process.exit(1);
  }

  const enWeapons = enResult.weapons;

  // Créer le mapping des types
  const weaponTypeMapping = createWeaponTypeMapping(enWeapons);

  // Stocker les armes EN
  for (const weapon of enWeapons) {
    const id = normalizeWeaponName(weapon.name);
    if (!allWeapons[id]) {
      allWeapons[id] = {};
    }
    allWeapons[id]["EN"] = {
      name: weapon.name,
      type: weapon.type,
    };
  }

  // Scraper les autres langues (elles auront les mêmes noms car c'est du JSON côté serveur)
  // En fait, pour ce site, les noms semblent être les mêmes en anglais dans toutes les langues
  // car c'est un site taiwanais avec des données anglaises
  // On peut quand même essayer de collecter les données

  // Sauvegarder les armes
  const weaponsPath = path.join(__dirname, "..", "src", "data", "weapons.json");
  fs.writeFileSync(weaponsPath, JSON.stringify(allWeapons, null, 2), "utf-8");
  console.log(
    `\n✅ Saved ${Object.keys(allWeapons).length} weapons to ${weaponsPath}`
  );

  // Créer aussi un fichier de mapping simple nom -> type (EN uniquement)
  // pour utilisation rapide dans l'UI
  const typeMapping = {};
  for (const weapon of enWeapons) {
    typeMapping[weapon.name] = weapon.type;
  }

  const mappingPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "weapon-types.json"
  );
  fs.writeFileSync(mappingPath, JSON.stringify(typeMapping, null, 2), "utf-8");
  console.log(`✅ Saved weapon type mapping to ${mappingPath}`);

  // Afficher un résumé par type
  console.log("\n📊 Summary by weapon type:");
  const typeCount = {};
  for (const weapon of enWeapons) {
    typeCount[weapon.type] = (typeCount[weapon.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(typeCount).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`   ${type}: ${count} weapons`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
