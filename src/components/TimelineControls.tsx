import React from 'react';
import {
  RotateCcw,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  FastForward,
} from 'lucide-react';
import { MachineStatus } from '../engine/types';

interface TimelineControlsProps {
  status: MachineStatus;
  currentStep: number;
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

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  status,
  currentStep,
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
  const isRunning = status === 'RUNNING';
  const isHalted = status === 'ACCEPTED' || status === 'REJECTED';
  const canGoBack = currentStep > 0;
  const canGoForward = !isHalted;

  const displayTotal = Math.max(totalSteps, currentStep, 1);
  const speedOptions = [0.5, 1, 1.5, 2];

  return (
    <div className="w-full glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950/90 backdrop-blur-xl flex flex-col gap-3 transition-colors">
      {/* Top row: Video Timeline Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">TIMELINE:</span>
            <span className="text-blue-700 dark:text-cyan-300 font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              Step {String(currentStep).padStart(2, '0')} / {String(displayTotal).padStart(2, '0')}
            </span>
          </div>

          <div className="text-[11px] font-sans">
            {isHalted ? (
              <span className={`font-semibold ${status === 'ACCEPTED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                Halted ({status})
              </span>
            ) : isRunning ? (
              <span className="text-blue-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping inline-block" /> Running
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{status === 'READY' ? 'Ready to Start' : 'Paused'}</span>
            )}
          </div>
        </div>

        {/* Scrubbable Range Bar */}
        <div className="relative flex items-center group cursor-pointer py-1">
          <input
            type="range"
            min="0"
            max={displayTotal}
            value={currentStep}
            onChange={(e) => {
              if (onScrubToStep) {
                onScrubToStep(Number(e.target.value));
              }
            }}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Bottom row: Video Transport Controls & Speed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-200 dark:border-slate-800">
        {/* Playback Buttons Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            title="Reset to Step 0 (⏮ Reset)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Previous Step (Real snapshot rewind) */}
          <button
            onClick={onPrevStep}
            disabled={!canGoBack}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
              canGoBack
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800'
            }`}
            title="Step Backward (◀ Prev)"
          >
            <SkipBack className="w-4 h-4" />
            <span className="hidden md:inline">Prev</span>
          </button>

          {/* Play / Pause Primary Button */}
          {isRunning ? (
            <button
              onClick={onPause}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-sm transition-all transform active:scale-95 flex items-center gap-2"
              title="Pause Simulation (⏸)"
            >
              <Pause className="w-4 h-4 fill-black" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={isHalted}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center gap-2 ${
                isHalted
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-black shadow-sm'
              }`}
              title="Start / Resume Simulation (▶)"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play</span>
            </button>
          )}

          {/* Next Step */}
          <button
            onClick={onNextStep}
            disabled={!canGoForward || isRunning}
            className={`p-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 ${
              !canGoForward || isRunning
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
            }`}
            title="Step Forward exactly one transition (▶| Step)"
          >
            <SkipForward className="w-4 h-4" />
            <span>Step</span>
          </button>

          {/* Run to End */}
          <button
            onClick={onRunToEnd}
            disabled={isHalted}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border transition-all ${
              isHalted
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Run directly to completion (⏭)"
          >
            <FastForward className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Run to End</span>
          </button>
        </div>

        {/* Speed Buttons: 0.5x, 1x, 1.5x, 2x */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono px-2 hidden sm:inline">Speed:</span>
          {speedOptions.map((s) => {
            const isSelected = playbackSpeed === s;
            return (
              <button
                key={s}
                onClick={() => onChangePlaybackSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
