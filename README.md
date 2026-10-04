# Turing Machine Visual Simulator
### *Interactive Simulation of Turing Machines with Transition Function, Hierarchical State Diagram, and Tape Execution*

An academic educational apparatus engineered for students and educators in **Theory of Computation**, **Formal Languages & Automata**, and **Computer Engineering**.

The simulator provides a 100% mathematically rigorous, real-time visual simulation of a standard 7-tuple deterministic Turing Machine:
$$M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)$$

---

## 🌟 Key Refinements & New Features

1. **Light Theme as Default**:
   - Opens by default in a clean, high-contrast academic **Light Theme** (warm white/slate background, crisp white cards, dark navy typography, blue/purple accents).
   - Instant **Theme Toggle** in header: `☀ Light` / `🌙 Dark` with full application persistence.

2. **Clean Hierarchical State Diagram (Zero Overlaps)**:
   - Completely redesigned automaton layout with **minimized edge crossings**.
   - **Non-colliding transition labels**: Each transition group (`a / X, R`) has dedicated coordinates and clean background pills that never intersect arrows or nodes.
   - **Compact directional self-loops**: Positioned neatly on designated edges (top, bottom, left) without stacking collisions.
   - **Teaching descriptions under states**: Clear pedagogical notes under each node ($q_0$: "Find next a", $q_1$: "Find matching b", $q_2$: "Return left", $q_3$: "Verify remaining", $q_{\text{accept}}$: "Accept ✓", $q_{\text{reject}}$: "Reject ✕").
   - **Selective transition animation**: Calm when idle; only the executing transition arrow receives strong animation and glow.

3. **Real Independent Machines**:
   - Switching problems completely swaps:
     1. Formal 7-tuple definition
     2. Finite state set $Q$
     3. Input alphabet $\Sigma$ and tape alphabet $\Gamma$
     4. Transition function table $\delta$
     5. State transition graph
     6. Preset examples
     7. Tape initialization and simulation logic
     8. Step-by-step educational explanations
     9. Acceptance and rejection criteria

4. **Turing Machine Question Bank**:
   - **Basic**:
     - $a^n b^n$ ($L = \{ a^n b^n \mid n \ge 1 \}$) [Ready]
     - Unary Increment ($x \to x + 1$) [Ready]
     - Equal number of 0s and 1s ($N_0(w) = N_1(w)$) [Ready]
     - Even number of 1s (Parity checking) [Ready]
   - **Intermediate**:
     - Binary Palindrome ($w = w^R$) [Ready]
     - $a^n b^{2n}$ [Ready]
     - $a^n b^n c^n$ [Coming Soon]
   - **Advanced**:
     - String Copy ($w \to w w$) [Coming Soon]
     - Binary Addition ($A + B$) [Coming Soon]
     - Binary Subtraction ($A - B$) [Coming Soon]

5. **Build Your Own Machine (Custom TM Builder)**:
   - Full in-browser editor allowing teachers and students to define custom states, alphabets, initial/accept/reject states, and transition rules ($\delta(q, \sigma) \to (q', \sigma', D)$).
   - Instantly compiles into an interactive tape, state diagram, and transition table!

6. **Clean Initial State (Never Starts Accepted)**:
   - Loading any machine or input starts strictly in **`READY TO RUN`** at Step 0, with un-processed input on tape and head at index 0.

7. **🎬 Live Teaching Theater Mode**:
   - Fullscreen projection view for lecture halls with Question Selector, Input Selector, Play/Pause, Step Forward/Backward, Speed Slider, Tape, Head, Transition Formula, and State Diagram.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

Then visit [http://localhost:3000](http://localhost:3000) in your web browser.
