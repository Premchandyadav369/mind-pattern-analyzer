import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FileText, Cpu, Brain, Atom, GitBranch, Lightbulb, BarChart3, ArrowDown, Zap, Globe,
} from "lucide-react";

const PIPELINE_STEPS = [
  {
    icon: FileText,
    title: "Input Layer",
    subtitle: "Text / Debate / Essay",
    details: ["Essays & Articles", "Debate Transcripts", "Social Media Posts", "Multilingual Support"],
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  {
    icon: Cpu,
    title: "NLP Processing",
    subtitle: "Text Preprocessing",
    details: ["Tokenization", "Sentence Segmentation", "Lemmatization", "Language Detection"],
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  {
    icon: Globe,
    title: "Translation Layer",
    subtitle: "Multilingual Pipeline",
    details: ["Auto Language Detection", "Indian Language Support", "Gemini Translation", "Context Preservation"],
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/30",
  },
  {
    icon: Brain,
    title: "Bias Classification",
    subtitle: "Transformer Model",
    details: ["RoBERTa Fine-Tuned", "Multi-label Classification", "Probability Distribution", "Confidence Scoring"],
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  {
    icon: Atom,
    title: "Quantum Bias Modeling",
    subtitle: "Quantum Cognition",
    details: ["Bias Superposition", "Bias Entanglement", "Probability Collapse", "State Vector Modeling"],
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
  },
  {
    icon: GitBranch,
    title: "Reasoning Analyzer",
    subtitle: "Cognitive Graph",
    details: ["Argument Mining", "Cause-Effect Chains", "Reasoning Graph", "Edge Bias Detection"],
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  {
    icon: Lightbulb,
    title: "Explanation Generator",
    subtitle: "Explainable AI",
    details: ["LLM Explanations", "Attention Highlighting", "Trigger Word Detection", "Bias Reframing"],
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  {
    icon: BarChart3,
    title: "Visualization Engine",
    subtitle: "Interactive Dashboard",
    details: ["Bias Heatmap", "Evolution Timeline", "Entanglement Graph", "Quantum Collapse Animation"],
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
  },
];

const SystemArchitecture = () => {
  const { isQuantum } = useTheme();

  return (
    <section id="architecture" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            System Design
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Architecture</span> Pipeline
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            End-to-end cognitive bias detection combining NLP, quantum cognition, and explainable AI.
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 -translate-x-1/2 hidden md:block" />

          <div className="space-y-6">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Arrow connector (mobile) */}
                  {i > 0 && (
                    <div className="flex justify-center mb-3 md:hidden">
                      <ArrowDown className="w-4 h-4 text-primary/40" />
                    </div>
                  )}

                  {/* Center dot (desktop) */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary/50 z-10 items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>

                  <div className={`md:grid md:grid-cols-2 md:gap-12 ${isLeft ? "" : "md:direction-rtl"}`}>
                    <div className={`${isLeft ? "md:text-right md:pr-8" : "md:col-start-2 md:pl-8"}`}>
                      <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-xl p-5 border ${step.bg} hover:scale-[1.02] transition-transform`}>
                        <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                          <div className={`w-10 h-10 rounded-lg ${step.bg} border flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${step.color}`} />
                          </div>
                          <div className={isLeft ? "md:text-right" : ""}>
                            <h3 className="font-display font-semibold text-sm text-foreground">{step.title}</h3>
                            <p className="text-[10px] font-mono text-muted-foreground">{step.subtitle}</p>
                          </div>
                        </div>
                        <div className={`flex flex-wrap gap-1.5 ${isLeft ? "md:justify-end" : ""}`}>
                          {step.details.map((detail) => (
                            <span
                              key={detail}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground border border-border/30"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Final output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <div className="flex justify-center mb-4 md:hidden">
              <ArrowDown className="w-4 h-4 text-primary/40" />
            </div>
            <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${isQuantum ? "quantum-glass glow-quantum" : "glass-card glow-cyan"} border border-primary/30`}>
              <Zap className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-display font-bold text-sm text-foreground">Output Layer</p>
                <p className="text-[10px] text-muted-foreground">Bias Type · Confidence · Explanation · Highlighted Text · Reframed Thought</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SystemArchitecture;
