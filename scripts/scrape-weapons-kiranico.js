/**
 * Script pour scraper les armes de Monster Hunter Wilds
 * depuis https://mhwilds.kiranico.com/data/weapons
 *
 * Le site Kiranico est une app Next.js qui intègre les traductions dans le HTML
 * via des objets JSON. Ce script extrait ces données multilingues directement.
 *
 * Structure de sortie :
 * {
 *   "weapon_slug": {
 *     "EN": { name, attack, affinity, skills, slots },
 *     "FR": { name, attack, affinity, skills, slots },
 *     ...
 *   }
 * }
 *
 * === MODES D'UTILISATION ===
 *
 * 1. MODE FULL SCRAPE :
 *    $ node scripts/scrape-weapons-kiranico.js
 *
 * 2. MODE TEST (quelques armes seulement) :
 *    $ node scripts/scrape-weapons-kiranico.js --test
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

const BASE_URL = "https://mhwilds.kiranico.com/data/weapons";
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
 * Le format est: ["$","tag",null,{...}] encodé en string avec des escapes
 */
function extractRSCData(html) {
  // Trouver tous les scripts self.__next_f.push
  const pushMatches = html.matchAll(
    /self\.__next_f\.push\(\[[\d,]*"([^]*?)"\]\)/g
  );
  let fullContent = "";

  for (const match of pushMatches) {
    // Décoder les échappements
    let content = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
    fullContent += content;
  }

  return fullContent;
}

/**
 * Parse les données des armes depuis le JSON RSC
 */
function parseWeaponsFromRSC(rscContent) {
  const weapons = [];

  // Pattern pour trouver les lignes de tableau d'armes
  // Chaque arme est dans un "type":"tr" avec des cells contenant:
  // - Image
  // - Nom avec hrefs multilingues et tx (traductions)
  // - Slots
  // - Attack
  // - Element
  // - Affinity
  // - Specials
  // - Skills

  // On va extraire les patterns d'armes ligne par ligne
  // Le pattern complet pour une arme contient:
  // "hrefs":{"ja":"/ja/data/weapons/SLUG",...},"children":{"type":"tx","props":{"children":{...translations...}}}

  const weaponPattern =
    /"hrefs":\{"ja":"\/ja\/data\/weapons\/([^"]+)"[^}]*\},"children":\{"type":"tx","props":\{"children":\{([^}]+(?:"[^"]*":"[^"]*",?)*)\}\}/g;

  let match;
  while ((match = weaponPattern.exec(rscContent)) !== null) {
    try {
      const jaSlug = match[1];
      const translationsRaw = match[2];

      // Parser les traductions
      const names = {};
      const translationMatches =
        translationsRaw.matchAll(/"([^"]+)":"([^"]+)"/g);
      for (const tm of translationMatches) {
        const kiranicoLang = tm[1];
        const name = tm[2];
        const ourLang = KIRANICO_LANG_MAP[kiranicoLang];
        if (ourLang) {
          names[ourLang] = name;
        }
      }

      // Utiliser le slug anglais si disponible
      const enSlugMatch = rscContent
        .slice(Math.max(0, match.index - 500), match.index + match[0].length)
        .match(/"en":"\/data\/weapons\/([^"]+)"/);
      const slug = enSlugMatch ? enSlugMatch[1] : jaSlug;

      if (Object.keys(names).length > 0) {
        weapons.push({
          slug,
          jaSlug,
          names,
        });
      }
    } catch (e) {
      console.error("Error parsing weapon:", e.message);
    }
  }

  return weapons;
}

/**
 * Parse des données supplémentaires pour chaque arme (slots, attack, affinity, skills)
 */
function enrichWeaponData(rscContent, weapons) {
  // Pour chaque arme, on va chercher ses stats dans le contexte proche

  // Pattern pour les slots
  const slotsPattern = /"slots":\[(\d+),(\d+),(\d+)\]/g;
  const allSlots = [...rscContent.matchAll(slotsPattern)];

  // Pattern pour l'attack (nombre seul dans un td)
  const attackPattern = /"type":"td","props":\{"children":(\d{2,3})\}/g;
  const allAttacks = [...rscContent.matchAll(attackPattern)];

  // Pattern pour l'affinity
  const affinityPattern = /"children":"([+-]?\d+)%"/g;
  const allAffinities = [...rscContent.matchAll(affinityPattern)];

  // Pattern pour les skills
  // "children":{"type":"small","props":{"children":"Skill Name +N"}}
  const skillPattern =
    /"type":"small","props":\{"children":"([^"]+\s*\+\d+)"\}/g;
  const allSkills = [...rscContent.matchAll(skillPattern)];

  console.log(
    `Found ${allSlots.length} slot patterns, ${allAttacks.length} attack patterns, ${allAffinities.length} affinity patterns, ${allSkills.length} skill patterns`
  );

  return weapons;
}

/**
 * Alternative: Parser le HTML avec une approche plus robuste basée sur les patterns TR
 */
function parseWeaponsRobust(html) {
  const weapons = [];

  // Extraire tout le contenu des scripts RSC
  let rscContent = "";
  const scriptMatches = html.matchAll(
    /self\.__next_f\.push\(\[[\d,]*"([^]*?)"\]\)/g
  );
  for (const match of scriptMatches) {
    let content = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
    rscContent += content;
  }

  console.log(`RSC content length: ${rscContent.length} bytes`);

  // Chercher les patterns d'armes avec les traductions
  // Format: "type":"a","props":{"hrefs":{...langues...},"children":{"type":"tx","props":{"children":{...traductions...}}}

  // Pattern simplifié pour extraire les noms d'armes avec leurs traductions
  const weaponNamePattern =
    /"en":"\/data\/weapons\/([^"]+)"[^]*?"type":"tx","props":\{"children":\{([^}]+)\}\}/g;

  let match;
  let count = 0;

  // Trouver tous les blocs qui contiennent des données d'armes
  const weaponBlocks = rscContent.split('"type":"tr"');
  console.log(`Found ${weaponBlocks.length - 1} TR blocks`);

  for (let i = 1; i < weaponBlocks.length; i++) {
    const block = weaponBlocks[i];

    // Extraire le slug anglais
    const slugMatch = block.match(/"en":"\/data\/weapons\/([^"]+)"/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];

    // Extraire les traductions du nom
    const txMatch = block.match(
      /"type":"tx","props":\{"children":\{([^}]+)\}\}/
    );
    if (!txMatch) continue;

    const names = {};
    const translationMatches = txMatch[1].matchAll(/"([^"]+)":"([^"]+)"/g);
    for (const tm of translationMatches) {
      const kiranicoLang = tm[1];
      const name = tm[2];
      const ourLang = KIRANICO_LANG_MAP[kiranicoLang];
      if (ourLang) {
        names[ourLang] = name;
      }
    }

    if (Object.keys(names).length === 0) continue;

    // Extraire les slots
    const slotsMatch = block.match(/"slots":\[(\d+),(\d+),(\d+)\]/);
    const slots = slotsMatch
      ? [
          parseInt(slotsMatch[1]),
          parseInt(slotsMatch[2]),
          parseInt(slotsMatch[3]),
        ]
      : [0, 0, 0];

    // Extraire l'attack (premier nombre à 3 chiffres trouvé)
    const attackMatch = block.match(/"children":(\d{2,3})\}/);
    const attack = attackMatch ? parseInt(attackMatch[1]) : 0;

    // Extraire l'affinity
    const affinityMatch = block.match(/"children":"([+-]?\d+)%"/);
    const affinity = affinityMatch ? parseInt(affinityMatch[1]) / 100 : 0;

    // Extraire le bonus de défense
    const defMatch = block.match(/"children":"([+-]?\d+) Def"/);
    const defenseBonus = defMatch ? parseInt(defMatch[1]) : 0;

    // Extraire les skills (nom anglais + niveau)
    const skills = [];
    const skillMatches = block.matchAll(
      /"type":"small","props":\{"children":"([^"]+\s*)\+(\d+)"\}/g
    );
    for (const sm of skillMatches) {
      skills.push([sm[1].trim(), parseInt(sm[2])]);
    }

    weapons.push({
      slug,
      names,
      slots,
      attack,
      affinity,
      defenseBonus,
      skills,
    });

    count++;
  }

  console.log(`Parsed ${count} weapons with data`);
  return weapons;
}

/**
 * Construit la structure de sortie finale
 */
function buildOutput(weapons) {
  const output = {};

  for (const weapon of weapons) {
    // Convertir le slug en clé (remplacer - par _)
    const key = weapon.slug.replace(/-/g, "_");

    output[key] = {};

    for (const [lang, name] of Object.entries(weapon.names)) {
      output[key][lang] = {
        name,
        attack: weapon.attack,
        affinity: weapon.affinity,
        skills: weapon.skills,
        slots: weapon.slots,
      };

      if (weapon.defenseBonus) {
        output[key][lang].defenseBonus = weapon.defenseBonus;
      }
    }
  }

  return output;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Scraping weapons from Kiranico");
  console.log(`URL: ${BASE_URL}`);
  console.log(`Test mode: ${TEST_MODE}`);
  console.log("=".repeat(60));
  console.log();

  try {
    // Fetch la page des armes
    console.log("Fetching weapons page...");
    const html = await fetchWithRetry(BASE_URL);
    console.log(`Received ${html.length} bytes`);

    // Parser les armes
    console.log("\nParsing weapons...");
    const weapons = parseWeaponsRobust(html);
    console.log(`Found ${weapons.length} weapons`);

    if (weapons.length === 0) {
      console.error("No weapons found! Check the parsing logic.");
      return;
    }

    if (TEST_MODE) {
      console.log("\n--- TEST MODE: First 5 weapons ---");
      for (const weapon of weapons.slice(0, 5)) {
        console.log(`\n${weapon.slug}:`);
        console.log(`  EN: ${weapon.names.EN || "N/A"}`);
        console.log(`  JA: ${weapon.names.JA || "N/A"}`);
        console.log(`  FR: ${weapon.names.FR || "N/A"}`);
        console.log(
          `  Attack: ${weapon.attack}, Affinity: ${(
            weapon.affinity * 100
          ).toFixed(0)}%`
        );
        console.log(`  Slots: [${weapon.slots.join(", ")}]`);
        console.log(
          `  Skills: ${
            weapon.skills.map((s) => `${s[0]} +${s[1]}`).join(", ") || "None"
          }`
        );
      }

      console.log("\n--- Sample of languages found ---");
      const allLangs = new Set();
      for (const weapon of weapons) {
        for (const lang of Object.keys(weapon.names)) {
          allLangs.add(lang);
        }
      }
      console.log(`Languages: ${[...allLangs].sort().join(", ")}`);

      return;
    }

    // Construire la sortie
    const output = buildOutput(weapons);

    // Écrire le fichier
    const outputPath = path.join(
      __dirname,
      "..",
      "src",
      "data",
      "weapons-kiranico.json"
    );
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
    console.log(
      `\n✓ Wrote ${Object.keys(output).length} weapons to ${outputPath}`
    );

    // Stats
    const sampleKey = Object.keys(output)[0];
    if (sampleKey) {
      const sampleLangs = Object.keys(output[sampleKey]);
      console.log(`  Languages per weapon: ${sampleLangs.join(", ")}`);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
