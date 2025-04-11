import { useState, useEffect } from "react";
import talentsData from "./data/talents.json"; // Assurez-vous que ce chemin est correct

// Icônes simplifiées
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const ArrowLeftRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3 4 7l4 4"></path>
    <path d="M4 7h16"></path>
    <path d="m16 21 4-4-4-4"></path>
    <path d="M20 17H4"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState("EN");
  const [targetLanguage, setTargetLanguage] = useState("FR");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [talents, setTalents] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Mode sombre par défaut

  useEffect(() => {
    // Appliquer le mode sombre par défaut au chargement
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Initialize talents from the imported JSON
    setTalents(talentsData);

    // Determine available languages from the first talent
    if (Object.keys(talentsData).length > 0) {
      const firstTalent = Object.keys(talentsData)[0];
      setAvailableLanguages(Object.keys(talentsData[firstTalent]));
    }
  }, []);

  useEffect(() => {
    // Filter talents based on search query
    if (searchQuery.trim() === "") {
      setFilteredTalents([]);
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
        ) ||
        talentKey.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredTalents(filtered);
  }, [searchQuery, talents, availableLanguages]);

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
      const otherLang = availableLanguages.find((lang) => lang !== bestMatch) || targetLanguage;
      setTargetLanguage(otherLang);
    }
  };

  const handleTalentSelect = (talentKey) => {
    setSelectedTalent(talentKey);
    setSearchQuery("");
    setFilteredTalents([]);
    setShowResults(true);
  };

  const handleLanguageSwap = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode
      ? 'dark bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900'
      : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>

      {/* Éléments décoratifs pour l'arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-lg border border-white/20 dark:border-gray-700/30"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            MH Wilds Talent Translator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Translate Monster Hunter Wilds talents between languages</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search for a talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg w-full rounded-xl border border-white/20 dark:border-gray-700/30 px-4 py-2
                backdrop-blur-md bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100
                shadow-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  backdrop-blur-md bg-white/30 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200
                  border border-white/20 dark:border-gray-700/30">
                  {sourceLanguage} detected
                  <SparklesIcon className="ml-1 text-yellow-500" />
                </span>
              </div>
            )}
          </div>

          {filteredTalents.length > 0 && (
            <div className="mt-2 border border-white/20 dark:border-gray-700/30 rounded-xl max-h-60 overflow-y-auto
              backdrop-blur-md bg-white/30 dark:bg-gray-800/30 shadow-lg">
              {filteredTalents.map((talentKey) => (
                <div
                  key={talentKey}
                  className="p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-300
                    border-b border-white/20 dark:border-gray-700/30 last:border-b-0 flex justify-between items-center"
                  onClick={() => handleTalentSelect(talentKey)}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{talents[talentKey][sourceLanguage]?.name || talentKey}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      {talents[talentKey][sourceLanguage]?.category}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full backdrop-blur-md bg-white/30 dark:bg-gray-800/30
                    text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700/30">
                    {talentKey}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showResults && selectedTalent && talents[selectedTalent] && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-[100px] rounded-xl border border-white/20 dark:border-gray-700/30 px-3 py-2
                      backdrop-blur-md bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100
                      shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={`source-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleLanguageSwap}
                    className="p-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-gray-800/30
                      text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50
                      transition-all duration-300 border border-white/20 dark:border-gray-700/30 shadow-md"
                  >
                    <ArrowLeftRightIcon />
                  </button>

                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-[100px] rounded-xl border border-white/20 dark:border-gray-700/30 px-3 py-2
                      backdrop-blur-md bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100
                      shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={`target-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs px-2 py-1 rounded-full backdrop-blur-md bg-white/30 dark:bg-gray-800/30
                  text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700/30">
                  {selectedTalent}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}

function TalentCard({ talent, talentKey, language, darkMode }) {
  if (!talent) {
    return (
      <div className="border border-dashed border-white/20 dark:border-gray-700/30 rounded-xl p-4
        backdrop-blur-md bg-white/20 dark:bg-gray-800/20 shadow-lg">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Translation not available in {language}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="group border border-white/20 dark:border-gray-700/30 rounded-xl overflow-hidden
      backdrop-blur-md bg-white/30 dark:bg-gray-800/30
      transition-all duration-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] dark:hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]
      hover:-translate-y-1">
      <div className={`border-b border-white/20 dark:border-gray-700/30 p-4
        ${darkMode
          ? 'bg-gradient-to-r from-gray-800/50 to-purple-900/30'
          : 'bg-gradient-to-r from-white/50 to-purple-100/30'}`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full
              backdrop-blur-md bg-white/30 dark:bg-gray-800/30
              text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700/30 mb-2">
              {language}
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {talent.name}
            </h3>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{talent.category}</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{talent.description}</p>

        {Object.keys(talent.levels).length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Levels</h3>
            <div className="space-y-2 rounded-xl backdrop-blur-md bg-white/20 dark:bg-gray-700/30 p-3 border border-white/10 dark:border-gray-600/30">
              {Object.entries(talent.levels).map(([level, description]) => (
                <div key={level} className="flex gap-2 text-sm">
                  <span className="px-2 py-0.5 bg-purple-100/70 dark:bg-purple-900/30 rounded-lg
                    text-purple-800 dark:text-purple-300 shrink-0 self-start mt-0.5
                    border border-purple-200/50 dark:border-purple-700/30">
                    {level}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{description}</span>
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
