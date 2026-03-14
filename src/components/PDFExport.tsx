import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { type AnalysisResult } from "@/lib/biasAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";

interface CorrectionData {
  original: string;
  corrected: string;
  changes: { original_phrase: string; corrected_phrase: string; bias_type: string; explanation: string }[];
  objectivity_score_before: number;
  objectivity_score_after: number;
  summary: string;
}

interface PDFExportProps {
  analysisResult?: AnalysisResult | null;
  correctionResult?: CorrectionData | null;
}

const PDFExport = ({ analysisResult, correctionResult }: PDFExportProps) => {
  const [generating, setGenerating] = useState(false);
  const { isQuantum } = useTheme();

  const generatePDF = () => {
    if (!analysisResult && !correctionResult) return;
    setGenerating(true);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const w = doc.internal.pageSize.getWidth();
      let y = 20;

      const addPage = () => { doc.addPage(); y = 20; };
      const checkPage = (needed: number) => { if (y + needed > 275) addPage(); };

      // Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("MindTrace AI - Research Report", w / 2, y, { align: "center" });
      y += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text(`Generated: ${new Date().toLocaleString()} | Quantum-Inspired Cognitive Bias Detection`, w / 2, y, { align: "center" });
      doc.setTextColor(0);
      y += 6;

      // Divider
      doc.setDrawColor(60, 180, 220);
      doc.setLineWidth(0.5);
      doc.line(20, y, w - 20, y);
      y += 10;

      // === BIAS ANALYSIS SECTION ===
      if (analysisResult) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("1. Cognitive Bias Analysis", 20, y);
        y += 8;

        // Input text
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Analyzed Text:", 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const inputLines = doc.splitTextToSize(analysisResult.overallText, w - 40);
        checkPage(inputLines.length * 4 + 5);
        doc.text(inputLines, 20, y);
        y += inputLines.length * 4 + 4;

        if (analysisResult.translatedText) {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(80);
          doc.text("Translated:", 20, y);
          y += 4;
          const tLines = doc.splitTextToSize(analysisResult.translatedText, w - 40);
          doc.text(tLines, 20, y);
          doc.setTextColor(0);
          y += tLines.length * 4 + 4;
        }

        // Summary
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        checkPage(10);
        doc.text(`Biases Detected: ${analysisResult.biases.length}`, 20, y);
        y += 5;

        if (analysisResult.biases.length > 0) {
          const avgConf = analysisResult.biases.reduce((s, b) => s + b.confidence, 0) / analysisResult.biases.length;
          doc.text(`Average Confidence: ${(avgConf * 100).toFixed(1)}%`, 20, y);
          y += 5;
        }

        // Sentiment
        if (analysisResult.sentiment) {
          checkPage(15);
          doc.setFont("helvetica", "bold");
          doc.text(`Sentiment: ${analysisResult.sentiment.overall.toUpperCase()}`, 20, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`Valence: ${analysisResult.sentiment.valence.toFixed(2)} | Arousal: ${analysisResult.sentiment.arousal.toFixed(2)} | Dominance: ${analysisResult.sentiment.dominance.toFixed(2)}`, 20, y);
          y += 5;
          if (analysisResult.sentiment.emotions.length > 0) {
            doc.text(`Emotions: ${analysisResult.sentiment.emotions.join(", ")}`, 20, y);
            y += 5;
          }
        }

        // NLP Metrics
        if (analysisResult.nlpMetrics) {
          checkPage(15);
          y += 3;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("NLP Metrics:", 20, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`Reading Level: ${analysisResult.nlpMetrics.readingLevel}`, 20, y); y += 4;
          doc.text(`Emotional Intensity: ${(analysisResult.nlpMetrics.emotionalIntensity * 100).toFixed(0)}%`, 20, y); y += 4;
          doc.text(`Logical Coherence: ${(analysisResult.nlpMetrics.logicalCoherence * 100).toFixed(0)}%`, 20, y); y += 4;
          doc.text(`Cognitive Complexity: ${analysisResult.nlpMetrics.cognitiveComplexity}`, 20, y); y += 4;
          if (analysisResult.nlpMetrics.persuasionTactics.length > 0) {
            doc.text(`Persuasion Tactics: ${analysisResult.nlpMetrics.persuasionTactics.join(", ")}`, 20, y); y += 4;
          }
        }

        y += 5;

        // Each bias
        analysisResult.biases.forEach((bias, i) => {
          checkPage(35);
          doc.setDrawColor(200);
          doc.setLineWidth(0.2);
          doc.line(20, y, w - 20, y);
          y += 5;

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${i + 1}. ${bias.biasType}`, 20, y);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`Confidence: ${(bias.confidence * 100).toFixed(0)}% | Severity: ${bias.severity || "N/A"}`, w - 20, y, { align: "right" });
          y += 6;

          const expLines = doc.splitTextToSize(bias.explanation, w - 40);
          checkPage(expLines.length * 4 + 10);
          doc.text(expLines, 20, y);
          y += expLines.length * 4 + 2;

          if (bias.triggers.length > 0) {
            doc.setFont("helvetica", "italic");
            doc.text(`Triggers: ${bias.triggers.join(", ")}`, 20, y);
            doc.setFont("helvetica", "normal");
            y += 5;
          }

          if (bias.reframe) {
            checkPage(10);
            doc.setFont("helvetica", "bold");
            doc.text("Reframe:", 20, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            const rfLines = doc.splitTextToSize(bias.reframe, w - 40);
            doc.text(rfLines, 20, y);
            y += rfLines.length * 4 + 2;
          }
          y += 3;
        });

        // Overall Insight
        if (analysisResult.overallInsight) {
          checkPage(20);
          y += 3;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("AI Psychological Insight:", 20, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const insightLines = doc.splitTextToSize(analysisResult.overallInsight, w - 40);
          doc.text(insightLines, 20, y);
          y += insightLines.length * 4 + 5;
        }
      }

      // === CORRECTION SECTION ===
      if (correctionResult) {
        checkPage(20);
        doc.setDrawColor(60, 180, 220);
        doc.setLineWidth(0.5);
        doc.line(20, y, w - 20, y);
        y += 10;

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(analysisResult ? "2. Bias Correction Results" : "Bias Correction Results", 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Original Text:", 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const origLines = doc.splitTextToSize(correctionResult.original, w - 40);
        checkPage(origLines.length * 4 + 5);
        doc.text(origLines, 20, y);
        y += origLines.length * 4 + 4;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Corrected Text:", 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const corrLines = doc.splitTextToSize(correctionResult.corrected, w - 40);
        checkPage(corrLines.length * 4 + 5);
        doc.text(corrLines, 20, y);
        y += corrLines.length * 4 + 4;

        // Scores
        checkPage(12);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Objectivity Before: ${Math.round(correctionResult.objectivity_score_before * 100)}%`, 20, y);
        doc.text(`Objectivity After: ${Math.round(correctionResult.objectivity_score_after * 100)}%`, w / 2, y);
        y += 8;

        // Changes
        if (correctionResult.changes.length > 0) {
          checkPage(10);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`Changes (${correctionResult.changes.length}):`, 20, y);
          y += 6;

          correctionResult.changes.forEach((ch, i) => {
            checkPage(18);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`${i + 1}. "${ch.original_phrase}" -> "${ch.corrected_phrase}"`, 22, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
            doc.text(`[${ch.bias_type}]`, 22, y);
            y += 4;
            const exLines = doc.splitTextToSize(ch.explanation, w - 46);
            doc.text(exLines, 24, y);
            doc.setTextColor(0);
            y += exLines.length * 4 + 3;
          });
        }

        // Summary
        if (correctionResult.summary) {
          checkPage(15);
          y += 3;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Summary:", 20, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const sumLines = doc.splitTextToSize(correctionResult.summary, w - 40);
          doc.text(sumLines, 20, y);
          y += sumLines.length * 4 + 5;
        }
      }

      // Footer on last page
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`MindTrace AI — Quantum-Inspired Cognitive Bias Detection | Page ${p}/${pageCount}`, w / 2, 290, { align: "center" });
      }

      doc.save(`MindTrace-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  const hasData = !!analysisResult || !!correctionResult;

  return (
    <button
      onClick={generatePDF}
      disabled={!hasData || generating}
      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border disabled:opacity-40 disabled:cursor-not-allowed ${
        isQuantum
          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
      }`}
    >
      {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
      {generating ? "Generating..." : "Export PDF Report"}
    </button>
  );
};

export default PDFExport;
