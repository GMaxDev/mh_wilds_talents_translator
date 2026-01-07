/**
 * Script pour scraper les niveaux détaillés des skills depuis Kiranico
 * https://mhwilds.kiranico.com/data/skills/[skill-slug]
 *
 * Ce script récupère les effets de chaque niveau pour tous les talents
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://mhwilds.kiranico.com";

// Langues supportées par Kiranico
const KIRANICO_LANGS = {
  EN: "",
  FR: "fr",
  DE: "de",
  ES: "es",
  IT: "it",
  PL: "pl",
  PT: "pt",
  JA: "ja",
  KO: "ko",
  ZH: "zh",
  ZH_HANT: "zh-Hant",
};

// Délai entre les requêtes
const DELAY_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convertit un ID de skill vers le slug URL Kiranico
 */
function skillIdToSlug(skillId) {
  return skillId.replace(/_/g, "-");
}

/**
 * Construit l'URL pour un skill dans une langue donnée
 */
function buildSkillUrl(skillSlug, lang) {
  const langCode = KIRANICO_LANGS[lang];
  if (langCode === "") {
    return `${BASE_URL}/data/skills/${skillSlug}`;
  }
  return `${BASE_URL}/${langCode}/data/skills/${skillSlug}`;
}

/**
 * Scrape les données d'un skill depuis Kiranico
 */
async function scrapeSkillLevels(skillSlug, lang) {
  const url = buildSkillUrl(skillSlug, lang);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ⚠ HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraire le nom du skill
    const skillName = $("h1").first().text().trim();

    // Extraire la description
    const description = $("blockquote").first().next("p").text().trim();

    // Extraire les niveaux
    const levels = {};

    // Trouver la table des niveaux (première table après la description)
    const tables = $("table");
    if (tables.length > 0) {
      const firstTable = $(tables[0]);
      firstTable.find("tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 3) {
          const levelText = $(cells[0]).text().trim();
          const levelMatch = levelText.match(/Lv(\d+)/i);
          if (levelMatch) {
            const levelNum = levelMatch[1];
            const effect = $(cells[2]).text().trim();
            if (effect) {
              levels[`Lv${levelNum}`] = effect;
            }
          }
        }
      });
    }

    return {
      name: skillName,
      description: description || null,
      levels: levels,
    };
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Récupère la liste des skills depuis la page principale
 */
async function getSkillsList() {
  const url = `${BASE_URL}/data/skills`;
  console.log(`📋 Fetching skills list from ${url}...`);

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const skills = [];

    // Trouver tous les liens vers les skills
    $('a[href*="/data/skills/"]').each((_, el) => {
      const href = $(el).attr("href");
      const match = href.match(/\/data\/skills\/([a-z0-9-]+)$/i);
      if (match && match[1] !== "skills") {
        const slug = match[1];
        const name = $(el).text().trim();
        if (name && !skills.find((s) => s.slug === slug)) {
          skills.push({ slug, name });
        }
      }
    });

    console.log(`  Found ${skills.length} skills`);
    return skills;
  } catch (error) {
    console.error("Error fetching skills list:", error.message);
    return [];
  }
}

/**
 * Charge les skills existants
 */
function loadExistingSkills() {
  const skillsPath = path.join(__dirname, "..", "src", "data", "skills.json");
  if (fs.existsSync(skillsPath)) {
    return JSON.parse(fs.readFileSync(skillsPath, "utf-8"));
  }
  return {};
}

/**
 * Sauvegarde les skills
 */
function saveSkills(skills) {
  const skillsPath = path.join(__dirname, "..", "src", "data", "skills.json");
  fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2), "utf-8");
  console.log(`\n✅ Saved to ${skillsPath}`);
}

/**
 * Parse les arguments CLI
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    test: args.includes("--test"),
    lang: args.find((a) => a.startsWith("--lang="))?.substring(7) || null,
    skill: args.find((a) => a.startsWith("--skill="))?.substring(8) || null,
  };
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MH Wilds Skills Levels Scraper (Kiranico)              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const options = parseArgs();
  const existingSkills = loadExistingSkills();

  // Récupérer la liste des skills
  let skillsList;
  if (options.skill) {
    skillsList = [{ slug: options.skill, name: options.skill }];
  } else {
    skillsList = await getSkillsList();
  }

  if (options.test) {
    console.log("\n🧪 Test mode: only scraping first 3 skills");
    skillsList = skillsList.slice(0, 3);
  }

  // Déterminer les langues à scraper
  const langsToScrape = options.lang
    ? [options.lang.toUpperCase()]
    : Object.keys(KIRANICO_LANGS);

  console.log(`\n🌐 Languages to scrape: ${langsToScrape.join(", ")}`);
  console.log(`📊 Skills to scrape: ${skillsList.length}`);
  console.log(
    `🔢 Total requests: ~${skillsList.length * langsToScrape.length}\n`
  );

  const updatedSkills = { ...existingSkills };

  for (let i = 0; i < skillsList.length; i++) {
    const { slug, name } = skillsList[i];
    const skillId = slug; // Garder le format avec tirets comme dans skills.json

    console.log(`\n[${i + 1}/${skillsList.length}] ${name} (${slug})`);

    // Initialiser si n'existe pas
    if (!updatedSkills[skillId]) {
      updatedSkills[skillId] = {};
    }

    for (const lang of langsToScrape) {
      process.stdout.write(`  ${lang}... `);

      const data = await scrapeSkillLevels(slug, lang);

      if (data) {
        // Mettre à jour ou créer les données pour cette langue
        if (!updatedSkills[skillId][lang]) {
          updatedSkills[skillId][lang] = {
            name: data.name,
            description: data.description || "",
            levels: {},
          };
        }

        // Mettre à jour le nom si on l'a récupéré
        if (data.name) {
          updatedSkills[skillId][lang].name = data.name;
        }

        // Mettre à jour la description si on l'a récupérée
        if (data.description) {
          updatedSkills[skillId][lang].description = data.description;
        }

        // Mettre à jour les niveaux
        if (Object.keys(data.levels).length > 0) {
          updatedSkills[skillId][lang].levels = data.levels;
          console.log(`✓ (${Object.keys(data.levels).length} levels)`);
        } else {
          console.log(`✓ (no levels found)`);
        }
      } else {
        console.log(`✗`);
      }

      await sleep(DELAY_MS);
    }
  }

  // Sauvegarder
  saveSkills(updatedSkills);

  // Résumé
  const totalSkills = Object.keys(updatedSkills).length;
  const skillsWithLevels = Object.values(updatedSkills).filter((s) =>
    Object.values(s).some(
      (langData) => langData.levels && Object.keys(langData.levels).length > 0
    )
  ).length;

  console.log(`\n📊 Summary:`);
  console.log(`   Total skills: ${totalSkills}`);
  console.log(`   Skills with levels: ${skillsWithLevels}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
