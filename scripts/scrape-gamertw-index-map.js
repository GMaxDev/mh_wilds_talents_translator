#!/usr/bin/env node
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://mhwilds.gamertw.com";

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
  "zh-TW": "ZH_HANT",
};

const DELAY_MS = 400;
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/'/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseIndex(html) {
  const $ = cheerio.load(html);
  const rows = [];

  $("table tbody tr").each((i, tr) => {
    const $tr = $(tr);
    const $link = $tr.find("td:first-child a");
    const href = $link.attr("href") || "";
    const name = $link.text().trim();
    const slugMatch = href.match(/\/skill\/([^/]+)$/);
    const slug = slugMatch ? slugMatch[1] : null;

    const $effectCell = $tr.find("td:nth-child(2)");
    const descElems = $effectCell.find(".Skill_description__BNAs8");
    const description = descElems.first().text().trim();

    // levels container is the .Skill_description__BNAs8 that has child divs
    let levels = {};
    const levelsContainer = descElems.filter((i, el) => $(el).find("div").length > 0).first();
    if (levelsContainer && levelsContainer.length) {
      $(levelsContainer)
        .find("div")
        .each((_, div) => {
          const txt = $(div).text().replace(/\uFEFF/g, "").trim();
          const m = txt.match(/Lv\.?\s*(\d+)\s*[:：]\s*(.+)/i);
          if (m) levels[`Lv${m[1]}`] = m[2].trim();
        });
    }

    rows.push({ slug, name, description, levels });
  });

  return rows;
}

async function fetchPage(langCode) {
  const url = langCode === "zh-TW" ? `${BASE_URL}/skill` : `${BASE_URL}/${langCode}/skill`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      console.warn(`HTTP ${res.status} for ${langCode} -> ${url}`);
      return null;
    }
    const html = await res.text();
    return html;
  } catch (e) {
    console.warn(`Error fetching ${url}: ${e.message}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const langsArg = args.find((a) => a.startsWith("--langs="));
  const langs = langsArg ? langsArg.split("=")[1].split(",") : ["ja","ko","zh-CN","zh-TW"];
  const testMode = args.includes("--test");
  const force = args.includes("--force");

  console.log(`Reference: English index -> fetching /en/skill`);
  const enHtml = await fetchPage("en");
  if (!enHtml) return console.error("Failed to fetch English index page");
  const enRows = parseIndex(enHtml);
  console.log(`Found ${enRows.length} rows in English index`);

  const skillsPath = path.join(__dirname, "../src/data/skills.json");
  const existingSkills = JSON.parse(fs.readFileSync(skillsPath, "utf8"));

  let updatedCount = 0;
  let totalLevels = 0;

  for (const lang of langs) {
    console.log(`\nProcessing language: ${lang}`);
    const html = await fetchPage(lang);
    if (!html) { console.log(`  Skipping ${lang}`); continue; }
    const rows = parseIndex(html);
    console.log(`  Found ${rows.length} rows for ${lang}`);

    // Build a map by normalized slug for quick lookup
    const mapBySlug = new Map();
    rows.forEach((r, i) => { if (r.slug) mapBySlug.set(normalizeSlug(r.slug), { r, i }); });

    for (let i = 0; i < enRows.length; i++) {
      const enRow = enRows[i];
      const target = mapBySlug.get(normalizeSlug(enRow.slug || enRow.name || ""));
      let matchedRow = null;
      if (target) matchedRow = target.r;
      else if (rows[i]) matchedRow = rows[i]; // fallback by position

      if (!matchedRow) continue;

      // find our internal key by matching normalized slug to existing keys
      const normalizedSlug = normalizeSlug(enRow.slug || matchedRow.slug || "");
      let existingKey = null;
      for (const key of Object.keys(existingSkills)) {
        if (normalizeSlug(key) === normalizedSlug) { existingKey = key; break; }
      }
      if (!existingKey) continue;

      const ourLang = LANG_MAPPING[lang];
      if (!ourLang) continue;

      const levels = matchedRow.levels || {};
      if (Object.keys(levels).length === 0) continue;

      const hadLevels = Boolean(
        existingSkills[existingKey][ourLang] &&
          Object.keys(existingSkills[existingKey][ourLang].levels || {}).length > 0
      );

      if (!hadLevels || force) {
        existingSkills[existingKey][ourLang] = existingSkills[existingKey][ourLang] || {};
        existingSkills[existingKey][ourLang].levels = levels;
        updatedCount++;
        totalLevels += Object.keys(levels).length;
        console.log(`  -> Updated ${existingKey} [${ourLang}] (${Object.keys(levels).length} levels)`);
      }
    }

    await sleep(DELAY_MS);
  }

  if (!testMode && updatedCount > 0) {
    fs.writeFileSync(skillsPath, JSON.stringify(existingSkills, null, 2), "utf8");
    console.log(`\nSaved updates: ${updatedCount} skill/language combos, ${totalLevels} levels`);
  } else if (testMode) {
    console.log(`\nTest mode: would update ${updatedCount} combos`);
  } else {
    console.log(`\nNo updates made`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
