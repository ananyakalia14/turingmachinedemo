import React from 'react';
import { Layers } from 'lucide-react';
import { TuringMachineDefinition } from '../engine/types';

interface FormalDefinitionProps {
  machine: TuringMachineDefinition;
  currentState: string;
}

export const FormalDefinition: React.FC<FormalDefinitionProps> = ({
  machine,
  currentState,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col gap-4 transition-colors">
      {/* Title & 7-Tuple equation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
            Formal 7-Tuple Definition
          </h3>
        </div>
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-800">
          M = (Q, Σ, Γ, δ, q₀, B, F)
        </span>
      </div>

      {/* Grid of Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* States Q */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Q (Finite States):
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              |Q| = {machine.states.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {machine.states.map((st) => {
              const isCurrent = currentState === st;
              const isAccept = machine.acceptStates.includes(st);
              const isReject = machine.rejectStates.includes(st);

              let chipStyle = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
              if (isAccept) chipStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
              else if (isReject) chipStyle = 'bg-red-50 text-red-800 border-red-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
              else if (st === machine.initialState) chipStyle = 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700';

              if (isCurrent) {
                chipStyle += ' ring-2 ring-blue-500 dark:ring-cyan-400 font-bold shadow-sm';
              }

              return (
                <span
                  key={st}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-mono border transition-all ${chipStyle}`}
                >
                  {st}
                  {isCurrent && ' ●'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Input Alphabet Σ */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            Input Alphabet Σ:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {machine.inputAlphabet.map((sym) => (
              <span
                key={sym}
                className="px-2 py-0.5 rounded-md text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-bold"
              >
                '{sym}'
              </span>
            ))}
          </div>
        </div>

        {/* Tape Alphabet Γ */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            Tape Alphabet Γ:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {machine.tapeAlphabet.map((sym) => (
              <span
                key={sym}
                className="px-2 py-0.5 rounded-md text-xs font-mono bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 font-bold"
              >
                '{sym}'
              </span>
            ))}
          </div>
        </div>

        {/* Initial, Blank & Final States */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Start (q₀):</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-bold">
              {machine.initialState}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Blank (B):</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold">
              '{machine.blankSymbol}'
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Accept (F):</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-bold">
              {machine.acceptStates.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
