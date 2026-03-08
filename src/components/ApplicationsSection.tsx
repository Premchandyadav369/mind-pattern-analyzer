import { motion } from "framer-motion";
import { HeartPulse, Scale, Globe, GraduationCap, TrendingUp, MessageCircle } from "lucide-react";

const APPLICATIONS = [
  {
    icon: HeartPulse,
    title: "Mental Health Tools",
    description: "Detect negative thinking patterns in journaling apps and CBT exercises. Help therapists identify cognitive distortions in patient writing.",
    tag: "Healthcare",
  },
  {
    icon: Scale,
    title: "Debate & Argument Analysis",
    description: "Identify weak reasoning, logical fallacies, and biased arguments in political debates, legal briefs, and academic papers.",
    tag: "Legal / Academic",
  },
  {
    icon: Globe,
    title: "Social Media Monitoring",
    description: "Detect biased or polarized discussions at scale. Flag misinformation patterns and cognitive manipulation tactics.",
    tag: "Media & Tech",
  },
  {
    icon: GraduationCap,
    title: "Critical Thinking Education",
    description: "Teach students to recognize biases in their own writing. Gamified exercises that build stronger reasoning skills.",
    tag: "Education",
  },
  {
    icon: TrendingUp,
    title: "Business Decision Analysis",
    description: "Review strategic documents for confirmation bias and sunk cost fallacy. Improve executive decision-making quality.",
    tag: "Enterprise",
  },
  {
    icon: MessageCircle,
    title: "Content Moderation",
    description: "Augment content review pipelines with bias-aware NLP. Prioritize emotionally charged or manipulative content for review.",
    tag: "Trust & Safety",
  },
];

const ApplicationsSection = () => {
  return (
    <section id="applications" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Research <span className="text-gradient-cyan">Applications</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From clinical psychology to enterprise decision-making — cognitive bias detection has transformative applications across industries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {APPLICATIONS.map((app, i) => (
            <motion.div
              key={app.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-6 group hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:glow-cyan transition-shadow">
                  <app.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 bg-muted/40 px-2 py-1 rounded">
                  {app.tag}
                </span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{app.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
