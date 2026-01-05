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

  // Head armor patterns
  if (
    lowerName.includes("helm") ||
    lowerName.includes("headgear") ||
    lowerName.includes("cap") ||
    lowerName.includes("mask") ||
    lowerName.includes("hood") ||
    lowerName.includes("head") ||
    lowerName.includes("coiffe") ||
    lowerName.includes("casque") ||
    lowerName.includes("crown") ||
    lowerName.includes("circlet") ||
    lowerName.includes("brain") ||
    lowerName.includes("glasses") ||
    lowerName.includes("shades") ||
    lowerName.includes("goggles") ||
    lowerName.includes("earring") ||
    lowerName.includes("vertex") ||
    lowerName.includes("skull") ||
    lowerName.includes("scalp") ||
    lowerName.includes("folia") ||
    lowerName.includes("phyta") ||
    lowerName.includes("eyepatch") ||
    lowerName.includes("visor") ||
    lowerName.includes("specs") ||
    lowerName.includes("spectacles") ||
    lowerName.includes("hat") ||
    lowerName.includes("accessory") ||
    lowerName.includes("御頭")
  ) {
    return "Head";
  } else if (
    // Chest armor patterns
    lowerName.includes("mail") ||
    lowerName.includes("vest") ||
    lowerName.includes("jacket") ||
    lowerName.includes("coat") ||
    lowerName.includes("chest") ||
    lowerName.includes("torso") ||
    lowerName.includes("robe") ||
    lowerName.includes("plate") ||
    lowerName.includes("plastron") ||
    lowerName.includes("cotte") ||
    lowerName.includes("shroud") ||
    lowerName.includes("muscle") ||
    lowerName.includes("hide") ||
    lowerName.includes("cloak") ||
    lowerName.includes("thorax") ||
    lowerName.includes("elytra") ||
    lowerName.includes("suit") ||
    lowerName.includes("cloth") ||
    lowerName.includes("amstrigian") ||
    lowerName.includes("鎧甲") ||
    lowerName.includes("メイル")
  ) {
    return "Chest";
  } else if (
    // Arms armor patterns
    lowerName.includes("vambrace") ||
    lowerName.includes("braces") ||
    lowerName.includes("gloves") ||
    lowerName.includes("gauntlets") ||
    lowerName.includes("arms") ||
    lowerName.includes("sleeves") ||
    lowerName.includes("brassard") ||
    lowerName.includes("gants") ||
    lowerName.includes("grip") ||
    lowerName.includes("brachia") ||
    lowerName.includes("bracers") ||
    lowerName.includes("cuffs") ||
    lowerName.includes("branch") ||
    lowerName.includes("腕甲") ||
    lowerName.includes("アーム")
  ) {
    return "Arms";
  } else if (
    // Waist armor patterns
    lowerName.includes("coil") ||
    lowerName.includes("belt") ||
    lowerName.includes("faulds") ||
    lowerName.includes("waist") ||
    lowerName.includes("tassets") ||
    lowerName.includes("ceinture") ||
    lowerName.includes("taille") ||
    lowerName.includes("obi") ||
    lowerName.includes("sash") ||
    lowerName.includes("apron") ||
    lowerName.includes("bowels") ||
    lowerName.includes("衣帶") ||
    lowerName.includes("コイル")
  ) {
    return "Waist";
  } else if (
    // Legs armor patterns
    lowerName.includes("greaves") ||
    lowerName.includes("boots") ||
    lowerName.includes("leggings") ||
    lowerName.includes("feet") ||
    lowerName.includes("legs") ||
    lowerName.includes("pants") ||
    lowerName.includes("jambières") ||
    lowerName.includes("bottes") ||
    lowerName.includes("overlay") ||
    lowerName.includes("crura") ||
    lowerName.includes("shoes") ||
    lowerName.includes("heel") ||
    lowerName.includes("chaps") ||
    lowerName.includes("hakama") ||
    lowerName.includes("roots") ||
    lowerName.includes("脚甲") ||
    lowerName.includes("グリーヴ")
  ) {
    return "Legs";
  } else if (
    // Charm patterns
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

  // Charger le mapping des types d'armes par langue
  const weaponNamesByLangPath = path.join(
    DATA_DIR,
    "weapon-names-by-lang.json"
  );
  const weaponTypesPath = path.join(DATA_DIR, "weapon-types.json");

  let weaponNamesByLang = {};
  let weaponTypesEN = {};

  // Essayer de charger le nouveau fichier multi-langue
  if (fs.existsSync(weaponNamesByLangPath)) {
    weaponNamesByLang = JSON.parse(
      fs.readFileSync(weaponNamesByLangPath, "utf-8")
    );
    console.log(
      `📚 Loaded weapon names for ${
        Object.keys(weaponNamesByLang).length
      } languages`
    );
  }

  // Charger aussi l'ancien fichier EN pour fallback
  if (fs.existsSync(weaponTypesPath)) {
    weaponTypesEN = JSON.parse(fs.readFileSync(weaponTypesPath, "utf-8"));
    console.log(
      `📚 Loaded ${
        Object.keys(weaponTypesEN).length
      } EN weapon type mappings (fallback)`
    );
  }

  if (
    Object.keys(weaponNamesByLang).length === 0 &&
    Object.keys(weaponTypesEN).length === 0
  ) {
    console.error(
      "❌ No weapon type files found. Run scrape-all-weapon-names.js first."
    );
    process.exit(1);
  }

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

  // Fonction helper pour trouver le type d'une arme dans une langue
  const findWeaponType = (name, lang) => {
    // D'abord essayer le mapping par langue
    if (weaponNamesByLang[lang]?.[name]) {
      return weaponNamesByLang[lang][name];
    }
    // Essayer sans suffixes romains
    const baseName = name.replace(/\s+[IVX]+$/, "");
    if (weaponNamesByLang[lang]?.[baseName]) {
      return weaponNamesByLang[lang][baseName];
    }
    // Fallback sur le mapping EN
    if (weaponTypesEN[name]) {
      return weaponTypesEN[name];
    }
    if (weaponTypesEN[baseName]) {
      return weaponTypesEN[baseName];
    }
    return null;
  };

  // Mise à jour de tous les équipements pour toutes les langues
  console.log("🔍 Updating equipment types for all languages...");

  for (const [skillId, langData] of Object.entries(skillSpecs)) {
    for (const [lang, data] of Object.entries(langData)) {
      if (!data?.equipment) continue;

      for (const item of data.equipment) {
        if (item.type === "Unknown") {
          // Essayer de trouver le type d'arme
          const foundType = findWeaponType(item.name, lang);

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
  }

  console.log(`   ✅ Weapons matched: ${totalUpdated}`);
  console.log(`   🛡️  Armor detected: ${totalArmor}`);
  console.log(`   ❓ Still unknown: ${totalUnknown}`);

  // Deuxième passe: propager les types des équipements EN vers les autres langues par position
  console.log(
    "\n🔄 Pass 2: Propagating types from EN to other languages by position..."
  );
  let totalPropagated = 0;

  for (const [skillId, langData] of Object.entries(skillSpecs)) {
    const enData = langData["EN"];
    if (!enData?.equipment) continue;

    for (const [lang, data] of Object.entries(langData)) {
      if (lang === "EN" || !data?.equipment) continue;

      for (let i = 0; i < data.equipment.length; i++) {
        const item = data.equipment[i];

        // Si le type est Unknown et qu'on a un équipement EN à la même position
        if (item.type === "Unknown" && i < enData.equipment.length) {
          const enType = enData.equipment[i].type;
          if (enType && enType !== "Unknown") {
            item.type = enType;
            totalPropagated++;
          }
        }
      }
    }
  }

  console.log(`   ✅ Types propagated from EN: ${totalPropagated}`);

  // Compter les unknown restants
  let finalUnknown = 0;
  for (const [skillId, langData] of Object.entries(skillSpecs)) {
    for (const [lang, data] of Object.entries(langData)) {
      if (!data?.equipment) continue;
      for (const item of data.equipment) {
        if (item.type === "Unknown") finalUnknown++;
      }
    }
  }

  // Sauvegarder les modifications
  fs.writeFileSync(specsPath, JSON.stringify(skillSpecs, null, 2), "utf-8");

  console.log("\n📊 Final Summary:");
  console.log(`   ✅ Total weapons matched: ${totalUpdated}`);
  console.log(`   🛡️  Total armor detected: ${totalArmor}`);
  console.log(`   🌐 Types propagated from EN: ${totalPropagated}`);
  console.log(`   ❓ Still unknown: ${finalUnknown}`);
  console.log(`\n✅ Updated skill-specifications.json`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
