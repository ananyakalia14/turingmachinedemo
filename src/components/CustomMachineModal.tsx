import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Edit3,
  Loader2,
  Check,
  Cpu,
  Layers,
  Table as TableIcon,
  Play,
  RotateCcw,
} from 'lucide-react';
import { TuringMachineDefinition, Transition, Direction } from '../engine/types';
import { analyzeQuestion, verifyGeneratedMachine, InterpretationResult } from '../engine/questionGenerator';

interface CustomMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMachine: (
    machine: TuringMachineDefinition,
    meta?: { question: string; interpretation: string }
  ) => void;
}

const EXAMPLE_PROMPTS = [
  { label: "Binary Decrement", query: "Design Turing Machine for Decrement of Binary Number by one" },
  { label: "Unary to Binary", query: "Design Turing Machine for unary to Binary Converter" },
  { label: "1's Complement", query: "Design a Turing Machine to compute 1's complement of a binary number" },
  { label: "2's Complement", query: "Design a Turing Machine to compute 2's complement of a binary number" },
  { label: "Language '01*0'", query: "Design a Turing Machine that accepts language '01*0' over input{0,1}" },
  { label: "Language 'aba'", query: "Design a Turing Machine that accepts language 'aba' over input{a,b}" },
  { label: 'aⁿbⁿ', query: "Design a Turing Machine for L = { aⁿbⁿ | n ≥ 1 }" },
  { label: 'aⁿbⁿcⁿ', query: "Design a Turing Machine for L = { aⁿbⁿcⁿ | n ≥ 1 }" },
  { label: 'Palindrome over {0,1}', query: "Binary Palindrome: L = { w ∈ {0,1}* | w = wᴿ }" },
  { label: 'Equal 0s and 1s', query: "Equal number of 0s and 1s: L = { w | N₀(w) = N₁(w) }" },
  { label: 'Binary increment', query: "Binary increment: f(w) = w + 1" },
];

const GENERATION_STEPS = [
  'Understanding Question...',
  'Identifying Language...',
  'Building States...',
  'Generating Transition Function...',
  'Building State Diagram...',
  'Preparing Tape...',
  'Machine Ready ✓',
];

export const CustomMachineModal: React.FC<CustomMachineModalProps> = ({
  isOpen,
  onClose,
  onSaveMachine,
}) => {
  // Input and generation state
  const [questionInput, setQuestionInput] = useState("Design a Turing Machine that accepts language 'aba' over input{a,b}");
  const [stepMode, setStepMode] = useState<'INPUT' | 'CLARIFICATION' | 'GENERATING' | 'UNSUPPORTED' | 'ERROR'>('INPUT');
  const [activeGenStep, setActiveGenStep] = useState(0);
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [customInterpretationText, setCustomInterpretationText] = useState('');
  const [isEditingInterpretation, setIsEditingInterpretation] = useState(false);
  const [generatedMachine, setGeneratedMachine] = useState<TuringMachineDefinition | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Advanced manual inspection / editing panel state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [name, setName] = useState('Custom Turing Machine');
  const [statesInput, setStatesInput] = useState('q0, q1, q2, q3, q_accept, q_reject');
  const [alphabetInput, setAlphabetInput] = useState('a, b');
  const [tapeAlphabetInput, setTapeAlphabetInput] = useState('a, b, X, Y, B');
  const [initialState, setInitialState] = useState('q0');
  const [acceptState, setAcceptState] = useState('q_accept');
  const [rejectState, setRejectState] = useState('q_reject');
  const [transitionsText, setTransitionsText] = useState(
    [
      '# Exact match for string "aba" (a -> X, b -> Y)',
      'q0, a -> q1, X, R',
      'q0, b -> q_reject, b, R',
      'q0, B -> q_reject, B, R',
      'q1, b -> q2, Y, R',
      'q1, a -> q_reject, a, R',
      'q1, B -> q_reject, B, R',
      'q2, a -> q3, X, R',
      'q2, b -> q_reject, b, R',
      'q2, B -> q_reject, B, R',
      'q3, B -> q_accept, B, R',
      'q3, a -> q_reject, a, R',
      'q3, b -> q_reject, b, R',
    ].join('\n')
  );

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      setStepMode('INPUT');
      setActiveGenStep(0);
      setValidationError(null);
      setShowAdvanced(false);
      setIsEditingInterpretation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle clicking "GENERATE & SIMULATE"
  const handleStartGeneration = () => {
    setValidationError(null);
    if (!questionInput.trim()) {
      setValidationError('Please enter a Turing Machine question or select an example prompt.');
      return;
    }

    const result = analyzeQuestion(questionInput);
    setInterpretation(result);
    setCustomInterpretationText(result.interpretationText);

    // If unsupported, show helpful warning
    if (!result.isSupported) {
      setStepMode('UNSUPPORTED');
      return;
    }

    // If ambiguous (confidence === 'medium'), ask for clarification first
    if (result.confidence === 'medium') {
      setStepMode('CLARIFICATION');
      return;
    }

    // Otherwise proceed straight to generation animation
    executeGenerationSequence(result);
  };

  // Run the stepped generation animation sequence
  const executeGenerationSequence = (result: InterpretationResult) => {
    setStepMode('GENERATING');
    setActiveGenStep(0);

    try {
      const machine = result.buildMachine();
      // Run pre-simulation safety verification (Requirement 16)
      const verification = verifyGeneratedMachine(machine, result.testCases);
      if (!verification.isValid) {
        setValidationError(`Machine needs verification before simulation. Failed on test case: "${verification.failedInput}"`);
        setStepMode('ERROR');
        return;
      }

      setGeneratedMachine(machine);
      setName(machine.name);
      setStatesInput(machine.states.join(', '));
      setAlphabetInput(machine.inputAlphabet.join(', '));
      setTapeAlphabetInput(machine.tapeAlphabet.join(', '));
      setInitialState(machine.initialState);
      setAcceptState(machine.acceptStates[0] || 'q_accept');
      setRejectState(machine.rejectStates[0] || 'q_reject');

      // Format transitions for advanced editing
      const lines = machine.transitions.map(
        (t) => `${t.currentState}, ${t.readSymbol} -> ${t.nextState}, ${t.writeSymbol}, ${t.moveDirection}`
      );
      setTransitionsText(lines.join('\n'));

      // Progressively advance the 7 steps
      const stepDuration = 220; // ms per step
      GENERATION_STEPS.forEach((_, idx) => {
        setTimeout(() => {
          setActiveGenStep(idx);
          if (idx === GENERATION_STEPS.length - 1) {
            // Once ready, wait briefly and complete
            setTimeout(() => {
              onSaveMachine(machine, {
                question: questionInput,
                interpretation: customInterpretationText || result.interpretationText,
              });
              onClose();
            }, 550);
          }
        }, idx * stepDuration);
      });
    } catch (err: any) {
      setValidationError(err.message || 'Failed to construct Turing Machine.');
      setStepMode('ERROR');
    }
  };

  // User confirmed the interpretation in the clarification dialog
  const handleConfirmInterpretation = () => {
    if (!interpretation) return;
    executeGenerationSequence(interpretation);
  };

  // Compile from advanced editor if user customized it
  const handleCompileAdvanced = () => {
    try {
      setValidationError(null);
      let states = statesInput.split(',').map((s) => s.trim()).filter(Boolean);
      let inputAlphabet = alphabetInput.split(',').map((s) => s.trim()).filter(Boolean);
      let tapeAlphabet = tapeAlphabetInput.split(',').map((s) => s.trim()).filter(Boolean);

      const initSt = initialState.trim() || states[0] || 'q0';
      const accSt = acceptState.trim() || 'q_accept';
      const rejSt = rejectState.trim() || 'q_reject';

      if (!states.includes(initSt)) states.unshift(initSt);
      if (!states.includes(accSt)) states.push(accSt);
      if (!states.includes(rejSt)) states.push(rejSt);

      if (inputAlphabet.length === 0) inputAlphabet = ['a', 'b'];
      if (!tapeAlphabet.includes('B')) tapeAlphabet.push('B');
      for (const s of inputAlphabet) {
        if (!tapeAlphabet.includes(s)) tapeAlphabet.unshift(s);
      }

      const transitions: Transition[] = [];
      const lines = transitionsText.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        const parts = line.split('->');
        if (parts.length !== 2) {
          throw new Error(`Line ${i + 1}: Invalid format. Expected 'state, read -> nextState, write, move'`);
        }

        const leftParts = parts[0].split(',').map((s) => s.trim());
        const rightParts = parts[1].split(',').map((s) => s.trim());

        if (leftParts.length < 2 || rightParts.length < 3) {
          throw new Error(`Line ${i + 1}: Expected 2 items on left and 3 items on right.`);
        }

        const fromState = leftParts[0];
        const readSym = leftParts[1];
        const toState = rightParts[0];
        const writeSym = rightParts[1];
        const moveDir = rightParts[2].toUpperCase() as Direction;

        if (moveDir !== 'L' && moveDir !== 'R' && moveDir !== 'N') {
          throw new Error(`Line ${i + 1}: Move direction must be L, R, or N.`);
        }

        transitions.push({
          currentState: fromState,
          readSymbol: readSym,
          writeSymbol: writeSym,
          moveDirection: moveDir,
          nextState: toState,
          description: `δ(${fromState}, '${readSym}') → (${toState}, '${writeSym}', ${moveDir})`,
        });
      }

      if (transitions.length === 0) {
        throw new Error('At least one transition rule must be provided.');
      }

      // Automatically arrange state positions nicely
      const statePositions = { ...(generatedMachine?.statePositions || {}) };
      const numStates = states.length;
      states.forEach((st, idx) => {
        if (!statePositions[st]) {
          const spacing = Math.min(180, Math.max(120, Math.floor(720 / Math.max(1, numStates))));
          const startX = 100;
          if (st === rejSt) {
            statePositions[st] = {
              x: Math.round(startX + (numStates / 2) * spacing),
              y: 250,
              label: st,
              description: 'Reject State',
              role: 'reject',
              color: '#dc2626',
            };
          } else if (st === accSt) {
            statePositions[st] = {
              x: startX + (numStates - 1) * spacing,
              y: 120,
              label: st,
              description: 'Accept State',
              role: 'accept',
              color: '#16a34a',
            };
          } else {
            statePositions[st] = {
              x: startX + idx * spacing,
              y: 120,
              label: st,
              description: st === initSt ? 'Start State' : 'Intermediate State',
              role: st === initSt ? 'start' : 'normal',
              color: st === initSt ? '#2563eb' : '#7c3aed',
            };
          }
        }
      });

      const baseMachine: TuringMachineDefinition = generatedMachine || {
        id: `custom-${Date.now()}`,
        name: name || 'Custom TM',
        description: 'User-customized Turing Machine',
        formalTitle: name || 'Custom Turing Machine',
        language: 'Custom Language',
        states,
        inputAlphabet,
        tapeAlphabet,
        initialState: initSt,
        blankSymbol: 'B',
        acceptStates: [accSt],
        rejectStates: [rejSt],
        transitions,
        defaultInput: 'aba',
        presetInputs: [
          { label: 'aba (Sample)', value: 'aba', expected: 'ACCEPT', note: 'Sample run' }
        ],
        statePositions,
        explanationGuide: {
          title: 'Custom Machine Execution',
          steps: [
            { step: 1, title: 'Execute Custom Rules', desc: 'The simulator steps through the transition table.', iconSymbol: '⚙️', color: '#2563eb' }
          ]
        }
      };

      const updatedMachine: TuringMachineDefinition = {
        ...baseMachine,
        name: name || 'Custom TM',
        states,
        inputAlphabet,
        tapeAlphabet,
        initialState: initSt,
        blankSymbol: 'B',
        acceptStates: [accSt],
        rejectStates: [rejSt],
        transitions,
        statePositions,
      };

      onSaveMachine(updatedMachine, {
        question: questionInput,
        interpretation: customInterpretationText || 'Manually customized machine definition',
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Error compiling custom machine.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 max-h-[92vh] flex flex-col transition-all"
        >
          {/* HEADER: ✨ CREATE MACHINE FROM QUESTION */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  ✨ CREATE MACHINE FROM QUESTION
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                  Describe the language or problem you want the Turing Machine to solve. The simulator will generate the machine, transition function, state diagram and teaching explanation.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN MODAL BODY */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Validation / Error banner */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                <span className="font-medium">{validationError}</span>
              </motion.div>
            )}

            {/* SCREEN 1: PRIMARY QUESTION INPUT (Default Experience) */}
            {stepMode === 'INPUT' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono mb-2">
                    Enter your Turing Machine problem
                  </label>
                  <textarea
                    rows={3}
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="e.g. Design a Turing Machine for L = { aⁿbⁿcⁿ | n ≥ 1 }"
                    className="w-full text-base sm:text-lg font-medium p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all shadow-inner resize-none"
                  />
                </div>

                {/* Example prompts chips */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2.5">
                    Try an example:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={() => setQuestionInput(ex.query)}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-cyan-950 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleStartGeneration}
                    className="w-full py-4 px-6 rounded-2xl text-base font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
                  >
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>✨ GENERATE & SIMULATE</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: CLARIFICATION WHEN AMBIGUOUS (Requirement 3) */}
            {stepMode === 'CLARIFICATION' && interpretation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60"
              >
                <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  <h4 className="text-sm font-bold uppercase tracking-wider font-mono">
                    I understood your question as:
                  </h4>
                </div>

                {isEditingInterpretation ? (
                  <textarea
                    rows={2}
                    value={customInterpretationText}
                    onChange={(e) => setCustomInterpretationText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <blockquote className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 text-slate-800 dark:text-slate-100 text-sm sm:text-base font-semibold leading-relaxed shadow-sm">
                    "{customInterpretationText || interpretation.interpretationText}"
                  </blockquote>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setIsEditingInterpretation((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 border border-amber-300/80 dark:border-amber-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingInterpretation ? 'Save interpretation' : '✎ Edit interpretation'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStepMode('INPUT')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmInterpretation}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>✓ Yes, generate</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: MULTI-STEP PROGRESS ANIMATION (Requirement 4) */}
            {stepMode === 'GENERATING' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 px-4 flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-full max-w-md space-y-2">
                  {GENERATION_STEPS.map((stepLabel, idx) => {
                    const isDone = idx < activeGenStep;
                    const isCurrent = idx === activeGenStep;
                    return (
                      <div
                        key={stepLabel}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-mono transition-all ${
                          isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-cyan-300 font-bold shadow-xs scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isCurrent ? (
                            <Loader2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px]">
                              {idx + 1}
                            </div>
                          )}
                          <span>{stepLabel}</span>
                        </div>
                        {isDone && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans animate-pulse pt-2">
                  Synthesizing formal definition, transition rules & state coordinates...
                </p>
              </motion.div>
            )}

            {/* SCREEN 4: UNSUPPORTED QUESTION (Requirement 12) */}
            {stepMode === 'UNSUPPORTED' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Unsupported Language Problem
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  I can understand the language, but I cannot reliably construct a correct machine automatically yet. You can still define your states and transitions manually below!
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setStepMode('INPUT')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Try another question
                  </button>
                  <button
                    onClick={() => {
                      setStepMode('INPUT');
                      setShowAdvanced(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Manual Editor</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 5: ERROR OR VERIFICATION FAILURE (Requirement 16) */}
            {stepMode === 'ERROR' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-red-700 dark:text-red-300">
                  Verification Notice
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {validationError || 'Machine needs verification before simulation.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setStepMode('INPUT')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Edit Question
                  </button>
                  <button
                    onClick={() => {
                      setStepMode('INPUT');
                      setShowAdvanced(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Fix in Manual Editor</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* OPTIONAL ADVANCED DRAWER: Edit Generated Machine (Requirement 14) */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-full"
              >
                {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Advanced: Manual Transition Editor / Custom Machine</span>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 overflow-hidden text-xs font-mono"
                  >
                    <p className="text-slate-500 font-sans text-xs">
                      Inspect or modify the 7-tuple definition and transition rules directly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          Machine Name:
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          States Q (comma-separated):
                        </label>
                        <input
                          type="text"
                          value={statesInput}
                          onChange={(e) => setStatesInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          Initial State q₀:
                        </label>
                        <input
                          type="text"
                          value={initialState}
                          onChange={(e) => setInitialState(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          Accept State:
                        </label>
                        <input
                          type="text"
                          value={acceptState}
                          onChange={(e) => setAcceptState(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          Reject State:
                        </label>
                        <input
                          type="text"
                          value={rejectState}
                          onChange={(e) => setRejectState(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          Input Alphabet Σ (comma-separated):
                        </label>
                        <input
                          type="text"
                          value={alphabetInput}
                          onChange={(e) => setAlphabetInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                          Tape Alphabet Γ (comma-separated):
                        </label>
                        <input
                          type="text"
                          value={tapeAlphabetInput}
                          onChange={(e) => setTapeAlphabetInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                        Transitions δ (Format: state, read → nextState, write, move):
                      </label>
                      <textarea
                        rows={7}
                        value={transitionsText}
                        onChange={(e) => setTransitionsText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleCompileAdvanced}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-sm flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Apply Manual Changes & Simulate</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Question → Interpretation → Formal Definition → State Diagram → Tape</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
