export type Direction = 'L' | 'R' | 'N';

export interface Transition {
  currentState: string;
  readSymbol: string;
  writeSymbol: string;
  moveDirection: Direction;
  nextState: string;
  description?: string;
  phaseName?: string;
}

export type MachineStatus = 'READY' | 'RUNNING' | 'PAUSED' | 'ACCEPTED' | 'REJECTED';

export type AnimationPhase = 
  | 'IDLE'
  | 'READING'
  | 'WRITING'
  | 'MOVING'
  | 'STATE_CHANGE'
  | 'COMPLETED_STEP';

export interface PresetInput {
  label: string;
  value: string;
  expected: 'ACCEPT' | 'REJECT';
  note?: string;
}

export interface StateNodeInfo {
  x: number;
  y: number;
  label: string;
  description: string;
  role?: 'start' | 'normal' | 'accept' | 'reject';
  color?: string;
}

export interface EdgeLayoutOverride {
  curveOffset?: number;
  labelX?: number;
  labelY?: number;
  loopDirection?: 'top' | 'bottom' | 'left' | 'right';
  pathD?: string;
}

export interface QuestionBankItem {
  id: string;
  title: string;
  category: 'Basic' | 'Intermediate' | 'Advanced';
  language: string;
  description: string;
  status: 'Ready' | 'Coming Soon';
  defaultInput?: string;
}

export interface TuringMachineDefinition {
  id: string;
  name: string;
  category?: 'Basic' | 'Intermediate' | 'Advanced';
  description: string;
  formalTitle: string;
  language: string;
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  initialState: string;
  blankSymbol: string;
  acceptStates: string[];
  rejectStates: string[];
  transitions: Transition[];
  defaultInput: string;
  presetInputs: PresetInput[];
  statePositions: Record<string, StateNodeInfo>;
  edgeLayouts?: Record<string, EdgeLayoutOverride>;
  algorithmPhases?: {
    id: string;
    label: string;
    description: string;
    states: string[];
    color: string;
  }[];
  explanationGuide: {
    title: string;
    steps: {
      step: number;
      title: string;
      desc: string;
      iconSymbol: string;
      color: string;
    }[];
  };
}

export interface TapeCell {
  id: string;
  index: number;
  symbol: string;
}

export interface StepLogEntry {
  step: number;
  fromState: string;
  readSymbol: string;
  writeSymbol: string;
  move: Direction;
  toState: string;
  headIndex: number;
  instantaneousDescription: string;
  tapeSnapshot: string[];
  explanation: string;
  formalEquation: string;
  reasoning: string;
  phaseName?: string;
}

export interface StateSnapshot {
  step: number;
  tape: TapeCell[];
  headIndex: number;
  currentState: string;
  status: MachineStatus;
  activeTransition: Transition | null;
  lastEntry: StepLogEntry | null;
  subPhase: AnimationPhase;
}

export interface SimulationState {
  tape: TapeCell[];
  headIndex: number;
  currentState: string;
  stepCount: number;
  status: MachineStatus;
  activeTransition: Transition | null;
  history: StepLogEntry[];
  snapshots: StateSnapshot[];
  subPhase: AnimationPhase;
  highlightedCellIndex: number | null;
  writtenCellIndex: number | null;
  prevSymbol: string | null;
  nextSymbol: string | null;
}
