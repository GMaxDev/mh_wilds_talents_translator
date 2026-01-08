/**
 * Script pour scraper les talismans (charms) depuis Kiranico
 * Base : https://mhwilds.kiranico.com/data/charms
 * Versions localisées : /fr/data/charms, /ja/data/charms, etc.
 *
 * Produit : src/data/charms-kiranico.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = "https://mhwilds.kiranico.com";

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
      console.error(`Attempt ${i + 1} failed for ${url}:`, e.message);
      if (i < retries - 1) await delay(1000 * (i + 1));
      else throw e;
    }
  }
}

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

async function fetchCharmsSlugs() {
  const url = `${BASE}/data/charms`;
  const html = await fetchWithRetry(url);
  const rsc = extractRSCData(html);
  const slugs = new Set();
  const enMatches = rsc.matchAll(/"en":"\/data\/charms\/([a-z0-9-]+)"/g);
  for (const m of enMatches) slugs.add(m[1]);

  if (slugs.size === 0) {
    const htmlMatches = html.matchAll(/href="\/data\/charms\/([a-z0-9-]+)"/g);
    for (const m of htmlMatches) slugs.add(m[1]);
  }
  return Array.from(slugs);
}

async function scrapeCharm(slug) {
  const url = `${BASE}/data/charms/${slug}`;
  const html = await fetchWithRetry(url);
  const rsc = extractRSCData(html);

  const charm = {};

  // Extract translations 'tx' blocks
  const txPattern = /"type":"tx","props":\{"children":\{([^}]+)\}\}/g;
  const allTx = [];
  let txMatch;
  while ((txMatch = txPattern.exec(rsc)) !== null) {
    const raw = `{${txMatch[1]}}`;
    const translations = {};
    const m = raw.matchAll(/"([a-z]{2}(?:-[A-Za-z]+)?)":\s*"([^"]+)"/g);
    for (const mm of m) {
      const lang = KIRANICO_LANG_MAP[mm[1]];
      if (lang) translations[lang] = mm[2];
    }
    if (Object.keys(translations).length > 0) allTx.push(translations);
  }

  // Heuristic: first long TX is name, next may be description
  if (allTx.length > 0) {
    // Choose the first TX that contains EN as name
    const nameTx = allTx.find((t) => t.EN && t.EN.length > 0) || allTx[0];
    // Next TX that looks like description
    const descTx =
      allTx.find((t, i) => i !== 0 && t.EN && t.EN.length > 0) || {};

    for (const lang of Object.values(KIRANICO_LANG_MAP)) {
      charm[lang] = {
        name: nameTx[lang] || "",
        description: descTx[lang] || "",
        skills: [],
      };
    }
  }

  // Extract applied skills from table rows
  // Each row contains: td with skill link (hrefs + tx children) and td with level span
  const skills = [];

  const tableRowPattern =
    /"type":"tr","props":\{"children":\[.*?"en":"\/data\/skills\/([a-z-]+)".*?\]\}\}/g;
  let rowMatch;

  while ((rowMatch = tableRowPattern.exec(rsc)) !== null) {
    const skillSlug = rowMatch[1];
    const rowContent = rowMatch[0];

    // Extract English skill name from TX block
    const nameMatch = rowContent.match(
      /"type":"tx","props":\{"children":\{.*?"en":"([^"]+)".*?\}\}\}/
    );
    const skillName = nameMatch ? nameMatch[1] : skillSlug;

    // Extract level from span (Lv1, Lv2, etc.)
    const levelMatch = rowContent.match(
      /"type":"span","props":\{"children":"Lv(\d+)"\}\}/
    );
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 1;

    skills.push({ slug: skillSlug, name: skillName, level });
  }

  // Assign skills to each language object (names will be translated in frontend by mapping)
  for (const lang of Object.values(KIRANICO_LANG_MAP)) {
    charm[lang] = charm[lang] || { name: "", description: "", skills: [] };
    charm[lang].skills = skills;
  }

  return charm;
}

async function main() {
  console.log("Scraping charms list...");
  const slugs = await fetchCharmsSlugs();
  console.log(`Found ${slugs.length} charms`);

  const charms = {};
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(` [${i + 1}/${slugs.length}] ${slug}...`);
    try {
      const data = await scrapeCharm(slug);
      charms[slug] = data;
      console.log("✓");
    } catch (e) {
      console.log("✗", e.message);
    }
    await delay(200);
  }

  const outPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "charms-kiranico.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(charms, null, 2), "utf-8");
  console.log(`Saved to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
