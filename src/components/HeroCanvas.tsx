import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TuringMachineDefinition, SimulationState, StepLogEntry } from '../engine/types';
import { Tape } from './Tape';
import { CurrentTransitionCard } from './CurrentTransitionCard';
import { MachineStatus } from './MachineStatus';
import { Lightbulb, HelpCircle, Sparkles } from 'lucide-react';

interface HeroCanvasProps {
  machine: TuringMachineDefinition;
  simulation: SimulationState;
  inputString: string;
  totalSteps: number;
  onOpenWhy: () => void;
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({
  machine,
  simulation,
  inputString,
  totalSteps,
  onOpenWhy,
}) => {
  const lastEntry: StepLogEntry | null = simulation.history[0] || null;
  const activeSymbol = simulation.tape[simulation.headIndex]?.symbol || 'B';
  const mathematicalHeadIndex = simulation.tape[simulation.headIndex]?.index ?? simulation.headIndex;

  // Active algorithm phase
  const phases = machine.algorithmPhases || [];
  const currentPhaseId = lastEntry?.phaseName;

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/90 relative overflow-hidden flex flex-col gap-6 transition-colors duration-200">
      {/* Subtle background ambient glow for dark mode */}
      <div className="hidden dark:block absolute -top-32 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* TOP HEADER: Title, Step Counter, and Mental Model Algorithm Phase */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 font-mono">
                SIMULATION CANVAS
              </span>
              <span className="text-xs text-slate-500 font-mono">
                • {machine.language}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
              {machine.formalTitle}
            </h2>
          </div>

          {/* Prominent Step Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                  STEP
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-cyan-300">
                  {String(simulation.stepCount).padStart(2, '0')}
                  <span className="text-xs text-slate-400 font-normal"> / {String(Math.max(totalSteps, simulation.stepCount, 1)).padStart(2, '0')}</span>
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                  STATE
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-300">
                  {simulation.currentState}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MENTAL MODEL ALGORITHM PHASES BAR */}
        {phases.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono mr-1">
              Algorithm Flow:
            </span>
            {phases.map((ph, idx) => {
              const isPhaseActive =
                currentPhaseId === ph.id ||
                ph.states.includes(simulation.currentState);

              return (
                <div key={ph.id} className="flex items-center gap-1">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isPhaseActive
                        ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black shadow-sm scale-105 ring-2 ring-blue-400/30 dark:ring-cyan-300/40'
                        : 'bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                    title={ph.description}
                  >
                    {isPhaseActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-ping" />
                    )}
                    <span>{ph.label}</span>
                  </div>
                  {idx < phases.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-700 text-xs select-none">→</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STATUS BANNER */}
      <div className="relative z-10">
        <MachineStatus
          status={simulation.status}
          machine={machine}
          inputString={inputString}
          stepCount={simulation.stepCount}
        />
      </div>

      {/* THE HERO TAPE */}
      <div className="relative z-10 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-2 sm:p-4 shadow-inner">
        <Tape
          tape={simulation.tape}
          headIndex={simulation.headIndex}
          currentState={simulation.currentState}
          writtenCellIndex={simulation.writtenCellIndex}
          prevSymbol={simulation.prevSymbol}
          nextSymbol={simulation.nextSymbol}
        />
      </div>

      {/* DYNAMIC CURRENT TRANSITION & BIG NARRATIVE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Left: Current Transition Card (lg: 5 cols) */}
        <div className="lg:col-span-5">
          <CurrentTransitionCard
            activeTransition={simulation.activeTransition}
            currentState={simulation.currentState}
            readSymbol={activeSymbol}
          />
        </div>

        {/* Right: BIG "WHAT IS HAPPENING?" Educational Explanation Area (lg: 7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                  What Is Happening?
                </h3>
              </div>

              <button
                onClick={onOpenWhy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-800 transition-all shadow-sm group"
                title="Inspect why this step was chosen"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span>Why this transition?</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {lastEntry ? (
                <motion.div
                  key={lastEntry.step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3"
                >
                  <p className="text-base sm:text-lg text-slate-900 dark:text-white font-sans font-medium leading-relaxed">
                    {lastEntry.explanation}
                  </p>

                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="italic leading-relaxed">{lastEntry.reasoning}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-base text-slate-700 dark:text-slate-300 font-sans font-medium">
                    The machine is in initial state <span className="font-mono text-blue-600 dark:text-cyan-300 font-bold">[{simulation.currentState}]</span>, scanning the first symbol <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">'{activeSymbol}'</span> at position {mathematicalHeadIndex}.
                  </p>
                  <p className="text-xs text-slate-500">
                    Press <strong className="text-blue-600 dark:text-cyan-400">Play ▶</strong> or <strong className="text-blue-600 dark:text-cyan-400">Step ▶|</strong> on the timeline below to watch the machine execute!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Instantaneous Description footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
            <span>Instantaneous Description (ID):</span>
            <span className="text-blue-700 dark:text-cyan-300 font-bold bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {lastEntry ? lastEntry.instantaneousDescription : `[${simulation.currentState}] ${inputString}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
