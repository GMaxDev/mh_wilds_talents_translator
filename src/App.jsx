"use client";

import { useState, useEffect, useRef } from "react";
//import talentsData from "./data/talents.json";
import talentsData from "./data/skills.json";

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
  const [currentPage, setCurrentPage] = useState("translator"); // "translator" ou "editor"
  const [darkMode, setDarkMode] = useState(true); // Mode sombre par défaut
  const [talents, setTalents] = useState({});

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

    const exportFileDefaultName = "talents.json";

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

      <div className="container relative z-10 px-4 py-8 mx-auto">
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
                title="Download talents.json"
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
            MH Wilds Talent{" "}
            {currentPage === "translator" ? "Translator" : "Editor"}
          </h1>
          <p
            className={`${
              darkMode ? "text-amber-100/80" : "text-amber-800/80"
            }`}
          >
            {currentPage === "translator"
              ? "Translate Monster Hunter Wilds talents between languages"
              : "Add, edit or delete Monster Hunter Wilds talents"}
          </p>
        </div>

        {currentPage === "translator" ? (
          <TranslatorPage talents={talents} darkMode={darkMode} />
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
  const [sourceLanguage, setSourceLanguage] = useState("EN");
  const [targetLanguage, setTargetLanguage] = useState("FR");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [keyboardSelectedIndex, setKeyboardSelectedIndex] = useState(-1); // Pour la navigation au clavier
  const [showResults, setShowResults] = useState(false);

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
    // Filter talents based on search query
    if (searchQuery.trim() === "") {
      setFilteredTalents([]);
      setKeyboardSelectedIndex(-1); // Réinitialiser l'index sélectionné
      return;
    }

    // Auto-detect language based on input
    detectLanguage(searchQuery);

    const filtered = Object.keys(talents).filter((talentKey) => {
      const talent = talents[talentKey];
      // Search in all available languages
      return (
        availableLanguages.some((lang) =>
          talent[lang]?.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || talentKey.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredTalents(filtered);

    // Réinitialiser l'index sélectionné lorsque les résultats changent
    setKeyboardSelectedIndex(filtered.length > 0 ? 0 : -1);
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
    setSearchQuery("");
    setFilteredTalents([]);
    setShowResults(true);
    setKeyboardSelectedIndex(-1); // Réinitialiser l'index sélectionné

    // Remettre le focus sur l'input de recherche après la sélection
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleLanguageSwap = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  // Gestionnaire pour les touches du clavier
  const handleKeyDown = (e) => {
    if (filteredTalents.length === 0) return;

    // Navigation avec les flèches
    if (e.key === "ArrowDown") {
      e.preventDefault(); // Empêcher le défilement de la page
      setKeyboardSelectedIndex((prev) =>
        prev < filteredTalents.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // Empêcher le défilement de la page
      setKeyboardSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && keyboardSelectedIndex >= 0) {
      e.preventDefault(); // Empêcher la soumission du formulaire
      handleTalentSelect(filteredTalents[keyboardSelectedIndex]);
    } else if (e.key === "Escape") {
      setFilteredTalents([]);
      setKeyboardSelectedIndex(-1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
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
          placeholder="Search for a talent..."
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

            {filteredTalents.length > 0 && (
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

      {filteredTalents.length > 0 && (
        <div
          ref={resultsContainerRef}
          className={`mt-2 rounded-xl max-h-60 overflow-y-auto
            backdrop-blur-md shadow-lg border ${
              darkMode
                ? "bg-slate-800/30 border-slate-700/50"
                : "bg-amber-100/30 border-amber-200/50"
            }`}
        >
          {filteredTalents.map((talentKey, index) => (
            <div
              key={talentKey}
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TalentCard
              talent={talents[selectedTalent][sourceLanguage]}
              talentKey={selectedTalent}
              language={sourceLanguage}
              darkMode={darkMode}
            />
            <TalentCard
              talent={talents[selectedTalent][targetLanguage]}
              talentKey={selectedTalent}
              language={targetLanguage}
              darkMode={darkMode}
            />
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

function TalentCard({ talent, language, darkMode }) {
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
              className={`text-xl font-bold transition-colors duration-300 ${
                darkMode
                  ? "text-amber-100 group-hover:text-cyan-300"
                  : "text-amber-900 group-hover:text-amber-600"
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

        {Object.keys(talent.levels).length > 0 && (
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
    </div>
  );
}

export default App;
