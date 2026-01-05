/**
 * Script pour scraper les armes avec leurs skills de Monster Hunter Wilds
 * depuis https://mhwilds.gamertw.com/[lang]/weapon
 *
 * Structure de sortie weapons-full.json :
 * {
 *   "weapon_id": {
 *     "EN": { name, type, attack, affinity, element, elementAttack, skills: [[skillName, level], ...] },
 *     "FR": { name, type, attack, affinity, element, elementAttack, skills: [[skillName, level], ...] },
 *     ...
 *   }
 * }
 *
 * === UTILISATION ===
 * $ node scripts/scrape-weapons-with-skills.js
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://mhwilds.gamertw.com";

const LANG_URL_MAP = {
  EN: "en",
  JP: "",
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

const LANG_ORDER = ["EN", "JP", "JA", "KO", "FR", "IT", "DE", "ES", "RU", "PL", "PT", "AR"];
const DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeWeaponName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
 * Scrape les armes avec skills pour une langue
 */
async function scrapeWeaponsForLang(lang) {
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

    const weaponMap = nextData.props?.pageProps?.weaponMap || {};
    
    // Récupérer les traductions pour les noms d'armes et skills
    const i18nStore = nextData.props?.pageProps?._nextI18Next?.initialI18nStore || {};
    const locales = Object.keys(i18nStore);
    const locale = locales.find(l => l !== "zh-TW") || locales[0];
    const translations = locale ? (i18nStore[locale]?.weapon || {}) : {};

    const weapons = [];

    for (const [weaponTypeEN, weaponList] of Object.entries(weaponMap)) {
      if (!Array.isArray(weaponList)) continue;

      for (const weapon of weaponList) {
        if (weapon.name) {
          // Traduire le nom de l'arme
          const translatedName = translations[weapon.name] || weapon.name;
          
          // Traduire les noms des skills
          const translatedSkills = (weapon.skills || []).map(([skillName, level]) => {
            const translatedSkill = translations[skillName] || skillName;
            return [translatedSkill, level];
          });

          weapons.push({
            originalName: weapon.name, // Nom EN pour créer l'ID
            name: translatedName,
            type: weaponTypeEN,
            attack: weapon.attack || 0,
            affinity: weapon.affinity || 0,
            element: weapon.element || "",
            elementAttack: weapon.elementAttack || 0,
            skills: translatedSkills,
            rarity: weapon.rarity || 1,
            slots: weapon.slots || [],
          });
        }
      }
    }

    console.log(`  Found ${weapons.length} weapons (locale: ${locale || 'none'})`);
    return weapons;
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MH Wilds Weapons with Skills Scraper                   ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Structure: { weapon_id: { EN: {...}, FR: {...}, ... } }
  const allWeapons = {};

  // Scraper EN d'abord pour créer les IDs
  console.log("📋 Scraping EN first to create weapon IDs...\n");
  const enWeapons = await scrapeWeaponsForLang("EN");

  if (!enWeapons) {
    console.error("❌ Failed to scrape EN weapons. Aborting.");
    process.exit(1);
  }

  // Créer les IDs et stocker EN
  for (const weapon of enWeapons) {
    const weaponId = normalizeWeaponName(weapon.originalName);
    allWeapons[weaponId] = {
      EN: {
        name: weapon.name,
        type: weapon.type,
        attack: weapon.attack,
        affinity: weapon.affinity,
        element: weapon.element,
        elementAttack: weapon.elementAttack,
        skills: weapon.skills,
        rarity: weapon.rarity,
        slots: weapon.slots,
      }
    };
  }

  console.log(`\n📦 Created ${Object.keys(allWeapons).length} weapon entries\n`);

  // Scraper les autres langues
  for (const lang of LANG_ORDER) {
    if (lang === "EN") continue;

    await sleep(DELAY_MS);
    const weapons = await scrapeWeaponsForLang(lang);

    if (weapons) {
      for (const weapon of weapons) {
        const weaponId = normalizeWeaponName(weapon.originalName);
        if (allWeapons[weaponId]) {
          allWeapons[weaponId][lang] = {
            name: weapon.name,
            type: weapon.type,
            attack: weapon.attack,
            affinity: weapon.affinity,
            element: weapon.element,
            elementAttack: weapon.elementAttack,
            skills: weapon.skills,
            rarity: weapon.rarity,
            slots: weapon.slots,
          };
        }
      }
    }
  }

  // Sauvegarder
  const outputPath = path.join(__dirname, "..", "src", "data", "weapons-full.json");
  fs.writeFileSync(outputPath, JSON.stringify(allWeapons, null, 2), "utf-8");
  console.log(`\n✅ Saved ${Object.keys(allWeapons).length} weapons to ${outputPath}`);

  // Résumé
  console.log("\n📊 Summary by language:");
  for (const lang of LANG_ORDER) {
    const count = Object.values(allWeapons).filter(w => w[lang]).length;
    console.log(`   ${lang}: ${count} weapons`);
  }

  // Afficher quelques exemples
  console.log("\n📝 Sample weapons:");
  const sampleIds = Object.keys(allWeapons).slice(0, 3);
  for (const id of sampleIds) {
    const en = allWeapons[id].EN;
    console.log(`   ${id}: ${en.name} (${en.type}) - Skills: ${en.skills.map(s => s[0]).join(", ")}`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
