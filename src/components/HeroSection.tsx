import { motion } from "framer-motion";
import { Brain, Zap, Eye, Shield, ArrowDown, Atom } from "lucide-react";
import NeuralBackground from "./NeuralBackground";
import { useTheme } from "@/contexts/ThemeContext";
import logo from "@/assets/logo.png";

const HeroSection = ({ onStartAnalysis }: { onStartAnalysis: () => void }) => {
  const { isQuantum } = useTheme();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <NeuralBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/6 blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/4 blur-[100px]" />
      {isQuantum && (
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[100px] animate-pulse" />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <img
              src={logo}
              alt="MindTrace AI"
              className={`h-20 sm:h-24 md:h-28 w-auto ${
                isQuantum
                  ? "drop-shadow-[0_0_50px_hsl(270,70%,60%,0.4)]"
                  : "drop-shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
              }`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs sm:text-sm text-primary font-medium tracking-wide">
              {isQuantum
                ? "Quantum-Inspired Cognitive Bias Detection System"
                : "NLP × Cognitive Psychology × Explainable AI"}
            </span>
          </motion.div>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            {isQuantum ? (
              <>
                Model cognitive biases as <em className="text-foreground/90 not-italic font-medium">quantum superpositions</em>.
                <br className="hidden sm:block" />
                Detect <em className="text-foreground/90 not-italic font-medium">entanglement</em> between thought patterns.
              </>
            ) : (
              <>
                Detect cognitive biases in text using advanced NLP.
                <br className="hidden sm:block" />
                Understand <em className="text-foreground/90 not-italic font-medium">how</em> people think, not just <em className="text-foreground/90 not-italic font-medium">what</em> they say.
              </>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStartAnalysis}
            className={`group px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
          >
            {isQuantum ? <Atom className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
            {isQuantum ? "Quantum Bias Analysis" : "Try Bias Detector"}
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 font-display font-medium"
          >
            How It Works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-24 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {(isQuantum
            ? [
                { icon: Atom, label: "Superposition", value: "∞" },
                { icon: Zap, label: "Entanglement", value: "Live" },
                { icon: Eye, label: "Collapse", value: "Real" },
                { icon: Shield, label: "Quantum", value: "Safe" },
              ]
            : [
                { icon: Brain, label: "Bias Types", value: "5+" },
                { icon: Zap, label: "Real-time", value: "<1s" },
                { icon: Eye, label: "Explainable", value: "100%" },
                { icon: Shield, label: "Privacy", value: "Local" },
              ]
          ).map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="text-center glass-card rounded-xl py-5 px-3 hover:border-primary/30 transition-colors"
            >
              <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">{value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
