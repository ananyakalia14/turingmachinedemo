import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { TuringMachineDefinition, PresetInput } from '../engine/types';
import { validateMachineInput } from '../engine/turingMachine';

interface MachineControlsProps {
  machine: TuringMachineDefinition;
  inputString: string;
  onInputChange: (value: string) => void;
  onReset: () => void;
  onLoadPreset: (preset: PresetInput) => void;
}

export const MachineControls: React.FC<MachineControlsProps> = ({
  machine,
  inputString,
  onInputChange,
  onReset,
  onLoadPreset,
}) => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message?: string;
  } | null>(null);

  const handleValidate = () => {
    const res = validateMachineInput(machine, inputString);
    setValidationResult(res);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 flex flex-col gap-4 transition-colors">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
            Machine Input & Presets
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Σ = &#123;{machine.inputAlphabet.join(', ')}&#125;
        </span>
      </div>

      {/* Input String Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>Tape Input String:</span>
          <span className="text-[10px] text-slate-400">
            Length: {inputString.length}
          </span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputString}
            onChange={(e) => {
              onInputChange(e.target.value);
              setValidationResult(null);
            }}
            placeholder="e.g. aaabbb"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-cyan-500 rounded-xl py-2 px-3 text-sm font-mono text-slate-900 dark:text-cyan-300 tracking-wider placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Validation Result Toast */}
        {validationResult && (
          <div
            className={`mt-1.5 p-2 rounded-lg text-xs font-mono flex items-center gap-2 ${
              validationResult.isValid
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800/80 text-red-800 dark:text-rose-300'
            }`}
          >
            {validationResult.isValid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-rose-400 flex-shrink-0" />
            )}
            <span>{validationResult.message}</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Validate & Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleValidate}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>Validate Input</span>
        </button>

        <button
          onClick={onReset}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5"
          title="Reset tape to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset Examples */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
          <span>Preset Test Cases:</span>
          <span className="text-[10px] text-slate-400">Click to load</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {machine.presetInputs.map((preset) => {
            const isCurrent = inputString === preset.value;
            const isExpectedAccept = preset.expected === 'ACCEPT';

            return (
              <button
                key={preset.label}
                onClick={() => {
                  onLoadPreset(preset);
                  setValidationResult(null);
                }}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-cyan-950/40 border-blue-500 dark:border-cyan-500 text-blue-900 dark:text-cyan-200 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
                title={preset.note}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold truncate">
                    {preset.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1 rounded ${
                      isExpectedAccept
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950'
                        : 'text-red-700 dark:text-rose-400 bg-red-100 dark:bg-rose-950'
                    }`}
                  >
                    {isExpectedAccept ? '✓' : '✕'}
                  </span>
                </div>
                {preset.note && (
                  <span className="text-[9.5px] text-slate-500 truncate mt-0.5 font-sans">
                    {preset.note}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
