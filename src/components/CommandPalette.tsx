import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BookOpen, History, Focus, Printer, Volume2, RotateCcw, Atom, Brain } from "lucide-react";

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

const CommandPalette = ({ open, onClose, commands }: Props) => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || (c.keywords || "").toLowerCase().includes(q)
    );
  }, [query, commands]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[active];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, active, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-card rounded-2xl overflow-hidden border-primary/20"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
              />
              <kbd className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No commands found</div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{cmd.label}</span>
                      {cmd.hint && (
                        <span className="text-[10px] font-mono text-muted-foreground">{cmd.hint}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-border/40 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>↑↓ navigate · ↵ select</span>
              <span>⌘P toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Sparkles, BookOpen, History, Focus, Printer, Volume2, RotateCcw, Atom, Brain };
export default CommandPalette;
