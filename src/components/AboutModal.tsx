import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, GraduationCap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 max-h-[90vh] flex flex-col transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-950/80 border border-blue-200 dark:border-cyan-800 text-blue-600 dark:text-cyan-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Turing Machine Simulator Guide
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Theory of Computation & Automata Reference
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto text-sm leading-relaxed">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-950 dark:text-blue-200">
              <h4 className="font-bold text-blue-900 dark:text-white mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                The Universal Computational Model (1936)
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Conceived by Alan Turing in 1936, the Turing Machine is the fundamental mathematical archetype of all digital computing. Despite having only a finite state control, an infinite tape, and a read/write head, any algorithm computable by supercomputers or neural networks can be simulated by a Turing Machine (Church-Turing Thesis).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono mb-2">
                The Formal 7-Tuple Definition
              </h4>
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div><strong className="text-blue-600 dark:text-cyan-400">Q</strong>: Finite set of internal states</div>
                <div><strong className="text-blue-600 dark:text-cyan-400">Σ</strong>: Finite input alphabet (excluding blank symbol B)</div>
                <div><strong className="text-blue-600 dark:text-cyan-400">Γ</strong>: Finite tape alphabet (where Σ ⊂ Γ, and B ∈ Γ)</div>
                <div><strong className="text-blue-600 dark:text-cyan-400">δ</strong>: Transition function: Q × Γ → Q × Γ × &#123;L, R, N&#125;</div>
                <div><strong className="text-blue-600 dark:text-cyan-400">q₀</strong>: Initial start state (q₀ ∈ Q)</div>
                <div><strong className="text-blue-600 dark:text-cyan-400">B</strong>: Blank symbol representing unwritten cells</div>
                <div><strong className="text-blue-600 dark:text-cyan-400">F</strong>: Set of final halting accept states (F ⊆ Q)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-slate-200">Teaching Tip:</strong> Use the <strong className="text-blue-600 dark:text-cyan-400">Step</strong> button to advance atomic transitions one by one, and press <strong className="text-blue-600 dark:text-cyan-400">Prev</strong> to reverse step and review preceding tape configurations with students.
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
