import { Share2 } from "lucide-react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/biasAnalyzer";

interface Props {
  result: AnalysisResult;
}

const ShareButton = ({ result }: Props) => {
  const handleShare = async () => {
    try {
      const payload = {
        t: result.overallText.slice(0, 500),
        b: result.biases.slice(0, 8).map((b) => ({
          n: b.biasType,
          c: Math.round(b.confidence * 100),
          s: b.severity,
        })),
        i: result.overallInsight?.slice(0, 280),
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

      if (navigator.share) {
        await navigator.share({ title: "MindTrace Bias Analysis", text: "Cognitive bias analysis", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't create share link");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-3 py-1.5 rounded-lg text-xs border border-border/50 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      title="Create shareable link"
    >
      <Share2 className="w-3 h-3" />
      Share
    </button>
  );
};

export default ShareButton;
