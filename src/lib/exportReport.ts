import type { AnalysisResult } from "./biasAnalyzer";
import { computeClarityScore } from "@/components/ClarityScore";

export function buildMarkdownReport(result: AnalysisResult): string {
  const date = new Date(result.analyzedAt).toLocaleString();
  const score = computeClarityScore(result);
  const lines: string[] = [];
  lines.push(`# MindTrace Analysis Report`);
  lines.push(`*Generated: ${date}*\n`);
  lines.push(`## Cognitive Clarity Score: ${score}/100\n`);
  lines.push(`## Analyzed Text`);
  lines.push(`> ${result.overallText.replace(/\n/g, "\n> ")}\n`);
  if (result.translatedText) {
    lines.push(`### English Translation`);
    lines.push(`> ${result.translatedText}\n`);
  }
  if (result.sentiment) {
    lines.push(`## Sentiment`);
    lines.push(`- Overall: **${result.sentiment.overall}**`);
    lines.push(`- Valence: ${result.sentiment.valence}`);
    lines.push(`- Arousal: ${result.sentiment.arousal}`);
    lines.push(`- Dominance: ${result.sentiment.dominance}`);
    lines.push(`- Emotions: ${result.sentiment.emotions.join(", ")}\n`);
  }
  if (result.nlpMetrics) {
    lines.push(`## NLP Metrics`);
    lines.push(`- Reading level: ${result.nlpMetrics.readingLevel}`);
    lines.push(`- Emotional intensity: ${result.nlpMetrics.emotionalIntensity}/100`);
    lines.push(`- Logical coherence: ${result.nlpMetrics.logicalCoherence}/100`);
    lines.push(`- Cognitive complexity: ${result.nlpMetrics.cognitiveComplexity}`);
    if (result.nlpMetrics.persuasionTactics?.length)
      lines.push(`- Persuasion tactics: ${result.nlpMetrics.persuasionTactics.join(", ")}`);
    lines.push("");
  }
  lines.push(`## Detected Biases (${result.biases.length})\n`);
  result.biases.forEach((b, i) => {
    lines.push(`### ${i + 1}. ${b.biasType}`);
    lines.push(`- **Confidence:** ${(b.confidence * 100).toFixed(0)}%`);
    if (b.severity) lines.push(`- **Severity:** ${b.severity}`);
    lines.push(`- **Triggers:** ${b.triggers.join(", ")}`);
    lines.push(`- **Explanation:** ${b.explanation}`);
    if (b.reasoning) lines.push(`- **Reasoning:** ${b.reasoning}`);
    if (b.reframe) lines.push(`- **Healthier reframe:** ${b.reframe}`);
    lines.push("");
  });
  if (result.overallInsight) {
    lines.push(`## Overall Psychological Insight`);
    lines.push(result.overallInsight);
  }
  lines.push(`\n---\n*Powered by MindTrace AI · Quantum-Inspired Cognitive Bias Detection*`);
  return lines.join("\n");
}

export function downloadReport(result: AnalysisResult) {
  const md = buildMarkdownReport(result);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindtrace-report-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyReport(result: AnalysisResult) {
  const md = buildMarkdownReport(result);
  await navigator.clipboard.writeText(md);
}
