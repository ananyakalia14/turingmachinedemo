import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TuringMachineDefinition, SimulationState, PresetInput } from './engine/types';
import { AN_BN_MACHINE, AVAILABLE_MACHINES } from './data/machines';
import {
  initializeSimulation,
  stepSimulation,
  stepSimulationBackward,
  jumpToStepSnapshot,
  precomputeFullRun,
} from './engine/turingMachine';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { HeroCanvas } from './components/HeroCanvas';
import { TimelineControls } from './components/TimelineControls';
import { StateDiagram } from './components/StateDiagram';
import { MachineControls } from './components/MachineControls';
import { FormalDefinition } from './components/FormalDefinition';
import { TransitionTable } from './components/TransitionTable';
import { ExecutionHistory } from './components/ExecutionHistory';
import { AlgorithmicFlow } from './components/AlgorithmicFlow';
import { WhyModal } from './components/WhyModal';
import { AboutModal } from './components/AboutModal';
import { LiveTeachingMode } from './components/LiveTeachingMode';
import { QuestionBankModal } from './components/QuestionBankModal';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CustomMachineModal } from './components/CustomMachineModal';

export const App: React.FC = () => {
  // Theme management: Light theme is DEFAULT (Section 1)
  const { theme, toggleTheme } = useTheme();

  // Machine Selection & Input
  const [currentMachine, setCurrentMachine] = useState<TuringMachineDefinition>(AN_BN_MACHINE);
  const [inputString, setInputString] = useState<string>(AN_BN_MACHINE.defaultInput);

  // Simulation State: always starts in READY state (Section 11)
  const [simulation, setSimulation] = useState<SimulationState>(() =>
    initializeSimulation(AN_BN_MACHINE, AN_BN_MACHINE.defaultInput)
  );

  // Playback parameters
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isExpertMode, setIsExpertMode] = useState<boolean>(false);
  const [isLiveTeachingOpen, setIsLiveTeachingOpen] = useState<boolean>(false);
  const [isWhyOpen, setIsWhyOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState<boolean>(false);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState<boolean>(false);
  const [generatedMeta, setGeneratedMeta] = useState<{ question: string; interpretation: string } | null>(null);

  // Pre-compute expected total steps for the timeline scrubber
  const { totalSteps } = useMemo(() => {
    return precomputeFullRun(currentMachine, inputString);
  }, [currentMachine, inputString]);

  // Reset handler: returns to clean step 0 with READY status
  const handleReset = useCallback(() => {
    setSimulation(initializeSimulation(currentMachine, inputString));
  }, [currentMachine, inputString]);

  // Handle machine switch (Section 8, 10, 11)
  const handleSelectMachine = (newMachine: TuringMachineDefinition) => {
    setCurrentMachine(newMachine);
    setInputString(newMachine.defaultInput);
    // Clean initial state: Step 0, READY status
    setSimulation(initializeSimulation(newMachine, newMachine.defaultInput));
    if (!newMachine.id.includes('generated')) {
      setGeneratedMeta(null);
    }
  };

  // Handle custom machine created by user (Section 13)
  const handleSaveCustomMachine = (
    customMachine: TuringMachineDefinition,
    meta?: { question: string; interpretation: string }
  ) => {
    if (meta) {
      setGeneratedMeta(meta);
    }
    handleSelectMachine(customMachine);
  };

  // Handle input string change
  const handleInputChange = (newVal: string) => {
    setInputString(newVal);
    setSimulation(initializeSimulation(currentMachine, newVal));
  };

  // Handle preset selection
  const handleLoadPreset = (preset: PresetInput) => {
    setInputString(preset.value);
    setSimulation(initializeSimulation(currentMachine, preset.value));
  };

  // Step Forward (advances exactly 1 atomic transition)
  const handleStepForward = useCallback(() => {
    setSimulation((prev) => {
      if (prev.status === 'ACCEPTED' || prev.status === 'REJECTED') return prev;
      return stepSimulation(currentMachine, prev);
    });
  }, [currentMachine]);

  // Step Backward (real reverse stepping restoring exact previous snapshot)
  const handleStepBackward = useCallback(() => {
    setSimulation((prev) => stepSimulationBackward(prev));
  }, []);

  // Jump to specific step snapshot on the scrubber
  const handleScrubToStep = (targetStep: number) => {
    setSimulation((prev) => jumpToStepSnapshot(prev, targetStep));
  };

  // Start continuous execution
  const handlePlay = () => {
    if (simulation.status === 'ACCEPTED' || simulation.status === 'REJECTED') {
      handleReset();
    }
    setSimulation((prev) => ({ ...prev, status: 'RUNNING' }));
  };

  // Pause execution
  const handlePause = () => {
    setSimulation((prev) => ({
      ...prev,
      status: prev.status === 'RUNNING' ? 'PAUSED' : prev.status,
    }));
  };

  // Run directly to completion
  const handleRunToEnd = () => {
    let current = simulation;
    if (current.status === 'ACCEPTED' || current.status === 'REJECTED') {
      current = initializeSimulation(currentMachine, inputString);
    }

    const MAX_STEPS = 1000;
    let count = 0;
    while (
      current.status !== 'ACCEPTED' &&
      current.status !== 'REJECTED' &&
      count < MAX_STEPS
    ) {
      current = stepSimulation(currentMachine, current);
      count++;
    }
    setSimulation(current);
  };

  // Playback timer interval: 1x = 750ms, 0.5x = 1500ms, 2x = 375ms
  useEffect(() => {
    if (simulation.status !== 'RUNNING') return;

    const delayMs = Math.round(750 / playbackSpeed);

    const timer = setTimeout(() => {
      setSimulation((prev) => {
        if (prev.status !== 'RUNNING') return prev;
        const next = stepSimulation(currentMachine, prev);
        if (next.status === 'ACCEPTED' || next.status === 'REJECTED') {
          return next;
        }
        return { ...next, status: 'RUNNING' };
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [simulation.status, simulation.stepCount, currentMachine, playbackSpeed]);

  const lastEntry = simulation.history[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/20 dark:selection:bg-cyan-500/30 transition-colors duration-200">
      {/* Top Header with Light Theme Default, SELECT MACHINE, Question Bank & Theme Toggle */}
      <Header
        currentMachine={currentMachine}
        onSelectMachine={handleSelectMachine}
        onReset={handleReset}
        isExpertMode={isExpertMode}
        onToggleExpertMode={() => setIsExpertMode((prev) => !prev)}
        onOpenLiveTeaching={() => setIsLiveTeachingOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
        onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* GENERATED FROM QUESTION BANNER (Requirement 11) */}
        {generatedMeta && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50/50 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-indigo-800/80 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white dark:bg-cyan-500 dark:text-black shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    Generated Machine
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Question: <span className="font-semibold text-blue-700 dark:text-cyan-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-slate-700">{generatedMeta.question}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <strong className="text-slate-900 dark:text-white font-bold">Interpretation: </strong>
                  {generatedMeta.interpretation}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsCustomBuilderOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-cyan-500 shadow-xs transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Question</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 1. HERO SIMULATION CANVAS (Central Stage) */}
        <section aria-label="Hero Simulation Canvas">
          <HeroCanvas
            machine={currentMachine}
            simulation={simulation}
            inputString={inputString}
            totalSteps={totalSteps}
            onOpenWhy={() => setIsWhyOpen(true)}
          />
        </section>

        {/* 2. VIDEO PLAYBACK TIMELINE CONTROLS */}
        <section aria-label="Simulation Timeline Controls">
          <TimelineControls
            status={simulation.status}
            currentStep={simulation.stepCount}
            totalSteps={totalSteps}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={setPlaybackSpeed}
            onReset={handleReset}
            onPrevStep={handleStepBackward}
            onPlay={handlePlay}
            onPause={handlePause}
            onNextStep={handleStepForward}
            onRunToEnd={handleRunToEnd}
            onScrubToStep={handleScrubToStep}
          />
        </section>

        {/* 3. REDESIGNED CLEAN HIERARCHICAL STATE DIAGRAM */}
        <section aria-label="State Transition Diagram">
          <StateDiagram
            machine={currentMachine}
            currentState={simulation.currentState}
            activeTransition={simulation.activeTransition}
          />
        </section>

        {/* 4. SUPPORTING PANELS */}
        <section aria-label="Turing Machine Parameters and Reference" className="space-y-6 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 font-mono">
              Theoretical Foundation & Registers
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls & 7-Tuple (lg: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <MachineControls
                machine={currentMachine}
                inputString={inputString}
                onInputChange={handleInputChange}
                onReset={handleReset}
                onLoadPreset={handleLoadPreset}
              />

              <FormalDefinition
                machine={currentMachine}
                currentState={simulation.currentState}
              />

              {!isExpertMode && (
                <AlgorithmicFlow
                  machine={currentMachine}
                  currentState={simulation.currentState}
                />
              )}
            </div>

            {/* Right Transition Table & Execution History (lg: 7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <TransitionTable
                machine={currentMachine}
                activeTransition={simulation.activeTransition}
                currentState={simulation.currentState}
              />

              <ExecutionHistory
                history={simulation.history}
                onSelectStep={(entry) => handleScrubToStep(entry.step)}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 font-mono bg-white dark:bg-[#05080e] transition-colors">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Turing Machine Visual Simulator — Interactive automata simulation driven by formal transition mathematics
          </div>
          <div>
            Current Model: <span className="text-blue-600 dark:text-cyan-400 font-bold">{currentMachine.name}</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <WhyModal
        isOpen={isWhyOpen}
        onClose={() => setIsWhyOpen(false)}
        activeTransition={simulation.activeTransition}
        lastEntry={lastEntry}
        currentState={simulation.currentState}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        currentMachineId={currentMachine.id}
        onSelectMachine={handleSelectMachine}
      />

      <CustomMachineModal
        isOpen={isCustomBuilderOpen}
        onClose={() => setIsCustomBuilderOpen(false)}
        onSaveMachine={handleSaveCustomMachine}
      />

      <LiveTeachingMode
        isOpen={isLiveTeachingOpen}
        onClose={() => setIsLiveTeachingOpen(false)}
        machine={currentMachine}
        onSelectMachine={handleSelectMachine}
        simulation={simulation}
        inputString={inputString}
        onInputChange={handleInputChange}
        totalSteps={totalSteps}
        playbackSpeed={playbackSpeed}
        onChangePlaybackSpeed={setPlaybackSpeed}
        onReset={handleReset}
        onPrevStep={handleStepBackward}
        onPlay={handlePlay}
        onPause={handlePause}
        onNextStep={handleStepForward}
        onRunToEnd={handleRunToEnd}
        onScrubToStep={handleScrubToStep}
      />
    </div>
  );
};

export default App;
