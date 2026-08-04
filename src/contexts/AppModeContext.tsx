import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AppMode = "user" | "research";

interface AppModeContextType {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  toggleMode: () => void;
  isResearch: boolean;
  isUser: boolean;
}

const AppModeContext = createContext<AppModeContextType>({
  mode: "user",
  setMode: () => {},
  toggleMode: () => {},
  isResearch: false,
  isUser: true,
});

export const useAppMode = () => useContext(AppModeContext);

const STORAGE_KEY = "mindtrace-app-mode";

export const AppModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "user" || stored === "research") return stored;
    }
    return "user";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode]);

  const setMode = (m: AppMode) => setModeState(m);
  const toggleMode = () => setModeState((m) => (m === "user" ? "research" : "user"));

  return (
    <AppModeContext.Provider
      value={{ mode, setMode, toggleMode, isResearch: mode === "research", isUser: mode === "user" }}
    >
      {children}
    </AppModeContext.Provider>
  );
};
