import { useState, useEffect } from "react";
import talentsData from "./data/talents.json"; // Assurez-vous que ce chemin est correct

// Icônes simplifiées (vous pouvez les remplacer par des SVG inline)
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

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState("EN");
  const [targetLanguage, setTargetLanguage] = useState("FR");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [talents, setTalents] = useState({});
  const [showResults, setShowResults] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            MH Wilds Talent Translator
          </h1>
          <p className="text-gray-500">Translate Monster Hunter Wilds talents between languages</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search for a talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg shadow-md transition-all focus:ring-2 focus:ring-purple-500 w-full rounded-md border border-gray-300 px-4 py-2"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  {sourceLanguage} detected
                  <SparklesIcon className="ml-1 text-yellow-500" />
                </span>
              </div>
            )}
          </div>

          {filteredTalents.length > 0 && (
            <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
              {filteredTalents.map((talentKey) => (
                <div
                  key={talentKey}
                  className="p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0 flex justify-between items-center"
                  onClick={() => handleTalentSelect(talentKey)}
                >
                  <div>
                    <span className="font-medium">{talents[talentKey][sourceLanguage]?.name || talentKey}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {talents[talentKey][sourceLanguage]?.category}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full border border-gray-300">
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
                    className="w-[100px] rounded-md border border-gray-300 px-3 py-2"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={`source-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleLanguageSwap}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeftRightIcon />
                  </button>

                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-[100px] rounded-md border border-gray-300 px-3 py-2"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={`target-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs px-2 py-1 rounded-full border border-gray-300">
                  {selectedTalent}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TalentCard
                  talent={talents[selectedTalent][sourceLanguage]}
                  talentKey={selectedTalent}
                  language={sourceLanguage}
                />
                <TalentCard
                  talent={talents[selectedTalent][targetLanguage]}
                  talentKey={selectedTalent}
                  language={targetLanguage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TalentCard({ talent, language }) {
  if (!talent) {
    return (
      <div className="border border-dashed rounded-lg p-4 bg-gray-50">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-500">Translation not available in {language}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
      <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full border border-gray-300 mb-2">
              {language}
            </span>
            <h3 className="text-xl font-bold">{talent.name}</h3>
            <div className="text-sm font-medium text-gray-500 mt-1">{talent.category}</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-6 text-sm leading-relaxed">{talent.description}</p>

        {Object.keys(talent.levels).length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Levels</h3>
            <div className="space-y-2 rounded-md bg-gray-50 p-3">
              {Object.entries(talent.levels).map(([level, description]) => (
                <div key={level} className="flex gap-2 text-sm">
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-800 shrink-0 self-start mt-0.5">
                    {level}
                  </span>
                  <span>{description}</span>
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
