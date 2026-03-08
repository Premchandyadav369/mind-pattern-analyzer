import { Globe } from "lucide-react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
  isQuantum?: boolean;
}

const LanguageSelector = ({ selectedLanguage, onLanguageChange, isQuantum }: LanguageSelectorProps) => {
  const selected = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className={`bg-transparent text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${
          isQuantum ? "focus:border-primary/50" : "focus:border-primary/30"
        }`}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-background text-foreground">
            {lang.flag} {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
      {selectedLanguage !== "en" && (
        <span className="text-[10px] text-primary/70 font-mono">
          → Auto-translates to English for analysis
        </span>
      )}
    </div>
  );
};

export default LanguageSelector;
