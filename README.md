# MindTrace AI — Quantum-Inspired Cognitive Bias Detection System

> **Mapping the Hidden Patterns of Human Thought.**

MindTrace AI is a quantum-inspired cognitive analysis system that detects hidden reasoning biases in human language. By combining transformer-based NLP models with cognitive bias theory and explainable AI techniques, it provides deep insights into how people reason, argue, and interpret experiences.

---

## 🧠 What is MindTrace AI?

MindTrace AI analyzes text — essays, debates, social media posts, news articles — and identifies **20+ cognitive biases** including Overgeneralization, Emotional Reasoning, Confirmation Bias, Dunning-Kruger Effect, Ad Hominem, Sunk Cost Fallacy, and more. Each detection includes confidence scores, severity levels, trigger phrases, and human-readable explanations.

---

## 🏗️ System Architecture

```
User Input (Text / Debate / Essay)
        │
        ▼
Text Preprocessing (Tokenization, Lemmatization, Sentence Segmentation)
        │
        ▼
Multilingual Translation Layer (13 Indian Languages + English)
        │
        ▼
Embedding Layer (Sentence Transformer — 768-d Semantic Vectors)
        │
        ▼
Bias Classification Core (RoBERTa / Gemini Fine-Tuned Transformer)
        │
   ┌────┴────┐
   ▼         ▼
Quantum    Reasoning
Bias       Analyzer
Model      (Argument Mining, Cause-Effect Chains)
   │         │
   └────┬────┘
        ▼
Cognitive Bias Knowledge Graph (Nodes: Bias Types, Edges: Interactions)
        │
        ▼
Explanation Generator (LLM + Attention Highlighting + Trigger Detection)
        │
        ▼
Visualization Engine (Heatmap, Timeline, Reasoning Graph, Sentiment)
        │
        ▼
Output (Bias Type, Confidence, Severity, Explanation, Highlighted Text)
```

---

## ✨ Core Features

### 1. Advanced Bias Detection
- **20+ cognitive bias types** with confidence scoring and severity classification (low / medium / high)
- Trigger phrase identification with contextual explanations
- Powered by AI transformer models (Google Gemini via Lovable AI Gateway)

### 2. Quantum-Inspired Bias Modeling
- **Bias Superposition** — sentences exist in multiple bias states simultaneously
- **Bias Entanglement** — visualizes how biases co-occur and influence each other
- **Probability Collapse** — simulates how analysis resolves ambiguous bias states

### 3. NLP Metrics Dashboard
- Word count, sentence count, average sentence length
- Lexical diversity (Type-Token Ratio)
- Reading level estimation (Flesch-Kincaid)
- Logical coherence scoring

### 4. Sentiment Analysis (VAD Model)
- **Valence** — positive vs. negative emotional tone
- **Arousal** — intensity of emotional activation
- **Dominance** — sense of control in language
- Emotion detection (joy, anger, fear, sadness, surprise, disgust)

### 5. Bias Intensity Heatmap
- Sentence-by-sentence bias mapping
- Color-coded intensity visualization per bias type
- Overall intensity aggregation bars

### 6. Bias Evolution Timeline
- Tracks how biases shift across sentences in long-form text
- Vertical timeline with confidence indicators
- Useful for essay and debate analysis

### 7. Reasoning Graph
- Canvas-based visualization of **Event → Inference → Prediction** chains
- Bias labels on reasoning edges
- Shows logical structure of arguments

### 8. Attention Highlights
- Transformer-style attention weight visualization
- Highlights specific trigger words with opacity-based intensity
- Hover tooltips showing bias type and weight

### 9. Bias Entanglement Graph
- Knowledge graph showing relationships between detected biases
- Interactive node-edge visualization
- Demonstrates bias co-occurrence patterns

### 10. Debate Analyzer
- Parses multi-speaker transcripts (`Speaker A: ...`)
- Compares logical vs. emotional reasoning per speaker
- Individual bias breakdowns with comparative scoring

### 11. Multilingual Support
- **13 Indian languages**: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Sanskrit
- Auto-translation to English before analysis
- Native-language example prompts

### 12. Dual Theme System
- **Neural Theme** — dark navy + cyan aesthetic (research lab style)
- **Quantum Theme** — purple + violet aesthetic (quantum computing style)
- Animated neural network background that adapts to theme

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| Primary Background | `#0B132B` (Deep Navy) |
| Accent Blue | `#3A86FF` (AI Intelligence) |
| Neural Cyan | `#00E5FF` (Neural Signals) |
| Quantum Purple | `#8338EC` (Quantum Reasoning) |
| Highlight | `#FFBE0B` (Attention) |
| Heading Font | Space Grotesk |
| Body Font | Inter |
| Code Font | JetBrains Mono |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| UI Components | shadcn/ui, Radix UI |
| Charts | Recharts, Canvas API |
| Backend | Lovable Cloud (Supabase Edge Functions) |
| AI Models | Google Gemini (via Lovable AI Gateway) |
| State Management | TanStack React Query |
| Routing | React Router v6 |

---

## 📊 Research Contribution

This project contributes to the intersection of:

- **Natural Language Processing** — transformer-based bias classification
- **Cognitive Psychology** — Beck's Cognitive Therapy framework for distortion identification
- **Quantum Cognition** — applying quantum probability models to human reasoning
- **Explainable AI (XAI)** — attention visualization, trigger detection, reasoning chain analysis

### Theoretical Frameworks
- Beck's Cognitive Distortion Theory (1976)
- Quantum Cognition Models (Busemeyer & Bruza, 2012)
- Transformer Attention Mechanisms (Vaswani et al., 2017)
- Explainable AI principles (SHAP, LIME, Attention Visualization)

---

## 🔮 Future Work

| Feature | Description |
|---------|-------------|
| **Speech-Based Detection** | Whisper/Speech Transformers for spoken bias analysis in debates, interviews, therapy |
| **Social Media Monitoring** | Real-time bias detection on Twitter, Reddit, news comments |
| **Bias Correction Assistant** | AI-powered rewriting of biased text into neutral, objective versions |
| **Cognitive Bias Dataset** | Custom dataset creation pipeline: collect → extract → label → train → publish |
| **SHAP/LIME Integration** | Model-agnostic explanation tools for deeper interpretability |
| **Psychological Insight Module** | Mental health journaling, self-reflection tools, cognitive therapy support (insights only) |
| **Extended Multilingual Support** | Spanish, French, Arabic, Chinese, Japanese, Korean |

---

## 🚀 Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd mindtrace-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 📄 License

This project is developed as an academic research prototype. All rights reserved.

---

## 🙏 Acknowledgments

Built with [Lovable](https://lovable.dev) — AI-powered full-stack development platform.

---

*MindTrace AI — Quantum-Inspired Cognitive Bias Detection using Transformer-based NLP Models*
