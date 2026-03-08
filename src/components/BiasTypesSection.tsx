import { motion } from "framer-motion";
import { BIAS_INFO } from "@/lib/biasAnalyzer";

const colorMap: Record<string, string> = {
  cyan: "border-primary/40 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]",
  green: "border-secondary/40 hover:border-secondary hover:shadow-[0_0_30px_hsl(var(--secondary)/0.1)]",
  red: "border-destructive/40 hover:border-destructive hover:shadow-[0_0_30px_hsl(var(--destructive)/0.1)]",
  orange: "border-accent/40 hover:border-accent hover:shadow-[0_0_30px_hsl(var(--accent)/0.1)]",
  purple: "border-ring/40 hover:border-ring hover:shadow-[0_0_30px_hsl(var(--ring)/0.1)]",
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
    <section id="bias-types" className="py-28 px-6 bg-navy-deep/50 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">Taxonomy</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Detected <span className="text-gradient-cyan">Bias Types</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
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
              className={`glass-card rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${colorMap[bias.color]}`}
            >
              <div className="text-3xl mb-4">{bias.icon}</div>
              <h3 className={`font-display font-semibold mb-2 text-lg ${textColorMap[bias.color]}`}>
                {bias.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{bias.description}</p>
              <div className="text-xs font-mono text-muted-foreground/70 bg-muted/30 rounded-lg px-3 py-2.5 border border-border/30">
                <span className="text-primary/50 mr-1">▸</span> {bias.example}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BiasTypesSection;
