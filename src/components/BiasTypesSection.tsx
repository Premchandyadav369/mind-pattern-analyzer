import { motion } from "framer-motion";
import { BIAS_INFO } from "@/lib/biasAnalyzer";

const colorMap: Record<string, string> = {
  cyan: "border-primary/40 hover:border-primary",
  green: "border-secondary/40 hover:border-secondary",
  red: "border-destructive/40 hover:border-destructive",
  orange: "border-accent/40 hover:border-accent",
  purple: "border-ring/40 hover:border-ring",
};

const textColorMap: Record<string, string> = {
  cyan: "text-primary",
  green: "text-secondary",
  red: "text-destructive",
  orange: "text-accent",
  purple: "text-ring",
};

const BiasTypesSection = () => {
  return (
    <section id="bias-types" className="py-24 px-6 bg-navy-deep/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Detected <span className="text-gradient-cyan">Bias Types</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Five key cognitive biases rooted in psychological research.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BIAS_INFO.map((bias, i) => (
            <motion.div
              key={bias.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-xl p-6 border transition-colors ${colorMap[bias.color]}`}
            >
              <div className="text-2xl mb-3">{bias.icon}</div>
              <h3 className={`font-display font-semibold mb-2 ${textColorMap[bias.color]}`}>
                {bias.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{bias.description}</p>
              <div className="text-xs font-mono text-muted-foreground/70 bg-muted/30 rounded-md px-3 py-2">
                {bias.example}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BiasTypesSection;
