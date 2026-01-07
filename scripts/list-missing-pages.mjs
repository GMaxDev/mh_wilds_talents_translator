import * as cheerio from 'cheerio';
import fs from 'fs';

const BASE = 'https://mhwilds.gamertw.com';
const EN_URL = `${BASE}/en/skill`;

function normalizeSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/'/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function getGamertwSlugs() {
  const html = await fetchHtml(EN_URL);
  const $ = cheerio.load(html);
  const slugs = [];
  $('table tbody tr').each((_, row) => {
    const $link = $(row).find('td:first-child a').first();
    const href = $link.attr('href') || '';
    const m = href.match(/\/skill\/([^/]+)$/);
    if (m) slugs.push(m[1]);
  });
  return slugs;
}

async function main() {
  const gamertwSlugs = await getGamertwSlugs();
  const skillsPath = new URL('../src/data/skills.json', import.meta.url).pathname;
  const existing = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
  const existingKeys = Object.keys(existing || {});

  const notFound = [];
  for (const slug of gamertwSlugs) {
    const n = normalizeSlug(slug);
    const found = existingKeys.some(k => normalizeSlug(k) === n);
    if (!found) notFound.push(slug);
  }

  // Now list skills that lack level translations for JA/KO/ZH/ZH_HANT
  const langs = ['JA','KO','ZH','ZH_HANT'];
  const missingLevels = [];
  for (const key of existingKeys) {
    const item = existing[key];
    const missing = [];
    for (const L of langs) {
      const entry = item[L];
      const levels = entry?.levels || {};
      if (!entry || Object.keys(levels).length === 0) missing.push(L);
    }
    if (missing.length) missingLevels.push({ key, missing });
  }

  console.log('\n=== Gamertw slugs not found in our data ===\n');
  if (notFound.length === 0) console.log('None'); else notFound.forEach(s => console.log('-', s));

  console.log('\n=== Skills missing level translations (JA/KO/ZH/ZH_HANT) ===\n');
  if (missingLevels.length === 0) console.log('None');
  else missingLevels.forEach(it => console.log('-', it.key, 'missing:', it.missing.join(', ')));
}

main().catch(e => { console.error(e); process.exit(1); });
