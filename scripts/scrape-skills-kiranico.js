/**
 * Script pour scraper les skills de Monster Hunter Wilds
 * depuis https://mhwilds.kiranico.com/data/skills
 *
 * Le site Kiranico dispose de versions localisées pour chaque langue.
 * Ce script scrape la page EN pour obtenir la liste des skills,
 * puis récupère les traductions depuis les autres versions linguistiques.
 *
 * Structure de sortie :
 * {
 *   "skill_slug": {
 *     "EN": { name, description },
 *     "FR": { name, description },
 *     ...
 *   }
 * }
 *
 * === MODES D'UTILISATION ===
 *
 * 1. MODE FULL SCRAPE :
 *    $ node scripts/scrape-skills-kiranico.js
 *
 * 2. MODE TEST (quelques skills seulement) :
 *    $ node scripts/scrape-skills-kiranico.js --test
 *
 * 3. MODE INCRÉMENTAL (ne scrape que les nouveaux skills) :
 *    $ node scripts/scrape-skills-kiranico.js --incremental
 *
 * === LANGUES SUPPORTÉES ===
 * EN, JA, FR, IT, DE, ES, RU, PL, PT, KO, ZH, ZH_HANT
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des langues
// Code Kiranico -> Notre code interne
const LANG_CONFIG = {
  EN: { urlPrefix: "", kiranicoCode: "en" },
  JA: { urlPrefix: "/ja", kiranicoCode: "ja" },
  FR: { urlPrefix: "/fr", kiranicoCode: "fr" },
  IT: { urlPrefix: "/it", kiranicoCode: "it" },
  DE: { urlPrefix: "/de", kiranicoCode: "de" },
  ES: { urlPrefix: "/es", kiranicoCode: "es" },
  RU: { urlPrefix: "/ru", kiranicoCode: "ru" },
  PL: { urlPrefix: "/pl", kiranicoCode: "pl" },
  PT: { urlPrefix: "/pt-BR", kiranicoCode: "pt-BR" },
  KO: { urlPrefix: "/ko", kiranicoCode: "ko" },
  ZH: { urlPrefix: "/zh", kiranicoCode: "zh" },
  ZH_HANT: { urlPrefix: "/zh-Hant", kiranicoCode: "zh-Hant" },
};

const BASE_URL = "https://mhwilds.kiranico.com";

// Délais pour être gentil avec le serveur
const DELAY_BETWEEN_REQUESTS = 300; // ms
const DELAY_BETWEEN_LANGUAGES = 100; // ms

/**
 * Pause execution
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch avec retry et gestion des erreurs
 */
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(
        `  ⚠ Attempt ${i + 1}/${retries} failed for ${url}:`,
        error.message
      );
      if (i < retries - 1) {
        await delay(1000 * (i + 1));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Extrait les skills depuis la page de liste (version anglaise)
 */
async function fetchSkillsList() {
  const url = `${BASE_URL}/data/skills`;
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const skills = [];

  // Les skills sont dans un tableau avec des liens vers /data/skills/[slug]
  $('a[href^="/data/skills/"]').each((_, elem) => {
    const href = $(elem).attr("href");
    const name = $(elem).text().trim();

    // Extraire le slug
    const match = href.match(/\/data\/skills\/([^/]+)$/);
    if (match && name) {
      const slug = match[1];
      // Éviter les doublons
      if (!skills.find((s) => s.slug === slug)) {
        skills.push({ slug, name });
      }
    }
  });

  return skills;
}

/**
 * Récupère les données d'un skill dans une langue donnée
 */
async function fetchSkillInLanguage(slug, langCode) {
  const config = LANG_CONFIG[langCode];
  if (!config) {
    throw new Error(`Unknown language: ${langCode}`);
  }

  // Construire l'URL
  // EN: /data/skills/attack-boost
  // FR: /fr/data/skills/augmentation-dattaque (slug traduit)
  // Mais on doit d'abord trouver le slug traduit...

  // Approche: on va sur la page EN et on récupère le lien vers la version localisée
  // via les liens de changement de langue dans le header

  // Alternative plus simple: on scrape la page de liste dans chaque langue
  // et on fait correspondre par position dans le tableau

  // Pour l'instant, utilisons la version EN et récupérons les traductions
  // depuis les métadonnées de la page de détail

  const url = `${BASE_URL}${config.urlPrefix}/data/skills`;
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  // Récupérer tous les skills avec leurs descriptions
  const skillsData = {};

  // Les skills sont dans un tableau
  // Chaque ligne a: nom du skill (lien) | description
  $("table tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const nameCell = cells.eq(0);
      const descCell = cells.eq(1);

      const link = nameCell.find("a");
      const href = link.attr("href") || "";
      const name = link.text().trim();
      const description = descCell.text().trim();

      // Extraire le slug du href
      const match = href.match(/\/skills\/([^/]+)$/);
      if (match && name) {
        const localSlug = match[1];
        skillsData[localSlug] = { name, description };
      }
    }
  });

  return skillsData;
}

/**
 * Crée une table de correspondance entre slugs EN et slugs localisés
 * En scrapant la page de détail EN pour obtenir les liens vers autres langues
 */
async function buildSlugMapping(enSkills) {
  const mapping = {};

  // Pour chaque skill, on récupère les slugs dans toutes les langues
  // depuis les liens de changement de langue sur la page de détail

  console.log("\nBuilding slug mapping from detail pages...");
  let count = 0;

  for (const skill of enSkills) {
    count++;
    if (count % 20 === 0) {
      console.log(`  Processing ${count}/${enSkills.length}...`);
    }

    try {
      const url = `${BASE_URL}/data/skills/${skill.slug}`;
      const html = await fetchWithRetry(url);
      const $ = cheerio.load(html);

      mapping[skill.slug] = { EN: skill.slug };

      // Chercher les liens de changement de langue
      // Ils sont généralement dans un sélecteur de langue ou le footer
      $('a[href*="/data/skills/"]').each((_, elem) => {
        const href = $(elem).attr("href") || "";

        for (const [langCode, config] of Object.entries(LANG_CONFIG)) {
          if (langCode === "EN") continue;

          // Pattern: /fr/data/skills/augmentation-dattaque
          const pattern = new RegExp(
            `^${config.urlPrefix}/data/skills/([^/]+)$`
          );
          const match = href.match(pattern);
          if (match) {
            mapping[skill.slug][langCode] = match[1];
          }
        }
      });

      await delay(DELAY_BETWEEN_REQUESTS);
    } catch (error) {
      console.error(
        `  Error getting slug mapping for ${skill.slug}:`,
        error.message
      );
    }
  }

  return mapping;
}

/**
 * Scrape tous les skills dans toutes les langues
 */
async function scrapeAllSkills(testMode = false) {
  console.log("=== Monster Hunter Wilds Skills Scraper (Kiranico) ===\n");

  // Étape 1: Récupérer la liste des skills en anglais
  console.log("Step 1: Fetching skills list (EN)...");
  const enSkills = await fetchSkillsList();
  console.log(`  Found ${enSkills.length} skills`);

  if (testMode) {
    enSkills.splice(5); // Garder seulement 5 skills pour le test
    console.log(`  [TEST MODE] Limited to ${enSkills.length} skills`);
  }

  // Étape 2: Pour chaque langue, récupérer la liste complète
  console.log("\nStep 2: Fetching skills in all languages...");
  const skillsByLang = {};

  for (const langCode of Object.keys(LANG_CONFIG)) {
    console.log(`  Fetching ${langCode}...`);
    try {
      skillsByLang[langCode] = await fetchSkillInLanguage(null, langCode);
      console.log(
        `    Found ${Object.keys(skillsByLang[langCode]).length} skills`
      );
    } catch (error) {
      console.error(`    Error: ${error.message}`);
      skillsByLang[langCode] = {};
    }
    await delay(DELAY_BETWEEN_LANGUAGES);
  }

  // Étape 3: Construire le mapping des slugs
  console.log("\nStep 3: Building slug mapping...");

  // Approche simplifiée: on utilise l'ordre des skills dans le tableau
  // Puisque les tableaux sont dans le même ordre dans toutes les langues

  // D'abord, récupérons les slugs dans l'ordre pour chaque langue
  const slugsInOrder = {};

  for (const langCode of Object.keys(LANG_CONFIG)) {
    slugsInOrder[langCode] = Object.keys(skillsByLang[langCode]);
  }

  // Créer le mapping basé sur l'index
  const skillsData = {};

  for (let i = 0; i < enSkills.length; i++) {
    const enSlug = enSkills[i].slug;
    skillsData[enSlug] = {};

    for (const langCode of Object.keys(LANG_CONFIG)) {
      // Trouver le slug correspondant dans cette langue (par index)
      const localSlug = slugsInOrder[langCode][i];
      const localData = skillsByLang[langCode][localSlug];

      if (localData) {
        skillsData[enSlug][langCode] = {
          name: localData.name,
          description: localData.description,
          levels: {},
        };
      } else {
        // Fallback: utiliser les données EN
        skillsData[enSlug][langCode] = {
          name: skillsByLang["EN"][enSlug]?.name || enSkills[i].name,
          description: skillsByLang["EN"][enSlug]?.description || "",
          levels: {},
        };
      }
    }
  }

  return skillsData;
}

/**
 * Point d'entrée principal
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes("--test");
  const incremental = args.includes("--incremental");

  console.log(
    `Mode: ${testMode ? "Test" : incremental ? "Incremental" : "Full scrape"}\n`
  );

  // Charger les données existantes si mode incrémental
  let existingData = {};
  const outputPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "skills-kiranico.json"
  );

  if (incremental && fs.existsSync(outputPath)) {
    console.log("Loading existing data...");
    existingData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    console.log(
      `  Found ${Object.keys(existingData).length} existing skills\n`
    );
  }

  // Scraper les skills
  const skillsData = await scrapeAllSkills(testMode);

  // Fusionner avec les données existantes si mode incrémental
  if (incremental) {
    for (const [slug, data] of Object.entries(existingData)) {
      if (!skillsData[slug]) {
        skillsData[slug] = data;
      }
    }
  }

  // Sauvegarder
  console.log("\nSaving data...");
  fs.writeFileSync(outputPath, JSON.stringify(skillsData, null, 2), "utf-8");
  console.log(`  Saved to ${outputPath}`);

  // Stats
  console.log("\n=== Summary ===");
  console.log(`Total skills: ${Object.keys(skillsData).length}`);
  console.log(`Languages: ${Object.keys(LANG_CONFIG).join(", ")}`);

  // Vérifier la couverture
  let withDescriptions = 0;
  for (const skillData of Object.values(skillsData)) {
    if (skillData.EN?.description) withDescriptions++;
  }
  console.log(`Skills with descriptions: ${withDescriptions}`);

  console.log("\nDone!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
