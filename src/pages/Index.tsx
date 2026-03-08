import { useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import BiasTypesSection from "@/components/BiasTypesSection";
import TechStackSection from "@/components/TechStackSection";
import ApplicationsSection from "@/components/ApplicationsSection";
import BiasDetector from "@/components/BiasDetector";
import { Brain, Github, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const detectorRef = useRef<HTMLDivElement>(null);

  const scrollToDetector = () => {
    detectorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onStartAnalysis={scrollToDetector} />
      <HowItWorks />
      <BiasTypesSection />
      <TechStackSection />
      <ApplicationsSection />
      <div ref={detectorRef}>
        <BiasDetector />
      </div>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/50 bg-navy-deep/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display font-bold text-lg">
                  Mind<span className="text-gradient-cyan">Trace</span> AI
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Research-grade cognitive bias detection powered by NLP, cognitive psychology, and explainable AI.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Explore</h4>
              <div className="space-y-2">
                {[
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Bias Types", href: "#bias-types" },
                  { label: "Applications", href: "#applications" },
                  { label: "Try Detector", href: "#detector" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Tech */}
            <div>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {["RoBERTa", "SBERT", "FLAN-T5", "spaCy", "PyTorch", "SHAP"].map((tech) => (
                  <span key={tech} className="text-[10px] font-mono px-2.5 py-1 rounded bg-muted/50 text-muted-foreground border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MindTrace AI · NLP × Cognitive Psychology × Explainable AI
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 rounded-lg border border-border/50 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
