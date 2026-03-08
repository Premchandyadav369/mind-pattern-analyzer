import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Atom } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import logo from "@/assets/logo.png";

const NAV_ITEMS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Bias Types", href: "#bias-types" },
  { label: "Applications", href: "#applications" },
  { label: "Detector", href: "#detector" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme, isQuantum } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
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
        <a href="#" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logo} alt="MindTrace AI" className="h-9 w-auto" />
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {item.label}
            </button>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 border ${
              isQuantum
                ? "border-primary/50 bg-primary/10 text-primary glow-quantum"
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
            title={`Switch to ${isQuantum ? "Neural" : "Quantum"} theme`}
          >
            <Atom className={`w-4 h-4 ${isQuantum ? "animate-spin" : ""}`} style={isQuantum ? { animationDuration: "3s" } : {}} />
            <span className="text-xs">{isQuantum ? "Quantum" : "Neural"}</span>
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
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Atom className="w-4 h-4" />
                {isQuantum ? "Switch to Neural" : "Switch to Quantum"}
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
