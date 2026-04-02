import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "neural" | "quantum" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isQuantum: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "neural",
  setTheme: () => {},
  toggleTheme: () => {},
  isQuantum: false,
  isLight: false,
});

export const useTheme = () => useContext(ThemeContext);

const THEME_ORDER: Theme[] = ["neural", "quantum", "light"];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("mindtrace-theme") as Theme) || "neural";
    }
    return "neural";
  });

  useEffect(() => {
    localStorage.setItem("mindtrace-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => {
    const idx = THEME_ORDER.indexOf(t);
    return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isQuantum: theme === "quantum", isLight: theme === "light" }}>
      {children}
    </ThemeContext.Provider>
  );
};
