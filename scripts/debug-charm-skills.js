const BASE = "https://mhwilds.kiranico.com";

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i < retries - 1)
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
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

async function debug() {
  const slug = "marathon-charm-i";
  const url = `${BASE}/data/charms/${slug}`;
  console.log(`Fetching ${url}...`);
  const html = await fetchWithRetry(url);
  const rsc = extractRSCData(html);

  // Find skills mentions
  const skillUrls = rsc.match(/\/data\/skills\/[a-z-]+/g);
  console.log(
    "Skill URLs found in RSC:",
    skillUrls ? skillUrls.slice(0, 5) : "None"
  );

  // Find a specific skill link structure
  const marathonRunnerIndex = rsc.indexOf("/data/skills/marathon-runner");
  if (marathonRunnerIndex > 0) {
    const snippet = rsc.substring(
      Math.max(0, marathonRunnerIndex - 200),
      marathonRunnerIndex + 300
    );
    console.log("\nSnippet around marathon-runner:");
    console.log(snippet);
  }

  // Try various patterns
  console.log("\n=== Testing patterns ===");

  // Look for table rows with skill links
  const pattern2 =
    /"type":"tr","props":\{"children":\[.*?"en":"\/data\/skills\/([a-z-]+)".*?\]\}\}/g;
  const matches2 = [...rsc.matchAll(pattern2)];
  console.log(
    `Pattern 2 (table row with en skill): ${matches2.length} matches`
  );
  if (matches2.length > 0) {
    console.log("First match slug:", matches2[0][1]);
    console.log("First match (truncated):", matches2[0][0].substring(0, 250));
  }

  // Try to extract skill name from the same row
  if (matches2.length > 0) {
    const firstRow = matches2[0][0];
    // Look for the TX children with English name
    const nameMatch = firstRow.match(
      /"type":"tx","props":\{"children":\{.*?"en":"([^"]+)".*?\}\}\}/
    );
    console.log(
      "\nSkill name extracted:",
      nameMatch ? nameMatch[1] : "NOT FOUND"
    );

    // Look for level span
    const levelMatch = firstRow.match(
      /"type":"span","props":\{"children":"Lv(\d+)"\}\}/
    );
    console.log("Level extracted:", levelMatch ? levelMatch[1] : "NOT FOUND");
  }
}

debug().catch(console.error);
