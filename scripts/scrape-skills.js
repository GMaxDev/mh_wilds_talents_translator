/**
 * Script pour scraper les skills de Monster Hunter Wilds
 * depuis https://mhwilds.gamertw.com/[lang]/skill
 *
 * Structure de sortie identique à talents.json :
 * {
 *   "skill_id": {
 *     "EN": { name, category, description, levels: { "1": "...", "2": "..." } },
 *     "FR": { name, category, description, levels: { "1": "...", "2": "..." } },
 *     ...
 *   }
 * }
 *
 * === MODES D'UTILISATION ===
 *
 * 1. MODE FULL SCRAPE (toutes les langues) :
 *    $ node scripts/scrape-skills.js
 *    Rescrappe toutes les 12 langues et recrée skills.json depuis zéro.
 *    À utiliser pour une première exécution ou un refresh complet.
 *
 * 2. MODE INCRÉMENTAL (ajouter/mettre à jour des langues) :
 *    $ node scripts/scrape-skills.js [LANG1] [LANG2] ...
 *    Exemples:
 *      node scripts/scrape-skills.js FR          # Ajouter/mettre à jour FR uniquement
 *      node scripts/scrape-skills.js EN JP JA    # Mettre à jour 3 langues
 *      node scripts/scrape-skills.js ZH           # Ajouter une nouvelle langue (si ajoutée à SKILL_URLS)
 *
 *    Le mode incrémental :
 *    - Charge les données existantes depuis skills.json
 *    - Utilise la structure EN de référence pour la correspondance positionnelle
 *    - Préserve les autres langues intactes
 *    - Ajoute/met à jour uniquement les langues spécifiées
 *
 * === LANGUES SUPPORTÉES ===
 * EN (English), JP (中文), JA (日本語), KO (한국어),
 * FR (Français), IT (Italiano), DE (Deutsch), ES (Español),
 * RU (Русский), PL (Polski), PT (Português), AR (العربية)
 *
 * === CORRESPONDANCE ENTRE LANGUES ===
 * Les skills sont fusionnés par position dans chaque section (WEAPON, ARMOR, GROUP, SET_BONUS, FOOD).
 * L'anglais (EN) sert de référence - les autres langues sont appairées par leur position.
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_URLS = {
  EN: "https://mhwilds.gamertw.com/en/skill",
  // Ajouter d'autres langues ici :
  JP: "https://mhwilds.gamertw.com/skill",
  JA: "https://mhwilds.gamertw.com/ja/skill",
  KO: "https://mhwilds.gamertw.com/ko/skill",
  FR: "https://mhwilds.gamertw.com/fr/skill",
  IT: "https://mhwilds.gamertw.com/it/skill",
  DE: "https://mhwilds.gamertw.com/de/skill",
  ES: "https://mhwilds.gamertw.com/es/skill",
  RU: "https://mhwilds.gamertw.com/ru/skill",
  PL: "https://mhwilds.gamertw.com/pl/skill",
  PT: "https://mhwilds.gamertw.com/pt/skill",
  AR: "https://mhwilds.gamertw.com/ar/skill",
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

// Mapping des catégories par langue
const CATEGORY_MAPPING = {
  EN: {
    "Weapon Skills": "Weapon",
    "Armor Skills": "Armor",
    "Group Skills": "Group Skill",
    "Set Bonus Skills": "Set Bonus",
    "Food Skills": "Food",
  },
  FR: {
    "Weapon Skills": "Arme",
    "Armor Skills": "Armure",
    "Group Skills": "Talent de groupe",
    "Set Bonus Skills": "Bonus de set",
    "Food Skills": "Nourriture",
  },
  JP: {
    "Weapon Skills": "武器",
    "Armor Skills": "防具",
    "Group Skills": "グループスキル",
    "Set Bonus Skills": "セットボーナス",
    "Food Skills": "食事",
  },
};

// Patterns pour identifier le type de section par langue
// L'ordre est important : Group et Set Bonus AVANT Weapon/Armor car certaines langues
// utilisent des mots similaires
const SECTION_PATTERNS = {
  GROUP: [
    "Group Skills",
    "Group",
    "Groupe",
    "グループ",
    "그룹",
    "組合",
    "Gruppo",
    "Gruppen",
    "grupo",
    "Группа",
    "групп",
    "Grupy",
    "مجموعة",
    "тип доспехов",
  ],
  SET_BONUS: [
    "Set Bonus",
    "Set :",
    "シリーズ",
    "系列",
    "시리즈",
    "Setbonus",
    "set",
    "Bonus",
    "комплект",
    "zestawu",
    "Conjunto",
    "Bônus",
    "مكافأة",
    "تعيين",
  ],
  FOOD: [
    "Food",
    "Meal",
    "repas",
    "餐點",
    "食事",
    "식사",
    "cibo",
    "Nahrungs",
    "menú",
    "Гастро",
    "pokarmu",
    "Alimento",
    "طعام",
  ],
  WEAPON: [
    "Weapon",
    "Arme",
    "arme",
    "武器",
    "무기",
    "armi",
    "Waffen",
    "armas",
    "оружия",
    "broni",
    "أسلحة",
  ],
  ARMOR: [
    "Armor",
    "Armure",
    "armure",
    "防具",
    "방어구",
    "armatur",
    "Rüstung",
    "armadura",
    "брони",
    "zbroi",
    "دروع",
  ],
};

function getSectionType(sectionName) {
  const lowerName = sectionName.toLowerCase();

  // Vérifier dans l'ordre : GROUP, SET_BONUS, FOOD d'abord (plus spécifiques)
  // puis WEAPON, ARMOR
  for (const pattern of SECTION_PATTERNS.GROUP) {
    if (
      sectionName.includes(pattern) ||
      lowerName.includes(pattern.toLowerCase())
    ) {
      return "GROUP";
    }
  }

  for (const pattern of SECTION_PATTERNS.SET_BONUS) {
    if (
      sectionName.includes(pattern) ||
      lowerName.includes(pattern.toLowerCase())
    ) {
      return "SET_BONUS";
    }
  }

  for (const pattern of SECTION_PATTERNS.FOOD) {
    if (
      sectionName.includes(pattern) ||
      lowerName.includes(pattern.toLowerCase())
    ) {
      return "FOOD";
    }
  }

  for (const pattern of SECTION_PATTERNS.WEAPON) {
    if (
      sectionName.includes(pattern) ||
      lowerName.includes(pattern.toLowerCase())
    ) {
      return "WEAPON";
    }
  }

  for (const pattern of SECTION_PATTERNS.ARMOR) {
    if (
      sectionName.includes(pattern) ||
      lowerName.includes(pattern.toLowerCase())
    ) {
      return "ARMOR";
    }
  }

  return "UNKNOWN";
}

async function fetchPage(url) {
  console.log(`📥 Fetching ${url}...`);
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function generateSkillId(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseSkillLevels(text) {
  const levels = {};
  // Normaliser le texte - ajouter un espace avant chaque "Lv."
  const normalizedText = text.replace(/([^\s])Lv\./g, "$1 Lv.");

  // Match patterns like "Lv. 1: ..." or "Lv. 2: ..."
  const levelRegex = /Lv\.\s*(\d+):\s*(.+?)(?=\s*Lv\.\s*\d+:|$)/gi;
  let match;

  while ((match = levelRegex.exec(normalizedText)) !== null) {
    levels[match[1]] = match[2].trim();
  }

  return levels;
}

function extractBaseDescription(fullText) {
  const normalized = fullText.replace(/([^\s])Lv\./g, "$1 Lv.");
  const match = normalized.match(/^(.*?)(?=\s*Lv\.\s*1:)/i);

  if (match && match[1].trim()) {
    return match[1].trim();
  }

  if (/Lv\.\s*\d+:/i.test(normalized)) {
    const parts = normalized.split(/\s*Lv\.\s*\d+:/i);
    if (parts[0].trim()) {
      return parts[0].trim();
    }
  }

  return "";
}

function cleanText(text) {
  return text.replace(/\s+/g, " ").replace(/\n/g, " ").trim();
}

function extractSkillName(text) {
  const cleaned = cleanText(text);
  const parts = cleaned.split(/\s{2,}/);
  return parts[0] || cleaned;
}

async function scrapeSkillsForLanguage(url, lang) {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  console.log(`📄 Page loaded for ${lang}, analyzing structure...`);

  // Retourne les skills groupés par section avec leur ordre
  const skillsBySection = {
    WEAPON: [],
    ARMOR: [],
    GROUP: [],
    SET_BONUS: [],
    FOOD: [],
  };

  let currentSectionType = null;
  const categoryMapping = CATEGORY_MAPPING[lang] || CATEGORY_MAPPING.EN;

  $("h2, table").each((_, el) => {
    const tagName = el.tagName.toLowerCase();

    if (tagName === "h2") {
      const sectionName = $(el).text().trim();
      currentSectionType = getSectionType(sectionName);
      console.log(`  📂 Section: ${sectionName} [${currentSectionType}]`);
    } else if (
      tagName === "table" &&
      currentSectionType &&
      currentSectionType !== "UNKNOWN"
    ) {
      $(el)
        .find("tr")
        .each((_, row) => {
          const cells = $(row).find("td");

          if (currentSectionType === "GROUP" && cells.length >= 4) {
            const groupName = extractSkillName(cleanText($(cells[0]).text()));
            const skillName = cleanText($(cells[1]).text());
            const pieces = cleanText($(cells[2]).text());
            const description = cleanText($(cells[3]).text());

            if (groupName && skillName) {
              const category = categoryMapping["Group Skills"] || "Group Skill";
              skillsBySection.GROUP.push({
                name: groupName,
                category,
                description,
                skillName,
                levels: { [pieces]: description },
              });
            }
          } else if (currentSectionType === "SET_BONUS" && cells.length >= 2) {
            if (cells.length >= 4) {
              const setName = extractSkillName(cleanText($(cells[0]).text()));
              const skillName = cleanText($(cells[1]).text());
              const pieces = cleanText($(cells[2]).text());
              const description = cleanText($(cells[3]).text());

              if (setName && skillName) {
                const category =
                  categoryMapping["Set Bonus Skills"] || "Set Bonus";
                // Vérifier si c'est une continuation du dernier skill
                const lastSkill =
                  skillsBySection.SET_BONUS[
                    skillsBySection.SET_BONUS.length - 1
                  ];
                if (lastSkill && lastSkill.name === setName) {
                  lastSkill.levels[pieces] = description;
                } else {
                  skillsBySection.SET_BONUS.push({
                    name: setName,
                    category,
                    description: skillName,
                    levels: { [pieces]: description },
                  });
                }
              }
            } else if (cells.length === 2) {
              const lastSkill =
                skillsBySection.SET_BONUS[skillsBySection.SET_BONUS.length - 1];
              if (lastSkill) {
                const pieces = cleanText($(cells[0]).text());
                const description = cleanText($(cells[1]).text());
                lastSkill.levels[pieces] = description;
              }
            }
          } else if (currentSectionType === "FOOD" && cells.length >= 2) {
            const name = extractSkillName(cleanText($(cells[0]).text()));
            const description = cleanText($(cells[1]).text());

            if (name) {
              const category = categoryMapping["Food Skills"] || "Food";
              skillsBySection.FOOD.push({
                name,
                category,
                description,
                levels: { 1: description },
              });
            }
          } else if (
            (currentSectionType === "WEAPON" ||
              currentSectionType === "ARMOR") &&
            cells.length >= 2
          ) {
            const nameText = cleanText($(cells[0]).text());
            const descText = cleanText($(cells[1]).text());

            if (!nameText || nameText.length < 2 || /^\d+$/.test(nameText))
              return;

            const name = extractSkillName(nameText);
            const fullDescription = descText;
            let baseDescription = extractBaseDescription(fullDescription);
            const levels = parseSkillLevels(fullDescription);

            if (!baseDescription && Object.keys(levels).length > 0) {
              baseDescription = `${name} skill.`;
            } else if (!baseDescription) {
              baseDescription = fullDescription;
            }

            const finalLevels =
              Object.keys(levels).length > 0 ? levels : { 1: fullDescription };
            const category =
              currentSectionType === "WEAPON"
                ? categoryMapping["Weapon Skills"] || "Weapon"
                : categoryMapping["Armor Skills"] || "Armor";

            skillsBySection[currentSectionType].push({
              name,
              category,
              description: baseDescription,
              levels: finalLevels,
            });
          }
        });
    }
  });

  return skillsBySection;
}

async function scrapeAllSkills(langsToScrape = null) {
  try {
    const outputPath = path.join(__dirname, "..", "src", "data", "skills.json");

    // Déterminer quelles langues scraper
    const langsToProcess = langsToScrape || LANG_ORDER;
    const isIncrementalUpdate = langsToScrape !== null;

    // Structure finale : { skillId: { EN: {...}, FR: {...}, ... } }
    let mergedSkills = {};
    let referenceStructure = null;

    // Charger les données existantes pour une mise à jour incrémentale
    if (isIncrementalUpdate && fs.existsSync(outputPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
        mergedSkills = existingData;
        console.log("📂 Loaded existing skills.json for incremental update");
      } catch (err) {
        console.warn("⚠️ Could not load existing skills.json, starting fresh");
      }
    }

    // Charger la structure de référence EN si elle existe
    if (mergedSkills.length === 0 && fs.existsSync(outputPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
        // Reconstruire la structure EN pour la correspondance par position
        const enSkillsData = Object.values(existingData)
          .filter((skill) => skill.EN)
          .map((skill) => skill.EN);

        if (enSkillsData.length > 0) {
          // Grouper par catégorie pour avoir la structure par section
          referenceStructure = {
            WEAPON: enSkillsData.filter((s) => s.category === "Weapon"),
            ARMOR: enSkillsData.filter((s) => s.category === "Armor"),
            GROUP: enSkillsData.filter((s) => s.category === "Group Skill"),
            SET_BONUS: enSkillsData.filter((s) => s.category === "Set Bonus"),
            FOOD: enSkillsData.filter((s) => s.category === "Food"),
          };
          console.log(
            "📂 Loaded EN reference structure from existing skills.json"
          );
        }
      } catch (err) {
        // Ignorer les erreurs
      }
    }

    for (const lang of langsToProcess) {
      const url = SKILL_URLS[lang];
      if (!url) continue;

      console.log(`\n🌐 Scraping ${lang}...`);
      const skillsBySection = await scrapeSkillsForLanguage(url, lang);

      const totalSkills = Object.values(skillsBySection).reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      console.log(`  ✅ Found ${totalSkills} skills for ${lang}`);

      if (lang === "EN" && !referenceStructure) {
        // Utiliser EN comme référence (première exécution ou rescrap complet)
        referenceStructure = skillsBySection;

        for (const skills of Object.values(skillsBySection)) {
          for (const skill of skills) {
            const skillId = generateSkillId(skill.name);
            if (skillId) {
              if (!mergedSkills[skillId]) {
                mergedSkills[skillId] = {};
              }
              mergedSkills[skillId].EN = skill;
            }
          }
        }
      } else if (referenceStructure) {
        // Faire correspondre par position dans chaque section
        for (const [sectionType, skills] of Object.entries(skillsBySection)) {
          const refSkills = referenceStructure[sectionType] || [];

          for (let i = 0; i < skills.length; i++) {
            const skill = skills[i];
            const refSkill = refSkills[i];

            if (refSkill) {
              // Utiliser l'ID de la référence EN
              const skillId = generateSkillId(refSkill.name);
              if (skillId) {
                if (!mergedSkills[skillId]) {
                  mergedSkills[skillId] = {};
                }
                mergedSkills[skillId][lang] = skill;
              }
            }
          }
        }
      }
    }

    // Trier les clés alphabétiquement
    const sortedData = {};
    Object.keys(mergedSkills)
      .sort()
      .forEach((key) => {
        sortedData[key] = mergedSkills[key];
      });

    fs.writeFileSync(outputPath, JSON.stringify(sortedData, null, 2), "utf-8");

    const totalSkills = Object.keys(sortedData).length;
    const languages = [
      ...new Set(Object.values(sortedData).flatMap((s) => Object.keys(s))),
    ].sort();

    console.log(`\n✅ Successfully scraped ${totalSkills} unique skills`);
    console.log(`🌐 Languages: ${languages.join(", ")}`);
    console.log(`📁 Saved to: ${outputPath}`);
    if (isIncrementalUpdate) {
      console.log(`📝 Updated languages: ${langsToScrape.join(", ")}`);
    }

    return sortedData;
  } catch (error) {
    console.error("❌ Error scraping skills:", error);
    throw error;
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const langsToScrape = args.length > 0 ? args : null;

// Run the scraper
if (langsToScrape) {
  console.log(
    `🎯 Incremental update mode - scraping: ${langsToScrape.join(", ")}`
  );
  scrapeAllSkills(langsToScrape);
} else {
  console.log("🔄 Full scrape mode - scraping all languages");
  scrapeAllSkills();
}
