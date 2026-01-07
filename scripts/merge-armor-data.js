/**
 * Script pour fusionner les données d'armures:
 * - Traductions multilingues de Kiranico (armors-kiranico.json)
 * - Stats détaillées de l'ancien fichier (armors-full.json)
 *
 * Le résultat sera un fichier avec les traductions Kiranico et les stats existantes.
 *
 * Usage:
 * $ node scripts/merge-armor-data.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les deux fichiers
const kiraniroPath = path.join(__dirname, "../src/data/armors-kiranico.json");
const oldDataPath = path.join(__dirname, "../src/data/armors-full.json");

console.log("📥 Chargement des données...");

// armors-kiranico.json original (avant le test qui l'a écrasé)
// On doit le régénérer d'abord
console.log("⚠️ Le fichier armors-kiranico.json a été écrasé par le test.");
console.log(
  "⚠️ Veuillez d'abord exécuter: node scripts/scrape-armors-kiranico.js"
);

// Vérifier si les fichiers existent
if (!fs.existsSync(kiraniroPath)) {
  console.error("❌ armors-kiranico.json non trouvé");
  process.exit(1);
}

if (!fs.existsSync(oldDataPath)) {
  console.error("❌ armors-full.json non trouvé");
  process.exit(1);
}

const kiranico = JSON.parse(fs.readFileSync(kiraniroPath, "utf-8"));
const oldData = JSON.parse(fs.readFileSync(oldDataPath, "utf-8"));

console.log(`  ✓ Kiranico: ${Object.keys(kiranico).length} armures`);
console.log(`  ✓ Old data: ${Object.keys(oldData).length} armures`);

// Créer un mapping pour faire correspondre les noms EN entre les deux fichiers
const oldDataByEnName = {};
for (const [slug, data] of Object.entries(oldData)) {
  const enName = data.EN?.name?.toLowerCase();
  if (enName) {
    oldDataByEnName[enName] = { slug, data };
  }
}

console.log(`\n🔗 Fusion des données...`);

const merged = {};
let matched = 0;
let notMatched = 0;
const notMatchedList = [];

for (const [kiraSlug, kiraData] of Object.entries(kiranico)) {
  // Essayer de trouver la correspondance dans l'ancien fichier
  const enSeriesName = kiraData.EN?.series_name?.toLowerCase();

  // Chercher par nom exact ou slug similaire
  let oldMatch = oldDataByEnName[enSeriesName];

  // Si pas de correspondance directe, chercher par slug
  if (!oldMatch) {
    const normalizedSlug = kiraSlug.replace(/-a$/, "").replace(/-/g, " ");
    for (const [oldName, oldEntry] of Object.entries(oldDataByEnName)) {
      if (
        oldName.includes(normalizedSlug) ||
        normalizedSlug.includes(oldName)
      ) {
        oldMatch = oldEntry;
        break;
      }
    }
  }

  merged[kiraSlug] = {};

  // Pour chaque langue, fusionner les données
  for (const lang of Object.keys(kiraData)) {
    const kiraLangData = kiraData[lang];
    const oldLangData = oldMatch?.data?.[lang];

    merged[kiraSlug][lang] = {
      // Nom de série depuis Kiranico (plus de traductions)
      name: kiraLangData.series_name || oldLangData?.name || "",
      series_name: kiraLangData.series_name || oldLangData?.name || "",

      // Métadonnées depuis l'ancien fichier
      rank: oldLangData?.rank || "HIGH",
      rarity: oldLangData?.rarity || 5,
      type: oldLangData?.type || "TYPE01",

      // Pièces: fusionner traductions Kiranico + stats anciennes
      pieces: {},

      // Bonus depuis l'ancien fichier
      groupSkill: oldLangData?.groupSkill || null,
      setBonus: oldLangData?.setBonus || null,
      totalDefense: oldLangData?.totalDefense || 0,
      resistances: oldLangData?.resistances || {
        fire: 0,
        water: 0,
        thunder: 0,
        ice: 0,
        dragon: 0,
      },
    };

    // Fusionner chaque pièce
    const pieceTypes = ["head", "chest", "arms", "waist", "legs"];
    for (const pieceType of pieceTypes) {
      const kiraPiece = kiraLangData.pieces?.[pieceType];
      const oldPiece = oldLangData?.pieces?.[pieceType];

      merged[kiraSlug][lang].pieces[pieceType] = {
        // Nom et description depuis Kiranico (meilleures traductions)
        name: kiraPiece?.name || oldPiece?.name || "",
        description: kiraPiece?.description || "",

        // Stats depuis l'ancien fichier
        defense: oldPiece?.defense || 0,
        slots: oldPiece?.slots || [0, 0, 0],
        skills: oldPiece?.skills || [],
        resistances: oldPiece?.resistances || {
          fire: 0,
          water: 0,
          thunder: 0,
          ice: 0,
          dragon: 0,
        },
      };
    }
  }

  if (oldMatch) {
    matched++;
  } else {
    notMatched++;
    notMatchedList.push(kiraSlug);
  }
}

console.log(`\n📊 Résultats de la fusion:`);
console.log(`  ✓ Correspondances trouvées: ${matched}`);
console.log(`  ⚠ Sans correspondance: ${notMatched}`);

if (notMatchedList.length > 0 && notMatchedList.length <= 20) {
  console.log(`\n📋 Armures sans correspondance:`);
  for (const slug of notMatchedList) {
    console.log(`    - ${slug} (${merged[slug].EN?.series_name})`);
  }
}

// Sauvegarder le fichier fusionné
const outputPath = path.join(__dirname, "../src/data/armors-merged.json");
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), "utf-8");
console.log(`\n💾 Sauvegardé dans: ${outputPath}`);

// Afficher un exemple
const firstSlug = Object.keys(merged)[0];
if (firstSlug) {
  console.log(`\n📝 Exemple (${firstSlug}):`);
  console.log(
    JSON.stringify(merged[firstSlug].EN, null, 2).substring(0, 1500) + "..."
  );
}
