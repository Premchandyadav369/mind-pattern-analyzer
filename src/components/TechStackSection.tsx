import { motion } from "framer-motion";

const STACK = [
  { name: "RoBERTa", role: "Bias Classification", desc: "Fine-tuned transformer for multi-label cognitive bias detection" },
  { name: "Sentence-BERT", role: "Semantic Embedding", desc: "768-dim vector representations for semantic similarity matching" },
  { name: "FLAN-T5", role: "Explanation Generation", desc: "Generates human-readable explanations for detected biases" },
  { name: "spaCy", role: "Text Preprocessing", desc: "Tokenization, POS tagging, dependency parsing, and lemmatization" },
  { name: "NetworkX", role: "Knowledge Graph", desc: "Bias-trigger relationships for explainable pattern reasoning" },
  { name: "SHAP", role: "Explainable AI", desc: "Feature attribution to highlight which words triggered detection" },
];

const TechStackSection = () => {
  return (
    <section className="py-24 px-6 bg-navy-deep/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Powered By <span className="text-gradient-cyan">Research-Grade</span> NLP
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A multi-model architecture combining state-of-the-art transformers with cognitive psychology knowledge graphs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STACK.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="font-display font-bold text-primary text-sm">{item.name}</div>
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">{item.role}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-card rounded-xl p-8"
        >
          <h3 className="font-display font-semibold text-center mb-8 text-sm text-muted-foreground uppercase tracking-wider">Pipeline Architecture</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            {[
              "User Input",
              "→",
              "Preprocessing",
              "→",
              "SBERT Embedding",
              "→",
              "RoBERTa Classifier",
              "→",
              "Pattern Analysis",
              "→",
              "FLAN-T5 Explainer",
              "→",
              "Output",
            ].map((step, i) =>
              step === "→" ? (
                <span key={i} className="text-primary text-lg">→</span>
              ) : (
                <span
                  key={i}
                  className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                >
                  {step}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
