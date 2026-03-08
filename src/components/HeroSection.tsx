import { motion } from "framer-motion";
import { Brain, Zap, Eye, Shield, ArrowDown } from "lucide-react";
import NeuralBackground from "./NeuralBackground";

const HeroSection = ({ onStartAnalysis }: { onStartAnalysis: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Neural network animation */}
      <NeuralBackground />

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[80px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs sm:text-sm text-primary font-medium tracking-wide">NLP × Cognitive Psychology × Explainable AI</span>
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Mind</span>
            <span className="text-gradient-cyan">Trace</span>
            <span className="text-foreground block sm:inline"> AI</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Detect cognitive biases in text using advanced NLP.
            Understand <em className="text-foreground/80">how</em> people think, not just <em className="text-foreground/80">what</em> they say.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStartAnalysis}
            className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg glow-cyan hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            Try Bias Detector
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 font-display font-medium"
          >
            How It Works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {[
            { icon: Brain, label: "Bias Types", value: "5+" },
            { icon: Zap, label: "Real-time", value: "<1s" },
            { icon: Eye, label: "Explainable", value: "100%" },
            { icon: Shield, label: "Privacy", value: "Local" },
          ].map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center glass-card rounded-xl py-4 px-3"
            >
              <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-display font-bold text-foreground">{value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
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
