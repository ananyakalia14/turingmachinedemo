import React, { useState } from 'react';
import { Table, Sparkles } from 'lucide-react';
import { TuringMachineDefinition, Transition } from '../engine/types';

interface TransitionTableProps {
  machine: TuringMachineDefinition;
  activeTransition: Transition | null;
  currentState: string;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  machine,
  activeTransition,
  currentState,
}) => {
  const [filterState, setFilterState] = useState<string>('all');

  const filteredTransitions = machine.transitions.filter((t) => {
    if (filterState === 'all') return true;
    if (filterState === 'active') return t.currentState === currentState;
    return t.currentState === filterState;
  });

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
            Transition Function (δ: Q × Γ → Q × Γ × &#123;L, R, N&#125;)
          </h3>
        </div>

        {/* Filter by state */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono">Filter State:</span>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 font-mono focus:outline-none"
          >
            <option value="all">All States ({machine.transitions.length})</option>
            <option value="active">Active State ({currentState})</option>
            {machine.states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Current State</th>
              <th className="py-2.5 px-3">Read (Γ)</th>
              <th className="py-2.5 px-3">Write (Γ)</th>
              <th className="py-2.5 px-3">Move (D)</th>
              <th className="py-2.5 px-3">Next State</th>
              <th className="py-2.5 px-4 hidden md:table-cell">Algorithmic Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
            {filteredTransitions.map((t, idx) => {
              const isActive =
                activeTransition !== null &&
                activeTransition.currentState === t.currentState &&
                activeTransition.readSymbol === t.readSymbol &&
                activeTransition.nextState === t.nextState;

              const isFromCurrentState = t.currentState === currentState;

              return (
                <tr
                  key={`${t.currentState}-${t.readSymbol}-${t.nextState}-${idx}`}
                  className={`transition-colors ${
                    isActive
                      ? 'active-transition-row font-bold text-blue-900 dark:text-cyan-300'
                      : isFromCurrentState
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-1.5">
                    {isActive && (
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                    )}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{t.currentState}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                      '{t.readSymbol}'
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-purple-700 dark:text-purple-300 font-semibold">
                      '{t.writeSymbol}'
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        t.moveDirection === 'R'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          : t.moveDirection === 'L'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {t.moveDirection}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        t.nextState === 'q_accept'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : t.nextState === 'q_reject'
                          ? 'text-red-600 dark:text-rose-400'
                          : 'text-blue-700 dark:text-cyan-300'
                      }`}
                    >
                      {t.nextState}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] font-sans hidden md:table-cell truncate max-w-xs">
                    {t.description || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
