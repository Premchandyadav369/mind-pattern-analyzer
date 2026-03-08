import { motion } from "framer-motion";
import { Brain, Zap, Eye } from "lucide-react";

const HeroSection = ({ onStartAnalysis }: { onStartAnalysis: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm text-primary font-medium tracking-wide">NLP + Cognitive Psychology + Explainable AI</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Mind</span>
            <span className="text-gradient-cyan">Trace</span>
            <span className="text-foreground"> AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Detect cognitive biases in text using advanced NLP. 
            Understand <em>how</em> people think, not just <em>what</em> they say.
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
            className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-lg glow-cyan hover:scale-105 transition-transform"
          >
            Try Bias Detector
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-display font-medium"
          >
            How It Works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { icon: Brain, label: "Bias Types", value: "5+" },
            { icon: Zap, label: "Real-time", value: "<1s" },
            { icon: Eye, label: "Explainable", value: "100%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-display font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
