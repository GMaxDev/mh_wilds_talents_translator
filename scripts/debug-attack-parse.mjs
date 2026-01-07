import * as cheerio from "cheerio";

const BASE = "https://mhwilds.gamertw.com";
const tests = [
  { code: "fr", url: `${BASE}/fr/skill` },
  { code: "ja", url: `${BASE}/ja/skill` },
  { code: "ko", url: `${BASE}/ko/skill` },
  { code: "zh-CN", url: `${BASE}/zh-CN/skill` },
  { code: "zh-TW", url: `${BASE}/skill` },
];

function extractLevelsFromEffectCell($, $effectCell) {
  const result = { description: null, levels: {} };
  const descElems = $effectCell.find(".Skill_description__BNAs8");
  console.log("  debug: descElems count =", descElems.length);
  descElems.each((i, el) =>
    console.log(
      `    descElems[${i}] html start:`,
      $(el).html().slice(0, 120).replace(/\n/g, " ")
    )
  );
  result.description = descElems.first().text().trim();

  const levelsContainer = descElems
    .filter((i, el) => $(el).find("div").length > 0)
    .first();
  if (!levelsContainer || levelsContainer.length === 0) return result;
  console.log(
    "  debug: levelsContainer html start:",
    $(levelsContainer).html().slice(0, 240).replace(/\n/g, " ")
  );

  $(levelsContainer)
    .find("div")
    .each((_, levelDiv) => {
      let levelText = $(levelDiv)
        .text()
        .replace(/\uFEFF/g, "")
        .trim();
      const match = levelText.match(/Lv\.?\s*(\d+)\s*[:：]\s*(.+)/i);
      if (match) {
        result.levels[`Lv${match[1]}`] = match[2].trim();
      }
    });

  return result;
}

for (const t of tests) {
  (async () => {
    try {
      console.log(`\n=== ${t.code} -> ${t.url} ===`);
      const res = await fetch(t.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) {
        console.log(`HTTP ${res.status}`);
        return;
      }
      const html = await res.text();
      const $ = cheerio.load(html);

      const $link = $(`a[href*="attack-boost"]`).first();
      if (!$link || !$link.length) {
        console.log("Skill link not found on page");
        return;
      }

      // Find the row containing the link
      const $row = $link.closest("tr");
      const $tds = $row.find("td");
      console.log("Row td count:", $tds.length);
      $tds.each((i, td) => {
        console.log(
          `  td[${i}] html snippet:`,
          $(td).html().slice(0, 180).replace(/\n/g, " ")
        );
      });

      const $effectCell = $tds.eq(1);
      if (!$effectCell || !$effectCell.length) {
        console.log("Effect cell not found");
        return;
      }

      // Inspect all descendant divs and their classes
      $effectCell.find("div").each((i, d) => {
        console.log(
          `    child div[${i}] class=",${$(d).attr("class")}," text-start=",${$(
            d
          )
            .text()
            .slice(0, 40)
            .replace(/\n/g, " ")},"`
        );
      });

      const parsed = extractLevelsFromEffectCell($, $effectCell);
      console.log(
        "Description (short):",
        parsed.description ? parsed.description.slice(0, 80) : "<none>"
      );
      const lvlKeys = Object.keys(parsed.levels);
      if (lvlKeys.length === 0) {
        console.log("Levels: <none found>");
        console.log(
          "Effect cell HTML snippet:\n",
          $effectCell.html().slice(0, 1000)
        );
      } else {
        console.log("Levels found:", lvlKeys.join(", "));
        for (const k of lvlKeys) console.log(`  ${k}: ${parsed.levels[k]}`);
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  })();
}
