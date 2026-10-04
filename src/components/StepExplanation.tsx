import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ArrowRight, Lightbulb, Compass } from 'lucide-react';
import { StepLogEntry, Transition } from '../engine/types';

interface StepExplanationProps {
  lastEntry: StepLogEntry | null;
  activeTransition: Transition | null;
  currentState: string;
  stepCount: number;
  onOpenWhy: () => void;
}

export const StepExplanation: React.FC<StepExplanationProps> = ({
  lastEntry,
  activeTransition,
  currentState,
  stepCount,
  onOpenWhy,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl bg-slate-900/70 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              What Is Happening?
            </h3>
          </div>
          <button
            onClick={onOpenWhy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 transition-all shadow-sm group"
            title="Deep dive into the algorithmic reasoning of this step"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Why this transition?</span>
          </button>
        </div>

        {/* Dynamic Explanation Content */}
        <AnimatePresence mode="wait">
          {lastEntry ? (
            <motion.div
              key={lastEntry.step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  Step {lastEntry.step}
                </span>
                <span className="text-xs text-slate-400">
                  State change: <span className="font-mono text-cyan-300">{lastEntry.fromState}</span> → <span className="font-mono text-purple-300">{lastEntry.toState}</span>
                </span>
              </div>

              {/* Natural language sentences */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                {lastEntry.explanation}
              </p>

              {/* Mathematical Equation Chip */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">FORMAL δ:</span>
                  <span className="text-sm sm:text-base font-bold text-cyan-400">
                    {lastEntry.formalEquation}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span>Move:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-bold border border-slate-800">
                    {lastEntry.move}
                  </span>
                </div>
              </div>

              {/* Rationale hint */}
              {lastEntry.reasoning && (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex items-start gap-2">
                  <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="italic">{lastEntry.reasoning}</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="py-6 text-center text-slate-400 space-y-2">
              <p className="text-sm">Simulation is currently at initial state <span className="font-mono text-cyan-300">{currentState}</span>.</p>
              <p className="text-xs text-slate-500">
                Press <strong className="text-cyan-400">Step</strong> or <strong className="text-cyan-400">Start</strong> to witness the first transition and learn how the head marks the tape!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
