import React from 'react';
import {
  RotateCcw,
  Presentation,
  HelpCircle,
  Sparkles,
  BookOpen,
  Cpu,
  GraduationCap,
  Sun,
  Moon,
  Wrench,
  Library,
} from 'lucide-react';
import { TuringMachineDefinition } from '../engine/types';
import { AVAILABLE_MACHINES } from '../data/machines';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  currentMachine: TuringMachineDefinition;
  onSelectMachine: (machine: TuringMachineDefinition) => void;
  onReset: () => void;
  isExpertMode: boolean;
  onToggleExpertMode: () => void;
  onOpenLiveTeaching: () => void;
  onOpenAbout: () => void;
  onOpenQuestionBank: () => void;
  onOpenCustomBuilder: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMachine,
  onSelectMachine,
  onReset,
  isExpertMode,
  onToggleExpertMode,
  onOpenLiveTeaching,
  onOpenAbout,
  onOpenQuestionBank,
  onOpenCustomBuilder,
  theme,
  onToggleTheme,
}) => {
  // Prominent core machines for top quick switcher
  const primaryMachines = AVAILABLE_MACHINES.slice(0, 3);

  return (
    <header className="sticky top-0 z-40 px-4 lg:px-8 py-3 bg-white/95 dark:bg-[#090d16]/90 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Turing Machine Visual Simulator
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                v2.1
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans hidden sm:block">
              Interactive automata simulation with real transition functions, tape & state graph.
            </p>
          </div>
        </div>

        {/* Center: SELECT MACHINE (Section 10) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-inner">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 font-mono">
            Select Machine:
          </span>
          {primaryMachines.map((m) => {
            const isSelected = m.id === currentMachine.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMachine(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title={m.description}
              >
                {m.name}
              </button>
            );
          })}

          {/* Question Bank Launcher Button */}
          <button
            onClick={onOpenQuestionBank}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400"
            title="Open Complete Turing Machine Question Bank"
          >
            <Library className="w-3.5 h-3.5" />
            <span>Question Bank</span>
          </button>
        </div>

        {/* Right: Actions, Theme Toggle, Live Teaching */}
        <div className="flex flex-wrap items-center gap-2">
          {/* THEME TOGGLE (Section 1: Light Theme Default with ☀/🌙 toggle) */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-400 shadow-sm transition-all"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* ✨ Create Machine from Question */}
          <button
            onClick={onOpenCustomBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-cyan-950/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-800/80 hover:border-blue-400 dark:hover:border-cyan-400 shadow-xs transition-all hover:scale-[1.02]"
            title="Create Turing Machine from Problem Question"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>✨ Create from Question</span>
          </button>

          {/* 🎬 Live Teaching Mode (Section 14) */}
          <button
            onClick={onOpenLiveTeaching}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-black shadow-sm transition-all"
            title="Full-screen clean animated teaching mode for projection"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>🎬 Live Teaching</span>
          </button>

          {/* Reset Machine */}
          <button
            onClick={onReset}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
            title="Reset Machine to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* About / Help */}
          <button
            onClick={onOpenAbout}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1"
            title="Automata Guide and Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </div>
    </header>
  );
};
