/**
 * Script pour scraper les noms d'armes dans toutes les langues
 * et créer un mapping nom→type pour chaque langue
 *
 * Structure de sortie weapon-names-by-lang.json :
 * {
 *   "EN": { "Kurenawi Ougi": "Sword & Shield", ... },
 *   "FR": { "Kurenawi Ougi": "Épée et bouclier", ... },
 *   "JA": { "紅威太刀": "片手剣", ... },
 *   ...
 * }
 *
 * === UTILISATION ===
 * $ node scripts/scrape-all-weapon-names.js
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

const DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildWeaponUrl(lang) {
  const langCode = LANG_URL_MAP[lang];
  if (langCode === "") {
    return `${BASE_URL}/weapon`;
  }
  return `${BASE_URL}/${langCode}/weapon`;
}

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
 * Scrape les armes pour une langue et retourne un mapping nom→type
 * Les noms traduits sont dans _nextI18Next, les types sont dans weaponMap
 */
async function scrapeWeaponNamesForLang(lang) {
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

    // Les armes sont dans props.pageProps.weaponMap (noms EN → type EN)
    const weaponMap = nextData.props?.pageProps?.weaponMap || {};

    // Les traductions sont dans _nextI18Next.initialI18nStore.[locale].weapon
    const i18nStore =
      nextData.props?.pageProps?._nextI18Next?.initialI18nStore || {};
    const locales = Object.keys(i18nStore);
    const locale = locales.find((l) => l !== "zh-TW") || locales[0];
    const translations = locale ? i18nStore[locale]?.weapon || {} : {};

    const nameToType = {};
    let count = 0;

    for (const [weaponTypeEN, weaponList] of Object.entries(weaponMap)) {
      if (!Array.isArray(weaponList)) continue;

      for (const weapon of weaponList) {
        if (weapon.name) {
          // Le nom dans weaponMap est EN, on cherche la traduction
          const translatedName = translations[weapon.name] || weapon.name;
          // Le type est toujours en anglais
          nameToType[translatedName] = weaponTypeEN;
          count++;
        }
      }
    }

    console.log(`  Found ${count} weapons (locale: ${locale || "none"})`);
    return nameToType;
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MH Wilds All Weapon Names Scraper                      ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  const allWeaponNames = {};

  for (const lang of LANG_ORDER) {
    if (lang !== LANG_ORDER[0]) {
      await sleep(DELAY_MS);
    }

    const nameToType = await scrapeWeaponNamesForLang(lang);
    if (nameToType) {
      allWeaponNames[lang] = nameToType;
    }
  }

  // Sauvegarder
  const outputPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "weapon-names-by-lang.json"
  );
  fs.writeFileSync(
    outputPath,
    JSON.stringify(allWeaponNames, null, 2),
    "utf-8"
  );
  console.log(`\n✅ Saved weapon names to ${outputPath}`);

  // Résumé
  console.log("\n📊 Summary:");
  for (const [lang, names] of Object.entries(allWeaponNames)) {
    console.log(`   ${lang}: ${Object.keys(names).length} weapons`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
