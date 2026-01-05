/**
 * Script pour scraper les types d'armes traduits de Monster Hunter Wilds
 * depuis https://mhwilds.gamertw.com/[lang]/weapon
 *
 * La page utilise Next.js et les traductions sont dans __namespaces.weapon
 *
 * Structure de sortie weapon-type-translations.json :
 * {
 *   "Great Sword": {
 *     "EN": "Great Sword",
 *     "FR": "Grande épée",
 *     "JA": "大剣",
 *     ...
 *   },
 *   ...
 * }
 *
 * === UTILISATION ===
 * $ node scripts/scrape-weapon-types.js
 * $ node scripts/scrape-weapon-types.js --langs=EN,FR
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs par langue (même logique que scrape-skills.js)
const WEAPON_URLS = {
  EN: "https://mhwilds.gamertw.com/en/weapon",
  JP: "https://mhwilds.gamertw.com/weapon", // Default/Chinese
  JA: "https://mhwilds.gamertw.com/ja/weapon",
  KO: "https://mhwilds.gamertw.com/ko/weapon",
  FR: "https://mhwilds.gamertw.com/fr/weapon",
  IT: "https://mhwilds.gamertw.com/it/weapon",
  DE: "https://mhwilds.gamertw.com/de/weapon",
  ES: "https://mhwilds.gamertw.com/es/weapon",
  RU: "https://mhwilds.gamertw.com/ru/weapon",
  PL: "https://mhwilds.gamertw.com/pl/weapon",
  PT: "https://mhwilds.gamertw.com/pt/weapon",
  AR: "https://mhwilds.gamertw.com/ar/weapon",
};

// Ordre de scraping - EN en premier comme référence
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

// Types d'armes EN (référence) - ce sont les clés à chercher dans les traductions
const WEAPON_TYPES_EN = [
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

const DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
 * Scrape les traductions des types d'armes pour une langue donnée
 * Les traductions sont dans: props.pageProps._nextI18Next.initialI18nStore.[locale].weapon
 */
async function scrapeWeaponTypeTranslations(lang) {
  const url = WEAPON_URLS[lang];
  if (!url) {
    console.warn(`  ⚠ No URL defined for ${lang}`);
    return null;
  }

  console.log(`Scraping ${lang}: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

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

    // Les traductions sont dans _nextI18Next.initialI18nStore.[locale].weapon
    const i18nStore =
      nextData.props?.pageProps?._nextI18Next?.initialI18nStore || {};

    // Trouver la bonne locale (peut être "fr", "ja", "zh-TW", etc.)
    const locales = Object.keys(i18nStore);
    const locale = locales.find((l) => l !== "zh-TW") || locales[0];

    if (!locale) {
      console.warn(`  ⚠ No locale found in i18nStore`);
      return null;
    }

    const weaponTranslations = i18nStore[locale]?.weapon || {};

    // Extraire uniquement les traductions des types d'armes
    const typeTranslations = {};
    for (const typeEN of WEAPON_TYPES_EN) {
      const translated = weaponTranslations[typeEN];
      if (translated) {
        typeTranslations[typeEN] = translated;
      } else {
        // Fallback à la version anglaise si pas de traduction
        typeTranslations[typeEN] = typeEN;
      }
    }

    const foundCount = Object.values(typeTranslations).filter(
      (t) => t !== typeTranslations[t]
    ).length;
    console.log(`  Found ${foundCount} translated types (locale: ${locale})`);

    return typeTranslations;
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
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
  console.log("║     MH Wilds Weapon Types Scraper                          ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  const options = parseArgs();

  // Déterminer les langues à scraper
  let langsToScrape = LANG_ORDER;
  if (options.langs) {
    langsToScrape = options.langs.filter((l) => WEAPON_URLS[l] !== undefined);
    console.log(`🌐 Scraping languages: ${langsToScrape.join(", ")}`);
  } else {
    console.log(`🌐 Scraping all ${langsToScrape.length} languages`);
  }

  // Structure: { "Great Sword": { "EN": "Great Sword", "FR": "Grande épée", ... } }
  const allTypeTranslations = {};

  // Initialiser avec les types EN
  for (const type of WEAPON_TYPES_EN) {
    allTypeTranslations[type] = {};
  }

  // Scraper chaque langue
  for (const lang of langsToScrape) {
    if (lang !== langsToScrape[0]) {
      await sleep(DELAY_MS);
    }

    const translations = await scrapeWeaponTypeTranslations(lang);

    if (translations) {
      for (const [enType, translatedType] of Object.entries(translations)) {
        if (allTypeTranslations[enType]) {
          allTypeTranslations[enType][lang] = translatedType;
        }
      }
    }
  }

  // Sauvegarder les traductions des types
  const outputPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "weapon-type-translations.json"
  );
  fs.writeFileSync(
    outputPath,
    JSON.stringify(allTypeTranslations, null, 2),
    "utf-8"
  );
  console.log(`\n✅ Saved weapon type translations to ${outputPath}`);

  // Afficher un résumé
  console.log("\n📊 Summary:");
  for (const [enType, translations] of Object.entries(allTypeTranslations)) {
    const langCount = Object.keys(translations).length;
    const samples = Object.entries(translations)
      .slice(0, 4)
      .map(([l, t]) => `${l}:${t}`)
      .join(", ");
    console.log(`   ${enType.padEnd(15)}: ${langCount} langs (${samples})`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
