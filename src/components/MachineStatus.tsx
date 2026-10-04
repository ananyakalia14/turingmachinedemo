import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Play, Pause, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MachineStatus as StatusType, TuringMachineDefinition } from '../engine/types';

interface MachineStatusProps {
  status: StatusType;
  machine: TuringMachineDefinition;
  inputString: string;
  stepCount: number;
}

export const MachineStatus: React.FC<MachineStatusProps> = ({
  status,
  machine,
  inputString,
  stepCount,
}) => {
  useEffect(() => {
    if (status === 'ACCEPTED') {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#16a34a', '#2563eb', '#7c3aed', '#d97706'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [status]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'ACCEPTED' && (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                    ACCEPTED ✓
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                    Halted in accept state after {stepCount} steps
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-white mt-1 font-mono">
                  {inputString || 'ε'} ∈ {machine.language}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200/90 mt-0.5">
                  {machine.id === 'anbn'
                    ? 'All symbols were paired in exact 1-to-1 correspondence. Equal number of a\'s and b\'s verified!'
                    : machine.id === 'palindrome'
                    ? 'String matches its reverse symmetrically. Palindrome verified!'
                    : machine.id === 'unaryIncrement'
                    ? 'Unary addition complete. Incremented value successfully output on tape.'
                    : 'The Turing Machine successfully processed the input and halted in an accept state.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'REJECTED' && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-4 rounded-xl bg-red-50 dark:bg-red-950/80 border-2 border-red-500 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg">
                <XCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                    REJECTED ✕
                  </span>
                  <span className="text-xs text-red-700 dark:text-red-300 font-mono">
                    Halted in reject state after {stepCount} steps
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-red-900 dark:text-white mt-1 font-mono">
                  {inputString || 'ε'} ∉ {machine.language}
                </h3>
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-200/90 mt-0.5">
                  The input string violates the formal language grammar or reached an undefined transition rule.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'RUNNING' && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-600/40 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-300">
                SIMULATION RUNNING
              </span>
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
              Executing transitions...
            </span>
          </motion.div>
        )}

        {status === 'PAUSED' && (
          <motion.div
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                SIMULATION PAUSED
              </span>
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
              Press Step or Play to proceed
            </span>
          </motion.div>
        )}

        {status === 'READY' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
              <span className="text-slate-900 dark:text-cyan-300 font-bold uppercase tracking-wider">READY TO RUN</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Press <strong className="text-blue-600 dark:text-cyan-400">Play ▶</strong> or <strong className="text-blue-600 dark:text-cyan-400">Step ▶|</strong> on the timeline below
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
