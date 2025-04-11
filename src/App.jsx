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
      ? 'dark bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900'
      : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100'}`}>

      {/* Éléments décoratifs pour l'arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob ${
          darkMode ? 'bg-cyan-500' : 'bg-amber-500'
        }`}></div>
        <div className={`absolute top-0 -right-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 ${
          darkMode ? 'bg-blue-500' : 'bg-orange-400'
        }`}></div>
        <div className={`absolute -bottom-40 left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 ${
          darkMode ? 'bg-indigo-500' : 'bg-amber-300'
        }`}></div>
      </div>

      <div className="container relative z-10 px-4 py-8 mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 shadow-lg ${
              darkMode
                ? 'bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/30'
                : 'bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50'
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="mb-10 text-center">
          <h1 className={`text-5xl font-bold mb-2 ${
            darkMode
              ? 'bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-cyan-200'
              : 'bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-orange-600'
          }`}>
            MH Wilds Talent Translator
          </h1>
          <p className={`${darkMode ? 'text-amber-100/80' : 'text-amber-800/80'}`}>
            Translate Monster Hunter Wilds talents between languages
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              darkMode ? 'text-amber-100/70' : 'text-amber-800/70'
            }`}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search for a talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-12 text-lg w-full rounded-xl px-4 py-2
                backdrop-blur-md shadow-lg focus:outline-none transition-all duration-300 ${
                darkMode
                  ? 'bg-slate-800/30 text-amber-100 border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50'
                  : 'bg-amber-100/30 text-amber-900 border border-amber-200/50 focus:ring-2 focus:ring-amber-500/50'
              }`}
            />
            {searchQuery && (
              <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  backdrop-blur-md border ${
                  darkMode
                    ? 'bg-slate-800/30 text-amber-100 border-slate-700/50'
                    : 'bg-amber-100/30 text-amber-900 border-amber-200/50'
                }`}>
                  {sourceLanguage} detected
                  <SparklesIcon className={`ml-1 ${darkMode ? 'text-cyan-300' : 'text-amber-500'}`} />
                </span>
              </div>
            )}
          </div>

          {filteredTalents.length > 0 && (
            <div className={`mt-2 rounded-xl max-h-60 overflow-y-auto
              backdrop-blur-md shadow-lg border ${
              darkMode
                ? 'bg-slate-800/30 border-slate-700/50'
                : 'bg-amber-100/30 border-amber-200/50'
            }`}>
              {filteredTalents.map((talentKey) => (
                <div
                  key={talentKey}
                  className={`p-3 cursor-pointer transition-all duration-300
                    border-b last:border-b-0 flex justify-between items-center ${
                    darkMode
                      ? 'border-slate-700/50 hover:bg-slate-700/50'
                      : 'border-amber-200/50 hover:bg-amber-200/50'
                  }`}
                  onClick={() => handleTalentSelect(talentKey)}
                >
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                      {talents[talentKey][sourceLanguage]?.name || talentKey}
                    </span>
                    <span className={`text-xs ml-2 ${darkMode ? 'text-amber-100/70' : 'text-amber-800/70'}`}>
                      {talents[talentKey][sourceLanguage]?.category}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                    darkMode
                      ? 'bg-slate-800/30 text-amber-100/90 border-slate-700/50'
                      : 'bg-amber-100/50 text-amber-900 border-amber-200/50'
                  }`}>
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
                        ? 'bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50'
                        : 'bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50'
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
                        ? 'bg-slate-800/30 text-amber-100 hover:bg-slate-700/50 border-slate-700/50'
                        : 'bg-amber-100/30 text-amber-900 hover:bg-amber-200/50 border-amber-200/50'
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
                        ? 'bg-slate-800/30 text-amber-100 border-slate-700/50 focus:ring-2 focus:ring-cyan-500/50'
                        : 'bg-amber-100/30 text-amber-900 border-amber-200/50 focus:ring-2 focus:ring-amber-500/50'
                    }`}
                  >
                    {availableLanguages.map((lang) => (
                      <option key={`target-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-md border ${
                  darkMode
                    ? 'bg-slate-800/30 text-amber-100 border-slate-700/50'
                    : 'bg-amber-100/30 text-amber-900 border-amber-200/50'
                }`}>
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
      </div>
    </div>
  );
}

function TalentCard({ talent, talentKey, language, darkMode }) {
  if (!talent) {
    return (
      <div className={`border-dashed rounded-xl p-4
        backdrop-blur-md shadow-lg ${
        darkMode
          ? 'bg-slate-800/20 border border-slate-700/50 text-amber-100/70'
          : 'bg-amber-100/20 border border-amber-200/50 text-amber-800/70'
      }`}>
        <div className="p-4">
          <h3 className="text-lg font-medium">Translation not available in {language}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`group rounded-xl overflow-hidden
      backdrop-blur-md border
      transition-all duration-500 hover:-translate-y-1 ${
      darkMode
        ? 'bg-slate-800/30 border-slate-700/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
        : 'bg-amber-100/30 border-amber-200/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    }`}>
      <div className={`border-b p-4 ${
        darkMode
          ? 'bg-gradient-to-r from-slate-800/50 to-indigo-900/30 border-slate-700/50'
          : 'bg-gradient-to-r from-amber-100/50 to-orange-100/30 border-amber-200/50'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
              backdrop-blur-md border mb-2 ${
              darkMode
                ? 'bg-slate-800/30 text-amber-100 border-slate-700/50'
                : 'bg-amber-100/50 text-amber-900 border-amber-200/50'
            }`}>
              {language}
            </span>
            <h3 className={`text-xl font-bold transition-colors duration-300 ${
              darkMode
                ? 'text-amber-100 group-hover:text-cyan-300'
                : 'text-amber-900 group-hover:text-amber-600'
            }`}>
              {talent.name}
            </h3>
            <div className={`text-sm font-medium mt-1 ${
              darkMode ? 'text-amber-100/70' : 'text-amber-800/70'
            }`}>
              {talent.category}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className={`mb-6 text-sm leading-relaxed ${
          darkMode ? 'text-amber-100/90' : 'text-amber-900/90'
        }`}>
          {talent.description}
        </p>

        {Object.keys(talent.levels).length > 0 && (
          <div>
            <h3 className={`font-semibold mb-2 text-sm uppercase tracking-wide ${
              darkMode ? 'text-amber-100/70' : 'text-amber-800/70'
            }`}>
              Levels
            </h3>
            <div className={`space-y-2 rounded-xl backdrop-blur-md p-3 border ${
              darkMode
                ? 'bg-slate-800/20 border-slate-700/30'
                : 'bg-amber-100/20 border-amber-200/30'
            }`}>
              {Object.entries(talent.levels).map(([level, description]) => (
                <div key={level} className="flex gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-lg
                    shrink-0 self-start mt-0.5 border ${
                    darkMode
                      ? 'bg-cyan-900/30 text-cyan-300 border-cyan-800/30'
                      : 'bg-amber-200/70 text-amber-800 border-amber-300/50'
                  }`}>
                    {level}
                  </span>
                  <span className={darkMode ? 'text-amber-100/90' : 'text-amber-900/90'}>
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
