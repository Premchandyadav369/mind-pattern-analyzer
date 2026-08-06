import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const HIGHLIGHTS = [
  { label: "Core Analysis", items: ["Bias Detector", "Clarity Score", "Live Suggestions", "Correction Assistant"] },
  { label: "Visualisation", items: ["Radar Chart", "Knowledge Graph", "Confusion Heatmap", "Quantum View"] },
  { label: "Research", items: ["Benchmarks", "Batch Evaluation", "Calibration", "Threshold Tuner"] },
  { label: "Experience", items: ["Command Palette", "Glossary", "Read Aloud", "User & Research Modes"] },
];

const FeatureShowcase = () => {
  const navigate = useNavigate();
  const { isQuantum } = useTheme();

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Capability Map
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Everything <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>MindTrace</span> can do
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            35+ features across analysis, visualisation, research tooling and collaboration.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {HIGHLIGHTS.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-5`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm text-foreground">{group.label}</h3>
              </div>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground">· {item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/features")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            Explore all features <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
