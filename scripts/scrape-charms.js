/**
 * Script pour scraper les talismans (charms) depuis Kiranico
 * Base : https://mhwilds.kiranico.com/data/charms
 * Versions localisées : /fr/data/charms, /ja/data/charms, etc.
 *
 * Approche : 
 * 1. Scraper l'index de chaque langue pour obtenir nom + description (ils sont dans le HTML statique)
 * 2. Scraper les pages charm EN pour obtenir les skills (slugs identiques pour toutes langues)
 *
 * Produit : src/data/charms-kiranico.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = "https://mhwilds.kiranico.com";

// Map our language codes to Kiranico URL prefixes
const LANG_URLS = {
  EN: "",
  JA: "/ja",
  FR: "/fr",
  IT: "/it",
  DE: "/de",
  ES: "/es",
  RU: "/ru",
  PL: "/pl",
  PT: "/pt-BR",
  KO: "/ko",
  ZH: "/zh",
  ZH_HANT: "/zh-Hant",
};

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i < retries - 1) await delay(1000 * (i + 1));
      else throw e;
    }
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

/**
 * Build a mapping from EN slugs to localized slugs from RSC data
 * Returns: { enSlug: { fr: frSlug, de: deSlug, ... } }
 */
function buildSlugMapping(html) {
  const mapping = {};
  
  // Extract and decode RSC data first
  const rsc = extractRSCData(html);
  
  // RSC contains patterns like:
  // "en":"/data/charms/sheathe-charm-iii","fr":"/fr/data/charms/talisman-de-rengainage-iii"
  // We need to extract: enSlug + all localized slugs
  
  // Find all charm link objects in RSC
  const rscPattern = /"en":"\/data\/charms\/([a-z0-9-]+)"([^}]+)/g;
  let match;
  while ((match = rscPattern.exec(rsc)) !== null) {
    const enSlug = match[1];
    const rest = match[2];
    
    if (!mapping[enSlug]) {
      mapping[enSlug] = { en: enSlug };
    }
    
    // Extract localized slugs
    const langPattern = /"([a-z]{2}(?:-[A-Za-z0-9]+)?)":"\/[^"]*\/data\/charms\/([a-z0-9-]+)"/g;
    let langMatch;
    while ((langMatch = langPattern.exec(rest)) !== null) {
      const langCode = langMatch[1];
      const localizedSlug = langMatch[2];
      mapping[enSlug][langCode] = localizedSlug;
    }
  }
  
  return mapping;
}

/**
 * Parse the charms index page for a given language
 * Returns: { data: {slug: {name, description}}, list: [{slug, name, description}], html }
 * The list preserves order for position-based matching
 */
async function parseCharmsIndex(langPrefix) {
  const url = `${BASE}${langPrefix}/data/charms`;
  const html = await fetchWithRetry(url);
  
  const result = {};
  const list = [];
  
  // The table rows have this structure:
  // <a href="/data/charms/SLUG"><span>NAME</span></a>...
  // followed by <span>DESCRIPTION</span> in next cell
  
  // Extract all table rows for charms
  // Pattern: href="/[prefix]/data/charms/slug"><span>name</span></a></td><td ...><span>description</span>
  const rowPattern = /href="[^"]*\/data\/charms\/([a-z0-9-]+)"[^>]*><span>([^<]+)<\/span><\/a><\/td><td[^>]*><span>([^<]*)<\/span>/g;
  
  let match;
  while ((match = rowPattern.exec(html)) !== null) {
    const slug = match[1];
    const name = decodeHtmlEntities(match[2].trim());
    const description = decodeHtmlEntities(match[3].trim());
    result[slug] = { name, description };
    list.push({ slug, name, description });
  }
  
  return { data: result, list, html };
}

/**
 * Extract RSC (React Server Component) data from HTML
 */
function extractRSCData(html) {
  const pushMatches = html.matchAll(
    /self\.__next_f\.push\(\[[\d,]*"([^]*?)"\]\)/g
  );
  let full = "";
  for (const m of pushMatches) {
    let content = m[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
    full += content;
  }
  return full;
}

/**
 * Scrape skills for a charm from its detail page (EN version)
 */
async function scrapeCharmSkills(slug) {
  const url = `${BASE}/data/charms/${slug}`;
  const html = await fetchWithRetry(url);
  const rsc = extractRSCData(html);
  
  const skills = [];
  
  // Method 1: Look for skill links followed by level spans in RSC data
  // Pattern: "en":"/data/skills/skill-slug" ... "Lv1" or "Lv2" etc
  
  // Find all skill slugs with their levels
  // The RSC structure for skill entries looks like:
  // ["$","a",null,{"href":{"en":"/data/skills/marathon-runner"...},...}]
  // followed later by ["$","span",null,{"children":"Lv1"}]
  
  // More reliable: look for the table structure in HTML
  // Skills are in a table with href to /data/skills/SLUG and a span with LvN
  
  // Pattern in HTML: href="/data/skills/SLUG"...><span>SKILL NAME</span>...Lv\d
  const htmlSkillPattern = /href="\/data\/skills\/([a-z0-9-]+)"[^>]*><span>([^<]+)<\/span>.*?<span>Lv(\d+)<\/span>/gs;
  
  let htmlMatch;
  const seenSlugs = new Set();
  while ((htmlMatch = htmlSkillPattern.exec(html)) !== null) {
    const skillSlug = htmlMatch[1];
    if (!seenSlugs.has(skillSlug)) {
      seenSlugs.add(skillSlug);
      const level = parseInt(htmlMatch[3], 10);
      skills.push({ slug: skillSlug, level });
    }
  }
  
  // If no skills found in HTML, try RSC pattern
  if (skills.length === 0) {
    // Look for skill patterns in RSC
    // Pattern: /data/skills/slug followed by Lv\d
    const rscSkillPattern = /"en":"\/data\/skills\/([a-z0-9-]+)"[^}]*}/g;
    const levelPattern = /"children":"Lv(\d+)"/g;
    
    const skillMatches = [...rsc.matchAll(rscSkillPattern)];
    const levelMatches = [...rsc.matchAll(levelPattern)];
    
    // Pair them up (they should appear in order)
    for (let i = 0; i < Math.min(skillMatches.length, levelMatches.length); i++) {
      const skillSlug = skillMatches[i][1];
      const level = parseInt(levelMatches[i][1], 10);
      if (!seenSlugs.has(skillSlug)) {
        seenSlugs.add(skillSlug);
        skills.push({ slug: skillSlug, level });
      }
    }
  }
  
  return skills;
}

// Mapping from Kiranico lang codes to our lang codes
const KIRANICO_TO_OUR_LANG = {
  "en": "EN",
  "ja": "JA",
  "fr": "FR",
  "it": "IT",
  "de": "DE",
  "es": "ES",
  "ru": "RU",
  "pl": "PL",
  "pt-BR": "PT",
  "ko": "KO",
  "zh": "ZH",
  "zh-Hant": "ZH_HANT",
};

async function main() {
  console.log("Scraping charms data from all languages...\n");
  
  // Step 1: Get EN index first to build slug mapping
  process.stdout.write(`Fetching EN index...`);
  const { data: enData, list: enList, html: enHtml } = await parseCharmsIndex(LANG_URLS.EN);
  console.log(` ✓ (${Object.keys(enData).length} charms)`);
  
  // Build mapping from EN slugs to localized slugs
  const slugMapping = buildSlugMapping(enHtml);
  console.log(`Built slug mapping for ${Object.keys(slugMapping).length} charms`);
  
  // Step 2: Get names and descriptions from each other language index
  const langData = { EN: enData };
  const langLists = { EN: enList };
  
  for (const [lang, prefix] of Object.entries(LANG_URLS)) {
    if (lang === "EN") continue;
    
    process.stdout.write(`Fetching ${lang} index...`);
    try {
      const { data, list } = await parseCharmsIndex(prefix);
      langData[lang] = data;
      langLists[lang] = list;
      console.log(` ✓ (${Object.keys(data).length} charms)`);
    } catch (e) {
      console.log(` ✗ ${e.message}`);
      langData[lang] = {};
      langLists[lang] = [];
    }
    await delay(200);
  }
  
  // Get the list of EN slugs (reference)
  const slugs = Object.keys(enData);
  console.log(`\nFound ${slugs.length} charms total`);
  
  if (slugs.length === 0) {
    console.error("No charms found! Check if the scraping pattern is correct.");
    process.exit(1);
  }
  
  // Step 3: For each charm, get skills from EN detail page
  console.log("\nFetching skills for each charm...");
  const skillsMap = {};
  
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(` [${i + 1}/${slugs.length}] ${slug}...`);
    try {
      skillsMap[slug] = await scrapeCharmSkills(slug);
      console.log(` ✓ (${skillsMap[slug].length} skills)`);
    } catch (e) {
      console.log(` ✗ ${e.message}`);
      skillsMap[slug] = [];
    }
    await delay(100);
  }
  
  // Step 4: Combine all data
  console.log("\nBuilding final data structure...");
  const charms = {};
  
  // Build position map from EN list
  const enPositionMap = {};
  enList.forEach((item, index) => {
    enPositionMap[item.slug] = index;
  });
  
  for (const enSlug of slugs) {
    charms[enSlug] = {};
    const skills = skillsMap[enSlug] || [];
    const mapping = slugMapping[enSlug] || { en: enSlug };
    const position = enPositionMap[enSlug];
    
    for (const [ourLang] of Object.entries(LANG_URLS)) {
      // Find the Kiranico lang code for this language
      const kiranicoLang = Object.entries(KIRANICO_TO_OUR_LANG).find(([, v]) => v === ourLang)?.[0] || ourLang.toLowerCase();
      
      // Get the localized slug for this language
      const localizedSlug = mapping[kiranicoLang] || enSlug;
      
      // Try to get data using the localized slug first
      let data = langData[ourLang]?.[localizedSlug];
      
      // If no data found, try position-based matching (for languages like JA with different slugs)
      if (!data && position !== undefined && langLists[ourLang]?.[position]) {
        data = langLists[ourLang][position];
      }
      
      if (data) {
        charms[enSlug][ourLang] = {
          name: data.name,
          description: data.description,
          skills: skills.map(s => ({ ...s })), // Clone skills array
        };
      } else {
        // Fallback to EN if language data missing
        const enDataItem = enData[enSlug];
        charms[enSlug][ourLang] = {
          name: enDataItem?.name || enSlug,
          description: enDataItem?.description || "",
          skills: skills.map(s => ({ ...s })),
        };
      }
    }
  }
  
  // Save to file
  const outPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "charms-kiranico.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(charms, null, 2), "utf-8");
  console.log(`\nSaved to ${outPath}`);
  
  // Show some examples
  console.log("\nExample data:");
  const exampleSlug = "sheathe-charm-iii";
  if (charms[exampleSlug]) {
    console.log(`\n${exampleSlug}:`);
    console.log(`  EN: ${charms[exampleSlug].EN.name}`);
    console.log(`  FR: ${charms[exampleSlug].FR.name}`);
    console.log(`  JA: ${charms[exampleSlug].JA.name}`);
    console.log(`  Skills: ${JSON.stringify(charms[exampleSlug].EN.skills)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
