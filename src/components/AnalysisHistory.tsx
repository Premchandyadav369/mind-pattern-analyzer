import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, Trash2, X } from "lucide-react";
import type { AnalysisResult } from "@/lib/biasAnalyzer";

interface Props {
  history: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AnalysisHistory = ({ history, onSelect, onClear, isOpen, onClose }: Props) => {
  if (history.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="glass-card rounded-xl p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h4 className="font-display font-semibold text-sm">Recent Analyses</h4>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                {history.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => onSelect(item)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{item.overallText}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {item.biases.length} bias{item.biases.length !== 1 ? "es" : ""} · {new Date(item.analyzedAt).toLocaleTimeString()}
                  </p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisHistory;
