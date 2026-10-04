import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Lightbulb } from 'lucide-react';
import { Transition, StepLogEntry } from '../engine/types';

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTransition: Transition | null;
  lastEntry: StepLogEntry | null;
  currentState: string;
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  lastEntry,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-950/80 border border-blue-200 dark:border-cyan-800 text-blue-600 dark:text-cyan-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Why Did the Machine Make This Transition?
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  State Machine Rationale & Invariant Preservation
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
          <div className="p-6 space-y-4 text-sm font-sans">
            {lastEntry ? (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
                  <div className="text-blue-600 dark:text-cyan-400 font-bold text-sm">
                    {lastEntry.formalEquation}
                  </div>
                  <div className="text-slate-500">
                    Step #{lastEntry.step} | Reading '{lastEntry.readSymbol}' in State {lastEntry.fromState}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                    <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    Algorithmic Intent
                  </h4>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    {lastEntry.reasoning || lastEntry.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Why write '{lastEntry.writeSymbol}'?
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 mt-1 block">
                      {lastEntry.writeSymbol === 'X'
                        ? 'Marks the symbol as processed so it will never be counted again.'
                        : lastEntry.writeSymbol === 'Y'
                        ? 'Marks the matching partner as paired with the preceding marker.'
                        : 'Preserves the symbol invariant without altering data.'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Why move {lastEntry.move === 'R' ? 'RIGHT' : lastEntry.move === 'L' ? 'LEFT' : 'STAY'}?
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 mt-1 block">
                      {lastEntry.move === 'R'
                        ? 'Scans forward to find the matching counterpart or boundary.'
                        : lastEntry.move === 'L'
                        ? 'Rewinds back toward the left blank boundary to prepare for next cycle.'
                        : 'Halts motion on termination.'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-center py-4">
                The machine is currently at its initial configuration. Run a step to inspect the transition logic!
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Understood
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
