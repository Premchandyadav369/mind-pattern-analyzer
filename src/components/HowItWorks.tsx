import { motion } from "framer-motion";
import { FileText, Cpu, Search, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Input Text",
    description: "Paste any text — social media posts, essays, journal entries, debate arguments.",
  },
  {
    icon: Cpu,
    title: "NLP Processing",
    description: "Text is tokenized, parsed, and embedded using transformer-based models.",
  },
  {
    icon: Search,
    title: "Bias Detection",
    description: "Pattern matching and classification identify cognitive bias categories.",
  },
  {
    icon: MessageSquare,
    title: "Explainable Output",
    description: "Get bias type, confidence score, trigger words, and a human-readable explanation.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 px-6 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">Pipeline</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient-cyan">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            A multi-stage NLP pipeline inspired by cognitive psychology research.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6 relative group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Step number with glow */}
              <div className="text-xs text-primary font-mono mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:glow-cyan transition-shadow">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              
              {/* Connector line on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
