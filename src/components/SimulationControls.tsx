import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  FastForward,
  Gauge,
} from 'lucide-react';
import { MachineStatus } from '../engine/types';

interface SimulationControlsProps {
  status: MachineStatus;
  stepCount: number;
  currentState: string;
  headPosition: number;
  speedMs: number;
  onChangeSpeed: (ms: number) => void;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunToCompletion: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  status,
  stepCount,
  currentState,
  headPosition,
  speedMs,
  onChangeSpeed,
  onStart,
  onPause,
  onStep,
  onReset,
  onRunToCompletion,
}) => {
  const isHalted = status === 'ACCEPTED' || status === 'REJECTED';
  const isRunning = status === 'RUNNING';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl bg-slate-900/80">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        {/* Step Counter & State Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border border-cyan-800/60 rounded-xl px-4 py-2 flex flex-col items-center justify-center min-w-[90px] shadow-glow-cyan">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
              STEP
            </span>
            <span className="text-2xl font-black font-mono text-white tracking-wider">
              {String(stepCount).padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">State</span>
              <span className="text-cyan-300 font-bold text-sm">{currentState}</span>
            </div>
            <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Head Pos</span>
              <span className="text-amber-300 font-bold text-sm">{headPosition}</span>
            </div>
          </div>
        </div>

        {/* Playback Buttons Group */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* Start / Pause */}
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition-all transform active:scale-95"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4 fill-black" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={isHalted}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 ${
                isHalted
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan'
              }`}
              title="Start Continuous Simulation"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start</span>
            </button>
          )}

          {/* Step Button (Crucial: 1 step per click) */}
          <button
            onClick={onStep}
            disabled={isRunning || isHalted}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 ${
              isRunning || isHalted
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple border border-purple-400/40'
            }`}
            title="Execute exactly ONE transition"
          >
            <SkipForward className="w-4 h-4" />
            <span>Step</span>
          </button>

          {/* Run to Completion */}
          <button
            onClick={onRunToCompletion}
            disabled={isHalted}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isHalted
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
            }`}
            title="Fast forward directly to accept or reject"
          >
            <FastForward className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Run to End</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
            title="Reset Machine to Initial State"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800/80">
          <Gauge className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col gap-1 w-28 sm:w-36">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Slow</span>
              <span>Fast</span>
            </div>
            <input
              type="range"
              min="50"
              max="1200"
              step="50"
              // Invert so slider right = faster (lower delay)
              value={1250 - speedMs}
              onChange={(e) => onChangeSpeed(1250 - Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
          <span className="text-[11px] font-mono text-cyan-300 w-12 text-right">
            {speedMs}ms
          </span>
        </div>
      </div>
    </div>
  );
};
