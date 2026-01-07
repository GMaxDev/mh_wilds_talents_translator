/**
 * Script pour scraper les niveaux de skills depuis gamertw.com
 * Ce site a les traductions officielles dans toutes les langues
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://mhwilds.gamertw.com";

// Mapping des codes de langue gamertw vers nos codes
const LANG_MAPPING = {
  en: "EN",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  pt: "PT",
  pl: "PL",
  ru: "RU",
  ja: "JA",
  ko: "KO",
  "zh-CN": "ZH",
  "zh-TW": "ZH_HANT", // Note: gamertw default is zh-TW
};

// Délai entre les requêtes pour ne pas surcharger le serveur
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse le HTML d'une page de skills et extrait les données
 */
function parseSkillsPage(html, lang) {
  const $ = cheerio.load(html);
  const skills = {};

  // Parcourir toutes les lignes du tableau
  $("table tbody tr").each((_, row) => {
    const $row = $(row);

    // Récupérer le nom du skill et le lien (qui contient le slug)
    const $link = $row.find("td:first-child a");
    const skillName = $link.text().trim();
    const href = $link.attr("href") || "";

    // Extraire le slug du skill depuis l'URL (ex: /skill/attack-boost -> attack-boost)
    const slugMatch = href.match(/\/skill\/([^/]+)$/);
    if (!slugMatch) return;

    const skillSlug = slugMatch[1];

    // Récupérer la description et les niveaux (sélecteur plus robuste)
    const $effectCell = $row.find("td:nth-child(2)");
    const descElems = $effectCell.find(".Skill_description__BNAs8");
    const description = descElems.first().text().trim();

    // Récupérer les niveaux depuis l'élément qui contient des <div> enfants
    const levels = {};
    const levelsContainer = descElems
      .filter((i, el) => $(el).find("div").length > 0)
      .first();
    if (levelsContainer && levelsContainer.length) {
      $(levelsContainer)
        .find("div")
        .each((_, levelDiv) => {
          let levelText = $(levelDiv)
            .text()
            .replace(/\uFEFF/g, "")
            .trim();
          // Supporter aussi le deux-points plein-width '：'
          const match = levelText.match(/Lv\.?\s*(\d+)\s*[:：]\s*(.+)/i);
          if (match) {
            levels[`Lv${match[1]}`] = match[2].trim();
          }
        });
    }

    skills[skillSlug] = {
      name: skillName,
      description: description,
      levels: levels,
    };
  });

  return skills;
}

/**
 * Scrape une langue
 */
async function scrapeLanguage(langCode) {
  const url =
    langCode === "zh-TW"
      ? `${BASE_URL}/skill`
      : `${BASE_URL}/${langCode}/skill`;

  console.log(`  Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(`  ⚠ HTTP ${response.status} for ${langCode}`);
      return null;
    }

    const html = await response.text();
    return parseSkillsPage(html, langCode);
  } catch (error) {
    console.warn(`  ⚠ Error for ${langCode}: ${error.message}`);
    return null;
  }
}

/**
 * Normalise un slug de skill pour le matching
 */
function normalizeSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/'/g, "") // Remove apostrophes
    .replace(/-+/g, "-") // Collapse multiple dashes
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes("--test");
  const forceUpdate = args.includes("--force");
  const singleLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];

  // Charger skills.json existant
  const skillsPath = path.join(__dirname, "../src/data/skills.json");
  const existingSkills = JSON.parse(fs.readFileSync(skillsPath, "utf-8"));

  // Langues à scraper
  const langsToScrape = singleLang ? [singleLang] : Object.keys(LANG_MAPPING);

  console.log(`🚀 Scraping skills from gamertw.com`);
  console.log(`   Languages: ${langsToScrape.join(", ")}`);
  if (testMode) console.log("   (Test mode - will not save)");

  const allData = {};

  for (const langCode of langsToScrape) {
    console.log(`\n📖 Processing ${langCode}...`);
    const skills = await scrapeLanguage(langCode);

    if (skills) {
      allData[langCode] = skills;
      console.log(`   ✓ Found ${Object.keys(skills).length} skills`);
    }

    await sleep(DELAY_MS);
  }

  // Maintenant, mettre à jour skills.json avec les nouvelles données
  console.log("\n📝 Updating skills.json...");

  let updatedCount = 0;
  let totalLevels = 0;
  const missingSkills = new Set();

  for (const [langCode, skills] of Object.entries(allData)) {
    const ourLang = LANG_MAPPING[langCode];
    if (!ourLang) continue;

    for (const [slug, data] of Object.entries(skills)) {
      const normalizedSlug = normalizeSlug(slug);

      // Chercher le skill dans notre fichier existant
      let existingKey = null;
      for (const key of Object.keys(existingSkills)) {
        if (normalizeSlug(key) === normalizedSlug) {
          existingKey = key;
          break;
        }
      }

      if (!existingKey) {
        missingSkills.add(slug);
        continue;
      }

      // Mettre à jour les levels si on en a
      if (data.levels && Object.keys(data.levels).length > 0) {
        if (!existingSkills[existingKey][ourLang]) {
          existingSkills[existingKey][ourLang] = {};
        }

        // Mettre à jour si les levels étaient vides OU si --force
        const existingLevels =
          existingSkills[existingKey][ourLang].levels || {};
        if (Object.keys(existingLevels).length === 0 || forceUpdate) {
          existingSkills[existingKey][ourLang].levels = data.levels;
          updatedCount++;
          totalLevels += Object.keys(data.levels).length;
        }
      }
    }
  }

  // Sauvegarder
  if (!testMode && updatedCount > 0) {
    fs.writeFileSync(
      skillsPath,
      JSON.stringify(existingSkills, null, 2),
      "utf-8"
    );
    console.log(
      `\n✅ Updated ${updatedCount} skill/language combinations with ${totalLevels} total levels`
    );
    console.log(`   Saved to ${skillsPath}`);
  } else if (testMode) {
    console.log(
      `\n🔍 Would update ${updatedCount} skill/language combinations`
    );
  } else {
    console.log("\n⚠ No updates needed");
  }

  // Afficher les skills non trouvés dans notre fichier
  if (missingSkills.size > 0) {
    console.log(
      `\n⚠ Skills from gamertw not found in our data (${missingSkills.size}):`
    );
    [...missingSkills].slice(0, 20).forEach((s) => console.log(`   - ${s}`));
    if (missingSkills.size > 20) {
      console.log(`   ... and ${missingSkills.size - 20} more`);
    }
  }

  // Lister les skills sans traduction de levels
  console.log("\n📋 Skills without level translations:");
  const skillsWithoutLevels = {};

  for (const [skillKey, skillData] of Object.entries(existingSkills)) {
    const enLevels = skillData.EN?.levels || {};
    if (Object.keys(enLevels).length === 0) continue; // Pas de levels EN = pas besoin de trad

    const missingLangs = [];
    for (const lang of Object.values(LANG_MAPPING)) {
      const langLevels = skillData[lang]?.levels || {};
      if (Object.keys(langLevels).length === 0) {
        missingLangs.push(lang);
      }
    }

    if (missingLangs.length > 0) {
      skillsWithoutLevels[skillKey] = missingLangs;
    }
  }

  const sortedMissing = Object.entries(skillsWithoutLevels).sort(
    (a, b) => b[1].length - a[1].length
  );

  if (sortedMissing.length > 0) {
    console.log(
      `   Total: ${sortedMissing.length} skills with missing translations`
    );
    sortedMissing.slice(0, 30).forEach(([skill, langs]) => {
      console.log(`   - ${skill}: missing ${langs.join(", ")}`);
    });
  } else {
    console.log("   All skills have level translations! 🎉");
  }
}

main().catch(console.error);
