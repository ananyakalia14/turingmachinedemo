import React from 'react';
import { Workflow, CheckCircle } from 'lucide-react';
import { TuringMachineDefinition } from '../engine/types';

interface AlgorithmicFlowProps {
  machine: TuringMachineDefinition;
  currentState: string;
}

export const AlgorithmicFlow: React.FC<AlgorithmicFlowProps> = ({
  machine,
  currentState,
}) => {
  const guide = machine.explanationGuide;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col gap-3 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
            {guide.title}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
          Marking Strategy
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {guide.steps.map((item, idx) => {
          let isCardActive = false;
          if (machine.id === 'anbn') {
            if (idx === 0 && currentState === 'q0') isCardActive = true;
            if (idx === 1 && currentState === 'q1') isCardActive = true;
            if (idx === 2 && currentState === 'q2') isCardActive = true;
            if (idx === 3 && (currentState === 'q3' || currentState === 'q_accept')) isCardActive = true;
          }

          return (
            <div
              key={item.step}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isCardActive
                  ? 'bg-blue-50 dark:bg-slate-900 border-blue-500 dark:border-cyan-500 ring-2 ring-blue-500/20 shadow-sm scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Phase {item.step}
                  </span>
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                    style={{ backgroundColor: `${item.color}25`, color: item.color }}
                  >
                    {item.iconSymbol}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug font-sans">
                  {item.desc}
                </p>
              </div>

              {isCardActive && (
                <div className="mt-2.5 pt-2 border-t border-blue-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-cyan-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                  <span>Currently active phase</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Acceptance criterion banner */}
      <div className="mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Termination Criteria:</span>
        </div>
        <span className="text-emerald-700 dark:text-emerald-300 font-bold">
          All symbols verified & paired → HALT IN ACCEPT
        </span>
      </div>
    </div>
  );
};
