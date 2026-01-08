"use client";

import { useState, useEffect, useRef } from "react";
import talentsData from "./data/skills.json";
import skillSpecsData from "./data/skill-specifications.json";
import weaponTypeTranslations from "./data/weapon-type-translations.json";
import weaponsFullData from "./data/weapons-full.json";
import armorsFullData from "./data/armors-kiranico-full.json";
import BuildCreatorPage from "./components/BuildCreatorPage";
import charmsData from "./data/charms-kiranico.json";

// Fonction helper pour traduire les noms de skills
const translateSkillName = (skillName, targetLang) => {
  if (!skillName) return skillName;

  // Chercher le talent dans talentsData par son nom (dans n'importe quelle langue)
  const talentKey = Object.keys(talentsData).find((key) => {
    const talent = talentsData[key];
    return Object.values(talent).some(
      (langData) =>
        (langData?.name || "").toLowerCase() === (skillName || "").toLowerCase()
    );
  });

  if (talentKey) {
    const talent = talentsData[talentKey];
    return talent[targetLang]?.name || talent.EN?.name || skillName;
  }
  return skillName;
};

// Fonction pour rendre les slots visuellement (copiée depuis BuildCreatorPage)
const renderSlots = (slots, darkMode) => {
  if (!slots || slots.length === 0)
    return <span className="text-gray-500">—</span>;

  return (
    <div className="flex gap-1">
      {slots.map((slotLevel, index) => {
        if (slotLevel === 0) return null;
        const colors = {
          1: darkMode ? "bg-gray-600" : "bg-gray-400",
          2: darkMode ? "bg-blue-600" : "bg-blue-400",
          3: darkMode ? "bg-yellow-600" : "bg-yellow-400",
          4: darkMode ? "bg-purple-600" : "bg-purple-400",
        };
        return (
          <span
            key={index}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              colors[slotLevel] || colors[1]
            }`}
          >
            {slotLevel}
          </span>
        );
      })}
    </div>
  );
};

// Traductions des types d'armures
const armorTypeTranslations = {
  Head: {
    EN: "Head",
    JP: "頭",
    JA: "頭",
    KO: "머리",
    FR: "Tête",
    IT: "Testa",
    DE: "Kopf",
    ES: "Cabeza",
    RU: "Голова",
    PL: "Głowa",
    PT: "Cabeça",
    AR: "الرأس",
  },
  Chest: {
    EN: "Chest",
    JP: "胴",
    JA: "胴",
    KO: "몸통",
    FR: "Torse",
    IT: "Torace",
    DE: "Brust",
    ES: "Torso",
    RU: "Торс",
    PL: "Tułów",
    PT: "Peito",
    AR: "الصدر",
  },
  Arms: {
    EN: "Arms",
    JP: "腕",
    JA: "腕",
    KO: "팔",
    FR: "Bras",
    IT: "Braccia",
    DE: "Arme",
    ES: "Brazos",
    RU: "Руки",
    PL: "Ramiona",
    PT: "Braços",
    AR: "الذراعين",
  },
  Waist: {
    EN: "Waist",
    JP: "腰",
    JA: "腰",
    KO: "허리",
    FR: "Taille",
    IT: "Vita",
    DE: "Taille",
    ES: "Cintura",
    RU: "Пояс",
    PL: "Pas",
    PT: "Cintura",
    AR: "الخصر",
  },
  Legs: {
    EN: "Legs",
    JP: "脚",
    JA: "脚",
    KO: "다리",
    FR: "Jambes",
    IT: "Gambe",
    DE: "Beine",
    ES: "Piernas",
    RU: "Ноги",
    PL: "Nogi",
    PT: "Pernas",
    AR: "الساقين",
  },
};

// Traductions de l'interface utilisateur
const uiTranslations = {
  equipmentWithSkill: {
    EN: "Equipment with this skill",
    JP: "該当裝備",
    JA: "このスキルを持つ装備",
    KO: "이 스킬을 가진 장비",
    FR: "Équipements avec ce talent",
    IT: "Equipaggiamento con questa abilità",
    DE: "Ausrüstung mit dieser Fertigkeit",
    ES: "Equipamiento con esta habilidad",
    RU: "Снаряжение с этим навыком",
    PL: "Ekwipunek z tą umiejętnością",
    PT: "Equipamento com esta habilidade",
    AR: "المعدات مع هذه المهارة",
  },
  levels: {
    EN: "Levels",
    JP: "等級",
    JA: "レベル",
    KO: "레벨",
    FR: "Niveaux",
    IT: "Livelli",
    DE: "Stufen",
    ES: "Niveles",
    RU: "Уровни",
    PL: "Poziomy",
    PT: "Níveis",
    AR: "المستويات",
  },
  noEquipmentData: {
    EN: "No equipment data available yet.",
    JP: "裝備數據尚未加載。",
    JA: "装備データがまだありません。",
    KO: "장비 데이터가 아직 없습니다.",
    FR: "Aucune donnée d'équipement disponible.",
    IT: "Nessun dato equipaggiamento disponibile.",
    DE: "Noch keine Ausrüstungsdaten verfügbar.",
    ES: "No hay datos de equipamiento disponibles.",
    RU: "Данные о снаряжении пока недоступны.",
    PL: "Brak danych o ekwipunku.",
    PT: "Nenhum dado de equipamento disponível.",
    AR: "لا تتوفر بيانات المعدات بعد.",
  },
  runScrapingScript: {
    EN: "Run the scraping script to fetch equipment details.",
    JP: "執行腳本以獲取裝備詳情。",
    JA: "スクリプトを実行して装備データを取得してください。",
    KO: "스크립트를 실행하여 장비 데이터를 가져오세요.",
    FR: "Exécutez le script pour récupérer les équipements.",
    IT: "Esegui lo script per recuperare i dettagli.",
    DE: "Führen Sie das Skript aus, um Ausrüstungsdetails abzurufen.",
    ES: "Ejecute el script para obtener los detalles del equipo.",
    RU: "Запустите скрипт для получения данных о снаряжении.",
    PL: "Uruchom skrypt, aby pobrać dane o ekwipunku.",
    PT: "Execute o script para obter os detalhes do equipamento.",
    AR: "قم بتشغيل البرنامج النصي لجلب تفاصيل المعدات.",
  },
  weaponSkills: {
    EN: "Skills",
    JP: "技能",
    JA: "スキル",
    KO: "스킬",
    FR: "Talents",
    IT: "Abilità",
    DE: "Fertigkeiten",
    ES: "Habilidades",
    RU: "Навыки",
    PL: "Umiejętności",
    PT: "Habilidades",
    AR: "المهارات",
  },
  weaponStats: {
    EN: "Stats",
    JP: "屬性",
    JA: "ステータス",
    KO: "스탯",
    FR: "Stats",
    IT: "Statistiche",
    DE: "Werte",
    ES: "Estadísticas",
    RU: "Характеристики",
    PL: "Statystyki",
    PT: "Estatísticas",
    AR: "الإحصائيات",
  },
  searchPlaceholder: {
    EN: "Search talents or weapons...",
    JP: "搜尋技能或武器...",
    JA: "スキルまたは武器を検索...",
    KO: "스킬 또는 무기 검색...",
    FR: "Rechercher talents ou armes...",
    IT: "Cerca abilità o armi...",
    DE: "Fertigkeiten oder Waffen suchen...",
    ES: "Buscar habilidades o armas...",
    RU: "Поиск навыков или оружия...",
    PL: "Szukaj umiejętności lub broni...",
    PT: "Buscar habilidades ou armas...",
    AR: "البحث عن المهارات أو الأسلحة...",
  },
  talentsSection: {
    EN: "Talents",
    JP: "技能",
    JA: "スキル",
    KO: "스킬",
    FR: "Talents",
    IT: "Abilità",
    DE: "Fertigkeiten",
    ES: "Habilidades",
    RU: "Навыки",
    PL: "Umiejętności",
    PT: "Habilidades",
    AR: "المهارات",
  },
  weaponsSection: {
    EN: "Weapons",
    JP: "武器",
    JA: "武器",
    KO: "무기",
    FR: "Armes",
    IT: "Armi",
    DE: "Waffen",
    ES: "Armas",
    RU: "Оружие",
    PL: "Bronie",
    PT: "Armas",
    AR: "الأسلحة",
  },
  noSkillsData: {
    EN: "This weapon has no skills",
    JP: "此武器沒有技能",
    JA: "この武器にはスキルがありません",
    KO: "이 무기에는 스킬이 없습니다",
    FR: "Cette arme n'a pas de talents",
    IT: "Quest'arma non ha abilità",
    DE: "Diese Waffe hat keine Fertigkeiten",
    ES: "Esta arma no tiene habilidades",
    RU: "У этого оружия нет навыков",
    PL: "Ta broń nie ma umiejętności",
    PT: "Esta arma não possui habilidades",
    AR: "هذا السلاح لا يحتوي على مهارات",
  },
  attack: {
    EN: "Attack",
    JP: "攻擊",
    JA: "攻撃力",
    KO: "공격력",
    FR: "Attaque",
    IT: "Attacco",
    DE: "Angriff",
    ES: "Ataque",
    RU: "Атака",
    PL: "Atak",
    PT: "Ataque",
    AR: "الهجوم",
  },
  affinity: {
    EN: "Affinity",
    JP: "會心率",
    JA: "会心率",
    KO: "회심률",
    FR: "Affinité",
    IT: "Affinità",
    DE: "Affinität",
    ES: "Afinidad",
    RU: "Сродство",
    PL: "Powinowactwo",
    PT: "Afinidade",
    AR: "التقارب",
  },
  slots: {
    EN: "Slots",
    JP: "插槽",
    JA: "スロット",
    KO: "슬롯",
    FR: "Emplacements",
    IT: "Slot",
    DE: "Slots",
    ES: "Ranuras",
    RU: "Слоты",
    PL: "Sloty",
    PT: "Compartimentos",
    AR: "الفتحات",
  },
  switchTo: {
    EN: "Switch to",
    JP: "切換到",
    JA: "に切り替え",
    KO: "로 전환",
    FR: "Voir en",
    IT: "Passa a",
    DE: "Wechseln zu",
    ES: "Cambiar a",
    RU: "Переключить на",
    PL: "Przełącz na",
    PT: "Mudar para",
    AR: "التبديل إلى",
  },
  weaponStatsTitle: {
    EN: "Weapon Stats",
    JP: "武器屬性",
    JA: "武器ステータス",
    KO: "무기 스탯",
    FR: "Stats de l'arme",
    IT: "Statistiche arma",
    DE: "Waffenwerte",
    ES: "Estadísticas del arma",
    RU: "Характеристики оружия",
    PL: "Statystyki broni",
    PT: "Estatísticas da arma",
    AR: "إحصائيات السلاح",
  },
  weaponSkillsTitle: {
    EN: "Weapon Skills",
    JP: "武器技能",
    JA: "武器スキル",
    KO: "무기 스킬",
    FR: "Talents de l'arme",
    IT: "Abilità arma",
    DE: "Waffenfertigkeiten",
    ES: "Habilidades del arma",
    RU: "Навыки оружия",
    PL: "Umiejętności broni",
    PT: "Habilidades da arma",
    AR: "مهارات السلاح",
  },
  more: {
    EN: "more",
    JP: "更多",
    JA: "もっと",
    KO: "더 보기",
    FR: "de plus",
    IT: "altri",
    DE: "mehr",
    ES: "más",
    RU: "ещё",
    PL: "więcej",
    PT: "mais",
    AR: "المزيد",
  },
};

// Fonction pour obtenir une traduction UI
const getUIText = (key, lang) => {
  return uiTranslations[key]?.[lang] || uiTranslations[key]?.EN || key;
};

// Fonction pour traduire un type d'équipement
const translateEquipmentType = (type, lang) => {
  // Vérifier d'abord dans les types d'armes
  if (weaponTypeTranslations[type]?.[lang]) {
    return weaponTypeTranslations[type][lang];
  }
  // Sinon vérifier dans les types d'armures
  if (armorTypeTranslations[type]?.[lang]) {
    return armorTypeTranslations[type][lang];
  }
  // Fallback: retourner le type original
  return type;
};

// Icônes simplifiées
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const ArrowLeftRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3 4 7l4 4"></path>
    <path d="M4 7h16"></path>
    <path d="m16 21 4-4-4-4"></path>
    <path d="M20 17H4"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);

const KeyboardArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7"></path>
    <path d="m19 12-7 7-7-7"></path>
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

function App() {
  const [currentPage, setCurrentPage] = useState("translator"); // "translator", "builder" ou "editor"
  const [darkMode, setDarkMode] = useState(true); // Mode sombre par défaut
  const [talents, setTalents] = useState({});

  // Détecter le paramètre build dans l'URL pour naviguer automatiquement vers le builder
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("build")) {
      setCurrentPage("builder");
    }
  }, []);

  useEffect(() => {
    // Appliquer le mode sombre par défaut au chargement
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    // Initialize talents from the imported JSON
    setTalents(talentsData);
  }, []);

  // Fonction pour vérifier le mot de passe (À RÉACTIVER PLUS TARD)
  // const handleEditorAuth = () => {
  //   const EDITOR_PASSWORD = "maxime2025";
  //   if (authPassword === EDITOR_PASSWORD) {
  //     setIsEditorAuthenticated(true);
  //     setShowAuthModal(false);
  //     setAuthPassword("");
  //     setCurrentPage("editor");
  //   } else {
  //     alert("Mot de passe incorrect");
  //     setAuthPassword("");
  //   }
  // };

  // const handleEditorClick = () => {
  //   if (!isEditorAuthenticated) {
  //     setShowAuthModal(true);
  //   } else {
  //     setCurrentPage("editor");
  //   }
  // };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fonction pour mettre à jour les talents (utilisée par l'éditeur)
  const updateTalents = (newTalents) => {
    setTalents(newTalents);
    // Dans une application réelle, vous sauvegarderiez ici les données dans un backend
    console.log("Talents updated:", newTalents);
  };

  // Fonction pour télécharger le JSON modifié
  const downloadTalentsJSON = () => {
    const dataStr = JSON.stringify(talents, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "skills.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "dark bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900"
          : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100"
      }`}
    >
      {/* Éléments décoratifs pour l'arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob ${
            darkMode ? "bg-cyan-500" : "bg-amber-500"
          }`}
        ></div>
        <div
          className={`absolute top-0 -right-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 ${
            darkMode ? "bg-blue-500" : "bg-orange-400"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 ${
            darkMode ? "bg-indigo-500" : "bg-amber-300"
          }`}
        ></div>
      </div>

      <div className="container relative z-10 px-8 py-8 mx-auto">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage("translator")}
              className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 shadow-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/30"
                  : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
              } ${
                currentPage === "translator"
                  ? darkMode
                    ? "ring-2 ring-cyan-500/50"
                    : "ring-2 ring-amber-500/50"
                  : ""
              }`}
              aria-label="Go to translator"
            >
              <HomeIcon />
              <span className="hidden sm:inline">Translator</span>
            </button>

            <button
              onClick={() => setCurrentPage("builder")}
              className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 shadow-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/30"
                  : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
              } ${
                currentPage === "builder"
                  ? darkMode
                    ? "ring-2 ring-cyan-500/50"
                    : "ring-2 ring-amber-500/50"
                  : ""
              }`}
              aria-label="Go to build creator"
            >
              <EditIcon />
              <span className="hidden sm:inline">Build Creator</span>
            </button>

            {/* Editor button - DISABLED FOR NOW */}
          </div>

          <div className="flex gap-2">
            {currentPage === "editor" && (
              <button
                onClick={downloadTalentsJSON}
                className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 shadow-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-cyan-900/30 text-cyan-100 hover:bg-cyan-800/50 border-cyan-900/50"
                    : "bg-amber-500/30 text-amber-900 hover:bg-amber-500/50 border-amber-500/50"
                }`}
                aria-label="Download JSON"
                title="Download skills.json"
              >
                <DownloadIcon />
                <span className="hidden sm:inline">Save JSON</span>
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 shadow-lg ${
                darkMode
                  ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/30"
                  : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
              }`}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1
            className={`text-5xl font-bold mb-2 ${
              darkMode
                ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-cyan-200"
                : "bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-orange-600"
            }`}
          >
            MH Wilds{" "}
            {currentPage === "translator"
              ? "Talent Translator"
              : currentPage === "builder"
              ? "Build Creator"
              : "Editor"}
          </h1>
          <p
            className={`${
              darkMode ? "text-amber-100/80" : "text-amber-800/80"
            }`}
          >
            {currentPage === "translator"
              ? "Translate Monster Hunter Wilds talents between languages"
              : currentPage === "builder"
              ? "Create and customize your Monster Hunter Wilds builds"
              : "Add, edit or delete Monster Hunter Wilds talents"}
          </p>
        </div>

        {currentPage === "translator" ? (
          <TranslatorPage talents={talents} darkMode={darkMode} />
        ) : currentPage === "builder" ? (
          <BuildCreatorPage darkMode={darkMode} initialLanguage="FR" />
        ) : (
          <TranslatorPage talents={talents} darkMode={darkMode} />
          // <EditorPage
          //   talents={talents}
          //   darkMode={darkMode}
          //   updateTalents={updateTalents}
          //   downloadTalentsJSON={downloadTalentsJSON}
          // />
        )}

        {/* Modal d'authentification pour l'éditeur - DISABLED FOR NOW
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className={`rounded-lg shadow-2xl p-8 max-w-sm w-full ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  darkMode ? "text-amber-100" : "text-amber-900"
                }`}
              >
                Editor Access
              </h2>
              <p
                className={`mb-4 ${
                  darkMode ? "text-amber-100/80" : "text-amber-800/80"
                }`}
              >
                This section requires authentication. Enter the password to access the editor.
              </p>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditorAuth();
                }}
                placeholder="Enter password"
                className={`w-full px-4 py-2 rounded-lg mb-4 border focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-slate-700/50 border-slate-600 text-amber-100 focus:ring-cyan-500 placeholder-slate-400"
                    : "bg-amber-50 border-amber-300 text-amber-900 focus:ring-amber-500 placeholder-amber-400"
                }`}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthPassword("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/30 border-slate-600 text-amber-100 hover:bg-slate-700/50"
                      : "bg-amber-100/30 border-amber-300 text-amber-900 hover:bg-amber-100/50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditorAuth}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    darkMode
                      ? "bg-cyan-900/50 border-cyan-700 text-cyan-100 hover:bg-cyan-800/50"
                      : "bg-amber-500/50 border-amber-500 text-amber-900 hover:bg-amber-500/70"
                  }`}
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );
}

function TranslatorPage({ talents, darkMode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [selectedWeapon, setSelectedWeapon] = useState(null); // Nouvelle: arme sélectionnée
  const [selectedArmor, setSelectedArmor] = useState(null); // Nouvelle: armure sélectionnée
  const [selectedCharm, setSelectedCharm] = useState(null); // talisman sélectionné
  const [sourceLanguage, setSourceLanguage] = useState("EN");
  const [targetLanguage, setTargetLanguage] = useState("FR");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [filteredWeapons, setFilteredWeapons] = useState([]); // Nouvelle: armes filtrées
  const [filteredArmors, setFilteredArmors] = useState([]); // Nouvelle: armures filtrées
  const [filteredCharms, setFilteredCharms] = useState([]); // talismans filtrés
  const [keyboardSelectedIndex, setKeyboardSelectedIndex] = useState(-1); // Pour la navigation au clavier
  const [showResults, setShowResults] = useState(false);
  const [expandedSide, setExpandedSide] = useState(null); // "source" ou "target" ou null

  const searchInputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const resultItemsRef = useRef([]);

  // Mettre le focus sur l'input de recherche au chargement de la page
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Determine available languages from the first talent
    if (Object.keys(talents).length > 0) {
      const firstTalent = Object.keys(talents)[0];
      setAvailableLanguages(Object.keys(talents[firstTalent]));
    }
  }, [talents]);

  useEffect(() => {
    // Filter talents, weapons and armors based on search query
    if (searchQuery.trim() === "") {
      setFilteredTalents([]);
      setFilteredWeapons([]);
      setFilteredArmors([]);
      setKeyboardSelectedIndex(-1);
      return;
    }

    // Auto-detect language based on input
    detectLanguage(searchQuery);

    // Filtrer les talents
    const filteredTalentsList = Object.keys(talents).filter((talentKey) => {
      const talent = talents[talentKey];
      return (
        availableLanguages.some((lang) =>
          (talent[lang]?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) || talentKey.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Filtrer les armes (limité à 20 résultats pour les performances)
    const filteredWeaponsList = Object.keys(weaponsFullData)
      .filter((weaponId) => {
        const weapon = weaponsFullData[weaponId];
        // Chercher dans toutes les langues disponibles
        return availableLanguages.some((lang) => {
          const weaponData = weapon[lang];
          if (!weaponData) return false;
          // Chercher par nom, type d'arme ou nom de skill
          const matchesName = (weaponData.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesType = (weaponData.type || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesSkill = weaponData.skills?.some(([skillName]) =>
            (skillName || "").toLowerCase().includes(searchQuery.toLowerCase())
          );
          return matchesName || matchesType || matchesSkill;
        });
      })
      .slice(0, 20); // Limiter à 20 armes

    // Filtrer les armures (limité à 20 résultats pour les performances)
    const filteredArmorsList = Object.keys(armorsFullData)
      .filter((armorId) => {
        const armor = armorsFullData[armorId];
        // Chercher dans toutes les langues disponibles
        return availableLanguages.some((lang) => {
          const armorData = armor[lang];
          if (!armorData) return false;
          // Chercher par nom d'ensemble, nom de pièce ou nom de skill
          const matchesSetName = (armorData.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesPieceName =
            armorData.pieces &&
            Object.values(armorData.pieces).some((piece) =>
              (piece?.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            );
          const matchesSkill =
            armorData.pieces &&
            Object.values(armorData.pieces).some((piece) =>
              piece?.skills?.some((skill) =>
                (skill?.name || "")
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
            );
          return matchesSetName || matchesPieceName || matchesSkill;
        });
      })
      .slice(0, 20); // Limiter à 20 armures

    setFilteredTalents(filteredTalentsList);
    setFilteredWeapons(filteredWeaponsList);
    setFilteredArmors(filteredArmorsList);

    // Filtrer les talismans (charms)
    const filteredCharmsList = Object.keys(charmsData)
      .filter((charmId) => {
        const charm = charmsData[charmId];
        const charmLang = charm[sourceLanguage] || charm.EN || {};
        if (!charmLang?.name) return false;
        const q = searchQuery.toLowerCase();
        const matchesName = Object.values(charm).some((cd) =>
          (cd?.name || "").toLowerCase().includes(q)
        );
        const matchesSkill = (charmLang.skills || []).some((s) =>
          (s.name || "").toLowerCase().includes(q)
        );
        return matchesName || matchesSkill || charmId.toLowerCase().includes(q);
      })
      .slice(0, 50);

    setFilteredCharms(filteredCharmsList);

    // Réinitialiser l'index sélectionné
    const totalResults =
      filteredTalentsList.length +
      filteredWeaponsList.length +
      filteredCharmsList.length +
      filteredArmorsList.length;
    setKeyboardSelectedIndex(totalResults > 0 ? 0 : -1);
  }, [searchQuery, talents, availableLanguages]);

  // Effet pour faire défiler l'élément sélectionné dans la vue
  useEffect(() => {
    if (
      keyboardSelectedIndex >= 0 &&
      resultsContainerRef.current &&
      resultItemsRef.current[keyboardSelectedIndex]
    ) {
      const container = resultsContainerRef.current;
      const selectedItem = resultItemsRef.current[keyboardSelectedIndex];

      const containerRect = container.getBoundingClientRect();
      const selectedItemRect = selectedItem.getBoundingClientRect();

      // Vérifier si l'élément est en dehors de la vue
      if (selectedItemRect.bottom > containerRect.bottom) {
        // Faire défiler vers le bas si l'élément est en dessous
        container.scrollTop += selectedItemRect.bottom - containerRect.bottom;
      } else if (selectedItemRect.top < containerRect.top) {
        // Faire défiler vers le haut si l'élément est au-dessus
        container.scrollTop -= containerRect.top - selectedItemRect.top;
      }
    }
  }, [keyboardSelectedIndex]);

  const detectLanguage = (query) => {
    if (query.length < 3) return; // Need minimum characters to detect

    // Count matches in each language
    const matchCounts = availableLanguages.reduce((acc, lang) => {
      acc[lang] = 0;
      return acc;
    }, {});

    // Check all talents for matches in each language
    Object.keys(talents).forEach((talentKey) => {
      availableLanguages.forEach((lang) => {
        const talentName = talents[talentKey][lang]?.name?.toLowerCase() || "";
        if (talentName.includes(query.toLowerCase())) {
          matchCounts[lang]++;
        }
      });
    });

    // Check all weapons for matches in each language
    Object.keys(weaponsFullData).forEach((weaponId) => {
      availableLanguages.forEach((lang) => {
        const weaponName =
          weaponsFullData[weaponId][lang]?.name?.toLowerCase() || "";
        if (weaponName.includes(query.toLowerCase())) {
          matchCounts[lang]++;
        }
      });
    });

    // Find language with most matches
    let bestMatch = sourceLanguage;
    let maxMatches = 0;

    Object.entries(matchCounts).forEach(([lang, count]) => {
      if (count > maxMatches) {
        maxMatches = count;
        bestMatch = lang;
      }
    });

    // Only change if we have a clear match and it's different from current
    if (maxMatches > 0 && bestMatch !== sourceLanguage) {
      setSourceLanguage(bestMatch);
      // Set target language to something different than source
      const otherLang =
        availableLanguages.find((lang) => lang !== bestMatch) || targetLanguage;
      setTargetLanguage(otherLang);
    }
  };

  const handleTalentSelect = (talentKey) => {
    setSelectedTalent(talentKey);
    setSelectedWeapon(null); // Désélectionner l'arme
    setSelectedArmor(null); // Désélectionner l'armure
    setSearchQuery("");
    setFilteredTalents([]);
    setFilteredWeapons([]);
    setFilteredArmors([]);
    setShowResults(true);
    setKeyboardSelectedIndex(-1);
    setExpandedSide(null); // Réinitialiser l'état d'expansion

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleWeaponSelect = (weaponId) => {
    setSelectedWeapon(weaponId);
    setSelectedTalent(null); // Désélectionner le talent
    setSelectedArmor(null); // Désélectionner l'armure
    setSearchQuery("");
    setFilteredTalents([]);
    setFilteredWeapons([]);
    setFilteredArmors([]);
    setShowResults(true);
    setKeyboardSelectedIndex(-1);
    setExpandedSide(null); // Réinitialiser l'état d'expansion

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleArmorSelect = (armorId) => {
    setSelectedArmor(armorId);
    setSelectedTalent(null); // Désélectionner le talent
    setSelectedWeapon(null); // Désélectionner l'arme
    setSearchQuery("");
    setFilteredTalents([]);
    setFilteredWeapons([]);
    setFilteredArmors([]);
    setShowResults(true);
    setKeyboardSelectedIndex(-1);
    setExpandedSide(null); // Réinitialiser l'état d'expansion

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCharmSelect = (charmId) => {
    setSelectedCharm(charmId);
    setSelectedTalent(null);
    setSelectedWeapon(null);
    setSelectedArmor(null);
    setSearchQuery("");
    setFilteredTalents([]);
    setFilteredWeapons([]);
    setFilteredArmors([]);
    setFilteredCharms([]);
    setShowResults(true);
    setKeyboardSelectedIndex(-1);
    setExpandedSide(null);

    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleLanguageSwap = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  // Calcul des résultats combinés pour la navigation clavier
  const totalResults =
    filteredTalents.length +
    filteredWeapons.length +
    filteredCharms.length +
    filteredArmors.length;

  // Gestionnaire pour les touches du clavier
  const handleKeyDown = (e) => {
    if (totalResults === 0) return;

    // Navigation avec les flèches
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardSelectedIndex((prev) =>
        prev < totalResults - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && keyboardSelectedIndex >= 0) {
      e.preventDefault();
      // Déterminer si c'est un talent, une arme ou une armure
      if (keyboardSelectedIndex < filteredTalents.length) {
        handleTalentSelect(filteredTalents[keyboardSelectedIndex]);
      } else if (
        keyboardSelectedIndex <
        filteredTalents.length + filteredWeapons.length
      ) {
        const weaponIndex = keyboardSelectedIndex - filteredTalents.length;
        handleWeaponSelect(filteredWeapons[weaponIndex]);
      } else if (
        keyboardSelectedIndex <
        filteredTalents.length + filteredWeapons.length + filteredCharms.length
      ) {
        const charmIndex =
          keyboardSelectedIndex -
          filteredTalents.length -
          filteredWeapons.length;
        handleCharmSelect(filteredCharms[charmIndex]);
      } else {
        const armorIndex =
          keyboardSelectedIndex -
          filteredTalents.length -
          filteredWeapons.length -
          filteredCharms.length;
        handleArmorSelect(filteredArmors[armorIndex]);
      }
    } else if (e.key === "Escape") {
      setFilteredTalents([]);
      setFilteredWeapons([]);
      setFilteredArmors([]);
      setFilteredCharms([]);
      setKeyboardSelectedIndex(-1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative mb-6">
        <div
          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
            darkMode ? "text-amber-100/70" : "text-amber-800/70"
          }`}
        >
          <SearchIcon />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={
            uiTranslations[sourceLanguage]?.searchPlaceholder ||
            "Search talents or weapons..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`pl-10 h-12 text-lg w-full rounded-xl px-4 py-2
            backdrop-blur-md shadow-lg focus:outline-none transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/30 text-amber-100 border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                : "bg-amber-100/30 text-amber-900 border border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
            }`}
          autoFocus
        />
        {searchQuery && (
          <div className="absolute flex items-center gap-2 transform -translate-y-1/2 right-3 top-1/2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              backdrop-blur-md border ${
                darkMode
                  ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                  : "bg-amber-100/30 text-amber-900 border-amber-200/50"
              }`}
            >
              {sourceLanguage} detected
              <SparklesIcon
                className={`ml-1 ${
                  darkMode ? "text-cyan-300" : "text-amber-500"
                }`}
              />
            </span>

            {totalResults > 0 && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                backdrop-blur-md border ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                    : "bg-amber-100/30 text-amber-900 border-amber-200/50"
                }`}
                title="Use keyboard arrows to navigate"
              >
                <KeyboardArrowIcon />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Résultats de recherche combinés */}
      {totalResults > 0 && (
        <div
          ref={resultsContainerRef}
          className={`mt-2 rounded-xl max-h-80 overflow-y-auto
            backdrop-blur-md shadow-lg border ${
              darkMode
                ? "bg-slate-800/30 border-slate-700/50"
                : "bg-amber-100/30 border-amber-200/50"
            }`}
        >
          {/* Section Talents */}
          {filteredTalents.length > 0 && (
            <>
              <div
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                  darkMode
                    ? "bg-slate-700/90 text-cyan-300 border-b border-slate-600/50"
                    : "bg-amber-200/90 text-amber-700 border-b border-amber-300/50"
                }`}
              >
                🎯 {uiTranslations[sourceLanguage]?.talentsSection || "Talents"}{" "}
                ({filteredTalents.length})
              </div>
              {filteredTalents.map((talentKey, index) => (
                <div
                  key={`talent-${talentKey}`}
                  ref={(el) => (resultItemsRef.current[index] = el)}
                  className={`p-3 cursor-pointer transition-all duration-300
                    border-b last:border-b-0 flex justify-between items-center ${
                      darkMode
                        ? `border-slate-700/50 ${
                            index === keyboardSelectedIndex
                              ? "bg-slate-700/70"
                              : "hover:bg-slate-700/50"
                          }`
                        : `border-amber-200/50 ${
                            index === keyboardSelectedIndex
                              ? "bg-amber-200/70"
                              : "hover:bg-amber-200/50"
                          }`
                    }`}
                  onClick={() => handleTalentSelect(talentKey)}
                  onMouseEnter={() => setKeyboardSelectedIndex(index)}
                >
                  <div>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-amber-100" : "text-amber-900"
                      }`}
                    >
                      {talents[talentKey][sourceLanguage]?.name || talentKey}
                    </span>
                    <span
                      className={`text-xs ml-2 ${
                        darkMode ? "text-amber-100/70" : "text-amber-800/70"
                      }`}
                    >
                      {talents[talentKey][sourceLanguage]?.category}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                      darkMode
                        ? "bg-slate-800/30 text-amber-100/90 border-slate-700/50"
                        : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                    }`}
                  >
                    {talentKey}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Section Armes */}
          {filteredWeapons.length > 0 && (
            <>
              <div
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                  darkMode
                    ? "bg-slate-700/90 text-cyan-300 border-b border-slate-600/50"
                    : "bg-amber-200/90 text-amber-700 border-b border-amber-300/50"
                }`}
              >
                ⚔️ {uiTranslations[sourceLanguage]?.weaponsSection || "Weapons"}{" "}
                ({filteredWeapons.length})
              </div>
              {filteredWeapons.map((weaponId, index) => {
                const globalIndex = filteredTalents.length + index;
                const weapon = weaponsFullData[weaponId]?.[sourceLanguage];
                return (
                  <div
                    key={`weapon-${weaponId}`}
                    ref={(el) => (resultItemsRef.current[globalIndex] = el)}
                    className={`p-3 cursor-pointer transition-all duration-300
                      border-b last:border-b-0 flex justify-between items-center ${
                        darkMode
                          ? `border-slate-700/50 ${
                              globalIndex === keyboardSelectedIndex
                                ? "bg-slate-700/70"
                                : "hover:bg-slate-700/50"
                            }`
                          : `border-amber-200/50 ${
                              globalIndex === keyboardSelectedIndex
                                ? "bg-amber-200/70"
                                : "hover:bg-amber-200/50"
                            }`
                      }`}
                    onClick={() => handleWeaponSelect(weaponId)}
                    onMouseEnter={() => setKeyboardSelectedIndex(globalIndex)}
                  >
                    <div>
                      <span
                        className={`font-medium ${
                          darkMode ? "text-amber-100" : "text-amber-900"
                        }`}
                      >
                        {weapon?.name || weaponId}
                      </span>
                      <span
                        className={`text-xs ml-2 ${
                          darkMode ? "text-amber-100/70" : "text-amber-800/70"
                        }`}
                      >
                        {weapon?.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {weapon?.skills?.length > 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                            darkMode
                              ? "bg-cyan-900/30 text-cyan-300 border-cyan-700/50"
                              : "bg-green-100/50 text-green-700 border-green-200/50"
                          }`}
                        >
                          {weapon.skills.length}{" "}
                          {uiTranslations[sourceLanguage]?.weaponSkills ||
                            "skills"}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100/90 border-slate-700/50"
                            : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                        }`}
                      >
                        ⚔️ {weapon?.attack || "?"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Section Charms/Talismans */}
          {filteredCharms.length > 0 && (
            <>
              <div
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                  darkMode
                    ? "bg-slate-700/90 text-cyan-300 border-b border-slate-600/50"
                    : "bg-amber-200/90 text-amber-700 border-b border-amber-300/50"
                }`}
              >
                🔮 Charms ({filteredCharms.length})
              </div>
              {filteredCharms.map((charmId, index) => {
                const globalIndex =
                  filteredTalents.length + filteredWeapons.length + index;
                const charm = charmsData[charmId]?.[sourceLanguage] || {};
                const skillsCount = (charm.skills || []).length;
                return (
                  <div
                    key={`charm-${charmId}`}
                    ref={(el) => (resultItemsRef.current[globalIndex] = el)}
                    className={`p-3 cursor-pointer transition-all duration-300
                        border-b last:border-b-0 flex justify-between items-center ${
                          darkMode
                            ? `border-slate-700/50 ${
                                globalIndex === keyboardSelectedIndex
                                  ? "bg-slate-700/70"
                                  : "hover:bg-slate-700/50"
                              }`
                            : `border-amber-200/50 ${
                                globalIndex === keyboardSelectedIndex
                                  ? "bg-amber-200/70"
                                  : "hover:bg-amber-200/50"
                              }`
                        }`}
                    onClick={() => handleCharmSelect(charmId)}
                    onMouseEnter={() => setKeyboardSelectedIndex(globalIndex)}
                  >
                    <div>
                      <span
                        className={`font-medium ${
                          darkMode ? "text-amber-100" : "text-amber-900"
                        }`}
                      >
                        {charm?.name || charmId}
                      </span>
                      <span
                        className={`text-xs ml-2 ${
                          darkMode ? "text-amber-100/70" : "text-amber-800/70"
                        }`}
                      >
                        {charm?.description || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {skillsCount > 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                            darkMode
                              ? "bg-cyan-900/30 text-cyan-300 border-cyan-700/50"
                              : "bg-green-100/50 text-green-700 border-green-200/50"
                          }`}
                        >
                          {skillsCount} skills
                        </span>
                      )}
                      {renderSlots(charm?.slots, darkMode)}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Section Armures */}
          {filteredArmors.length > 0 && (
            <>
              <div
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${
                  darkMode
                    ? "bg-slate-700/90 text-cyan-300 border-b border-slate-600/50"
                    : "bg-amber-200/90 text-amber-700 border-b border-amber-300/50"
                }`}
              >
                🛡️ Armors ({filteredArmors.length})
              </div>
              {filteredArmors.map((armorId, index) => {
                const globalIndex =
                  filteredTalents.length + filteredWeapons.length + index;
                const armor = armorsFullData[armorId]?.[sourceLanguage];
                const totalSkills = armor?.pieces
                  ? Object.values(armor.pieces).reduce(
                      (acc, piece) => acc + (piece?.skills?.length || 0),
                      0
                    )
                  : 0;
                return (
                  <div
                    key={`armor-${armorId}`}
                    ref={(el) => (resultItemsRef.current[globalIndex] = el)}
                    className={`p-3 cursor-pointer transition-all duration-300
                      border-b last:border-b-0 flex justify-between items-center ${
                        darkMode
                          ? `border-slate-700/50 ${
                              globalIndex === keyboardSelectedIndex
                                ? "bg-slate-700/70"
                                : "hover:bg-slate-700/50"
                            }`
                          : `border-amber-200/50 ${
                              globalIndex === keyboardSelectedIndex
                                ? "bg-amber-200/70"
                                : "hover:bg-amber-200/50"
                            }`
                      }`}
                    onClick={() => handleArmorSelect(armorId)}
                    onMouseEnter={() => setKeyboardSelectedIndex(globalIndex)}
                  >
                    <div>
                      <span
                        className={`font-medium ${
                          darkMode ? "text-amber-100" : "text-amber-900"
                        }`}
                      >
                        {armor?.name || armorId}
                      </span>
                      <span
                        className={`text-xs ml-2 ${
                          darkMode ? "text-amber-100/70" : "text-amber-800/70"
                        }`}
                      >
                        {armor?.rank === "LOW"
                          ? "Low Rank"
                          : armor?.rank === "HIGH"
                          ? "High Rank"
                          : armor?.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {totalSkills > 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                            darkMode
                              ? "bg-cyan-900/30 text-cyan-300 border-cyan-700/50"
                              : "bg-green-100/50 text-green-700 border-green-200/50"
                          }`}
                        >
                          {totalSkills} skills
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100/90 border-slate-700/50"
                            : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                        }`}
                      >
                        ⭐ {armor?.rarity || "?"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {showResults && selectedTalent && talents[selectedTalent] && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`source-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLanguageSwap}
                className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 shadow-md ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                <ArrowLeftRightIcon />
              </button>

              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`target-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                darkMode
                  ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                  : "bg-amber-100/30 text-amber-900 border-amber-200/50"
              }`}
            >
              {selectedTalent}
            </span>
          </div>

          {expandedSide ? (
            <ExpandedTalentCard
              talent={
                talents[selectedTalent][
                  expandedSide === "source" ? sourceLanguage : targetLanguage
                ]
              }
              talentKey={selectedTalent}
              language={
                expandedSide === "source" ? sourceLanguage : targetLanguage
              }
              otherLanguage={
                expandedSide === "source" ? targetLanguage : sourceLanguage
              }
              darkMode={darkMode}
              onClose={() => setExpandedSide(null)}
              onSwitchLanguage={() =>
                setExpandedSide(expandedSide === "source" ? "target" : "source")
              }
              availableLanguages={availableLanguages}
              specs={skillSpecsData[selectedTalent]}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <TalentCard
                talent={talents[selectedTalent][sourceLanguage]}
                talentKey={selectedTalent}
                language={sourceLanguage}
                darkMode={darkMode}
                onClick={() => setExpandedSide("source")}
                fallbackLevels={talents[selectedTalent]?.EN?.levels}
              />
              <TalentCard
                talent={talents[selectedTalent][targetLanguage]}
                talentKey={selectedTalent}
                language={targetLanguage}
                darkMode={darkMode}
                onClick={() => setExpandedSide("target")}
                fallbackLevels={talents[selectedTalent]?.EN?.levels}
              />
            </div>
          )}
        </div>
      )}

      {/* Affichage de l'arme sélectionnée */}
      {showResults && selectedWeapon && weaponsFullData[selectedWeapon] && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`source-weapon-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLanguageSwap}
                className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 shadow-md ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                <ArrowLeftRightIcon />
              </button>

              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`target-weapon-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                darkMode
                  ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/50"
                  : "bg-orange-100/50 text-orange-700 border-orange-200/50"
              }`}
            >
              ⚔️ {weaponsFullData[selectedWeapon][sourceLanguage]?.type}
            </span>
          </div>

          {expandedSide ? (
            <ExpandedWeaponCard
              weapon={
                weaponsFullData[selectedWeapon][
                  expandedSide === "source" ? sourceLanguage : targetLanguage
                ]
              }
              language={
                expandedSide === "source" ? sourceLanguage : targetLanguage
              }
              otherLanguage={
                expandedSide === "source" ? targetLanguage : sourceLanguage
              }
              darkMode={darkMode}
              onClose={() => setExpandedSide(null)}
              onSwitchLanguage={() =>
                setExpandedSide(expandedSide === "source" ? "target" : "source")
              }
              talents={talents}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <WeaponCard
                weapon={weaponsFullData[selectedWeapon][sourceLanguage]}
                language={sourceLanguage}
                darkMode={darkMode}
                onClick={() => setExpandedSide("source")}
              />
              <WeaponCard
                weapon={weaponsFullData[selectedWeapon][targetLanguage]}
                language={targetLanguage}
                darkMode={darkMode}
                onClick={() => setExpandedSide("target")}
              />
            </div>
          )}
        </div>
      )}

      {/* Affichage de l'armure sélectionnée */}
      {showResults && selectedArmor && armorsFullData[selectedArmor] && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`source-armor-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLanguageSwap}
                className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 shadow-md ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                <ArrowLeftRightIcon />
              </button>

              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`target-armor-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                darkMode
                  ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/50"
                  : "bg-orange-100/50 text-orange-700 border-orange-200/50"
              }`}
            >
              🛡️{" "}
              {armorsFullData[selectedArmor][sourceLanguage]?.rank === "LOW"
                ? "Low Rank"
                : "High Rank"}{" "}
              • ⭐{armorsFullData[selectedArmor][sourceLanguage]?.rarity}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ArmorSetCard
              armorSet={armorsFullData[selectedArmor][sourceLanguage]}
              language={sourceLanguage}
              darkMode={darkMode}
              talents={talents}
            />
            <ArmorSetCard
              armorSet={armorsFullData[selectedArmor][targetLanguage]}
              language={targetLanguage}
              darkMode={darkMode}
              talents={talents}
            />
          </div>
        </div>
      )}

      {/* Affichage du talisman sélectionné */}
      {showResults && selectedCharm && charmsData[selectedCharm] && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`source-charm-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLanguageSwap}
                className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 shadow-md ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                <ArrowLeftRightIcon />
              </button>

              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`w-[100px] rounded-xl px-3 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={`target-charm-${lang}`} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                darkMode
                  ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/50"
                  : "bg-orange-100/50 text-orange-700 border-orange-200/50"
              }`}
            >
              🔮 {selectedCharm}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/50"
                  : "bg-amber-100/30 border-amber-200/50 hover:bg-amber-200/50"
              }`}
            >
              <h4
                className={`font-bold mb-2 ${
                  darkMode ? "text-amber-100" : "text-amber-900"
                }`}
              >
                {charmsData[selectedCharm][sourceLanguage]?.name ||
                  selectedCharm}
              </h4>
              <p
                className={`text-sm mb-3 ${
                  darkMode ? "text-amber-100/70" : "text-amber-800/70"
                }`}
              >
                {charmsData[selectedCharm][sourceLanguage]?.description}
              </p>
              {/* Skills du talisman */}
              {(charmsData[selectedCharm][sourceLanguage]?.skills || charmsData[selectedCharm].EN?.skills || []).length > 0 ? (
                <div className="space-y-3">
                  {(charmsData[selectedCharm][sourceLanguage]?.skills || charmsData[selectedCharm].EN?.skills || []).map((s, i) => {
                    const talentInfo = talents[s.slug];
                    const talentLangData = talentInfo?.[sourceLanguage] || talentInfo?.EN;
                    const skillName = talentLangData?.name || s.name || s.slug;
                    const levelKey = `Lv${s.level}`;
                    const levelDescription = talentLangData?.levels?.[levelKey];
                    
                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-3 ${
                          darkMode ? "bg-slate-700/40" : "bg-amber-100/50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-medium ${
                            darkMode ? "text-cyan-400" : "text-blue-600"
                          }`}>
                            {skillName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              darkMode
                                ? "bg-cyan-900/50 text-cyan-300 border border-cyan-800"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            }`}
                          >
                            Lv.{s.level}
                          </span>
                        </div>
                        {talentLangData?.description && (
                          <p className={`text-xs mb-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {talentLangData.description}
                          </p>
                        )}
                        {levelDescription && (
                          <p className={`text-xs ${
                            darkMode ? "text-amber-300" : "text-amber-700"
                          }`}>
                            {levelDescription}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-sm italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Aucun talent associé
                </p>
              )}
            </div>

            <div
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/50"
                  : "bg-amber-100/30 border-amber-200/50 hover:bg-amber-200/50"
              }`}
            >
              <h4
                className={`font-bold mb-2 ${
                  darkMode ? "text-amber-100" : "text-amber-900"
                }`}
              >
                {charmsData[selectedCharm][targetLanguage]?.name ||
                  selectedCharm}
              </h4>
              <p
                className={`text-sm mb-3 ${
                  darkMode ? "text-amber-100/70" : "text-amber-800/70"
                }`}
              >
                {charmsData[selectedCharm][targetLanguage]?.description}
              </p>
              {/* Skills du talisman */}
              {(charmsData[selectedCharm][targetLanguage]?.skills || charmsData[selectedCharm].EN?.skills || []).length > 0 ? (
                <div className="space-y-3">
                  {(charmsData[selectedCharm][targetLanguage]?.skills || charmsData[selectedCharm].EN?.skills || []).map((s, i) => {
                    const talentInfo = talents[s.slug];
                    const talentLangData = talentInfo?.[targetLanguage] || talentInfo?.EN;
                    const skillName = talentLangData?.name || s.name || s.slug;
                    const levelKey = `Lv${s.level}`;
                    const levelDescription = talentLangData?.levels?.[levelKey];
                    
                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-3 ${
                          darkMode ? "bg-slate-700/40" : "bg-amber-100/50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-medium ${
                            darkMode ? "text-cyan-400" : "text-blue-600"
                          }`}>
                            {skillName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              darkMode
                                ? "bg-cyan-900/50 text-cyan-300 border border-cyan-800"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            }`}
                          >
                            Lv.{s.level}
                          </span>
                        </div>
                        {talentLangData?.description && (
                          <p className={`text-xs mb-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {talentLangData.description}
                          </p>
                        )}
                        {levelDescription && (
                          <p className={`text-xs ${
                            darkMode ? "text-amber-300" : "text-amber-700"
                          }`}>
                            {levelDescription}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-sm italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  No associated talent
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorPage({ talents, darkMode, updateTalents }) {
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [editMode, setEditMode] = useState("list"); // "list", "edit", "add", "addLanguage"
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [referenceLanguage, setReferenceLanguage] = useState("EN");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [newLanguageCode, setNewLanguageCode] = useState("");
  const [editedTalent, setEditedTalent] = useState(null);
  const [newTalentKey, setNewTalentKey] = useState("");
  // Dans la fonction EditorPage, ajouter un nouvel état pour le filtre des talents incomplets
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  const searchInputRef = useRef(null);

  // Mettre le focus sur l'input de recherche au chargement de la page
  useEffect(() => {
    if (searchInputRef.current && editMode === "list") {
      searchInputRef.current.focus();
    }
  }, [editMode]);

  useEffect(() => {
    // Determine available languages from the first talent
    if (Object.keys(talents).length > 0) {
      const firstTalent = Object.keys(talents)[0];
      setAvailableLanguages(Object.keys(talents[firstTalent]));
    }
  }, [talents]);

  // Modifier la fonction de filtrage des talents pour prendre en compte le nouveau filtre
  useEffect(() => {
    // Filter talents based on search query and incomplete filter
    let filtered = Object.keys(talents);

    // Filter by search query if provided
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((talentKey) => {
        const talent = talents[talentKey];
        // Search in all available languages
        return (
          availableLanguages.some((lang) =>
            talent[lang]?.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) || talentKey.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply incomplete filter if activated
    if (showIncompleteOnly) {
      filtered = filtered.filter((talentKey) => {
        // Get completed languages for this talent
        const completedLangs = getCompletedLanguages(talents[talentKey]);
        // Filter talents that don't have all languages completed
        return completedLangs.length < availableLanguages.length;
      });
    }

    setFilteredTalents(filtered);
  }, [searchQuery, talents, availableLanguages, showIncompleteOnly]);

  // Ajouter une fonction pour basculer l'affichage des talents incomplets
  const toggleIncompleteFilter = () => {
    setShowIncompleteOnly(!showIncompleteOnly);
  };

  // Initialiser la liste filtrée avec tous les talents au chargement
  useEffect(() => {
    setFilteredTalents(Object.keys(talents));
  }, [talents]);

  const handleEditTalent = (talentKey) => {
    setSelectedTalent(talentKey);
    setEditedTalent(JSON.parse(JSON.stringify(talents[talentKey]))); // Deep copy

    // Définir la langue de référence comme la première langue disponible (généralement EN)
    if (availableLanguages.length > 0) {
      setReferenceLanguage(availableLanguages[0]);

      // Définir la langue d'édition comme la deuxième langue disponible ou la première si une seule est disponible
      if (availableLanguages.length > 1) {
        setCurrentLanguage(availableLanguages[1]);
      } else {
        setCurrentLanguage(availableLanguages[0]);
      }
    }

    setEditMode("edit");
  };

  const handleAddTalent = () => {
    setNewTalentKey("");
    // Créer un talent avec toutes les langues disponibles
    const newTalent = {};
    availableLanguages.forEach((lang) => {
      newTalent[lang] = {
        name: "",
        category: "",
        description: "",
        levels: {},
      };
    });

    setEditedTalent(newTalent);

    // Définir la langue de référence comme la première langue disponible (généralement EN)
    if (availableLanguages.length > 0) {
      setReferenceLanguage(availableLanguages[0]);

      // Définir la langue d'édition comme la deuxième langue disponible ou la première si une seule est disponible
      if (availableLanguages.length > 1) {
        setCurrentLanguage(availableLanguages[1]);
      } else {
        setCurrentLanguage(availableLanguages[0]);
      }
    }

    setEditMode("add");
  };

  const handleAddLanguage = () => {
    setNewLanguageCode("");
    setEditMode("addLanguage");
  };

  const handleDeleteTalent = (talentKey) => {
    if (confirm(`Are you sure you want to delete the talent "${talentKey}"?`)) {
      const newTalents = { ...talents };
      delete newTalents[talentKey];
      updateTalents(newTalents);
    }
  };

  const handleSaveTalent = () => {
    if (editMode === "edit") {
      const newTalents = { ...talents };
      newTalents[selectedTalent] = editedTalent;
      updateTalents(newTalents);
      setEditMode("list");
    } else if (editMode === "add") {
      if (!newTalentKey.trim()) {
        alert("Please enter a talent key");
        return;
      }

      if (talents[newTalentKey]) {
        alert("This talent key already exists");
        return;
      }

      const newTalents = { ...talents };
      newTalents[newTalentKey] = editedTalent;
      updateTalents(newTalents);
      setEditMode("list");
    } else if (editMode === "addLanguage") {
      if (!newLanguageCode.trim()) {
        alert("Please enter a language code");
        return;
      }

      if (availableLanguages.includes(newLanguageCode)) {
        alert("This language code already exists");
        return;
      }

      // Add the new language to all talents
      const newTalents = { ...talents };
      Object.keys(newTalents).forEach((talentKey) => {
        newTalents[talentKey][newLanguageCode] = {
          name: "",
          category: "",
          description: "",
          levels: {},
        };
      });

      updateTalents(newTalents);
      setEditMode("list");
    }
  };

  const handleAddLevel = () => {
    const newLevel = prompt("Enter level number:");
    if (newLevel && !isNaN(Number.parseInt(newLevel))) {
      const updatedTalent = { ...editedTalent };
      if (!updatedTalent[currentLanguage].levels) {
        updatedTalent[currentLanguage].levels = {};
      }
      updatedTalent[currentLanguage].levels[newLevel] = "";
      setEditedTalent(updatedTalent);
    }
  };

  const handleDeleteLevel = (level) => {
    const updatedTalent = { ...editedTalent };
    delete updatedTalent[currentLanguage].levels[level];
    setEditedTalent(updatedTalent);
  };

  const handleCancel = () => {
    setEditMode("list");
  };

  // Fonction pour copier les niveaux de la langue de référence vers la langue actuelle
  const copyLevelsFromReference = () => {
    if (referenceLanguage === currentLanguage) return;

    if (
      confirm(`Copy levels from ${referenceLanguage} to ${currentLanguage}?`)
    ) {
      const updatedTalent = { ...editedTalent };
      updatedTalent[currentLanguage].levels = {
        ...editedTalent[referenceLanguage].levels,
      };
      // Réinitialiser les descriptions pour que l'utilisateur puisse les traduire
      Object.keys(updatedTalent[currentLanguage].levels).forEach((level) => {
        updatedTalent[currentLanguage].levels[level] = "";
      });
      setEditedTalent(updatedTalent);
    }
  };

  // Dans la fonction EditorPage, ajoutez cette fonction pour vérifier si une langue est complète
  // Ajoutez cette fonction juste avant le return de EditorPage

  // Fonction pour vérifier si une langue est complète pour un talent donné
  const isLanguageComplete = (talent, lang) => {
    if (!talent[lang]) return false;

    // Vérifier si le nom est présent et non vide
    if (!talent[lang].name || talent[lang].name.trim() === "") return false;

    // Vérifier si la description est présente et non vide
    if (!talent[lang].description || talent[lang].description.trim() === "")
      return false;

    // Vérifier si au moins un niveau est défini avec une description non vide
    if (!talent[lang].levels || Object.keys(talent[lang].levels).length === 0)
      return false;

    // Vérifier que tous les niveaux ont une description non vide
    const hasEmptyLevelDescription = Object.values(talent[lang].levels).some(
      (desc) => !desc || desc.trim() === ""
    );

    return !hasEmptyLevelDescription;
  };

  // Fonction pour obtenir les langues complétées pour un talent
  const getCompletedLanguages = (talent) => {
    return availableLanguages.filter((lang) =>
      isLanguageComplete(talent, lang)
    );
  };

  // Maintenant, modifiez l'en-tête de la table dans le return pour ajouter la nouvelle colonne

  return (
    <div className="max-w-6xl mx-auto">
      {editMode === "list" && (
        <>
          <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row">
            <div className="relative flex-grow">
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  darkMode ? "text-amber-100/70" : "text-amber-800/70"
                }`}
              >
                <SearchIcon />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search talents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 h-12 w-full rounded-xl px-4 py-2
                  backdrop-blur-md shadow-lg focus:outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filtre pour les talents incomplets */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="filter-incomplete"
                    checked={showIncompleteOnly}
                    onChange={toggleIncompleteFilter}
                    className={`h-4 w-4 rounded focus:ring-0 ${
                      darkMode
                        ? "bg-slate-700 border-slate-500 text-cyan-500 focus:ring-cyan-500/50"
                        : "bg-amber-100 border-amber-300 text-amber-500 focus:ring-amber-500/50"
                    }`}
                  />
                  <label
                    htmlFor="filter-incomplete"
                    className={`ml-2 text-sm font-medium ${
                      darkMode ? "text-amber-100" : "text-amber-900"
                    }`}
                  >
                    Show incomplete talents
                  </label>
                </div>
              </div>

              <button
                onClick={handleAddTalent}
                className={`px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 shadow-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/30"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                <PlusIcon />
                <span>Add Talent</span>
              </button>

              <button
                onClick={handleAddLanguage}
                className={`px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 shadow-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/30"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                <PlusIcon />
                <span>Add Language</span>
              </button>
            </div>
          </div>
          <div
            className={`rounded-xl overflow-hidden backdrop-blur-md shadow-lg border ${
              darkMode
                ? "bg-slate-800/30 border-slate-700/50"
                : "bg-amber-100/30 border-amber-200/50"
            }`}
          >
            <div
              className={`p-4 border-b ${
                darkMode
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-amber-200/30 border-amber-200/50"
              }`}
            >
              <div className="grid grid-cols-12 gap-4">
                <div
                  className={`col-span-2 font-semibold ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  Talent Key
                </div>
                <div
                  className={`col-span-2 font-semibold ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  Name (EN)
                </div>
                <div
                  className={`col-span-2 font-semibold ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  Category
                </div>
                <div
                  className={`col-span-3 font-semibold ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  Completed Languages
                </div>
                <div
                  className={`col-span-3 font-semibold ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  Actions
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {filteredTalents.length === 0 ? (
                <div
                  className={`p-4 text-center ${
                    darkMode ? "text-amber-100/70" : "text-amber-800/70"
                  }`}
                >
                  No talents found
                </div>
              ) : (
                filteredTalents.map((talentKey) => (
                  <div
                    key={talentKey}
                    className={`p-4 border-b last:border-b-0 ${
                      darkMode
                        ? "border-slate-700/50 hover:bg-slate-700/30"
                        : "border-amber-200/50 hover:bg-amber-200/30"
                    }`}
                  >
                    <div className="grid items-center grid-cols-12 gap-4">
                      <div className="col-span-2 truncate">
                        <span
                          className={`font-medium ${
                            darkMode ? "text-amber-100" : "text-amber-900"
                          }`}
                        >
                          {talentKey}
                        </span>
                      </div>
                      <div
                        className={`col-span-2 truncate ${
                          darkMode ? "text-amber-100" : "text-amber-900"
                        }`}
                      >
                        {talents[talentKey].EN?.name || "—"}
                      </div>
                      <div
                        className={`col-span-2 truncate ${
                          darkMode ? "text-amber-100" : "text-amber-900"
                        }`}
                      >
                        {talents[talentKey].EN?.category || "—"}
                      </div>
                      <div className="flex flex-wrap col-span-3 gap-1">
                        {getCompletedLanguages(talents[talentKey]).map(
                          (lang) => (
                            <span
                              key={`${talentKey}-${lang}`}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                darkMode
                                  ? "bg-cyan-900/30 text-cyan-300 border border-cyan-800/30"
                                  : "bg-amber-200/70 text-amber-800 border border-amber-300/50"
                              }`}
                            >
                              {lang}
                            </span>
                          )
                        )}
                        {getCompletedLanguages(talents[talentKey]).length ===
                          0 && (
                          <span
                            className={`text-xs italic ${
                              darkMode
                                ? "text-amber-100/50"
                                : "text-amber-800/50"
                            }`}
                          >
                            No completed languages
                          </span>
                        )}
                      </div>
                      <div className="flex col-span-3 gap-2">
                        <button
                          onClick={() => handleEditTalent(talentKey)}
                          className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                            darkMode
                              ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                              : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                          }`}
                          title="Edit talent"
                        >
                          <EditIcon />
                        </button>

                        <button
                          onClick={() => handleDeleteTalent(talentKey)}
                          className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                            darkMode
                              ? "bg-red-900/30 text-red-100 hover:bg-red-800/50 border-red-900/50"
                              : "bg-red-100/30 text-red-900 hover:bg-red-200/50 border-red-200/50"
                          }`}
                          title="Delete talent"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {(editMode === "edit" || editMode === "add") && (
        <div
          className={`rounded-xl overflow-hidden backdrop-blur-md shadow-lg border ${
            darkMode
              ? "bg-slate-800/30 border-slate-700/50"
              : "bg-amber-100/30 border-amber-200/50"
          }`}
        >
          <div
            className={`p-4 border-b ${
              darkMode
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-amber-200/30 border-amber-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editMode === "edit"
                  ? `Edit Talent: ${selectedTalent}`
                  : "Add New Talent"}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className={`px-3 py-1 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                      : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveTalent}
                  className={`px-3 py-1 rounded-xl backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
                    darkMode
                      ? "bg-cyan-900/30 text-cyan-100 hover:bg-cyan-800/50 border-cyan-900/50"
                      : "bg-amber-500/30 text-amber-900 hover:bg-amber-500/50 border-amber-500/50"
                  }`}
                >
                  <SaveIcon />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {editMode === "add" && (
              <div className="mb-6">
                <label
                  className={`block mb-2 font-medium ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  Talent Key (unique identifier)
                </label>
                <input
                  type="text"
                  value={newTalentKey}
                  onChange={(e) => setNewTalentKey(e.target.value)}
                  placeholder="e.g. adrenaline_rush"
                  className={`w-full rounded-xl px-4 py-2
                    backdrop-blur-md shadow-md focus:outline-none border ${
                      darkMode
                        ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                        : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                    }`}
                  autoFocus
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Colonne de gauche - Prévisualisation */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label
                    className={`font-medium ${
                      darkMode ? "text-amber-100" : "text-amber-900"
                    }`}
                  >
                    Reference Language
                  </label>
                  <select
                    value={referenceLanguage}
                    onChange={(e) => setReferenceLanguage(e.target.value)}
                    className={`w-[100px] rounded-xl px-3 py-2
                      backdrop-blur-md shadow-md focus:outline-none border ${
                        darkMode
                          ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                          : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                      }`}
                  >
                    {Object.keys(editedTalent || {}).map((lang) => (
                      <option key={`ref-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className={`p-4 rounded-xl backdrop-blur-md border ${
                    darkMode
                      ? "bg-slate-800/20 border-slate-700/30"
                      : "bg-amber-100/20 border-amber-200/30"
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                      backdrop-blur-md border mr-2 ${
                        darkMode
                          ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                          : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                      }`}
                    >
                      {referenceLanguage}
                    </span>
                    <h3
                      className={`text-xl font-bold ${
                        darkMode ? "text-amber-100" : "text-amber-900"
                      }`}
                    >
                      {editedTalent?.[referenceLanguage]?.name || "New Talent"}
                    </h3>
                  </div>

                  <div
                    className={`text-sm font-medium mb-4 ${
                      darkMode ? "text-amber-100/70" : "text-amber-800/70"
                    }`}
                  >
                    {editedTalent?.[referenceLanguage]?.category || "Category"}
                  </div>

                  <p
                    className={`mb-6 text-sm leading-relaxed ${
                      darkMode ? "text-amber-100/90" : "text-amber-900/90"
                    }`}
                  >
                    {editedTalent?.[referenceLanguage]?.description ||
                      "No description available"}
                  </p>

                  <div>
                    <h3
                      className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
                        darkMode ? "text-amber-100/70" : "text-amber-800/70"
                      }`}
                    >
                      Levels
                    </h3>
                    <div
                      className={`space-y-2 rounded-xl backdrop-blur-md p-3 border ${
                        darkMode
                          ? "bg-slate-800/20 border-slate-700/30"
                          : "bg-amber-100/20 border-amber-200/30"
                      }`}
                    >
                      {Object.keys(
                        editedTalent?.[referenceLanguage]?.levels || {}
                      ).length === 0 ? (
                        <div
                          className={`text-center py-2 ${
                            darkMode ? "text-amber-100/70" : "text-amber-800/70"
                          }`}
                        >
                          No levels added yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(
                            editedTalent?.[referenceLanguage]?.levels || {}
                          ).map(([level, description]) => (
                            <div
                              key={`ref-${level}`}
                              className="flex gap-2 text-sm"
                            >
                              <span
                                className={`px-2 py-0.5 rounded-lg
                                shrink-0 self-start mt-0.5 border ${
                                  darkMode
                                    ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/30"
                                    : "bg-amber-200/70 text-amber-800 border-amber-300/50"
                                }`}
                              >
                                {level}
                              </span>
                              <span
                                className={
                                  darkMode
                                    ? "text-amber-100/90"
                                    : "text-amber-900/90"
                                }
                              >
                                {description || "No description"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne de droite - Édition */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <label
                      className={`font-medium ${
                        darkMode ? "text-amber-100" : "text-amber-900"
                      }`}
                    >
                      Edit Language
                    </label>

                    {referenceLanguage !== currentLanguage && (
                      <button
                        onClick={copyLevelsFromReference}
                        className={`p-1 rounded-full backdrop-blur-md border transition-all duration-300 text-xs flex items-center gap-1 ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                            : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                        }`}
                        title={`Copy levels structure from ${referenceLanguage}`}
                      >
                        <span>Copy levels</span>
                      </button>
                    )}
                  </div>

                  <select
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    className={`w-[100px] rounded-xl px-3 py-2
                      backdrop-blur-md shadow-md focus:outline-none border ${
                        darkMode
                          ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                          : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                      }`}
                  >
                    {Object.keys(editedTalent || {}).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block mb-2 font-medium ${
                        darkMode ? "text-amber-100" : "text-amber-900"
                      }`}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={editedTalent?.[currentLanguage]?.name || ""}
                      onChange={(e) => {
                        const updated = { ...editedTalent };
                        updated[currentLanguage].name = e.target.value;
                        setEditedTalent(updated);
                      }}
                      placeholder="Talent name"
                      className={`w-full rounded-xl px-4 py-2
                        backdrop-blur-md shadow-md focus:outline-none border ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                            : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                        }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block mb-2 font-medium ${
                        darkMode ? "text-amber-100" : "text-amber-900"
                      }`}
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      value={editedTalent?.[currentLanguage]?.category || ""}
                      onChange={(e) => {
                        const updated = { ...editedTalent };
                        updated[currentLanguage].category = e.target.value;
                        setEditedTalent(updated);
                      }}
                      placeholder="Talent category"
                      className={`w-full rounded-xl px-4 py-2
                        backdrop-blur-md shadow-md focus:outline-none border ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                            : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                        }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block mb-2 font-medium ${
                        darkMode ? "text-amber-100" : "text-amber-900"
                      }`}
                    >
                      Description
                    </label>
                    <textarea
                      value={editedTalent?.[currentLanguage]?.description || ""}
                      onChange={(e) => {
                        const updated = { ...editedTalent };
                        updated[currentLanguage].description = e.target.value;
                        setEditedTalent(updated);
                      }}
                      placeholder="Talent description"
                      rows={3}
                      className={`w-full rounded-xl px-4 py-2
                        backdrop-blur-md shadow-md focus:outline-none border ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                            : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                        }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`font-medium ${
                          darkMode ? "text-amber-100" : "text-amber-900"
                        }`}
                      >
                        Levels
                      </label>
                      <button
                        onClick={handleAddLevel}
                        className={`p-1 rounded-full backdrop-blur-md border transition-all duration-300 ${
                          darkMode
                            ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                            : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                        }`}
                        title="Add level"
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    <div
                      className={`rounded-xl backdrop-blur-md p-3 border ${
                        darkMode
                          ? "bg-slate-800/20 border-slate-700/30"
                          : "bg-amber-100/20 border-amber-200/30"
                      }`}
                    >
                      {Object.keys(
                        editedTalent?.[currentLanguage]?.levels || {}
                      ).length === 0 ? (
                        <div
                          className={`text-center py-2 ${
                            darkMode ? "text-amber-100/70" : "text-amber-800/70"
                          }`}
                        >
                          No levels added yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(
                            editedTalent?.[currentLanguage]?.levels || {}
                          ).map(([level, description]) => (
                            <div key={level} className="flex gap-2">
                              <div
                                className={`px-2 py-1 rounded-lg shrink-0 self-start ${
                                  darkMode
                                    ? "bg-cyan-900/30 text-cyan-300 border border-cyan-800/30"
                                    : "bg-amber-200/70 text-amber-800 border border-amber-300/50"
                                }`}
                              >
                                {level}
                              </div>
                              <textarea
                                value={description}
                                onChange={(e) => {
                                  const updated = { ...editedTalent };
                                  updated[currentLanguage].levels[level] =
                                    e.target.value;
                                  setEditedTalent(updated);
                                }}
                                placeholder={`Description for level ${level}`}
                                rows={2}
                                className={`flex-grow rounded-lg px-3 py-1
                                  backdrop-blur-md focus:outline-none border ${
                                    darkMode
                                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                                  }`}
                              />
                              <button
                                onClick={() => handleDeleteLevel(level)}
                                className={`p-1 rounded-full backdrop-blur-md border transition-all duration-300 self-start ${
                                  darkMode
                                    ? "bg-red-900/30 text-red-100 hover:bg-red-800/50 border-red-900/50"
                                    : "bg-red-100/30 text-red-900 hover:bg-red-200/50 border-red-200/50"
                                }`}
                                title="Delete level"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editMode === "addLanguage" && (
        <div
          className={`rounded-xl overflow-hidden backdrop-blur-md shadow-lg border ${
            darkMode
              ? "bg-slate-800/30 border-slate-700/50"
              : "bg-amber-100/30 border-amber-200/50"
          }`}
        >
          <div
            className={`p-4 border-b ${
              darkMode
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-amber-200/30 border-amber-200/50"
            }`}
          >
            <h2 className="text-xl font-bold">Add New Language</h2>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label
                className={`block mb-2 font-medium ${
                  darkMode ? "text-amber-100" : "text-amber-900"
                }`}
              >
                Language Code
              </label>
              <input
                type="text"
                value={newLanguageCode}
                onChange={(e) =>
                  setNewLanguageCode(e.target.value.toUpperCase())
                }
                placeholder="e.g. DE, ES, IT"
                className={`w-full rounded-xl px-4 py-2
                  backdrop-blur-md shadow-md focus:outline-none border ${
                    darkMode
                      ? "bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50"
                      : "bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50"
                  }`}
                autoFocus
              />
              <p
                className={`mt-2 text-sm ${
                  darkMode ? "text-amber-100/70" : "text-amber-800/70"
                }`}
              >
                Use a 2-letter ISO language code (e.g., EN for English, FR for
                French)
              </p>
            </div>

            <div className="mb-6">
              <h3
                className={`mb-2 font-medium ${
                  darkMode ? "text-amber-100" : "text-amber-900"
                }`}
              >
                Current Languages:
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => (
                  <span
                    key={lang}
                    className={`px-2 py-1 rounded-lg ${
                      darkMode
                        ? "bg-slate-800/50 text-amber-100 border border-slate-700/50"
                        : "bg-amber-100/50 text-amber-900 border border-amber-200/50"
                    }`}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                    : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTalent}
                className={`px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
                  darkMode
                    ? "bg-cyan-900/30 text-cyan-100 hover:bg-cyan-800/50 border-cyan-900/50"
                    : "bg-amber-500/30 text-amber-900 hover:bg-amber-500/50 border-amber-500/50"
                }`}
              >
                <SaveIcon />
                <span>Add Language</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher une carte d'ensemble d'armure
function ArmorSetCard({ armorSet, language, darkMode, talents }) {
  if (!armorSet) {
    return (
      <div
        className={`border-dashed rounded-xl p-4
        backdrop-blur-md shadow-lg ${
          darkMode
            ? "bg-slate-800/20 border border-slate-700/50 text-amber-100/70"
            : "bg-amber-100/20 border border-amber-200/50 text-amber-800/70"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium">
            Armor not available in {language}
          </h3>
        </div>
      </div>
    );
  }

  // Calculer les stats totales de l'ensemble
  const totalDefense = armorSet.pieces
    ? Object.values(armorSet.pieces).reduce(
        (acc, piece) => acc + (piece?.defense || 0),
        0
      )
    : 0;

  const totalResistances = armorSet.pieces
    ? Object.values(armorSet.pieces).reduce((acc, piece) => {
        if (piece?.resistances) {
          Object.entries(piece.resistances).forEach(([key, value]) => {
            acc[key] = (acc[key] || 0) + value;
          });
        }
        return acc;
      }, {})
    : {};

  // Collecter tous les skills uniques de l'ensemble
  const allSkills = {};
  if (armorSet.pieces) {
    Object.values(armorSet.pieces).forEach((piece) => {
      if (piece?.skills) {
        piece.skills.forEach((skill) => {
          if (allSkills[skill.name]) {
            allSkills[skill.name].level += skill.level;
          } else {
            allSkills[skill.name] = { ...skill };
          }
        });
      }
    });
  }

  const pieceOrder = ["head", "chest", "arms", "waist", "legs"];
  const pieceIcons = {
    head: "🎭",
    chest: "👕",
    arms: "🧤",
    waist: "🩲",
    legs: "👖",
  };

  // Couleurs par résistance élémentaire
  const getResistanceColor = (value) => {
    if (value > 0) return darkMode ? "text-green-400" : "text-green-600";
    if (value < 0) return darkMode ? "text-red-400" : "text-red-600";
    return darkMode ? "text-amber-100/50" : "text-amber-800/50";
  };

  const resistanceIcons = {
    fire: "🔥",
    water: "💧",
    thunder: "⚡",
    ice: "❄️",
    dragon: "🐉",
  };

  return (
    <div
      className={`group rounded-xl overflow-hidden
      backdrop-blur-md border
      transition-all duration-500 ${
        darkMode
          ? "bg-slate-800/30 border-slate-700/50"
          : "bg-amber-100/30 border-amber-200/50"
      }`}
    >
      {/* En-tête de l'ensemble */}
      <div
        className={`border-b p-4 ${
          darkMode
            ? "bg-gradient-to-r from-slate-800/50 to-cyan-900/30 border-slate-700/50"
            : "bg-gradient-to-r from-amber-100/50 to-orange-100/30 border-amber-200/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                    : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                }`}
              >
                {language}
              </span>
              {armorSet.rarity && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                  backdrop-blur-md border ${
                    darkMode
                      ? "bg-purple-900/30 text-purple-300 border-purple-800/50"
                      : "bg-purple-100/50 text-purple-700 border-purple-200/50"
                  }`}
                >
                  ★{armorSet.rarity}
                </span>
              )}
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border ${
                  armorSet.rank === "LOW"
                    ? darkMode
                      ? "bg-green-900/30 text-green-300 border-green-800/50"
                      : "bg-green-100/50 text-green-700 border-green-200/50"
                    : darkMode
                    ? "bg-orange-900/30 text-orange-300 border-orange-800/50"
                    : "bg-orange-100/50 text-orange-700 border-orange-200/50"
                }`}
              >
                {armorSet.rank === "LOW" ? "Low Rank" : "High Rank"}
              </span>
            </div>
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-amber-100" : "text-amber-900"
              }`}
            >
              🛡️ {armorSet.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Stats totales de l'ensemble */}
      <div
        className={`p-4 border-b ${
          darkMode ? "border-slate-700/50" : "border-amber-200/50"
        }`}
      >
        <div
          className={`flex flex-wrap gap-4 text-sm ${
            darkMode ? "text-amber-100/90" : "text-amber-900/90"
          }`}
        >
          <span className="flex items-center gap-1 font-bold">
            🛡️ Total DEF: {totalDefense}
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(resistanceIcons).map(([key, icon]) => (
              <span
                key={key}
                className={`flex items-center gap-1 ${getResistanceColor(
                  totalResistances[key] || 0
                )}`}
              >
                {icon} {totalResistances[key] > 0 ? "+" : ""}
                {totalResistances[key] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pièces d'armure */}
      <div className="p-4 space-y-3">
        {pieceOrder.map((pieceKey) => {
          const piece = armorSet.pieces?.[pieceKey];
          if (!piece) return null;

          return (
            <div
              key={pieceKey}
              className={`rounded-lg p-3 border ${
                darkMode
                  ? "bg-slate-800/20 border-slate-700/30"
                  : "bg-amber-100/20 border-amber-200/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{pieceIcons[pieceKey]}</span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-amber-100" : "text-amber-900"
                    }`}
                  >
                    {piece.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      darkMode ? "text-amber-100/70" : "text-amber-800/70"
                    }
                  >
                    🛡️ {piece.defense}
                  </span>
                  {piece.slots && piece.slots.some((s) => s > 0) && (
                    <span
                      className={darkMode ? "text-cyan-300" : "text-amber-600"}
                    >
                      [
                      {piece.slots.map((s) => (s > 0 ? `◆${s}` : "○")).join("")}
                      ]
                    </span>
                  )}
                </div>
              </div>

              {/* Skills de la pièce */}
              {piece.skills && piece.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {piece.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-lg border ${
                        darkMode
                          ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/30"
                          : "bg-amber-200/70 text-amber-800 border-amber-300/50"
                      }`}
                    >
                      {translateSkillName(skill.name, language)} +{skill.level}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Skills totaux de l'ensemble */}
      {Object.keys(allSkills).length > 0 && (
        <div
          className={`p-4 border-t ${
            darkMode ? "border-slate-700/50" : "border-amber-200/50"
          }`}
        >
          <h4
            className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
              darkMode ? "text-amber-100/70" : "text-amber-800/70"
            }`}
          >
            📊 Total Skills ({Object.keys(allSkills).length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(allSkills).map((skill, idx) => (
              <span
                key={idx}
                className={`text-sm px-3 py-1 rounded-lg border ${
                  darkMode
                    ? "bg-slate-700/50 text-amber-100 border-slate-600/50"
                    : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                }`}
              >
                {translateSkillName(skill.name, language)}{" "}
                <strong>+{skill.level}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Group Skill / Set Bonus */}
      {armorSet.groupSkill && (
        <div
          className={`p-4 border-t ${
            darkMode ? "border-slate-700/50" : "border-amber-200/50"
          }`}
        >
          <h4
            className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
              darkMode ? "text-cyan-300" : "text-orange-600"
            }`}
          >
            ✨ Group Skill
          </h4>
          <span
            className={`text-sm ${
              darkMode ? "text-amber-100" : "text-amber-900"
            }`}
          >
            {armorSet.groupSkill}
          </span>
        </div>
      )}

      {armorSet.setBonus && (
        <div
          className={`p-4 border-t ${
            darkMode ? "border-slate-700/50" : "border-amber-200/50"
          }`}
        >
          <h4
            className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
              darkMode ? "text-purple-300" : "text-purple-600"
            }`}
          >
            🎁 Set Bonus
          </h4>
          <span
            className={`text-sm ${
              darkMode ? "text-amber-100" : "text-amber-900"
            }`}
          >
            {armorSet.setBonus}
          </span>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher une carte d'arme compacte
function WeaponCard({ weapon, language, darkMode, onClick }) {
  if (!weapon) {
    return (
      <div
        className={`border-dashed rounded-xl p-4
        backdrop-blur-md shadow-lg ${
          darkMode
            ? "bg-slate-800/20 border border-slate-700/50 text-amber-100/70"
            : "bg-amber-100/20 border border-amber-200/50 text-amber-800/70"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium">
            Weapon not available in {language}
          </h3>
        </div>
      </div>
    );
  }

  // Couleurs par type d'élément
  const getElementColor = (element) => {
    const colors = {
      Fire: { dark: "text-red-400", light: "text-red-600", icon: "🔥" },
      Water: { dark: "text-blue-400", light: "text-blue-600", icon: "💧" },
      Thunder: {
        dark: "text-yellow-400",
        light: "text-yellow-600",
        icon: "⚡",
      },
      Ice: { dark: "text-cyan-400", light: "text-cyan-600", icon: "❄️" },
      Dragon: { dark: "text-purple-400", light: "text-purple-600", icon: "🐉" },
      Poison: {
        dark: "text-fuchsia-400",
        light: "text-fuchsia-600",
        icon: "☠️",
      },
      Sleep: { dark: "text-indigo-400", light: "text-indigo-600", icon: "💤" },
      Paralysis: {
        dark: "text-amber-400",
        light: "text-amber-600",
        icon: "⚡",
      },
      Blast: { dark: "text-orange-400", light: "text-orange-600", icon: "💥" },
    };
    return (
      colors[element] || {
        dark: "text-gray-400",
        light: "text-gray-600",
        icon: "✨",
      }
    );
  };

  const elementInfo = weapon.element ? getElementColor(weapon.element) : null;

  return (
    <div
      className={`group rounded-xl overflow-hidden
      backdrop-blur-md border
      transition-all duration-500 hover:-translate-y-1 ${
        darkMode
          ? "bg-slate-800/30 border-slate-700/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          : "bg-amber-100/30 border-amber-200/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
      }`}
    >
      <div
        className={`border-b p-4 ${
          darkMode
            ? "bg-gradient-to-r from-slate-800/50 to-cyan-900/30 border-slate-700/50"
            : "bg-gradient-to-r from-amber-100/50 to-orange-100/30 border-amber-200/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                    : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                }`}
              >
                {language}
              </span>
              {weapon.rarity && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                  backdrop-blur-md border ${
                    darkMode
                      ? "bg-purple-900/30 text-purple-300 border-purple-800/50"
                      : "bg-purple-100/50 text-purple-700 border-purple-200/50"
                  }`}
                >
                  ★{weapon.rarity}
                </span>
              )}
            </div>
            <h3
              onClick={onClick}
              className={`text-xl font-bold transition-colors duration-300 cursor-pointer ${
                darkMode
                  ? "text-amber-100 group-hover:text-cyan-300 hover:underline"
                  : "text-amber-900 group-hover:text-amber-600 hover:underline"
              }`}
              title="Click to expand and see skill details"
            >
              {weapon.name}
            </h3>
            <div
              className={`text-sm font-medium mt-1 ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              ⚔️ {weapon.type}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Stats rapides */}
        <div
          className={`flex flex-wrap gap-3 mb-4 text-sm ${
            darkMode ? "text-amber-100/90" : "text-amber-900/90"
          }`}
        >
          <span className="flex items-center gap-1">
            <span className="font-bold">⚔️ {weapon.attack}</span>
          </span>
          {weapon.affinity !== undefined && weapon.affinity !== 0 && (
            <span
              className={`flex items-center gap-1 ${
                weapon.affinity > 0
                  ? darkMode
                    ? "text-green-400"
                    : "text-green-600"
                  : darkMode
                  ? "text-red-400"
                  : "text-red-600"
              }`}
            >
              💫 {weapon.affinity > 0 ? "+" : ""}
              {weapon.affinity}%
            </span>
          )}
          {weapon.element && elementInfo && (
            <span
              className={`flex items-center gap-1 ${
                darkMode ? elementInfo.dark : elementInfo.light
              }`}
            >
              {elementInfo.icon} {weapon.elementAttack}
            </span>
          )}
        </div>

        {/* Skills */}
        {weapon.skills && weapon.skills.length > 0 && (
          <div>
            <h4
              className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              {getUIText("weaponSkills", language)} ({weapon.skills.length})
            </h4>
            <div
              className={`space-y-2 rounded-xl backdrop-blur-md p-3 border ${
                darkMode
                  ? "bg-slate-800/20 border-slate-700/30"
                  : "bg-amber-100/20 border-amber-200/30"
              }`}
            >
              {weapon.skills.slice(0, 3).map(([skillName, level], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span
                    className={
                      darkMode ? "text-amber-100/90" : "text-amber-900/90"
                    }
                  >
                    {translateSkillName(skillName, language)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg border ${
                      darkMode
                        ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/30"
                        : "bg-amber-200/70 text-amber-800 border-amber-300/50"
                    }`}
                  >
                    +{level}
                  </span>
                </div>
              ))}
              {weapon.skills.length > 3 && (
                <div
                  className={`text-xs text-center pt-1 ${
                    darkMode ? "text-amber-100/50" : "text-amber-800/50"
                  }`}
                >
                  +{weapon.skills.length - 3} {getUIText("more", language)}...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TalentCard({ talent, language, darkMode, onClick, fallbackLevels }) {
  if (!talent) {
    return (
      <div
        className={`border-dashed rounded-xl p-4
        backdrop-blur-md shadow-lg ${
          darkMode
            ? "bg-slate-800/20 border border-slate-700/50 text-amber-100/70"
            : "bg-amber-100/20 border border-amber-200/50 text-amber-800/70"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium">
            Translation not available in {language}
          </h3>
        </div>
      </div>
    );
  }

  // Utiliser les levels du talent ou les fallbackLevels (EN) si vides
  const levelsToShow =
    talent.levels && Object.keys(talent.levels).length > 0
      ? talent.levels
      : fallbackLevels || {};

  // Déterminer si on utilise le fallback
  const usingFallback =
    !(talent.levels && Object.keys(talent.levels).length > 0) &&
    fallbackLevels &&
    Object.keys(fallbackLevels).length > 0;

  return (
    <div
      className={`group rounded-xl overflow-hidden
      backdrop-blur-md border
      transition-all duration-500 hover:-translate-y-1 ${
        darkMode
          ? "bg-slate-800/30 border-slate-700/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          : "bg-amber-100/30 border-amber-200/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
      }`}
    >
      <div
        className={`border-b p-4 ${
          darkMode
            ? "bg-gradient-to-r from-slate-800/50 to-indigo-900/30 border-slate-700/50"
            : "bg-gradient-to-r from-amber-100/50 to-orange-100/30 border-amber-200/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full
              backdrop-blur-md border mb-2 ${
                darkMode
                  ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                  : "bg-amber-100/50 text-amber-900 border-amber-200/50"
              }`}
            >
              {language}
            </span>
            <h3
              onClick={onClick}
              className={`text-xl font-bold transition-colors duration-300 cursor-pointer ${
                darkMode
                  ? "text-amber-100 group-hover:text-cyan-300 hover:underline"
                  : "text-amber-900 group-hover:text-amber-600 hover:underline"
              }`}
              title="Click to expand and see equipment details"
            >
              {talent.name}
            </h3>
            <div
              className={`text-sm font-medium mt-1 ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              {talent.category}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p
          className={`mb-6 text-sm leading-relaxed ${
            darkMode ? "text-amber-100/90" : "text-amber-900/90"
          }`}
        >
          {talent.description}
        </p>

        {Object.keys(levelsToShow).length > 0 && (
          <div>
            <h3
              className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              Levels{" "}
              {usingFallback && (
                <span className="text-xs opacity-60 font-normal">(EN)</span>
              )}
            </h3>
            <div
              className={`space-y-2 rounded-xl backdrop-blur-md p-3 border ${
                darkMode
                  ? "bg-slate-800/20 border-slate-700/30"
                  : "bg-amber-100/20 border-amber-200/30"
              }`}
            >
              {Object.entries(levelsToShow).map(([level, description]) => (
                <div key={level} className="flex gap-2 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-lg
                    shrink-0 self-start mt-0.5 border ${
                      darkMode
                        ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/30"
                        : "bg-amber-200/70 text-amber-800 border-amber-300/50"
                    }`}
                  >
                    {level}
                  </span>
                  <span
                    className={
                      darkMode ? "text-amber-100/90" : "text-amber-900/90"
                    }
                  >
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour afficher les détails d'une arme
function ExpandedWeaponCard({
  weapon,
  language,
  otherLanguage,
  darkMode,
  onClose,
  onSwitchLanguage,
  talents,
}) {
  if (!weapon) {
    return (
      <div
        className={`border-dashed rounded-xl p-4
        backdrop-blur-md shadow-lg ${
          darkMode
            ? "bg-slate-800/20 border border-slate-700/50 text-amber-100/70"
            : "bg-amber-100/20 border border-amber-200/50 text-amber-800/70"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium">
            Weapon not available in {language}
          </h3>
        </div>
      </div>
    );
  }

  // Fonction pour trouver un talent par son nom traduit
  const findTalentBySkillName = (skillName) => {
    for (const [talentKey, talentData] of Object.entries(talents)) {
      if (talentData[language]?.name === skillName) {
        return { key: talentKey, data: talentData };
      }
      // Chercher aussi dans d'autres langues si pas trouvé
      for (const lang of Object.keys(talentData)) {
        if (talentData[lang]?.name === skillName) {
          return { key: talentKey, data: talentData };
        }
      }
    }
    return null;
  };

  // Couleurs par type d'élément
  const getElementColor = (element) => {
    const colors = {
      Fire: { dark: "text-red-400", light: "text-red-600", icon: "🔥" },
      Water: { dark: "text-blue-400", light: "text-blue-600", icon: "💧" },
      Thunder: {
        dark: "text-yellow-400",
        light: "text-yellow-600",
        icon: "⚡",
      },
      Ice: { dark: "text-cyan-400", light: "text-cyan-600", icon: "❄️" },
      Dragon: { dark: "text-purple-400", light: "text-purple-600", icon: "🐉" },
      Poison: {
        dark: "text-fuchsia-400",
        light: "text-fuchsia-600",
        icon: "☠️",
      },
      Sleep: { dark: "text-indigo-400", light: "text-indigo-600", icon: "💤" },
      Paralysis: {
        dark: "text-amber-400",
        light: "text-amber-600",
        icon: "⚡",
      },
      Blast: { dark: "text-orange-400", light: "text-orange-600", icon: "💥" },
    };
    return (
      colors[element] || {
        dark: "text-gray-400",
        light: "text-gray-600",
        icon: "✨",
      }
    );
  };

  const elementInfo = weapon.element ? getElementColor(weapon.element) : null;

  return (
    <div
      className={`group rounded-xl overflow-hidden col-span-2
      backdrop-blur-md border
      transition-all duration-500 animate-fadeIn ${
        darkMode
          ? "bg-slate-800/30 border-slate-700/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          : "bg-amber-100/30 border-amber-200/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
      }`}
    >
      {/* Header with weapon info */}
      <div
        className={`border-b p-4 ${
          darkMode
            ? "bg-gradient-to-r from-slate-800/50 to-cyan-900/30 border-slate-700/50"
            : "bg-gradient-to-r from-amber-100/50 to-orange-100/30 border-amber-200/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                    : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                }`}
              >
                {language}
              </span>

              {/* Weapon type badge */}
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border ${
                  darkMode
                    ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/50"
                    : "bg-orange-100/50 text-orange-700 border-orange-200/50"
                }`}
              >
                ⚔️ {weapon.type}
              </span>

              {/* Rarity badge */}
              {weapon.rarity && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                  backdrop-blur-md border ${
                    darkMode
                      ? "bg-purple-900/30 text-purple-300 border-purple-800/50"
                      : "bg-purple-100/50 text-purple-700 border-purple-200/50"
                  }`}
                >
                  ★ {weapon.rarity}
                </span>
              )}

              {/* Switch language button */}
              <button
                onClick={onSwitchLanguage}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border transition-all duration-300 ${
                  darkMode
                    ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/50 hover:bg-cyan-800/50"
                    : "bg-amber-200/50 text-amber-800 border-amber-300/50 hover:bg-amber-300/50"
                }`}
                title={`${getUIText("switchTo", language)} ${otherLanguage}`}
              >
                <GlobeIcon />
                <span>
                  {getUIText("switchTo", language)} {otherLanguage}
                </span>
              </button>
            </div>

            <h3
              className={`text-2xl font-bold ${
                darkMode ? "text-amber-100" : "text-amber-900"
              }`}
            >
              {weapon.name}
            </h3>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
            }`}
            title="Close expanded view"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Stats */}
          <div>
            <h4
              className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              {getUIText("weaponStatsTitle", language)}
            </h4>

            <div
              className={`rounded-xl backdrop-blur-md p-4 border space-y-3 ${
                darkMode
                  ? "bg-slate-800/20 border-slate-700/30"
                  : "bg-amber-100/20 border-amber-200/30"
              }`}
            >
              {/* Attack */}
              <div className="flex justify-between items-center">
                <span
                  className={
                    darkMode ? "text-amber-100/70" : "text-amber-800/70"
                  }
                >
                  ⚔️ {getUIText("attack", language)}
                </span>
                <span
                  className={`font-bold text-lg ${
                    darkMode ? "text-amber-100" : "text-amber-900"
                  }`}
                >
                  {weapon.attack}
                </span>
              </div>

              {/* Affinity */}
              {weapon.affinity !== undefined && weapon.affinity !== 0 && (
                <div className="flex justify-between items-center">
                  <span
                    className={
                      darkMode ? "text-amber-100/70" : "text-amber-800/70"
                    }
                  >
                    💫 {getUIText("affinity", language)}
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      weapon.affinity > 0
                        ? darkMode
                          ? "text-green-400"
                          : "text-green-600"
                        : darkMode
                        ? "text-red-400"
                        : "text-red-600"
                    }`}
                  >
                    {weapon.affinity > 0 ? "+" : ""}
                    {weapon.affinity}%
                  </span>
                </div>
              )}

              {/* Element */}
              {weapon.element && (
                <div className="flex justify-between items-center">
                  <span
                    className={
                      darkMode ? "text-amber-100/70" : "text-amber-800/70"
                    }
                  >
                    {elementInfo?.icon} {weapon.element}
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      darkMode ? elementInfo?.dark : elementInfo?.light
                    }`}
                  >
                    {weapon.elementAttack}
                  </span>
                </div>
              )}

              {/* Slots */}
              {weapon.slots && weapon.slots.length > 0 && (
                <div className="flex justify-between items-center">
                  <span
                    className={
                      darkMode ? "text-amber-100/70" : "text-amber-800/70"
                    }
                  >
                    🔲 {getUIText("slots", language)}
                  </span>
                  <div className="flex gap-1">
                    {weapon.slots.map((slot, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 text-xs rounded-full border ${
                          darkMode
                            ? "bg-slate-700/50 text-amber-100 border-slate-600/50"
                            : "bg-amber-200/50 text-amber-800 border-amber-300/50"
                        }`}
                      >
                        Lv{slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Skills */}
          <div>
            <h4
              className={`font-semibold mb-3 text-sm uppercase tracking-wide ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              {getUIText("weaponSkillsTitle", language)} (
              {weapon.skills?.length || 0})
            </h4>

            {weapon.skills && weapon.skills.length > 0 ? (
              <div
                className={`rounded-xl backdrop-blur-md border max-h-80 overflow-y-auto ${
                  darkMode
                    ? "bg-slate-800/20 border-slate-700/30"
                    : "bg-amber-100/20 border-amber-200/30"
                }`}
              >
                {weapon.skills.map(([skillName, level], index) => {
                  const talentInfo = findTalentBySkillName(skillName);
                  return (
                    <div
                      key={index}
                      className={`p-3 border-b last:border-b-0 ${
                        darkMode ? "border-slate-700/30" : "border-amber-200/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm ${
                              darkMode ? "text-amber-100" : "text-amber-900"
                            }`}
                          >
                            {translateSkillName(skillName, language)}
                          </div>
                          {talentInfo && (
                            <div
                              className={`text-xs mt-1 ${
                                darkMode
                                  ? "text-amber-100/60"
                                  : "text-amber-800/60"
                              }`}
                            >
                              {talentInfo.data[language]?.category ||
                                talentInfo.data.EN?.category}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-bold rounded-lg border ${
                            darkMode
                              ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/30"
                              : "bg-amber-200/70 text-amber-800 border-amber-300/50"
                          }`}
                        >
                          +{level}
                        </span>
                      </div>

                      {/* Afficher la description du skill si trouvé */}
                      {talentInfo && talentInfo.data[language]?.levels && (
                        <div
                          className={`mt-2 text-xs italic ${
                            darkMode ? "text-amber-100/50" : "text-amber-800/50"
                          }`}
                        >
                          Lv{level}:{" "}
                          {talentInfo.data[language]?.levels?.[`Lv ${level}`] ||
                            talentInfo.data[language]?.levels?.[`Lv${level}`] ||
                            talentInfo.data[language]?.levels?.[level] ||
                            ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`rounded-xl backdrop-blur-md p-4 border text-center ${
                  darkMode
                    ? "bg-slate-800/20 border-slate-700/30 text-amber-100/50"
                    : "bg-amber-100/20 border-amber-200/30 text-amber-800/50"
                }`}
              >
                <p className="text-sm">
                  {uiTranslations[language]?.noSkillsData ||
                    "This weapon has no skills"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpandedTalentCard({
  talent,
  language,
  otherLanguage,
  darkMode,
  onClose,
  onSwitchLanguage,
  specs,
}) {
  if (!talent) {
    return (
      <div
        className={`border-dashed rounded-xl p-4
        backdrop-blur-md shadow-lg ${
          darkMode
            ? "bg-slate-800/20 border border-slate-700/50 text-amber-100/70"
            : "bg-amber-100/20 border border-amber-200/50 text-amber-800/70"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium">
            Translation not available in {language}
          </h3>
        </div>
      </div>
    );
  }

  const equipment = specs?.[language]?.equipment || [];

  return (
    <div
      className={`group rounded-xl overflow-hidden col-span-2
      backdrop-blur-md border
      transition-all duration-500 animate-fadeIn ${
        darkMode
          ? "bg-slate-800/30 border-slate-700/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          : "bg-amber-100/30 border-amber-200/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
      }`}
    >
      {/* Header with close and switch buttons */}
      <div
        className={`border-b p-4 ${
          darkMode
            ? "bg-gradient-to-r from-slate-800/50 to-indigo-900/30 border-slate-700/50"
            : "bg-gradient-to-r from-amber-100/50 to-orange-100/30 border-amber-200/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border ${
                  darkMode
                    ? "bg-slate-800/30 text-amber-100 border-slate-700/50"
                    : "bg-amber-100/50 text-amber-900 border-amber-200/50"
                }`}
              >
                {language}
              </span>

              {/* Switch language button */}
              <button
                onClick={onSwitchLanguage}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full
                backdrop-blur-md border transition-all duration-300 ${
                  darkMode
                    ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/50 hover:bg-cyan-800/50"
                    : "bg-amber-200/50 text-amber-800 border-amber-300/50 hover:bg-amber-300/50"
                }`}
                title={`${getUIText("switchTo", language)} ${otherLanguage}`}
              >
                <GlobeIcon />
                <span>
                  {getUIText("switchTo", language)} {otherLanguage}
                </span>
              </button>
            </div>

            <h3
              className={`text-2xl font-bold ${
                darkMode ? "text-amber-100" : "text-amber-900"
              }`}
            >
              {talent.name}
            </h3>
            <div
              className={`text-sm font-medium mt-1 ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              {talent.category}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50"
                : "bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50"
            }`}
            title="Close expanded view"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Description and Levels */}
          <div>
            <p
              className={`mb-6 text-sm leading-relaxed ${
                darkMode ? "text-amber-100/90" : "text-amber-900/90"
              }`}
            >
              {talent.description}
            </p>

            {Object.keys(talent.levels).length > 0 && (
              <div>
                <h3
                  className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
                    darkMode ? "text-amber-100/70" : "text-amber-800/70"
                  }`}
                >
                  {getUIText("levels", language)}
                </h3>
                <div
                  className={`space-y-2 rounded-xl backdrop-blur-md p-3 border ${
                    darkMode
                      ? "bg-slate-800/20 border-slate-700/30"
                      : "bg-amber-100/20 border-amber-200/30"
                  }`}
                >
                  {Object.entries(talent.levels).map(([level, description]) => (
                    <div key={level} className="flex gap-2 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-lg
                        shrink-0 self-start mt-0.5 border ${
                          darkMode
                            ? "bg-cyan-900/30 text-cyan-300 border-cyan-800/30"
                            : "bg-amber-200/70 text-amber-800 border-amber-300/50"
                        }`}
                      >
                        {level}
                      </span>
                      <span
                        className={
                          darkMode ? "text-amber-100/90" : "text-amber-900/90"
                        }
                      >
                        {description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Equipment list */}
          <div>
            <h3
              className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
                darkMode ? "text-amber-100/70" : "text-amber-800/70"
              }`}
            >
              {getUIText("equipmentWithSkill", language)}
            </h3>

            {equipment.length > 0 ? (
              <div
                className={`rounded-xl backdrop-blur-md border max-h-80 overflow-y-auto ${
                  darkMode
                    ? "bg-slate-800/20 border-slate-700/30"
                    : "bg-amber-100/20 border-amber-200/30"
                }`}
              >
                {equipment.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b last:border-b-0 ${
                      darkMode ? "border-slate-700/30" : "border-amber-200/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-lg shrink-0 border ${
                          darkMode
                            ? "bg-indigo-900/30 text-indigo-300 border-indigo-800/30"
                            : "bg-orange-200/70 text-orange-800 border-orange-300/50"
                        }`}
                      >
                        {translateEquipmentType(item.type, language)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm truncate ${
                            darkMode ? "text-amber-100" : "text-amber-900"
                          }`}
                        >
                          {item.name}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            darkMode ? "text-amber-100/60" : "text-amber-800/60"
                          }`}
                        >
                          {item.skills}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-xl backdrop-blur-md p-4 border text-center ${
                  darkMode
                    ? "bg-slate-800/20 border-slate-700/30 text-amber-100/50"
                    : "bg-amber-100/20 border-amber-200/30 text-amber-800/50"
                }`}
              >
                <p className="text-sm">
                  {getUIText("noEquipmentData", language)}
                </p>
                <p className="text-xs mt-2">
                  {getUIText("runScrapingScript", language)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
