import { motion } from "framer-motion";
import type { BiasResult } from "@/lib/biasAnalyzer";
import { Atom } from "lucide-react";

const QUANTUM_COLORS: Record<string, string> = {
  cyan: "hsl(199, 89%, 60%)",
  green: "hsl(142, 71%, 45%)",
  red: "hsl(0, 84%, 60%)",
  orange: "hsl(24, 95%, 53%)",
  purple: "hsl(270, 70%, 60%)",
};

const QuantumSuperposition = ({ biases }: { biases: BiasResult[] }) => {
  const total = biases.reduce((s, b) => s + b.confidence, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="quantum-glass rounded-2xl p-6 overflow-hidden relative"
    >
      {/* Background particle effect */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary"
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{
              x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{ repeat: Infinity, duration: 3 + Math.random() * 4, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Atom className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Quantum Bias State Vector</h3>
          <span className="text-[10px] font-mono-code text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">|ψ⟩ superposition</span>
        </div>

        {/* State vector notation */}
        <div className="bg-muted/20 rounded-xl p-4 mb-6 border border-border/30">
          <p className="font-mono-code text-sm text-muted-foreground mb-2">|ψ⟩ =</p>
          <div className="flex flex-wrap gap-2 items-center">
            {biases.map((bias, i) => (
              <span key={bias.biasType} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground font-mono-code">+</span>}
                <span className="font-mono-code text-sm font-bold" style={{ color: QUANTUM_COLORS[bias.color] }}>
                  {bias.confidence.toFixed(2)}
                </span>
                <span className="font-mono-code text-xs text-muted-foreground">
                  |{bias.biasType.replace(/\s+/g, "").slice(0, 8)}⟩
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Probability bars with wave animation */}
        <div className="space-y-4">
          {biases.map((bias, i) => {
            const probability = total > 0 ? (bias.confidence / total) * 100 : 0;
            return (
              <motion.div
                key={bias.biasType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: QUANTUM_COLORS[bias.color] }} />
                    <span className="text-sm font-medium text-foreground">{bias.biasType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-code text-xs text-muted-foreground">
                      P = |α|² = {probability.toFixed(1)}%
                    </span>
                    <span className="font-mono-code text-sm font-bold" style={{ color: QUANTUM_COLORS[bias.color] }}>
                      {bias.confidence.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="h-3 rounded-full bg-muted/30 overflow-hidden relative">
                  {/* Wave pattern overlay */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bias.confidence * 100}%` }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: QUANTUM_COLORS[bias.color] }}
                  >
                    {/* Animated wave overlay */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)`,
                      }}
                      animate={{ x: [-20, 0] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Normalization note */}
        <p className="mt-4 text-[10px] font-mono-code text-muted-foreground/50 text-center">
          Σ|α_i|² = 1 · Quantum state normalized · Measurement collapses superposition
        </p>
      </div>
    </motion.div>
  );
};

export default QuantumSuperposition;
