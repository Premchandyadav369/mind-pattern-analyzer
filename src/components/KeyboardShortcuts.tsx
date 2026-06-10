import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["⌘", "Enter"], desc: "Analyze text" },
  { keys: ["?"], desc: "Show keyboard shortcuts" },
  { keys: ["Esc"], desc: "Close dialogs" },
  { keys: ["⌘", "K"], desc: "Focus textarea" },
  { keys: ["⌘", "/"], desc: "Toggle focus mode" },
  { keys: ["⌘", "B"], desc: "Toggle history" },
];

interface Props {
  onFocusInput?: () => void;
  onToggleHistory?: () => void;
  onToggleFocus?: () => void;
}

const KeyboardShortcuts = ({ onFocusInput, onToggleHistory, onToggleFocus }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = target.tagName === "TEXTAREA" || target.tagName === "INPUT";

      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onFocusInput?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        onToggleFocus?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        onToggleHistory?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFocusInput, onToggleHistory, onToggleFocus]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full glass-card border border-border/50 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 max-w-md w-full border border-primary/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold">Keyboard Shortcuts</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {SHORTCUTS.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <span className="text-sm text-muted-foreground">{s.desc}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd key={k} className="px-2 py-1 rounded bg-muted/30 border border-border/50 text-[10px] font-mono text-foreground">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcuts;
