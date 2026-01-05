/**
 * Script pour mettre à jour les types d'équipement dans skill-specifications.json
 * en utilisant le mapping de weapon-types.json et en propageant les types EN aux autres langues
 *
 * === UTILISATION ===
 * $ node scripts/update-equipment-types.js
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "src", "data");

/**
 * Détecte le type d'armure basé sur le nom
 */
function detectArmorType(name) {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("helm") ||
    lowerName.includes("headgear") ||
    lowerName.includes("cap") ||
    lowerName.includes("mask") ||
    lowerName.includes("hood") ||
    lowerName.includes("head") ||
    lowerName.includes("coiffe") ||
    lowerName.includes("casque")
  ) {
    return "Head";
  } else if (
    lowerName.includes("mail") ||
    lowerName.includes("vest") ||
    lowerName.includes("jacket") ||
    lowerName.includes("coat") ||
    lowerName.includes("chest") ||
    lowerName.includes("torso") ||
    lowerName.includes("robe") ||
    lowerName.includes("plate") ||
    lowerName.includes("plastron") ||
    lowerName.includes("cotte")
  ) {
    return "Chest";
  } else if (
    lowerName.includes("vambrace") ||
    lowerName.includes("braces") ||
    lowerName.includes("gloves") ||
    lowerName.includes("gauntlets") ||
    lowerName.includes("arms") ||
    lowerName.includes("sleeves") ||
    lowerName.includes("brassard") ||
    lowerName.includes("gants")
  ) {
    return "Arms";
  } else if (
    lowerName.includes("coil") ||
    lowerName.includes("belt") ||
    lowerName.includes("faulds") ||
    lowerName.includes("waist") ||
    lowerName.includes("tassets") ||
    lowerName.includes("ceinture") ||
    lowerName.includes("taille")
  ) {
    return "Waist";
  } else if (
    lowerName.includes("greaves") ||
    lowerName.includes("boots") ||
    lowerName.includes("leggings") ||
    lowerName.includes("feet") ||
    lowerName.includes("legs") ||
    lowerName.includes("pants") ||
    lowerName.includes("jambières") ||
    lowerName.includes("bottes")
  ) {
    return "Legs";
  } else if (
    lowerName.includes("charm") ||
    lowerName.includes("talisman") ||
    lowerName.includes("pendant") ||
    lowerName.includes("amulet") ||
    lowerName.includes("amulette")
  ) {
    return "Charm";
  }

  return null;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Update Equipment Types                                 ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  // Charger le mapping des types d'armes
  const weaponTypesPath = path.join(DATA_DIR, "weapon-types.json");
  if (!fs.existsSync(weaponTypesPath)) {
    console.error(
      "❌ weapon-types.json not found. Run scrape-weapons.js first."
    );
    process.exit(1);
  }

  const weaponTypes = JSON.parse(fs.readFileSync(weaponTypesPath, "utf-8"));
  console.log(
    `📚 Loaded ${Object.keys(weaponTypes).length} weapon type mappings`
  );

  // Charger les spécifications de skills
  const specsPath = path.join(DATA_DIR, "skill-specifications.json");
  if (!fs.existsSync(specsPath)) {
    console.error(
      "❌ skill-specifications.json not found. Run scrape-skill-specs.js first."
    );
    process.exit(1);
  }

  const skillSpecs = JSON.parse(fs.readFileSync(specsPath, "utf-8"));
  console.log(
    `📚 Loaded ${Object.keys(skillSpecs).length} skill specifications\n`
  );

  let totalUpdated = 0;
  let totalUnknown = 0;
  let totalArmor = 0;
  let totalPropagated = 0;

  // Première passe: mettre à jour les types EN avec le mapping
  console.log("🔍 Pass 1: Updating EN types from weapon mapping...");
  for (const [_skillId, langData] of Object.entries(skillSpecs)) {
    const enData = langData["EN"];
    if (!enData?.equipment) continue;

    for (const item of enData.equipment) {
      if (item.type === "Unknown") {
        // Essayer de trouver le type via le nom exact
        let foundType = weaponTypes[item.name];

        // Si pas trouvé, essayer sans les suffixes romains (I, II, III, IV, V)
        if (!foundType) {
          const baseName = item.name.replace(/\s+[IVX]+$/, "");
          foundType = weaponTypes[baseName];
        }

        if (foundType) {
          item.type = foundType;
          totalUpdated++;
        } else {
          // Essayer de détecter l'armure
          const armorType = detectArmorType(item.name);
          if (armorType) {
            item.type = armorType;
            totalArmor++;
          } else {
            totalUnknown++;
          }
        }
      }
    }
  }

  console.log(`   ✅ Weapons matched: ${totalUpdated}`);
  console.log(`   🛡️  Armor detected: ${totalArmor}`);
  console.log(`   ❓ Still unknown: ${totalUnknown}`);

  // Deuxième passe: propager les types EN aux autres langues par position
  console.log("\n🔄 Pass 2: Propagating EN types to other languages...");
  for (const [_skillId, langData] of Object.entries(skillSpecs)) {
    const enData = langData["EN"];
    if (!enData?.equipment) continue;

    // Pour chaque autre langue
    for (const [lang, data] of Object.entries(langData)) {
      if (lang === "EN" || !data?.equipment) continue;

      // Pour chaque équipement dans cette langue
      for (let i = 0; i < data.equipment.length; i++) {
        const item = data.equipment[i];

        // Si on a le même index dans EN et que le type EN n'est pas Unknown
        if (
          i < enData.equipment.length &&
          enData.equipment[i].type !== "Unknown"
        ) {
          if (item.type === "Unknown") {
            item.type = enData.equipment[i].type;
            totalPropagated++;
          }
        } else if (item.type === "Unknown") {
          // Essayer la détection d'armure
          const armorType = detectArmorType(item.name);
          if (armorType) {
            item.type = armorType;
            totalArmor++;
          }
        }
      }
    }
  }

  console.log(`   ✅ Types propagated to other languages: ${totalPropagated}`);

  // Sauvegarder les modifications
  fs.writeFileSync(specsPath, JSON.stringify(skillSpecs, null, 2), "utf-8");

  console.log("\n📊 Final Summary:");
  console.log(`   ✅ Total weapons updated: ${totalUpdated}`);
  console.log(`   🛡️  Total armor detected: ${totalArmor}`);
  console.log(`   🌐 Types propagated: ${totalPropagated}`);
  console.log(`   ❓ Still unknown: ${totalUnknown}`);
  console.log(`\n✅ Updated skill-specifications.json`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
