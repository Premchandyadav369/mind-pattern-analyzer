import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "neural" | "quantum";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isQuantum: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "neural",
  toggleTheme: () => {},
  isQuantum: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("mindtrace-theme") as Theme) || "neural";
    }
    return "neural";
  });

  useEffect(() => {
    localStorage.setItem("mindtrace-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "neural" ? "quantum" : "neural"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isQuantum: theme === "quantum" }}>
      {children}
    </ThemeContext.Provider>
  );
};
