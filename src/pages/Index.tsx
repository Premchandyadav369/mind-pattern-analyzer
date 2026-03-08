import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import BiasTypesSection from "@/components/BiasTypesSection";
import BiasDetector from "@/components/BiasDetector";

const Index = () => {
  const detectorRef = useRef<HTMLDivElement>(null);

  const scrollToDetector = () => {
    detectorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onStartAnalysis={scrollToDetector} />
      <HowItWorks />
      <BiasTypesSection />
      <div ref={detectorRef}>
        <BiasDetector />
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-display text-lg font-semibold text-foreground mb-2">
            Mind<span className="text-gradient-cyan">Trace</span> AI
          </p>
          <p className="text-sm text-muted-foreground">
            NLP × Cognitive Psychology × Explainable AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
