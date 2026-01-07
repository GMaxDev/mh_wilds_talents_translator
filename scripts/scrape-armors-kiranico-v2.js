/**
 * Script pour scraper les armures de Monster Hunter Wilds
 * depuis https://mhwilds.kiranico.com/data/armor-series
 *
 * VERSION 2 - Extrait toutes les données: noms, defense, résistances, slots, skills
 *
 * Le site Kiranico est une app Next.js qui intègre les données dans le HTML
 * via des objets JSON React Server Components (RSC).
 *
 * Structure de sortie :
 * {
 *   "armor_slug": {
 *     "EN": {
 *       series_name: "...",
 *       pieces: {
 *         head: { name, description, defense, slots, resistances: {fire, water, thunder, ice, dragon}, skills: [{name, level}] },
 *         chest: { ... },
 *         arms: { ... },
 *         waist: { ... },
 *         legs: { ... }
 *       }
 *     },
 *     "FR": { ... },
 *     ...
 *   }
 * }
 *
 * === MODES D'UTILISATION ===
 *
 * 1. MODE FULL SCRAPE :
 *    $ node scripts/scrape-armors-kiranico-v2.js
 *
 * 2. MODE TEST (quelques armures seulement) :
 *    $ node scripts/scrape-armors-kiranico-v2.js --test
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
const PIECE_TYPES = ["head", "chest", "arms", "waist", "legs"];
const PIECE_LABELS = ["Head", "Chest", "Arms", "Waist", "Legs"];

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
 * Extrait les traductions d'un objet TX
 */
function extractTxTranslations(txProps) {
  const translations = {};
  if (txProps && txProps.children) {
    for (const [lang, value] of Object.entries(txProps.children)) {
      const mappedLang = KIRANICO_LANG_MAP[lang];
      if (mappedLang) {
        translations[mappedLang] = value;
      }
    }
  }
  return translations;
}

/**
 * Parse récursivement un objet JSON pour extraire les TX
 */
function extractTxFromValue(value) {
  if (!value || typeof value !== "object") return null;

  if (value.type === "tx" && value.props?.children) {
    return extractTxTranslations(value.props);
  }

  return null;
}

/**
 * Récupère la liste des slugs d'armures depuis la page principale
 */
async function fetchArmorSlugs() {
  console.log("📋 Récupération de la liste des armures...");
  const html = await fetchWithRetry(BASE_URL);

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
 * Parse le JSON RSC structuré pour une armure
 */
function parseArmorFromRSC(rscContent) {
  // Chercher le bloc "entry" qui contient toutes les données de l'armure
  const entryMatch = rscContent.match(
    /"entry":\{"type":"content","props":\{"children":\[([\s\S]*?)\]\}\}/
  );
  if (!entryMatch) return null;

  try {
    // Reconstruire le JSON complet
    const fullEntryStr = `{"type":"content","props":{"children":[${entryMatch[1]}]}}`;
    const entry = JSON.parse(fullEntryStr);
    return entry.props.children;
  } catch (e) {
    // Si le JSON direct échoue, on parse manuellement
    return null;
  }
}

/**
 * Parse les données d'une série d'armure depuis la page détail (nouvelle approche)
 */
async function scrapeArmorDetail(slug) {
  const url = `${BASE_URL}/${slug}`;
  const html = await fetchWithRetry(url);
  const rscContent = extractRSCData(html);

  // Structure de données pour toutes les langues
  const armorData = {};
  const languages = Object.values(KIRANICO_LANG_MAP);

  // Initialiser la structure pour chaque langue
  for (const lang of languages) {
    armorData[lang] = {
      series_name: "",
      pieces: {},
    };
    for (const pieceType of PIECE_TYPES) {
      armorData[lang].pieces[pieceType] = {
        name: "",
        description: "",
        defense: 0,
        slots: [0, 0, 0],
        resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
        skills: [],
      };
    }
  }

  // === EXTRACTION DU NOM DE LA SÉRIE ===
  // Pattern: "type":"h2","props":{"children":{"type":"tx","props":{"children":{"ja":"...","en":"..."}}}}
  const h2Match = rscContent.match(
    /"type":"h2","props":\{"children":\{"type":"tx","props":\{"children":\{([^}]+)\}\}\}/
  );
  if (h2Match) {
    const langMatches = h2Match[1].matchAll(
      /"([a-z]{2}(?:-[A-Za-z]+)?)":\s*"([^"]+)"/g
    );
    for (const m of langMatches) {
      const lang = KIRANICO_LANG_MAP[m[1]];
      if (lang && armorData[lang]) {
        armorData[lang].series_name = m[2];
      }
    }
  }

  // === EXTRACTION DES NOMS ET DESCRIPTIONS DES PIÈCES (Table 1) ===
  // Chercher la première table avec les noms et descriptions
  const table1Regex =
    /"type":"table","props":\{"children":\[((?:[^\[\]]|\[(?:[^\[\]]|\[[^\]]*\])*\])*?)\]\}/g;
  const tables = [];
  let tableMatch;
  while ((tableMatch = table1Regex.exec(rscContent)) !== null) {
    tables.push(tableMatch[1]);
  }

  // Table 1 et 2: Noms + descriptions (première table avec 2 colonnes par row)
  // Table 3: Defense et résistances
  // Table 4: Slots et skills

  // Pour extraire les pièces avec les TX translations, on utilise un pattern plus sophistiqué
  // Pattern pour TX: "type":"tx","props":{"children":{"ja":"...","en":"...",...}}
  const txPattern = /"type":"tx","props":\{"children":\{([^}]+)\}\}/g;
  const allTx = [];
  let txMatch;
  while ((txMatch = txPattern.exec(rscContent)) !== null) {
    const translations = {};
    const langMatches = txMatch[1].matchAll(
      /"([a-z]{2}(?:-[A-Za-z]+)?)":\s*"([^"]+)"/g
    );
    for (const m of langMatches) {
      const lang = KIRANICO_LANG_MAP[m[1]];
      if (lang) {
        translations[lang] = m[2];
      }
    }
    if (Object.keys(translations).length >= 10) {
      allTx.push(translations);
    }
  }

  // Les TX sont dans l'ordre: série, puis pour chaque pièce: nom, description
  // Total attendu: 1 (série) + 5*2 (pièces) = 11 TX minimum pour les noms/desc
  // Plus les TX pour les résistances dans les tables

  if (allTx.length >= 11) {
    // Premier TX = nom de la série (ou nav précédent, on cherche celui qui matche le slug)
    let seriesIdx = 0;
    const slugNorm = slug
      .toLowerCase()
      .replace(/-/g, "")
      .replace(/[^a-z]/g, "");

    for (let i = 0; i < Math.min(5, allTx.length); i++) {
      const enName = (allTx[i].EN || "").toLowerCase().replace(/[^a-z]/g, "");
      if (
        enName.includes(slugNorm.substring(0, 3)) ||
        slugNorm.includes(enName.substring(0, 3))
      ) {
        seriesIdx = i;
        break;
      }
    }

    // Appliquer le nom de série
    for (const lang of languages) {
      if (allTx[seriesIdx][lang]) {
        armorData[lang].series_name = allTx[seriesIdx][lang];
      }
    }

    // Les 10 TX suivants sont nom/desc pour chaque pièce
    for (let i = 0; i < 5; i++) {
      const nameIdx = seriesIdx + 1 + i * 2;
      const descIdx = seriesIdx + 2 + i * 2;
      const pieceType = PIECE_TYPES[i];

      if (nameIdx < allTx.length) {
        for (const lang of languages) {
          if (allTx[nameIdx][lang]) {
            armorData[lang].pieces[pieceType].name = allTx[nameIdx][lang];
          }
        }
      }

      if (descIdx < allTx.length) {
        for (const lang of languages) {
          if (allTx[descIdx][lang]) {
            armorData[lang].pieces[pieceType].description =
              allTx[descIdx][lang];
          }
        }
      }
    }
  }

  // === EXTRACTION DES DEFENSE ET RÉSISTANCES ===
  // Pattern pour les lignes de table avec defense: "Head", TX nom, 48, 3, -2, 0, -2, 3
  // Les valeurs numériques sont directement dans le JSON
  const defenseRowPattern =
    /\{"type":"tr","props":\{"children":\[\{"type":"td","props":\{"children":"(Head|Chest|Arms|Waist|Legs)"\}\},\{"type":"td","props":\{"children":\{"type":"tx"[^}]+\}[^}]+\},"align":"left"\}\},\{"type":"td","props":\{"children":(\d+)\}\},\{"type":"td","props":\{"children":(-?\d+)\}\},\{"type":"td","props":\{"children":(-?\d+)\}\},\{"type":"td","props":\{"children":(-?\d+)\}\},\{"type":"td","props":\{"children":(-?\d+)\}\},\{"type":"td","props":\{"children":(-?\d+)\}\}\]\}\}/g;

  let defMatch;
  while ((defMatch = defenseRowPattern.exec(rscContent)) !== null) {
    const pieceLabel = defMatch[1];
    const pieceIdx = PIECE_LABELS.indexOf(pieceLabel);
    if (pieceIdx === -1) continue;

    const pieceType = PIECE_TYPES[pieceIdx];
    const defense = parseInt(defMatch[2]);
    const fire = parseInt(defMatch[3]);
    const water = parseInt(defMatch[4]);
    const thunder = parseInt(defMatch[5]);
    const ice = parseInt(defMatch[6]);
    const dragon = parseInt(defMatch[7]);

    for (const lang of languages) {
      armorData[lang].pieces[pieceType].defense = defense;
      armorData[lang].pieces[pieceType].resistances = {
        fire,
        water,
        thunder,
        ice,
        dragon,
      };
    }
  }

  // === EXTRACTION DES SLOTS ===
  // Pattern: "type":"td","props":{"children":["[2]","[2]","[1]"]}
  const slotsRowPattern =
    /\{"type":"tr","props":\{"children":\[\{"type":"td","props":\{"children":"(Head|Chest|Arms|Waist|Legs)"\}\},\{"type":"td","props":\{"children":\{"type":"tx"[^}]+\}[^}]+\},"align":"left"\}\},\{"type":"td","props":\{"children":\["?\[(\d+)\]"?,"?\[(\d+)\]"?,"?\[(\d+)\]"?\]\}\}/g;

  let slotsMatch;
  while ((slotsMatch = slotsRowPattern.exec(rscContent)) !== null) {
    const pieceLabel = slotsMatch[1];
    const pieceIdx = PIECE_LABELS.indexOf(pieceLabel);
    if (pieceIdx === -1) continue;

    const pieceType = PIECE_TYPES[pieceIdx];
    const slots = [
      parseInt(slotsMatch[2]),
      parseInt(slotsMatch[3]),
      parseInt(slotsMatch[4]),
    ];

    for (const lang of languages) {
      armorData[lang].pieces[pieceType].slots = slots;
    }
  }

  // === EXTRACTION DES SKILLS PAR PIÈCE ===
  // Pattern: on cherche les lignes de table avec slots suivies des skills
  // Structure: td Head, td TX nom, td slots, td [div avec skills]
  // Skill: "children":"Master of the Fist +1"
  const skillsTablePattern =
    /\{"type":"tr","props":\{"children":\[\{"type":"td","props":\{"children":"(Head|Chest|Arms|Waist|Legs)"\}\},\{"type":"td","props":\{"children":\{"type":"tx"[^}]+\}[^}]+\},"align":"left"\}\},\{"type":"td","props":\{"children":\["\[\d+\]","\[\d+\]","\[\d+\]"\]\}\},\{"type":"td","props":\{"children":\[((?:[^\[\]]|\[(?:[^\[\]]|\[[^\]]*\])*\])*?)\]\}\}\]\}\}/g;

  let skillsMatch;
  while ((skillsMatch = skillsTablePattern.exec(rscContent)) !== null) {
    const pieceLabel = skillsMatch[1];
    const pieceIdx = PIECE_LABELS.indexOf(pieceLabel);
    if (pieceIdx === -1) continue;

    const pieceType = PIECE_TYPES[pieceIdx];
    const skillsContent = skillsMatch[2];

    // Extraire les skills: "children":"Skill Name +Level"
    const skillMatches = skillsContent.matchAll(
      /"children":"([^"]+\s+\+\d+)"/g
    );
    const skills = [];

    for (const sm of skillMatches) {
      const skillText = sm[1];
      const levelMatch = skillText.match(/\s+\+(\d+)$/);
      if (levelMatch) {
        skills.push({
          name: skillText.replace(/\s+\+\d+$/, ""),
          level: parseInt(levelMatch[1]),
        });
      }
    }

    for (const lang of languages) {
      armorData[lang].pieces[pieceType].skills = skills;
    }
  }

  // Vérifier qu'on a au moins le nom de série
  if (!armorData.EN?.series_name) {
    return {};
  }

  return armorData;
}

/**
 * Scrape toutes les armures
 */
async function scrapeAllArmors() {
  console.log("🛡️ Début du scraping des armures V2 depuis Kiranico...\n");

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
        const pieceCount = Object.keys(data.EN?.pieces || {}).filter(
          (k) => data.EN.pieces[k]?.name
        ).length;
        console.log(`✓ (${pieceCount} pièces)`);
        success++;
      } else {
        console.log("⚠ (pas de données)");
      }

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
      JSON.stringify(armors[firstSlug].EN, null, 2).substring(0, 1500) + "..."
    );
  }

  return armors;
}

// Exécution
scrapeAllArmors().catch(console.error);
