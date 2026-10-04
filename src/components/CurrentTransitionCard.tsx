import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Transition } from '../engine/types';

interface CurrentTransitionCardProps {
  activeTransition: Transition | null;
  currentState: string;
  readSymbol: string;
}

export const CurrentTransitionCard: React.FC<CurrentTransitionCardProps> = ({
  activeTransition,
  currentState,
  readSymbol,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 font-mono">
            Current Transition
          </h3>
        </div>
        <span className="text-[10px] font-mono text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-800/60 font-semibold">
          δ(q, σ) → (q', σ', D)
        </span>
      </div>

      {/* Main Equation */}
      <div className="bg-slate-50 dark:bg-slate-950/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800/90 text-center mb-3">
        <AnimatePresence mode="wait">
          {activeTransition ? (
            <motion.div
              key={
                activeTransition.currentState +
                activeTransition.readSymbol +
                activeTransition.nextState +
                activeTransition.writeSymbol
              }
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="text-base sm:text-lg font-mono font-bold text-blue-600 dark:text-cyan-300"
            >
              δ({activeTransition.currentState}, '{activeTransition.readSymbol}') = (
              {activeTransition.nextState}, '{activeTransition.writeSymbol}',{' '}
              {activeTransition.moveDirection})
            </motion.div>
          ) : (
            <div className="text-sm font-mono text-slate-500 py-1">
              Ready at initial state [{currentState}], scanning '{readSymbol}'
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 4 Parameter Grid: READ, WRITE, MOVE, NEXT STATE */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
        {/* READ */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
            READ
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
            '{activeTransition ? activeTransition.readSymbol : readSymbol}'
          </span>
        </div>

        {/* WRITE */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
            WRITE
          </span>
          <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
            '{activeTransition ? activeTransition.writeSymbol : '—'}'
          </span>
        </div>

        {/* MOVE */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
            MOVE
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1 mt-0.5">
            {activeTransition ? (
              activeTransition.moveDirection === 'R' ? (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>RIGHT</span>
                </>
              ) : activeTransition.moveDirection === 'L' ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>LEFT</span>
                </>
              ) : (
                <span>STAY</span>
              )
            ) : (
              '—'
            )}
          </span>
        </div>

        {/* NEXT STATE */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
            NEXT STATE
          </span>
          <span
            className={`text-sm font-bold ${
              activeTransition?.nextState === 'q_accept'
                ? 'text-emerald-600 dark:text-emerald-400'
                : activeTransition?.nextState === 'q_reject'
                ? 'text-red-600 dark:text-rose-400'
                : 'text-blue-600 dark:text-cyan-300'
            }`}
          >
            {activeTransition ? activeTransition.nextState : currentState}
          </span>
        </div>
      </div>
    </div>
  );
};
