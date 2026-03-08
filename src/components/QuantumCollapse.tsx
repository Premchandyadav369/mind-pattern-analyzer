import { motion, AnimatePresence } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { useState, useEffect } from "react";
import { Atom, Zap } from "lucide-react";

const COLORS: Record<string, string> = {
  cyan: "hsl(199, 89%, 60%)",
  green: "hsl(142, 71%, 45%)",
  red: "hsl(0, 84%, 60%)",
  orange: "hsl(24, 95%, 53%)",
  purple: "hsl(270, 70%, 60%)",
};

interface CollapseProps {
  biases: BiasResult[];
  onComplete?: () => void;
}

const QuantumCollapse = ({ biases, onComplete }: CollapseProps) => {
  const [phase, setPhase] = useState<"superposition" | "collapsing" | "collapsed">("superposition");
  const [collapsedIndex, setCollapsedIndex] = useState(-1);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("collapsing"), 1500);
    const t2 = setTimeout(() => {
      setPhase("collapsed");
      // Collapse to highest confidence
      const maxIdx = biases.reduce((max, b, i) => (b.confidence > biases[max].confidence ? i : max), 0);
      setCollapsedIndex(maxIdx);
      onComplete?.();
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [biases, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="quantum-glass rounded-2xl p-6 overflow-hidden relative"
    >
      {/* Phase label */}
      <div className="flex items-center gap-2 mb-6">
        <Atom className={`w-5 h-5 text-primary ${phase === "collapsing" ? "animate-spin" : ""}`} style={phase === "collapsing" ? { animationDuration: "0.5s" } : {}} />
        <h3 className="font-display font-semibold text-foreground">Quantum State Collapse</h3>
        <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full ${
          phase === "superposition" ? "bg-primary/10 text-primary" :
          phase === "collapsing" ? "bg-accent/10 text-accent" :
          "bg-secondary/10 text-secondary"
        }`}>
          {phase === "superposition" ? "⟨ψ| Superposition" :
           phase === "collapsing" ? "⚡ Collapsing..." :
           "✓ Measured"}
        </span>
      </div>

      {/* Visualization */}
      <div className="relative min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "superposition" && (
            <motion.div
              key="super"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              {biases.map((bias, i) => (
                <motion.div
                  key={bias.biasType}
                  animate={{
                    y: [0, -10, 0, 10, 0],
                    opacity: [0.5, 1, 0.5, 1, 0.5],
                    scale: [1, 1.05, 1, 0.95, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut" }}
                  className="px-4 py-3 rounded-xl border border-border/50 bg-muted/20 text-center"
                >
                  <div className="font-mono-code text-sm font-bold" style={{ color: COLORS[bias.color] }}>
                    {bias.confidence.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{bias.biasType}</div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === "collapsing" && (
            <motion.div
              key="collapse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Spinning ring */}
              <div className="relative w-32 h-32">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ rotate: 360, scale: [1, 1.2, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-secondary/30"
                  animate={{ rotate: -360, scale: [1, 0.8, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                />
                <motion.div
                  className="absolute inset-8 rounded-full border-2 border-accent/30"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-mono-code text-muted-foreground animate-pulse">
                Wavefunction collapsing...
              </p>
            </motion.div>
          )}

          {phase === "collapsed" && collapsedIndex >= 0 && (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: COLORS[biases[collapsedIndex].color] + "20", border: `2px solid ${COLORS[biases[collapsedIndex].color]}` }}
              >
                <span className="text-2xl font-display font-bold" style={{ color: COLORS[biases[collapsedIndex].color] }}>
                  {(biases[collapsedIndex].confidence * 100).toFixed(0)}%
                </span>
              </motion.div>
              <p className="font-display font-semibold text-lg text-foreground">{biases[collapsedIndex].biasType}</p>
              <p className="text-xs text-muted-foreground mt-1">Dominant cognitive bias — state collapsed</p>

              {/* Other states faded */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {biases.filter((_, i) => i !== collapsedIndex).map((bias) => (
                  <span key={bias.biasType} className="text-[10px] font-mono-code text-muted-foreground/40 line-through px-2 py-1 rounded bg-muted/20">
                    {bias.biasType} ({(bias.confidence * 100).toFixed(0)}%)
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pipeline */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono-code text-muted-foreground/50">
        <span className={phase === "superposition" ? "text-primary" : ""}>Superposition</span>
        <span>→</span>
        <span className={phase === "collapsing" ? "text-accent" : ""}>Measurement</span>
        <span>→</span>
        <span className={phase === "collapsed" ? "text-secondary" : ""}>Collapse</span>
        <span>→</span>
        <span className={phase === "collapsed" ? "text-foreground" : ""}>Prediction</span>
      </div>
    </motion.div>
  );
};

export default QuantumCollapse;
