# Universal Computation Unit (UTM Simulator)
### *AI-Inspired Computation Using the Universal Turing Machine Model*

An interactive, academic-grade web apparatus demonstrating Alan Turing's groundbreaking 1936 concept of **Universal Computation** and its direct architectural lineage to modern Artificial Intelligence.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fananyakalia14%2Fturingmachinedemo)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-ready%20for%20deployment-success.svg)

---

## 💡 The Core Thesis

> **"One machine. Different encoded programs. Different computations."**

In 1936, Alan Turing proved that instead of building dedicated physical circuitry for every distinct mathematical or logical problem, one could build a **single invariant universal machine** $U$. By encoding a program $\langle M \rangle$ and its data $w$ onto a shared memory medium (the tape), $U(\langle M \rangle, w) = M(w)$.

This simulator illustrates the profound connection between:
- **Turing's Invariant Universal Machine** $\longleftrightarrow$ **General-Purpose Hardware (CPUs / GPUs / TPUs)**
- **Encoded Turing Table on Tape** $\longleftrightarrow$ **Software Code / Neural Network Weights**
- **Tape Input & Output** $\longleftrightarrow$ **Inference Tokens, Prompts & Predictions**

---

## ✨ Features

- 📼 **Interactive Tape Visualizer**: Bidirectional infinite tape with head animation, live read/write indicators, and cell markers.
- ⚙️ **Dual Program Demonstrations**:
  - **Program A (Symbol Shift)**: Demonstrates fundamental data movement with state-carried bit propagation and tape rewind.
  - **Program B (XOR Cryptographic Transform)**: Multi-track bitwise XOR between an input binary stream and a cryptographic key.
- 🎓 **3-Phase Guided University Examination Demo**:
  - **Phase 1**: Execute Program A — Symbol Shift.
  - **Phase 2**: Reconfigure Program Memory — Hot-swap encoded instructions to Program B while proving hardware invariants remain unchanged.
  - **Phase 3**: Execute Program B — XOR Transform, verifying the Universal Architecture.
- 🎙️ **Presenter Cues**: Integrated rehearsal scripts and physical presentation pointers designed for seamless academic presentations.
- 📐 **Universal Mode (UTM Mode)**: Shows explicit UTM encoding ($\langle M \rangle \# w$) simulated directly on a virtual universal interpreter.
- 🖥️ **Presentation Mode**: Minimalist high-contrast full-screen HUD optimized for lecture hall projection and screen shares.
- 📊 **Dynamic State Transition Register**: Real-time inspection of formal 7-tuple state transitions $\delta(q, \sigma) \to (q', \sigma', D)$.

---

## 🚀 Live Deployment on Vercel

This repository is pre-configured with `vercel.json` for zero-configuration, lightning-fast deployment on [Vercel](https://vercel.com):

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub account and import `ananyakalia14/turingmachinedemo`.
3. Keep default settings (Framework Preset: **Other** / Root Directory: `./`).
4. Click **Deploy**.

Alternatively, install the Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

## 💻 Running Locally

No build tools or bundlers required! The project uses native ES6+, vanilla CSS, and standard HTML5.

### Option 1: Using Python
```bash
# Python 3
python -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

### Option 2: Using Node / npx
```bash
npx serve .
# or
npm start
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 📂 Project Structure

```
├── index.html       # Semantic HTML5 single-page application layout & UI controls
├── styles.css       # Responsive dark academic-grade design system & animations
├── script.js        # Formal Turing Machine simulation engine, state machine, & UI controller
├── vercel.json      # Vercel deployment configuration & security headers
├── package.json     # Project metadata and quick-start scripts
└── README.md        # Documentation and academic context
```

---

## 📜 Academic Attribution

Designed for 3rd-Year Computer Engineering & Theory of Computation curricula:
- **Course**: Theory of Computation / Formal Languages and Automata (COMP-ENG 301)
- **Concept**: Universal Turing Machine ($M_U$), Alan Turing (1936)
- **Author**: Ananya Kalia ([@ananyakalia14](https://github.com/ananyakalia14))
