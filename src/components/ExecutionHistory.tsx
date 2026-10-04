import React, { useState } from 'react';
import { History, Eye } from 'lucide-react';
import { StepLogEntry } from '../engine/types';

interface ExecutionHistoryProps {
  history: StepLogEntry[];
  onSelectStep?: (entry: StepLogEntry) => void;
}

export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  history,
  onSelectStep,
}) => {
  const [inspectedStep, setInspectedStep] = useState<StepLogEntry | null>(null);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col transition-colors">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
            Execution History Log
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          Steps Recorded: <strong className="text-blue-600 dark:text-cyan-400">{history.length}</strong>
        </span>
      </div>

      {history.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-mono">
          No transitions executed yet. Step or Play the machine to record execution history.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-right">Step</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Read</th>
                <th className="py-2.5 px-3">Write</th>
                <th className="py-2.5 px-3">Move</th>
                <th className="py-2.5 px-3">Next State</th>
                <th className="py-2.5 px-4">Instantaneous Description (ID)</th>
                <th className="py-2.5 px-2 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {history.map((entry, idx) => {
                const isNewest = idx === 0;
                return (
                  <tr
                    key={entry.step}
                    onClick={() => {
                      setInspectedStep(entry);
                      if (onSelectStep) onSelectStep(entry);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isNewest
                        ? 'bg-blue-50/80 dark:bg-cyan-950/30 text-blue-900 dark:text-cyan-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-2 px-3 text-right text-slate-500 font-bold">
                      {entry.step}
                    </td>
                    <td className="py-2 px-3 text-blue-600 dark:text-blue-400 font-bold">
                      {entry.fromState}
                    </td>
                    <td className="py-2 px-3">'{entry.readSymbol}'</td>
                    <td className="py-2 px-3 text-purple-700 dark:text-purple-300 font-bold">
                      '{entry.writeSymbol}'
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          entry.move === 'R'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : entry.move === 'L'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {entry.move}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-blue-600 dark:text-cyan-300">
                      {entry.toState}
                    </td>
                    <td className="py-2 px-4 text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate max-w-xs">
                      {entry.instantaneousDescription}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedStep(entry);
                        }}
                        className="p-1 hover:text-blue-600 dark:hover:text-cyan-300 transition-colors text-slate-400"
                        title="Inspect step details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspected Step Modal / Detail Drawer */}
      {inspectedStep && (
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center justify-between text-blue-700 dark:text-cyan-300 font-bold">
            <span>Inspecting Step #{inspectedStep.step} Snapshot</span>
            <button
              onClick={() => setInspectedStep(null)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-900"
            >
              ✕ Close
            </button>
          </div>
          <div className="text-slate-700 dark:text-slate-300 font-sans">
            {inspectedStep.explanation}
          </div>
          <div className="bg-white dark:bg-slate-900 p-2 rounded text-blue-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-800">
            {inspectedStep.formalEquation}
          </div>
        </div>
      )}
    </div>
  );
};
