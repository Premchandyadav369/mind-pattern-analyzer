import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Atom, Sun, Brain } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppMode } from "@/contexts/AppModeContext";
import ModeToggle from "@/components/ModeToggle";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme, isQuantum, isLight } = useTheme();
  const { isResearch } = useAppMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2 group"
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname !== "/") navigate("/");
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src={logo} alt="MindTrace AI" className="h-9 w-auto" />
        </a>

        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => handleNav("#detector")} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
            Detector
          </button>
          {isResearch && (
            <button onClick={() => handleNav("#research")} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              Research
            </button>
          )}
          <button onClick={() => handleNav("/about")} className={`px-3 py-2 text-sm transition-colors rounded-lg hover:bg-muted/50 ${location.pathname === "/about" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            Why MindTrace
          </button>

          <div className="ml-2 w-[172px]">
            <ModeToggle />
          </div>


          <button
            onClick={toggleTheme}
            className={`ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 border ${
              isQuantum
                ? "border-primary/50 bg-primary/10 text-primary glow-quantum"
                : isLight
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
            title={`Switch theme`}
          >
            {isQuantum ? <Atom className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} /> : isLight ? <Sun className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            <span className="text-xs">{theme === "neural" ? "Neural" : theme === "quantum" ? "Quantum" : "Light"}</span>
          </button>

          <button
            onClick={() => handleNav("#detector")}
            className={`ml-3 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
          >
            Analyze Text
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              <button onClick={() => handleNav("#detector")} className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">
                Detector
              </button>
              <button onClick={() => handleNav("#research")} className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">
                Research
              </button>
              <button onClick={() => handleNav("/about")} className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">
                Why MindTrace
              </button>
              <button
                onClick={toggleTheme}
                className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                {isQuantum ? <Atom className="w-4 h-4" /> : isLight ? <Sun className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                Switch to {theme === "neural" ? "Quantum" : theme === "quantum" ? "Light" : "Neural"}
              </button>
              <button
                onClick={() => handleNav("#detector")}
                className="w-full mt-2 px-5 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg"
              >
                Analyze Text
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
