/**
 * Script pour scraper les armures de Monster Hunter Wilds
 * depuis https://mhwilds.kiranico.com/data/armor-series
 *
 * Le site Kiranico est une app Next.js qui intègre les traductions dans le HTML
 * via des objets JSON React Server Components (RSC).
 *
 * Structure de sortie :
 * {
 *   "armor_slug": {
 *     "EN": {
 *       series_name: "...",
 *       pieces: {
 *         head: { name, description },
 *         chest: { name, description },
 *         arms: { name, description },
 *         waist: { name, description },
 *         legs: { name, description }
 *       },
 *       defense: { ... },
 *       resistances: { fire, water, thunder, ice, dragon },
 *       skills: [{ name, level }]
 *     },
 *     "FR": { ... },
 *     ...
 *   }
 * }
 *
 * === MODES D'UTILISATION ===
 *
 * 1. MODE FULL SCRAPE :
 *    $ node scripts/scrape-armors-kiranico.js
 *
 * 2. MODE TEST (quelques armures seulement) :
 *    $ node scripts/scrape-armors-kiranico.js --test
 *
 * === LANGUES SUPPORTÉES ===
 * EN, JA, FR, IT, DE, ES, RU, PL, PT, KO, ZH, ZH_HANT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping des codes de langue Kiranico vers nos codes internes
const KIRANICO_LANG_MAP = {
  en: "EN",
  ja: "JA",
  fr: "FR",
  it: "IT",
  de: "DE",
  es: "ES",
  ru: "RU",
  pl: "PL",
  "pt-BR": "PT",
  ko: "KO",
  zh: "ZH",
  "zh-Hant": "ZH_HANT",
};

const BASE_URL = "https://mhwilds.kiranico.com/data/armor-series";
const TEST_MODE = process.argv.includes("--test");

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
 * Parse les données JSON stringifiées dans les scripts RSC
 */
function extractRSCData(html) {
  const pushMatches = html.matchAll(
    /self\.__next_f\.push\(\[[\d,]*"([^]*?)"\]\)/g
  );
  let fullContent = "";

  for (const match of pushMatches) {
    let content = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
    fullContent += content;
  }

  return fullContent;
}

/**
 * Extrait les traductions d'un objet "type":"tx"
 */
function extractTranslations(txContent) {
  const translations = {};
  // Format: {"ja":"...", "en":"...", "fr":"...", ...}
  const matches = txContent.matchAll(
    /"([a-z]{2}(?:-[A-Za-z]+)?)":\s*"([^"]+)"/g
  );
  for (const m of matches) {
    const lang = KIRANICO_LANG_MAP[m[1]];
    if (lang) {
      translations[lang] = m[2];
    }
  }
  return translations;
}

/**
 * Récupère la liste des slugs d'armures depuis la page principale
 * Filtre uniquement les slugs anglais (pas les versions localisées comme /fr/, /ja/, etc.)
 */
async function fetchArmorSlugs() {
  console.log("📋 Récupération de la liste des armures...");
  const html = await fetchWithRetry(BASE_URL);

  // Extraire les slugs RSC qui sont dans le format "en":"/data/armor-series/slug"
  // Ce sont les slugs anglais canoniques
  const rscContent = extractRSCData(html);
  const canonicalMatches = rscContent.matchAll(
    /"en":"\/data\/armor-series\/([a-z0-9-]+)"/g
  );
  const slugs = new Set();

  for (const match of canonicalMatches) {
    if (!match[1].includes("\\") && match[1].length > 0) {
      slugs.add(match[1]);
    }
  }

  // Fallback: si pas trouvé dans RSC, chercher dans le HTML direct
  if (slugs.size === 0) {
    const htmlMatches = html.matchAll(
      /href="\/data\/armor-series\/([a-z0-9-]+)"/g
    );
    for (const match of htmlMatches) {
      if (!match[1].includes("\\") && match[1].length > 0) {
        slugs.add(match[1]);
      }
    }
  }

  console.log(`  ✓ Trouvé ${slugs.size} séries d'armures`);
  return Array.from(slugs);
}

/**
 * Parse les données d'une série d'armure depuis la page détail
 */
async function scrapeArmorDetail(slug) {
  const url = `${BASE_URL}/${slug}`;
  const html = await fetchWithRetry(url);
  const rscContent = extractRSCData(html);

  const armorData = {};

  // Extraire toutes les traductions "type":"tx" dans l'ordre
  // La structure est:
  // - TX 0 ou 1: Nom de la série
  // - TX suivants: alternance nom_piece / description_piece pour head, chest, arms, waist, legs
  const txPattern = /"type":"tx","props":\{"children":\{([^}]+)\}\}/g;
  const allTranslations = [];

  let txMatch;
  while ((txMatch = txPattern.exec(rscContent)) !== null) {
    const translations = extractTranslations(`{${txMatch[1]}}`);
    if (Object.keys(translations).length >= 10) {
      // Au moins les 12 langues principales
      allTranslations.push(translations);
    }
  }

  if (allTranslations.length === 0) {
    return armorData;
  }

  // Trouver le nom de la série (celui qui correspond au slug)
  // C'est généralement le 2ème TX (le 1er peut être la série précédente dans la pagination)
  let seriesIndex = 0;
  const slugLower = slug.toLowerCase().replace(/-/g, "");

  for (let i = 0; i < Math.min(3, allTranslations.length); i++) {
    const enName = allTranslations[i].EN || "";
    const enNameNorm = enName.toLowerCase().replace(/[^a-z]/g, "");
    if (
      enNameNorm.includes(slugLower) ||
      slugLower.includes(enNameNorm.substring(0, 4))
    ) {
      seriesIndex = i;
      break;
    }
  }

  // Initialiser les données pour chaque langue avec le nom de série
  const seriesTranslations = allTranslations[seriesIndex];
  for (const [lang, name] of Object.entries(seriesTranslations)) {
    armorData[lang] = {
      series_name: name,
      pieces: {},
      skills: [],
    };
  }

  // Extraire les pièces (nom + description en alternance)
  // Après le nom de série, on a: nom_head, desc_head, nom_chest, desc_chest, etc.
  const pieceTypes = ["head", "chest", "arms", "waist", "legs"];
  const startIdx = seriesIndex + 1;

  for (let i = 0; i < pieceTypes.length; i++) {
    const nameIdx = startIdx + i * 2;
    const descIdx = startIdx + i * 2 + 1;

    if (nameIdx < allTranslations.length) {
      const pieceType = pieceTypes[i];
      const nameTranslations = allTranslations[nameIdx];
      const descTranslations =
        descIdx < allTranslations.length ? allTranslations[descIdx] : {};

      for (const lang of Object.keys(armorData)) {
        armorData[lang].pieces[pieceType] = {
          name: nameTranslations[lang] || "",
          description: descTranslations[lang] || "",
        };
      }
    }
  }

  // Extraire les skills
  const skillsMatches = rscContent.matchAll(
    /"hrefs":\{[^}]*"en":"\/data\/skills\/([^"]+)"[^}]*\},"children":"([^"]+)"/g
  );
  const skills = [];
  for (const sm of skillsMatches) {
    const skillSlug = sm[1];
    const skillText = sm[2]; // ex: "Neopteron Alert +1"
    const levelMatch = skillText.match(/\+(\d+)$/);
    skills.push({
      slug: skillSlug,
      name: skillText.replace(/\s*\+\d+$/, ""),
      level: levelMatch ? parseInt(levelMatch[1]) : 1,
    });
  }

  // Ajouter les skills à chaque langue
  for (const lang of Object.keys(armorData)) {
    armorData[lang].skills = skills;
  }

  return armorData;
}

/**
 * Scrape toutes les armures
 */
async function scrapeAllArmors() {
  console.log("🛡️ Début du scraping des armures depuis Kiranico...\n");

  const slugs = await fetchArmorSlugs();
  const testSlugs = TEST_MODE ? slugs.slice(0, 5) : slugs;

  console.log(
    `\n📥 Scraping ${testSlugs.length} séries d'armures${
      TEST_MODE ? " (mode test)" : ""
    }...\n`
  );

  const armors = {};
  let success = 0;
  let failed = 0;

  for (let i = 0; i < testSlugs.length; i++) {
    const slug = testSlugs[i];
    process.stdout.write(`  [${i + 1}/${testSlugs.length}] ${slug}... `);

    try {
      const data = await scrapeArmorDetail(slug);

      if (Object.keys(data).length > 0) {
        armors[slug] = data;
        console.log("✓");
        success++;
      } else {
        console.log("⚠ (pas de données)");
      }

      // Délai pour éviter le rate limiting
      if (i < testSlugs.length - 1) {
        await delay(200);
      }
    } catch (error) {
      console.log("✗", error.message);
      failed++;
    }
  }

  console.log(`\n📊 Résultats:`);
  console.log(`  ✓ Réussites: ${success}`);
  console.log(`  ✗ Échecs: ${failed}`);
  console.log(`  📁 Total armures: ${Object.keys(armors).length}`);

  // Sauvegarder
  const outputPath = path.join(__dirname, "../src/data/armors-kiranico.json");
  fs.writeFileSync(outputPath, JSON.stringify(armors, null, 2), "utf-8");
  console.log(`\n💾 Sauvegardé dans: ${outputPath}`);

  // Afficher un exemple
  const firstSlug = Object.keys(armors)[0];
  if (firstSlug) {
    console.log(`\n📝 Exemple (${firstSlug}):`);
    console.log(
      JSON.stringify(armors[firstSlug], null, 2).substring(0, 1000) + "..."
    );
  }

  return armors;
}

// Exécution
scrapeAllArmors().catch(console.error);
