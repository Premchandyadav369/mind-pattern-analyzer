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
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It <span className="text-gradient-cyan">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
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
              className="glass-card rounded-xl p-6 relative group hover:border-primary/30 transition-colors"
            >
              <div className="text-xs text-primary font-mono mb-4">0{i + 1}</div>
              <step.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
