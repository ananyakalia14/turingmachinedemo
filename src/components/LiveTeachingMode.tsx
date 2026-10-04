import React from 'react';
import {
  Minimize2,
  Clapperboard,
  BookOpen,
} from 'lucide-react';
import { TuringMachineDefinition, SimulationState } from '../engine/types';
import { AVAILABLE_MACHINES } from '../data/machines';
import { Tape } from './Tape';
import { StateDiagram } from './StateDiagram';
import { MachineStatus } from './MachineStatus';
import { TimelineControls } from './TimelineControls';

interface LiveTeachingModeProps {
  isOpen: boolean;
  onClose: () => void;
  machine: TuringMachineDefinition;
  onSelectMachine: (machine: TuringMachineDefinition) => void;
  simulation: SimulationState;
  inputString: string;
  onInputChange: (val: string) => void;
  totalSteps: number;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  onReset: () => void;
  onPrevStep: () => void;
  onPlay: () => void;
  onPause: () => void;
  onNextStep: () => void;
  onRunToEnd: () => void;
  onScrubToStep?: (step: number) => void;
}

export const LiveTeachingMode: React.FC<LiveTeachingModeProps> = ({
  isOpen,
  onClose,
  machine,
  onSelectMachine,
  simulation,
  inputString,
  onInputChange,
  totalSteps,
  playbackSpeed,
  onChangePlaybackSpeed,
  onReset,
  onPrevStep,
  onPlay,
  onPause,
  onNextStep,
  onRunToEnd,
  onScrubToStep,
}) => {
  if (!isOpen) return null;

  const lastEntry = simulation.history[0] || null;
  const activeSymbol = simulation.tape[simulation.headIndex]?.symbol || 'B';

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-[#060910] text-slate-900 dark:text-white flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto font-sans transition-colors duration-200">
      {/* Top Theater Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 dark:bg-cyan-500 rounded-xl text-white dark:text-black shadow-md">
            <Clapperboard className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 font-mono">
                LIVE TEACHING THEATER MODE
              </span>
              <span className="text-xs text-slate-500 font-mono">• {machine.language}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {machine.formalTitle}
            </h2>
          </div>
        </div>

        {/* Question Selector & Input inside Live Teaching */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm text-xs font-mono">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <select
              value={machine.id}
              onChange={(e) => {
                const found = AVAILABLE_MACHINES.find((m) => m.id === e.target.value);
                if (found) onSelectMachine(found);
              }}
              className="bg-transparent font-bold text-slate-800 dark:text-cyan-300 focus:outline-none cursor-pointer"
            >
              {AVAILABLE_MACHINES.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Selector Chips */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-mono">
            <span className="text-slate-500 px-1">Input:</span>
            {machine.presetInputs.slice(0, 3).map((p) => (
              <button
                key={p.value}
                onClick={() => onInputChange(p.value)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  inputString === p.value
                    ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Theater</span>
          </button>
        </div>
      </div>

      {/* Main Theater Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6 max-w-7xl mx-auto w-full">
        {/* Status Notification */}
        <div className="w-full">
          <MachineStatus
            status={simulation.status}
            machine={machine}
            inputString={inputString}
            stepCount={simulation.stepCount}
          />
        </div>

        {/* Current State Header Banner */}
        <div className="flex items-center justify-center gap-3 text-center">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-slate-600 dark:text-slate-400">
            CURRENT STATE:
          </span>
          <span className="text-3xl font-black font-mono text-blue-700 dark:text-cyan-300 px-5 py-1.5 rounded-2xl bg-white dark:bg-cyan-950/80 border border-blue-300 dark:border-cyan-700/80 shadow-md">
            {simulation.currentState}
          </span>
        </div>

        {/* Enormous Tape Visualization */}
        <div className="w-full bg-white dark:bg-slate-950/90 rounded-3xl border border-slate-200 dark:border-slate-800/90 p-4 shadow-md">
          <Tape
            tape={simulation.tape}
            headIndex={simulation.headIndex}
            currentState={simulation.currentState}
            writtenCellIndex={simulation.writtenCellIndex}
            prevSymbol={simulation.prevSymbol}
            nextSymbol={simulation.nextSymbol}
          />
        </div>

        {/* Active Transition Formula & Big Narrative */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transition Equation */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-center text-center">
            <span className="text-xs uppercase font-mono text-slate-500 mb-1">
              Active Transition Rule
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-blue-600 dark:text-cyan-400">
              {simulation.activeTransition
                ? `δ(${simulation.activeTransition.currentState}, '${simulation.activeTransition.readSymbol}') = (${simulation.activeTransition.nextState}, '${simulation.activeTransition.writeSymbol}', ${simulation.activeTransition.moveDirection})`
                : `Ready at [${simulation.currentState}] scanning '${activeSymbol}'`}
            </div>
          </div>

          {/* Large Educational Narrative */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
            <span className="text-xs uppercase font-mono text-slate-500 mb-1">
              Live Instruction Narrative
            </span>
            <p className="text-base sm:text-lg text-slate-900 dark:text-white font-sans font-medium leading-relaxed">
              {lastEntry ? lastEntry.explanation : `Machine initialized and ready to run.`}
            </p>
          </div>
        </div>

        {/* Clean State Diagram in Theater */}
        <div className="w-full">
          <StateDiagram
            machine={machine}
            currentState={simulation.currentState}
            activeTransition={simulation.activeTransition}
          />
        </div>

        {/* Bottom Video Timeline Controls */}
        <div className="w-full sticky bottom-2">
          <TimelineControls
            status={simulation.status}
            currentStep={simulation.stepCount}
            totalSteps={totalSteps}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={onChangePlaybackSpeed}
            onReset={onReset}
            onPrevStep={onPrevStep}
            onPlay={onPlay}
            onPause={onPause}
            onNextStep={onNextStep}
            onRunToEnd={onRunToEnd}
            onScrubToStep={onScrubToStep}
          />
        </div>
      </div>
    </div>
  );
};
