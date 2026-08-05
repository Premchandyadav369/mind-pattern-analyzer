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
import BatchEvaluation from "@/components/BatchEvaluation";
import TeamCredits from "@/components/TeamCredits";
import SampleTextLibrary from "@/components/SampleTextLibrary";
import BiasQuiz from "@/components/BiasQuiz";
import CognitiveChecklist from "@/components/CognitiveChecklist";
import CognitiveProfile from "@/components/CognitiveProfile";
import ABComparison from "@/components/ABComparison";
import DailyInsight from "@/components/DailyInsight";
import TextAnalyzerMini from "@/components/TextAnalyzerMini";
import ScrollProgress from "@/components/ScrollProgress";
import QuickStartGuide from "@/components/QuickStartGuide";
import { useAppMode } from "@/contexts/AppModeContext";
import { ArrowUp } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const detectorRef = useRef<HTMLDivElement>(null);
  const { isResearch, isUser } = useAppMode();

  const scrollToDetector = () => {
    detectorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const Divider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
  );

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <div className="relative z-30 pt-20 px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-background/60 backdrop-blur-sm rounded-full border border-border/40 px-3 py-1.5 w-fit">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isResearch ? "bg-accent" : "bg-primary"}`} />
          {isResearch
            ? "Research mode · architecture, benchmarks, calibration & batch evaluation enabled"
            : "Simple mode · guided view with the essentials"}
        </div>
      </div>

      <HeroSection onStartAnalysis={scrollToDetector} />


      {isUser && <QuickStartGuide onStart={scrollToDetector} />}


      {isUser && (
        <>
          <Divider />
          <div ref={detectorRef}>
            <BiasDetector />
          </div>
          <Divider />
          <SampleTextLibrary />
          <Divider />
        </>
      )}

      <DailyInsight />

      <Divider />

      <HowItWorks />

      <Divider />

      <BiasTypesSection />

      {isResearch && (
        <>
          <Divider />
          <TechStackSection />
          <Divider />
          <ApplicationsSection />
          <Divider />
          <SystemArchitecture />
          <Divider />
          <ResearchSection />
          <Divider />
          <div ref={detectorRef}>
            <BiasDetector />
          </div>
          <Divider />
          <SampleTextLibrary />
          <Divider />
          <BatchEvaluation />
        </>
      )}

      <Divider />

      <DebateAnalyzer />

      <Divider />

      <BiasCorrectionAssistant />

      <Divider />

      <TextAnalyzerMini />

      <Divider />

      <ABComparison />

      <Divider />

      <CognitiveProfile />

      <Divider />

      <CognitiveChecklist />


      <Divider />

      <BiasQuiz />

      {isUser && (
        <>
          <Divider />
          <ApplicationsSection />
        </>
      )}

      <Divider />

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
              <p className="text-xs text-primary/70 mt-3 font-mono">
                Built by V C Premchand Yadav · 23BCE7167
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Explore</h4>
              <div className="space-y-2">
                {[
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Bias Types", href: "#bias-types" },
                  { label: "Try Detector", href: "#detector" },
                  { label: "Debate Mode", href: "#debate" },
                  ...(isResearch
                    ? [
                        { label: "Architecture", href: "#architecture" },
                        { label: "Research", href: "#research" },
                        { label: "Batch Evaluation", href: "#batch" },
                      ]
                    : []),
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
