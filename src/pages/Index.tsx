import { useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import BiasTypesSection from "@/components/BiasTypesSection";
import TechStackSection from "@/components/TechStackSection";
import ApplicationsSection from "@/components/ApplicationsSection";
import BiasDetector from "@/components/BiasDetector";
import DebateAnalyzer from "@/components/DebateAnalyzer";
import BiasCorrectionAssistant from "@/components/BiasCorrectionAssistant";
import SystemArchitecture from "@/components/SystemArchitecture";
import ResearchSection from "@/components/ResearchSection";
import TeamCredits from "@/components/TeamCredits";
import { ArrowUp } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const detectorRef = useRef<HTMLDivElement>(null);

  const scrollToDetector = () => {
    detectorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onStartAnalysis={scrollToDetector} />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <HowItWorks />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <BiasTypesSection />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <TechStackSection />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <ApplicationsSection />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <SystemArchitecture />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <ResearchSection />
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div ref={detectorRef}>
        <BiasDetector />
      </div>
      
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <DebateAnalyzer />

      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <BiasCorrectionAssistant />

      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <TeamCredits />

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/30 bg-navy-deep/80">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="MindTrace AI" className="h-10 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Research-grade cognitive bias detection powered by Transformer NLP, quantum cognition modeling, and explainable AI.
              </p>
              <p className="text-xs text-muted-foreground/50 mt-3">
                20+ cognitive biases · 13 Indian languages · Sentiment analysis · Real-time NLP metrics
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Explore</h4>
              <div className="space-y-2">
                {[
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Bias Types", href: "#bias-types" },
                  { label: "Architecture", href: "#architecture" },
                  { label: "Research", href: "#research" },
                  { label: "Try Detector", href: "#detector" },
                  { label: "Debate Mode", href: "#debate" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {["RoBERTa", "SBERT", "FLAN-T5", "spaCy", "PyTorch", "SHAP", "NetworkX", "Transformers"].map((tech) => (
                  <span key={tech} className="text-[10px] font-mono px-2.5 py-1 rounded bg-muted/50 text-muted-foreground border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
              <h4 className="font-display font-semibold text-sm mt-6 mb-3 text-foreground">Research Areas</h4>
              <div className="flex flex-wrap gap-2">
                {["NLP", "Cognitive Psychology", "Quantum Cognition", "Explainable AI", "Multilingual NLP"].map((area) => (
                  <span key={area} className="text-[10px] px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MindTrace AI · Quantum-Inspired Cognitive Bias Detection using Transformer-based NLP
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
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
