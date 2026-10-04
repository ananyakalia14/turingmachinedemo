import {
  TuringMachineDefinition,
  SimulationState,
  TapeCell,
  StepLogEntry,
  StateSnapshot,
} from './types';

const INITIAL_LEFT_BLANKS = 4;
const INITIAL_RIGHT_BLANKS = 7;

let cellCounter = 0;
export function createCell(index: number, symbol: string): TapeCell {
  return {
    id: `cell-${++cellCounter}-${index}`,
    index,
    symbol,
  };
}

/**
 * Initializes the tape and head for a given machine and input string.
 * Starts in clean READY state without showing any final results.
 */
export function initializeSimulation(
  machine: TuringMachineDefinition,
  inputString: string
): SimulationState {
  const chars = inputString.length === 0 ? [] : inputString.split('');
  const tape: TapeCell[] = [];

  // Add leading blank cells
  for (let i = -INITIAL_LEFT_BLANKS; i < 0; i++) {
    tape.push(createCell(i, machine.blankSymbol));
  }

  // Add input symbols (index 0 to chars.length - 1)
  if (chars.length === 0) {
    tape.push(createCell(0, machine.blankSymbol));
  } else {
    for (let i = 0; i < chars.length; i++) {
      tape.push(createCell(i, chars[i]));
    }
  }

  // Add trailing blank cells
  const lastIndex = chars.length === 0 ? 0 : chars.length - 1;
  for (let i = 1; i <= INITIAL_RIGHT_BLANKS; i++) {
    tape.push(createCell(lastIndex + i, machine.blankSymbol));
  }

  // Head starts at index 0 (which is INITIAL_LEFT_BLANKS in array index)
  const initialHeadIndexInArray = INITIAL_LEFT_BLANKS;

  const initialSnapshot: StateSnapshot = {
    step: 0,
    tape: tape.map((c) => ({ ...c })),
    headIndex: initialHeadIndexInArray,
    currentState: machine.initialState,
    status: 'READY',
    activeTransition: null,
    lastEntry: null,
    subPhase: 'IDLE',
  };

  return {
    tape,
    headIndex: initialHeadIndexInArray,
    currentState: machine.initialState,
    stepCount: 0,
    status: 'READY',
    activeTransition: null,
    history: [],
    snapshots: [initialSnapshot],
    subPhase: 'IDLE',
    highlightedCellIndex: initialHeadIndexInArray,
    writtenCellIndex: null,
    prevSymbol: null,
    nextSymbol: null,
  };
}

/**
 * Formats mathematical Instantaneous Description (ID): u [q] v
 */
export function computeInstantaneousDescription(
  tape: TapeCell[],
  headIndex: number,
  currentState: string
): string {
  let firstNonBlank = 0;
  while (firstNonBlank < headIndex && tape[firstNonBlank]?.symbol === 'B') {
    firstNonBlank++;
  }
  let lastNonBlank = tape.length - 1;
  while (lastNonBlank > headIndex && tape[lastNonBlank]?.symbol === 'B') {
    lastNonBlank--;
  }

  const start = Math.min(firstNonBlank, headIndex);
  const end = Math.max(lastNonBlank, headIndex);

  let leftPart = '';
  for (let i = start; i < headIndex; i++) {
    leftPart += tape[i].symbol;
  }

  let rightPart = '';
  for (let i = headIndex; i <= end; i++) {
    rightPart += tape[i].symbol;
  }

  return `${leftPart ? leftPart + ' ' : ''}[${currentState}] ${rightPart}`;
}

/**
 * Pre-computes the complete run to determine total step count
 * and expected outcome for timeline scrubber display.
 */
export function precomputeFullRun(
  machine: TuringMachineDefinition,
  inputString: string
): { totalSteps: number; finalStatus: 'ACCEPTED' | 'REJECTED' } {
  let sim = initializeSimulation(machine, inputString);
  const MAX_STEPS = 1000;
  let count = 0;

  while (sim.status !== 'ACCEPTED' && sim.status !== 'REJECTED' && count < MAX_STEPS) {
    const next = stepSimulation(machine, sim);
    if (next.stepCount === sim.stepCount && (next.status === 'ACCEPTED' || next.status === 'REJECTED')) {
      sim = next;
      break;
    }
    sim = next;
    count++;
  }

  return {
    totalSteps: sim.stepCount,
    finalStatus: sim.status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
  };
}

/**
 * Executes one atomic transition step on the Turing Machine
 */
export function stepSimulation(
  machine: TuringMachineDefinition,
  prevState: SimulationState
): SimulationState {
  if (prevState.status === 'ACCEPTED' || prevState.status === 'REJECTED') {
    return prevState;
  }

  let currentTape = prevState.tape.map((c) => ({ ...c }));
  let headIdx = prevState.headIndex;
  const currentSymbol = currentTape[headIdx]?.symbol || machine.blankSymbol;
  const fromState = prevState.currentState;

  // Check if current state is already accept/reject
  if (machine.acceptStates.includes(fromState)) {
    return {
      ...prevState,
      status: 'ACCEPTED',
      subPhase: 'COMPLETED_STEP',
    };
  }
  if (machine.rejectStates.includes(fromState)) {
    return {
      ...prevState,
      status: 'REJECTED',
      subPhase: 'COMPLETED_STEP',
    };
  }

  // Find transition: δ(fromState, currentSymbol)
  const matchedTransition = machine.transitions.find(
    (t) => t.currentState === fromState && t.readSymbol === currentSymbol
  );

  if (!matchedTransition) {
    // Halts without explicit rule
    const isAccepted = machine.acceptStates.includes(fromState);
    const finalStatus = isAccepted ? 'ACCEPTED' : 'REJECTED';

    const logEntry: StepLogEntry = {
      step: prevState.stepCount + 1,
      fromState,
      readSymbol: currentSymbol,
      writeSymbol: currentSymbol,
      move: 'N',
      toState: finalStatus === 'ACCEPTED' ? fromState : 'q_reject',
      headIndex: currentTape[headIdx].index,
      instantaneousDescription: computeInstantaneousDescription(currentTape, headIdx, fromState),
      tapeSnapshot: currentTape.map((c) => c.symbol),
      explanation: `No transition rule found for state ${fromState} on symbol '${currentSymbol}'. Machine halts and ${finalStatus}.`,
      formalEquation: `δ(${fromState}, ${currentSymbol}) = undefined`,
      reasoning: `No explicit rule found in δ table for (${fromState}, '${currentSymbol}'). Halting machine.`,
      phaseName: 'HALT',
    };

    const newSnapshot: StateSnapshot = {
      step: prevState.stepCount + 1,
      tape: currentTape.map((c) => ({ ...c })),
      headIndex: headIdx,
      currentState: finalStatus === 'ACCEPTED' ? fromState : 'q_reject',
      status: finalStatus,
      activeTransition: null,
      lastEntry: logEntry,
      subPhase: 'COMPLETED_STEP',
    };

    return {
      ...prevState,
      status: finalStatus,
      stepCount: prevState.stepCount + 1,
      history: [logEntry, ...prevState.history],
      snapshots: [...prevState.snapshots, newSnapshot],
      activeTransition: null,
      subPhase: 'COMPLETED_STEP',
      highlightedCellIndex: headIdx,
      writtenCellIndex: null,
      prevSymbol: null,
      nextSymbol: null,
    };
  }

  // Execute transition
  const { writeSymbol, moveDirection, nextState, description, phaseName } = matchedTransition;

  // 1. Write symbol
  const prevSymbolVal = currentTape[headIdx].symbol;
  currentTape[headIdx] = {
    ...currentTape[headIdx],
    symbol: writeSymbol,
  };
  const writtenIdx = headIdx;

  // 2. Move head
  let newHeadIdx = headIdx;
  if (moveDirection === 'R') {
    newHeadIdx += 1;
  } else if (moveDirection === 'L') {
    newHeadIdx -= 1;
  }

  // 3. Dynamically expand tape if needed
  if (newHeadIdx < 2) {
    const minIndex = currentTape[0].index;
    const prependCells: TapeCell[] = [];
    for (let k = 3; k >= 1; k--) {
      prependCells.push(createCell(minIndex - k, machine.blankSymbol));
    }
    currentTape = [...prependCells, ...currentTape];
    newHeadIdx += prependCells.length;
  } else if (newHeadIdx >= currentTape.length - 2) {
    const maxIndex = currentTape[currentTape.length - 1].index;
    const appendCells: TapeCell[] = [];
    for (let k = 1; k <= 3; k++) {
      appendCells.push(createCell(maxIndex + k, machine.blankSymbol));
    }
    currentTape = [...currentTape, ...appendCells];
  }

  // 4. Status
  let nextStatus: SimulationState['status'] = 'RUNNING';
  if (machine.acceptStates.includes(nextState)) {
    nextStatus = 'ACCEPTED';
  } else if (machine.rejectStates.includes(nextState)) {
    nextStatus = 'REJECTED';
  }

  // 5. Narrative explanation
  const moveWord = moveDirection === 'R' ? 'RIGHT' : moveDirection === 'L' ? 'LEFT' : 'STAYS';
  const humanExplanation = `The machine in state ${fromState} reads '${currentSymbol}'. It writes '${writeSymbol}', moves ${moveWord}, and transitions to state ${nextState}.`;
  const formalEq = `δ(${fromState}, ${currentSymbol}) = (${nextState}, ${writeSymbol}, ${moveDirection})`;

  const logEntry: StepLogEntry = {
    step: prevState.stepCount + 1,
    fromState,
    readSymbol: currentSymbol,
    writeSymbol,
    move: moveDirection,
    toState: nextState,
    headIndex: currentTape[newHeadIdx].index,
    instantaneousDescription: computeInstantaneousDescription(currentTape, newHeadIdx, nextState),
    tapeSnapshot: currentTape.map((c) => c.symbol),
    explanation: humanExplanation,
    formalEquation: formalEq,
    reasoning: description || `Transition rule δ(${fromState}, ${currentSymbol}) executed.`,
    phaseName,
  };

  const newSnapshot: StateSnapshot = {
    step: prevState.stepCount + 1,
    tape: currentTape.map((c) => ({ ...c })),
    headIndex: newHeadIdx,
    currentState: nextState,
    status: nextStatus,
    activeTransition: matchedTransition,
    lastEntry: logEntry,
    subPhase: 'COMPLETED_STEP',
  };

  return {
    tape: currentTape,
    headIndex: newHeadIdx,
    currentState: nextState,
    stepCount: prevState.stepCount + 1,
    status: nextStatus,
    history: [logEntry, ...prevState.history],
    snapshots: [...prevState.snapshots, newSnapshot],
    activeTransition: matchedTransition,
    subPhase: 'COMPLETED_STEP',
    highlightedCellIndex: newHeadIdx,
    writtenCellIndex: writtenIdx,
    prevSymbol: prevSymbolVal,
    nextSymbol: writeSymbol,
  };
}

/**
 * Real reverse stepping: restores the exact previous snapshot state!
 */
export function stepSimulationBackward(
  prevState: SimulationState
): SimulationState {
  if (prevState.snapshots.length <= 1) {
    return prevState; // Already at step 0
  }

  const newSnapshots = prevState.snapshots.slice(0, -1);
  const targetSnapshot = newSnapshots[newSnapshots.length - 1];

  return {
    ...prevState,
    tape: targetSnapshot.tape.map((c) => ({ ...c })),
    headIndex: targetSnapshot.headIndex,
    currentState: targetSnapshot.currentState,
    stepCount: targetSnapshot.step,
    status: targetSnapshot.status === 'ACCEPTED' || targetSnapshot.status === 'REJECTED' ? targetSnapshot.status : 'PAUSED',
    activeTransition: targetSnapshot.activeTransition,
    snapshots: newSnapshots,
    history: prevState.history.filter((h) => h.step <= targetSnapshot.step),
    subPhase: 'IDLE',
    highlightedCellIndex: targetSnapshot.headIndex,
    writtenCellIndex: null,
    prevSymbol: null,
    nextSymbol: null,
  };
}

/**
 * Jump to a specific step in the snapshot stack
 */
export function jumpToStepSnapshot(
  prevState: SimulationState,
  targetStep: number
): SimulationState {
  if (targetStep < 0 || targetStep >= prevState.snapshots.length) {
    return prevState;
  }

  const targetSnapshot = prevState.snapshots[targetStep];
  const slicedSnapshots = prevState.snapshots.slice(0, targetStep + 1);

  return {
    ...prevState,
    tape: targetSnapshot.tape.map((c) => ({ ...c })),
    headIndex: targetSnapshot.headIndex,
    currentState: targetSnapshot.currentState,
    stepCount: targetSnapshot.step,
    status: targetSnapshot.status === 'ACCEPTED' || targetSnapshot.status === 'REJECTED' ? targetSnapshot.status : 'PAUSED',
    activeTransition: targetSnapshot.activeTransition,
    snapshots: slicedSnapshots,
    history: prevState.history.filter((h) => h.step <= targetSnapshot.step),
    subPhase: 'IDLE',
    highlightedCellIndex: targetSnapshot.headIndex,
    writtenCellIndex: null,
    prevSymbol: null,
    nextSymbol: null,
  };
}

/**
 * Validates input string against the machine's input alphabet
 */
export function validateMachineInput(
  machine: TuringMachineDefinition,
  input: string
): { isValid: boolean; message?: string } {
  if (input.length === 0) {
    return { isValid: true, message: 'Empty input string (blank tape)' };
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (!machine.inputAlphabet.includes(ch)) {
      return {
        isValid: false,
        message: `Invalid symbol '${ch}' at index ${i}. Alphabet Σ = {${machine.inputAlphabet.join(', ')}}`,
      };
    }
  }

  return { isValid: true, message: `Valid input over alphabet Σ = {${machine.inputAlphabet.join(', ')}}` };
}
