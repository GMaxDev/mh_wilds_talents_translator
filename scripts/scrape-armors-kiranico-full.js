/**
 * Script pour scraper les armures COMPLÈTES de Monster Hunter Wilds
 * depuis https://mhwilds.kiranico.com/data/armor-series
 *
 * Extrait: noms, descriptions, defense, résistances, slots, skills par pièce
 * en 12 langues.
 *
 * Usage:
 *   $ node scripts/scrape-armors-kiranico-full.js          # Scrape tout
 *   $ node scripts/scrape-armors-kiranico-full.js --test   # Test avec 5 armures
 *   $ node scripts/scrape-armors-kiranico-full.js akuma-a  # Scrape une armure spécifique
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const PIECE_TYPES = ["head", "chest", "arms", "waist", "legs"];
const PIECE_LABELS = ["Head", "Chest", "Arms", "Waist", "Legs"];

const TEST_MODE = process.argv.includes("--test");
const SINGLE_ARMOR = process.argv.find(
  (a) => !a.startsWith("-") && !a.includes("/") && a !== "node"
);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (i < retries - 1) await delay(1000 * (i + 1));
      else throw error;
    }
  }
}

function extractRSCContent(html) {
  const matches = html.matchAll(/self\.__next_f\.push\(\[[\d,]*"([^]*?)"\]\)/g);
  let content = "";
  for (const m of matches) {
    content += m[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  return content;
}

function extractTranslations(childrenStr) {
  const translations = {};
  const matches = childrenStr.matchAll(
    /"([a-z]{2}(?:-[A-Za-z]+)?)":"([^"]+)"/g
  );
  for (const m of matches) {
    const lang = KIRANICO_LANG_MAP[m[1]];
    if (lang) translations[lang] = m[2];
  }
  return translations;
}

async function fetchArmorSlugs() {
  console.log("📋 Récupération de la liste des armures...");
  const html = await fetchWithRetry(BASE_URL);
  const content = extractRSCContent(html);

  const slugs = new Set();
  const matches = content.matchAll(
    /"en":"\/data\/armor-series\/([a-z0-9-]+)"/g
  );
  for (const m of matches) {
    if (m[1].length > 0 && !m[1].includes("\\")) slugs.add(m[1]);
  }

  console.log(`  ✓ ${slugs.size} séries d'armures trouvées`);
  return Array.from(slugs);
}

async function scrapeArmorDetail(slug) {
  const url = `${BASE_URL}/${slug}`;
  const html = await fetchWithRetry(url);
  const content = extractRSCContent(html);

  const armorData = {};
  const languages = Object.values(KIRANICO_LANG_MAP);

  // Initialiser structure
  for (const lang of languages) {
    armorData[lang] = {
      series_name: "",
      name: "",
      pieces: {},
    };
    for (const pt of PIECE_TYPES) {
      armorData[lang].pieces[pt] = {
        name: "",
        description: "",
        defense: 0,
        slots: [0, 0, 0],
        resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
        skills: [],
      };
    }
  }

  // === 1. EXTRAIRE TOUS LES TX (traductions) ===
  const txPattern = /"type":"tx","props":\{"children":\{([^}]+)\}\}/g;
  const allTx = [];
  let txMatch;
  while ((txMatch = txPattern.exec(content)) !== null) {
    const trans = extractTranslations(txMatch[1]);
    if (Object.keys(trans).length >= 10) allTx.push(trans);
  }

  // Trouver le TX du nom de série (celui qui correspond au slug)
  let seriesIdx = 0;
  const slugNorm = slug
    .toLowerCase()
    .replace(/-/g, "")
    .replace(/[^a-z0-9]/g, "");
  for (let i = 0; i < Math.min(5, allTx.length); i++) {
    const enName = (allTx[i].EN || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (
      enName &&
      (enName.includes(slugNorm.slice(0, 4)) ||
        slugNorm.includes(enName.slice(0, 4)))
    ) {
      seriesIdx = i;
      break;
    }
  }

  // Appliquer nom de série
  if (allTx[seriesIdx]) {
    for (const lang of languages) {
      armorData[lang].series_name = allTx[seriesIdx][lang] || "";
      armorData[lang].name = allTx[seriesIdx][lang] || "";
    }
  }

  // Appliquer noms et descriptions des pièces
  for (let i = 0; i < 5; i++) {
    const nameIdx = seriesIdx + 1 + i * 2;
    const descIdx = seriesIdx + 2 + i * 2;
    const pt = PIECE_TYPES[i];

    if (allTx[nameIdx]) {
      for (const lang of languages) {
        armorData[lang].pieces[pt].name = allTx[nameIdx][lang] || "";
      }
    }
    if (allTx[descIdx]) {
      for (const lang of languages) {
        armorData[lang].pieces[pt].description = allTx[descIdx][lang] || "";
      }
    }
  }

  // === 2. EXTRAIRE DEFENSE ET RÉSISTANCES ===
  // Format: {"type":"td","props":{"children":"Head"}}, TX, {"type":"td","props":{"children":48}}, ...

  for (let i = 0; i < PIECE_LABELS.length; i++) {
    const label = PIECE_LABELS[i];
    const pt = PIECE_TYPES[i];

    // Pattern: "children":"Head" suivi de TX puis 6 valeurs numériques
    // Les valeurs sont dans "children":48 ou "children":-2
    const rowPattern = new RegExp(
      `"children":"${label}"\\}\\}[^]*?"align":"left"\\}\\}` +
        `[^]*?"children":(-?\\d+)\\}` + // defense
        `[^]*?"children":(-?\\d+)\\}` + // fire
        `[^]*?"children":(-?\\d+)\\}` + // water
        `[^]*?"children":(-?\\d+)\\}` + // thunder
        `[^]*?"children":(-?\\d+)\\}` + // ice
        `[^]*?"children":(-?\\d+)\\}` // dragon
    );

    const rowMatch = content.match(rowPattern);
    if (rowMatch) {
      const [, def, fire, water, thunder, ice, dragon] = rowMatch;
      for (const lang of languages) {
        armorData[lang].pieces[pt].defense = parseInt(def);
        armorData[lang].pieces[pt].resistances = {
          fire: parseInt(fire),
          water: parseInt(water),
          thunder: parseInt(thunder),
          ice: parseInt(ice),
          dragon: parseInt(dragon),
        };
      }
    }
  }

  // === 3. EXTRAIRE SLOTS ET SKILLS ===
  // Utiliser matchAll pour trouver tous les slots et skills par pièce

  // Extraire tous les slots - format: ["[2]","[2]","[1]"]
  const allSlotsMatches = content.matchAll(
    /"children":"(Head|Chest|Arms|Waist|Legs)"[^]*?"children":\["\[(\d)\]","\[(\d)\]","\[(\d)\]"\]/g
  );
  for (const m of allSlotsMatches) {
    const label = m[1];
    const idx = PIECE_LABELS.indexOf(label);
    if (idx !== -1) {
      const pt = PIECE_TYPES[idx];
      const slots = [parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];
      for (const lang of languages) {
        armorData[lang].pieces[pt].slots = slots;
      }
    }
  }

  // Extraire les skills: chercher le pattern après "Slots" header avec les skills
  // Format: "children":"Head", TX, slots, puis liste de skills
  const skillsTableMatch = content.match(
    /"children":"Slots"[^]*?"children":"Equipment Skills"[^]*?(?="children":"Equipment Skills")/
  );
  if (skillsTableMatch) {
    const skillsTable = skillsTableMatch[0];

    for (let i = 0; i < PIECE_LABELS.length; i++) {
      const label = PIECE_LABELS[i];
      const pt = PIECE_TYPES[i];

      // Trouver la ligne de cette pièce et extraire les skills
      const piecePattern = new RegExp(
        `"children":"${label}"[^}]*\\}[^}]*\\}[^]*?"children":\\["\\[\\d\\]"[^]*?\\]\\}[^}]*\\}[^,]*,[^{]*\\{[^}]*"children":\\[([^\\]]+)\\]`,
        "s"
      );
      const pieceMatch = skillsTable.match(piecePattern);
      if (pieceMatch) {
        const skillsContent = pieceMatch[1];
        const skillMatches = skillsContent.matchAll(
          /"children":"([^"]+)\s\+(\d+)"/g
        );
        const skills = [];
        for (const sm of skillMatches) {
          skills.push({ name: sm[1], level: parseInt(sm[2]) });
        }
        if (skills.length > 0) {
          for (const lang of languages) {
            armorData[lang].pieces[pt].skills = skills;
          }
        }
      }
    }
  }

  // Vérifier qu'on a au moins le nom de série
  if (!armorData.EN?.series_name) {
    return null;
  }

  return armorData;
}

async function main() {
  console.log("🛡️ Scraping complet des armures Kiranico...\n");

  let slugs;
  if (
    SINGLE_ARMOR &&
    SINGLE_ARMOR !== "scripts/scrape-armors-kiranico-full.js"
  ) {
    slugs = [SINGLE_ARMOR];
  } else {
    slugs = await fetchArmorSlugs();
    if (TEST_MODE) slugs = slugs.slice(0, 5);
  }

  console.log(
    `\n📥 Scraping ${slugs.length} armures${
      TEST_MODE ? " (mode test)" : ""
    }...\n`
  );

  const armors = {};
  let success = 0,
    failed = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(`  [${i + 1}/${slugs.length}] ${slug}... `);

    try {
      const data = await scrapeArmorDetail(slug);
      if (data) {
        armors[slug] = data;
        const def = data.EN?.pieces?.head?.defense || 0;
        const skills = data.EN?.pieces?.head?.skills?.length || 0;
        console.log(`✓ (def:${def}, skills:${skills})`);
        success++;
      } else {
        console.log("⚠ (pas de données)");
      }
      if (i < slugs.length - 1) await delay(200);
    } catch (error) {
      console.log("✗", error.message);
      failed++;
    }
  }

  console.log(`\n📊 Résultats:`);
  console.log(`  ✓ Réussites: ${success}`);
  console.log(`  ✗ Échecs: ${failed}`);

  // Sauvegarder
  const outputPath = path.join(
    __dirname,
    "../src/data/armors-kiranico-full.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(armors, null, 2), "utf-8");
  console.log(`\n💾 Sauvegardé: ${outputPath}`);

  // Exemple
  const first = Object.keys(armors)[0];
  if (first) {
    console.log(`\n📝 Exemple (${first} - EN):`);
    console.log(JSON.stringify(armors[first].EN, null, 2).slice(0, 1500));
  }
}

main().catch(console.error);
