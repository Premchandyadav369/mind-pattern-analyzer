import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import type { LiveSuggestion } from "@/lib/liveSuggestions";

const colorMap: Record<string, string> = {
  cyan: "bg-primary/10 text-primary border-primary/30",
  green: "bg-secondary/10 text-secondary border-secondary/30",
  red: "bg-destructive/10 text-destructive border-destructive/30",
  orange: "bg-accent/10 text-accent border-accent/30",
  purple: "bg-ring/10 text-ring border-ring/30",
};

const LiveSuggestions = ({ suggestions }: { suggestions: LiveSuggestion[] }) => {
  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Live hints · {suggestions.length} potential bias{suggestions.length > 1 ? "es" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.biasType}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`text-xs px-3 py-1.5 rounded-full border ${colorMap[s.color] || colorMap.cyan}`}
                title={`${s.hint} (trigger: "${s.triggerPhrase}")`}
              >
                <span className="font-semibold">{s.biasType}</span>
                <span className="opacity-60 ml-1.5 hidden sm:inline">· {s.hint}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveSuggestions;
