import { TuringMachineDefinition, Transition, Direction, PresetInput } from './types';
import { initializeSimulation, stepSimulation } from './turingMachine';
import {
  AN_BN_MACHINE,
  AN_B2N_MACHINE,
  PALINDROME_MACHINE,
  EQUAL_01_MACHINE,
  EVEN_1S_MACHINE,
  UNARY_INCREMENT_MACHINE,
  AN_BN_CN_MACHINE,
  STRING_COPY_MACHINE,
  BINARY_ADDITION_MACHINE,
  BINARY_SUBTRACTION_MACHINE,
  UNARY_TO_BINARY_MACHINE,
  BINARY_DECREMENT_MACHINE,
} from '../data/machines';

export interface InterpretationResult {
  isSupported: boolean;
  confidence: 'high' | 'medium' | 'unsupported';
  normalizedQuestion: string;
  interpretationText: string;
  matchedId: string;
  buildMachine: () => TuringMachineDefinition;
  testCases: { input: string; expected: 'ACCEPT' | 'REJECT' }[];
}

/**
 * 1. aⁿbⁿcⁿ Generator (Context-Sensitive language)
 */
function buildAnBnCnMachine(): TuringMachineDefinition {
  const transitions: Transition[] = [
    // q0: Find leftmost unmarked 'a', replace with X, seek 'b' in q1
    { currentState: 'q0', readSymbol: 'a', writeSymbol: 'X', moveDirection: 'R', nextState: 'q1', phaseName: 'MARK_A', description: 'Found leftmost "a". Mark as "X" and seek matching "b" in state q1.' },
    { currentState: 'q0', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0', phaseName: 'MARK_A', description: 'Scanning past previously marked "X".' },
    { currentState: 'q0', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q4', phaseName: 'VERIFY', description: 'All "a"s marked. Switch to state q4 to verify remaining symbols.' },
    { currentState: 'q0', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Unexpected "b" in q0. Reject.' },
    { currentState: 'q0', readSymbol: 'c', writeSymbol: 'c', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Unexpected "c" in q0. Reject.' },
    { currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Empty string is not in L. Reject.' },

    // q1: Seek matching 'b', replace with Y, seek 'c' in q2
    { currentState: 'q1', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'R', nextState: 'q1', phaseName: 'SEEK_B', description: 'Scanning right past "a"s.' },
    { currentState: 'q1', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q1', phaseName: 'SEEK_B', description: 'Scanning right past marked "Y"s.' },
    { currentState: 'q1', readSymbol: 'b', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q2', phaseName: 'SEEK_B', description: 'Found matching "b"! Mark as "Y" and seek corresponding "c" in state q2.' },
    { currentState: 'q1', readSymbol: 'c', writeSymbol: 'c', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Found "c" before finding matching "b". Reject.' },
    { currentState: 'q1', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Missing matching "b". Reject.' },

    // q2: Seek matching 'c', replace with Z, transition to rewind state q3
    { currentState: 'q2', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'R', nextState: 'q2', phaseName: 'SEEK_C', description: 'Scanning right past "b"s.' },
    { currentState: 'q2', readSymbol: 'Z', writeSymbol: 'Z', moveDirection: 'R', nextState: 'q2', phaseName: 'SEEK_C', description: 'Scanning right past marked "Z"s.' },
    { currentState: 'q2', readSymbol: 'c', writeSymbol: 'Z', moveDirection: 'L', nextState: 'q3', phaseName: 'SEEK_C', description: 'Found matching "c"! Mark as "Z" and enter rewind state q3.' },
    { currentState: 'q2', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Missing matching "c". Reject.' },

    // q3: Rewind left all the way back to the leftmost marked 'X'
    { currentState: 'q3', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'L', nextState: 'q3', phaseName: 'REWIND', description: 'Rewinding left across "a"s.' },
    { currentState: 'q3', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'L', nextState: 'q3', phaseName: 'REWIND', description: 'Rewinding left across "b"s.' },
    { currentState: 'q3', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q3', phaseName: 'REWIND', description: 'Rewinding left across "Y"s.' },
    { currentState: 'q3', readSymbol: 'Z', writeSymbol: 'Z', moveDirection: 'L', nextState: 'q3', phaseName: 'REWIND', description: 'Rewinding left across "Z"s.' },
    { currentState: 'q3', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0', phaseName: 'REWIND', description: 'Hit "X"! Step one cell right to resume in q0.' },

    // q4: Verifying 'Y's and transitioning to 'Z's
    { currentState: 'q4', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q4', phaseName: 'VERIFY', description: 'Verifying marked "Y"s.' },
    { currentState: 'q4', readSymbol: 'Z', writeSymbol: 'Z', moveDirection: 'R', nextState: 'q5', phaseName: 'VERIFY', description: 'Finished "Y"s, now verifying "Z"s in state q5.' },
    { currentState: 'q4', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Rogue "b" in verification phase. Reject.' },

    // q5: Verifying 'Z's until trailing blank 'B'
    { currentState: 'q5', readSymbol: 'Z', writeSymbol: 'Z', moveDirection: 'R', nextState: 'q5', phaseName: 'VERIFY', description: 'Verifying marked "Z"s.' },
    { currentState: 'q5', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_accept', phaseName: 'ACCEPT', description: 'Reached blank with all a, b, c symbols 1-to-1-to-1 matched! ACCEPT.' },
    { currentState: 'q5', readSymbol: 'c', writeSymbol: 'c', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Extra "c" detected. Reject.' },
  ];

  return {
    id: 'anbncn-generated',
    name: 'aⁿbⁿcⁿ',
    category: 'Intermediate',
    description: 'Generated Context-Sensitive language Turing Machine for L = { aⁿbⁿcⁿ | n ≥ 1 } using markers X, Y, Z.',
    formalTitle: 'Language Recognition: aⁿbⁿcⁿ (Context-Sensitive Matching)',
    language: 'L = { aⁿbⁿcⁿ | n ≥ 1 }',
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q_accept', 'q_reject'],
    inputAlphabet: ['a', 'b', 'c'],
    tapeAlphabet: ['a', 'b', 'c', 'X', 'Y', 'Z', 'B'],
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: 'aabbcc',
    presetInputs: [
      { label: 'abc', value: 'abc', expected: 'ACCEPT', note: 'n = 1 (minimal string)' },
      { label: 'aabbcc', value: 'aabbcc', expected: 'ACCEPT', note: 'n = 2 (2 of each)' },
      { label: 'aaabbbccc', value: 'aaabbbccc', expected: 'ACCEPT', note: 'n = 3 (3 of each)' },
      { label: 'aabbc', value: 'aabbc', expected: 'REJECT', note: 'Missing one c' },
      { label: 'abcc', value: 'abcc', expected: 'REJECT', note: 'Extra c' },
      { label: 'aabbbccc', value: 'aabbbccc', expected: 'REJECT', note: 'Extra b' },
      { label: 'cba', value: 'cba', expected: 'REJECT', note: 'Reversed order' },
    ],
    algorithmPhases: [
      { id: 'MARK_A', label: 'MARK "a"', description: 'Find leftmost "a" and mark as "X"', states: ['q0'], color: '#2563eb' },
      { id: 'SEEK_B', label: 'MATCH "b"', description: 'Find matching "b" and mark as "Y"', states: ['q1'], color: '#7c3aed' },
      { id: 'SEEK_C', label: 'MATCH "c"', description: 'Find matching "c" and mark as "Z"', states: ['q2'], color: '#16a34a' },
      { id: 'REWIND', label: 'REWIND', description: 'Return left to marker "X"', states: ['q3'], color: '#d97706' },
      { id: 'VERIFY', label: 'VERIFY', description: 'Confirm all symbols matched', states: ['q4', 'q5'], color: '#0891b2' },
    ],
    statePositions: {
      q0: { x: 120, y: 130, label: 'q0', description: 'Mark next a', role: 'start', color: '#2563eb' },
      q1: { x: 300, y: 90, label: 'q1', description: 'Match b', role: 'normal', color: '#7c3aed' },
      q2: { x: 480, y: 90, label: 'q2', description: 'Match c', role: 'normal', color: '#16a34a' },
      q3: { x: 300, y: 250, label: 'q3', description: 'Rewind left', role: 'normal', color: '#d97706' },
      q4: { x: 640, y: 90, label: 'q4', description: 'Verify Y', role: 'normal', color: '#0891b2' },
      q5: { x: 760, y: 90, label: 'q5', description: 'Verify Z', role: 'normal', color: '#0284c7' },
      q_accept: { x: 880, y: 90, label: 'q_accept', description: 'Accept ✓', role: 'accept', color: '#16a34a' },
      q_reject: { x: 640, y: 250, label: 'q_reject', description: 'Reject ✕', role: 'reject', color: '#dc2626' },
    },
    edgeLayouts: {
      'q0-->q1': { labelX: 210, labelY: 85, curveOffset: 0 },
      'q1-->q2': { labelX: 390, labelY: 70, curveOffset: 0 },
      'q2-->q3': { labelX: 390, labelY: 190, curveOffset: 0 },
      'q3-->q0': { labelX: 210, labelY: 210, curveOffset: 0 },
      'q0-->q4': { labelX: 470, labelY: 20, curveOffset: 45 },
      'q4-->q5': { labelX: 700, labelY: 70, curveOffset: 0 },
      'q5-->q_accept': { labelX: 820, labelY: 70, curveOffset: 0 },
      'q4-->q_reject': { labelX: 670, labelY: 170, curveOffset: 0 },
      'q5-->q_reject': { labelX: 720, labelY: 210, curveOffset: 0 },
      'q0-->q0': { loopDirection: 'left' },
      'q1-->q1': { loopDirection: 'top' },
      'q2-->q2': { loopDirection: 'top' },
      'q3-->q3': { loopDirection: 'bottom' },
      'q4-->q4': { loopDirection: 'top' },
      'q5-->q5': { loopDirection: 'top' },
    },
    explanationGuide: {
      title: '3-Way Context-Sensitive Marking Algorithm',
      steps: [
        { step: 1, title: 'Mark an "a" → X', desc: 'In state q0, mark leftmost "a" as "X", move right to q1.', iconSymbol: 'X', color: '#2563eb' },
        { step: 2, title: 'Mark matching "b" → Y', desc: 'In state q1, find first unmarked "b", mark as "Y", and enter q2.', iconSymbol: 'Y', color: '#7c3aed' },
        { step: 3, title: 'Mark matching "c" → Z', desc: 'In state q2, find first unmarked "c", mark as "Z", then rewind left in q3.', iconSymbol: 'Z', color: '#16a34a' },
        { step: 4, title: 'Rewind & Verify', desc: 'In state q3, return left to marker "X". Once all "a"s are processed, q4 and q5 verify no leftover symbols remain.', iconSymbol: '✓', color: '#0891b2' },
      ],
    },
  };
}

/**
 * 2. aⁿb³ⁿ Generator (1 a paired with 3 b's)
 */
function buildAnBn3Machine(): TuringMachineDefinition {
  const transitions: Transition[] = [
    // q0: mark a -> X, move R -> q1
    { currentState: 'q0', readSymbol: 'a', writeSymbol: 'X', moveDirection: 'R', nextState: 'q1', phaseName: 'MARK', description: 'Found "a". Mark with "X" and seek 1st "b".' },
    { currentState: 'q0', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0', phaseName: 'MARK', description: 'Scanning past marked "X".' },
    { currentState: 'q0', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q4', phaseName: 'VERIFY', description: 'All "a"s marked. Verify "Y"s in q4.' },
    { currentState: 'q0', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Unexpected "b" in q0. Reject.' },
    { currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Empty string is rejected.' },

    // q1: seek 1st b -> Y, enter q2
    { currentState: 'q1', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'R', nextState: 'q1', phaseName: 'MATCH', description: 'Scanning past "a"s.' },
    { currentState: 'q1', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q1', phaseName: 'MATCH', description: 'Scanning past "Y"s.' },
    { currentState: 'q1', readSymbol: 'b', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q2', phaseName: 'MATCH', description: 'Found 1st "b"! Mark as "Y" and seek 2nd "b" in q2.' },
    { currentState: 'q1', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Missing 1st "b". Reject.' },

    // q2: seek 2nd b -> Y, enter q3
    { currentState: 'q2', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q2', phaseName: 'MATCH', description: 'Scanning past "Y"s.' },
    { currentState: 'q2', readSymbol: 'b', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q3', phaseName: 'MATCH', description: 'Found 2nd "b"! Mark as "Y" and seek 3rd "b" in q3.' },
    { currentState: 'q2', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Missing 2nd "b". Reject.' },

    // q3: seek 3rd b -> Y, enter rewind q_rewind
    { currentState: 'q3', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q3', phaseName: 'MATCH', description: 'Scanning past "Y"s.' },
    { currentState: 'q3', readSymbol: 'b', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q_rewind', phaseName: 'MATCH', description: 'Found 3rd "b"! Mark as "Y" and rewind.' },
    { currentState: 'q3', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Missing 3rd "b". Reject.' },

    // q_rewind: rewind left to left blank B
    { currentState: 'q_rewind', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'L', nextState: 'q_rewind', phaseName: 'REWIND', description: 'Rewinding left across "a".' },
    { currentState: 'q_rewind', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'L', nextState: 'q_rewind', phaseName: 'REWIND', description: 'Rewinding left across "b".' },
    { currentState: 'q_rewind', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'L', nextState: 'q_rewind', phaseName: 'REWIND', description: 'Rewinding left across "X".' },
    { currentState: 'q_rewind', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q_rewind', phaseName: 'REWIND', description: 'Rewinding left across "Y".' },
    { currentState: 'q_rewind', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q0', phaseName: 'REWIND', description: 'Hit left blank boundary "B"! Step right into q0.' },

    // q4: verify all Y's
    { currentState: 'q4', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q4', phaseName: 'VERIFY', description: 'Verifying "Y"s.' },
    { currentState: 'q4', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_accept', phaseName: 'ACCEPT', description: 'All 3n "b"s verified for n "a"s! ACCEPT.' },
    { currentState: 'q4', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'R', nextState: 'q_reject', phaseName: 'REJECT', description: 'Extra "b" detected. Reject.' },
  ];

  return {
    id: 'anb3n-generated',
    name: 'aⁿb³ⁿ',
    category: 'Intermediate',
    description: 'Turing Machine for L = { aⁿb³ⁿ | n ≥ 1 } matching each "a" with three "b"s.',
    formalTitle: 'Language Recognition: aⁿb³ⁿ (Triple b for each a)',
    language: 'L = { aⁿb³ⁿ | n ≥ 1 }',
    states: ['q0', 'q1', 'q2', 'q3', 'q_rewind', 'q4', 'q_accept', 'q_reject'],
    inputAlphabet: ['a', 'b'],
    tapeAlphabet: ['a', 'b', 'X', 'Y', 'B'],
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: 'abbb',
    presetInputs: [
      { label: 'abbb', value: 'abbb', expected: 'ACCEPT', note: 'n = 1 (1 a, 3 b\'s)' },
      { label: 'aabbbbbb', value: 'aabbbbbb', expected: 'ACCEPT', note: 'n = 2 (2 a\'s, 6 b\'s)' },
      { label: 'abb', value: 'abb', expected: 'REJECT', note: 'Only 2 b\'s' },
      { label: 'abbbb', value: 'abbbb', expected: 'REJECT', note: '4 b\'s (not 3n)' },
    ],
    algorithmPhases: [
      { id: 'MARK', label: 'MARK "a"', description: 'Find and mark "a"', states: ['q0'], color: '#2563eb' },
      { id: 'MATCH', label: 'MATCH 3 "b"s', description: 'Mark three consecutive "b"s', states: ['q1', 'q2', 'q3'], color: '#16a34a' },
      { id: 'REWIND', label: 'REWIND', description: 'Rewind left to start', states: ['q_rewind'], color: '#d97706' },
      { id: 'VERIFY', label: 'VERIFY', description: 'Verify all symbols matched', states: ['q4'], color: '#0891b2' },
    ],
    statePositions: {
      q0: { x: 130, y: 130, label: 'q0', description: 'Mark a', role: 'start', color: '#2563eb' },
      q1: { x: 300, y: 90, label: 'q1', description: '1st b', role: 'normal', color: '#7c3aed' },
      q2: { x: 450, y: 90, label: 'q2', description: '2nd b', role: 'normal', color: '#0891b2' },
      q3: { x: 600, y: 90, label: 'q3', description: '3rd b', role: 'normal', color: '#16a34a' },
      q_rewind: { x: 360, y: 250, label: 'q_rewind', description: 'Rewind', role: 'normal', color: '#d97706' },
      q4: { x: 740, y: 90, label: 'q4', description: 'Verify', role: 'normal', color: '#0284c7' },
      q_accept: { x: 870, y: 90, label: 'q_accept', description: 'Accept ✓', role: 'accept', color: '#16a34a' },
      q_reject: { x: 740, y: 250, label: 'q_reject', description: 'Reject ✕', role: 'reject', color: '#dc2626' },
    },
    explanationGuide: {
      title: '3-to-1 Symbol Marking Strategy',
      steps: [
        { step: 1, title: 'Mark "a" → X', desc: 'Mark current "a" with "X" in state q0.', iconSymbol: 'X', color: '#2563eb' },
        { step: 2, title: 'Mark three "b"s → Y', desc: 'Advance through states q1, q2, q3 marking 3 distinct "b"s with "Y".', iconSymbol: '3×Y', color: '#16a34a' },
        { step: 3, title: 'Rewind & Repeat', desc: 'Return left in q_rewind and repeat until all "a"s are exhausted.', iconSymbol: '←', color: '#d97706' },
        { step: 4, title: 'Verify & Accept', desc: 'Verify in state q4 that no excess "b"s remain.', iconSymbol: '✓', color: '#0891b2' },
      ],
    },
  };
}

/**
 * 3. Binary Increment Generator (e.g. 1011 -> 1100)
 */
function buildBinaryIncrementMachine(): TuringMachineDefinition {
  const transitions: Transition[] = [
    // q0: scan right across 0 and 1 to find the end of the binary string
    { currentState: 'q0', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q0', description: 'Scanning right past 0.' },
    { currentState: 'q0', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q0', description: 'Scanning right past 1.' },
    { currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'L', nextState: 'q1', description: 'Found right end of binary string. Step back to least significant bit in q1.' },

    // q1: Add 1 (propagate carry left)
    { currentState: 'q1', readSymbol: '1', writeSymbol: '0', moveDirection: 'L', nextState: 'q1', description: '1 + 1 = 0 with carry 1. Write 0 and move left.' },
    { currentState: 'q1', readSymbol: '0', writeSymbol: '1', moveDirection: 'L', nextState: 'q2', description: '0 + 1 = 1 with no carry. Write 1 and transition to rewind state q2.' },
    { currentState: 'q1', readSymbol: 'B', writeSymbol: '1', moveDirection: 'L', nextState: 'q2', description: 'Carry overflow! Write 1 at front of number.' },

    // q2: Rewind to start of binary string
    { currentState: 'q2', readSymbol: '0', writeSymbol: '0', moveDirection: 'L', nextState: 'q2', description: 'Rewinding left past 0.' },
    { currentState: 'q2', readSymbol: '1', writeSymbol: '1', moveDirection: 'L', nextState: 'q2', description: 'Rewinding left past 1.' },
    { currentState: 'q2', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_accept', description: 'Hit left blank boundary. Position head at MSB and halt.' },
  ];

  return {
    id: 'bininc-generated',
    name: 'Binary Increment',
    category: 'Basic',
    description: 'Transducer that computes f(w) = w + 1 in binary notation with carry propagation.',
    formalTitle: 'Transducer: f(w) = w + 1 (Binary Addition of 1)',
    language: 'f(w) = w + 1 in base 2',
    states: ['q0', 'q1', 'q2', 'q_accept', 'q_reject'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'B'],
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: '1011',
    presetInputs: [
      { label: '1011 → 1100', value: '1011', expected: 'ACCEPT', note: '11 to 12' },
      { label: '111 → 1000', value: '111', expected: 'ACCEPT', note: '7 to 8 (carry overflow)' },
      { label: '100 → 101', value: '100', expected: 'ACCEPT', note: '4 to 5' },
      { label: '0 → 1', value: '0', expected: 'ACCEPT', note: '0 to 1' },
    ],
    statePositions: {
      q0: { x: 180, y: 160, label: 'q0', description: 'Scan to LSB', role: 'start', color: '#2563eb' },
      q1: { x: 440, y: 160, label: 'q1', description: 'Add 1 & Carry', role: 'normal', color: '#7c3aed' },
      q2: { x: 680, y: 160, label: 'q2', description: 'Rewind to MSB', role: 'normal', color: '#d97706' },
      q_accept: { x: 840, y: 160, label: 'q_accept', description: 'Incremented ✓', role: 'accept', color: '#16a34a' },
      q_reject: { x: 440, y: 280, label: 'q_reject', description: 'Reject ✕', role: 'reject', color: '#dc2626' },
    },
    explanationGuide: {
      title: 'Binary Increment with Carry Propagation',
      steps: [
        { step: 1, title: 'Locate LSB', desc: 'Scan tape to rightmost binary bit.', iconSymbol: '→', color: '#2563eb' },
        { step: 2, title: 'Add 1 & Carry', desc: 'Flip 1s to 0s propagating carry until reaching first 0 or blank, write 1.', iconSymbol: '+1', color: '#7c3aed' },
        { step: 3, title: 'Rewind & Halt', desc: 'Return left to most significant bit and accept.', iconSymbol: '✓', color: '#16a34a' },
      ],
    },
  };
}

/**
 * 1's Complement Transducer Generator: f(w) = not(w)
 */
export function buildOnesComplementMachine(): TuringMachineDefinition {
  const transitions: Transition[] = [
    // q0: Invert bits while moving right until trailing blank
    { currentState: 'q0', readSymbol: '0', writeSymbol: '1', moveDirection: 'R', nextState: 'q0', phaseName: 'INVERT', description: 'Bit 0 → Inverted to 1. Move right.' },
    { currentState: 'q0', readSymbol: '1', writeSymbol: '0', moveDirection: 'R', nextState: 'q0', phaseName: 'INVERT', description: 'Bit 1 → Inverted to 0. Move right.' },
    { currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'L', nextState: 'q1', phaseName: 'REWIND', description: 'Reached right blank boundary. Step left to rewind in q1.' },

    // q1: Rewind left back to MSB
    { currentState: 'q1', readSymbol: '0', writeSymbol: '0', moveDirection: 'L', nextState: 'q1', phaseName: 'REWIND', description: 'Rewinding left across 0.' },
    { currentState: 'q1', readSymbol: '1', writeSymbol: '1', moveDirection: 'L', nextState: 'q1', phaseName: 'REWIND', description: 'Rewinding left across 1.' },
    { currentState: 'q1', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_accept', phaseName: 'ACCEPT', description: 'Hit left blank boundary. Position head at MSB and accept ✓' },
  ];

  const presetInputs: PresetInput[] = [
    { label: '1011 → 0100', value: '1011', expected: 'ACCEPT', note: 'Bit inversion' },
    { label: '1100 → 0011', value: '1100', expected: 'ACCEPT', note: 'All bits flipped' },
    { label: '0 → 1', value: '0', expected: 'ACCEPT', note: 'Single bit 0' },
    { label: '1 → 0', value: '1', expected: 'ACCEPT', note: 'Single bit 1' },
    { label: '101010 → 010101', value: '101010', expected: 'ACCEPT', note: 'Alternating bits' },
  ];

  return {
    id: `ones-complement-${Date.now()}`,
    name: "1's Complement Transducer",
    category: 'Basic',
    description: "Turing Machine transducer that computes the 1's complement of an arbitrary binary string by flipping every bit (0 ↔ 1).",
    formalTitle: "Transducer: f(w) = 1's Complement of w",
    language: "f(w) = w̄ (Bitwise NOT in base 2)",
    states: ['q0', 'q1', 'q_accept', 'q_reject'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'B'],
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: '1011',
    presetInputs,
    algorithmPhases: [
      { id: 'INVERT', label: 'BITWISE INVERSION', description: 'Scan right replacing 0 with 1 and 1 with 0', states: ['q0'], color: '#2563eb' },
      { id: 'REWIND', label: 'REWIND TO MSB', description: 'Return tape head left to most significant bit', states: ['q1'], color: '#7c3aed' },
      { id: 'ACCEPT', label: 'COMPLETED', description: 'Position head at start and halt in accept state', states: ['q_accept'], color: '#16a34a' },
    ],
    statePositions: {
      q0: { x: 180, y: 140, label: 'q0', description: 'Flip bits (0↔1)', role: 'start', color: '#2563eb' },
      q1: { x: 460, y: 140, label: 'q1', description: 'Rewind left', role: 'normal', color: '#7c3aed' },
      q_accept: { x: 740, y: 140, label: 'q_accept', description: 'Done ✓', role: 'accept', color: '#16a34a' },
      q_reject: { x: 460, y: 260, label: 'q_reject', description: 'Reject ✕', role: 'reject', color: '#dc2626' },
    },
    edgeLayouts: {
      'q0-->q0': { loopDirection: 'top' },
      'q0-->q1': { labelX: 320, labelY: 115, curveOffset: 0 },
      'q1-->q1': { loopDirection: 'top' },
      'q1-->q_accept': { labelX: 600, labelY: 115, curveOffset: 0 },
    },
    explanationGuide: {
      title: "1's Complement Bitwise Inversion",
      steps: [
        { step: 1, title: 'Invert Every Bit', desc: 'In state q0, scan left-to-right replacing every 0 with 1, and every 1 with 0.', iconSymbol: '0↔1', color: '#2563eb' },
        { step: 2, title: 'Locate End of String', desc: 'Upon reading the trailing blank B, step one cell left to enter rewind state q1.', iconSymbol: '←', color: '#7c3aed' },
        { step: 3, title: 'Rewind & Halt', desc: 'Rewind left to the beginning blank boundary and halt at the most significant bit.', iconSymbol: '✓', color: '#16a34a' },
      ],
    },
  };
}

/**
 * 2's Complement Transducer Generator
 */
export function buildTwosComplementMachine(): TuringMachineDefinition {
  const transitions: Transition[] = [
    // q0: Scan right to find the end (LSB) of the binary string
    { currentState: 'q0', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q0', phaseName: 'SEEK_LSB', description: 'Scanning right past 0.' },
    { currentState: 'q0', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q0', phaseName: 'SEEK_LSB', description: 'Scanning right past 1.' },
    { currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'L', nextState: 'q1', phaseName: 'SCAN_TRAILING', description: 'Found right end of number. Step left to begin 2\'s complement scan in q1.' },

    // q1: Moving left - preserve trailing 0's and first 1
    { currentState: 'q1', readSymbol: '0', writeSymbol: '0', moveDirection: 'L', nextState: 'q1', phaseName: 'SCAN_TRAILING', description: 'Trailing 0 preserved unchanged. Move left.' },
    { currentState: 'q1', readSymbol: '1', writeSymbol: '1', moveDirection: 'L', nextState: 'q2', phaseName: 'INVERT_PREFIX', description: 'First 1 preserved! Transition to state q2 to invert all remaining left bits.' },
    { currentState: 'q1', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_accept', phaseName: 'ACCEPT', description: 'All-zeros string. Position head at MSB and accept ✓' },

    // q2: Moving left - invert all remaining bits to the left
    { currentState: 'q2', readSymbol: '0', writeSymbol: '1', moveDirection: 'L', nextState: 'q2', phaseName: 'INVERT_PREFIX', description: 'Prefix bit 0 → Inverted to 1. Move left.' },
    { currentState: 'q2', readSymbol: '1', writeSymbol: '0', moveDirection: 'L', nextState: 'q2', phaseName: 'INVERT_PREFIX', description: 'Prefix bit 1 → Inverted to 0. Move left.' },
    { currentState: 'q2', readSymbol: 'B', writeSymbol: 'B', moveDirection: 'R', nextState: 'q_accept', phaseName: 'ACCEPT', description: 'Hit left blank boundary! Position head at MSB. 2\'s complement complete ✓' },
  ];

  const presetInputs: PresetInput[] = [
    { label: '1100 → 0100', value: '1100', expected: 'ACCEPT', note: '12 → 4 in 4-bit' },
    { label: '1011 → 0101', value: '1011', expected: 'ACCEPT', note: '11 → 5 in 4-bit' },
    { label: '1010 → 0110', value: '1010', expected: 'ACCEPT', note: '10 → 6 in 4-bit' },
    { label: '1000 → 1000', value: '1000', expected: 'ACCEPT', note: '8 → 8 (MSB boundary)' },
    { label: '1111 → 0001', value: '1111', expected: 'ACCEPT', note: 'All ones' },
    { label: '0000 → 0000', value: '0000', expected: 'ACCEPT', note: 'All zeros' },
  ];

  return {
    id: `twos-complement-${Date.now()}`,
    name: "2's Complement Transducer",
    category: 'Basic',
    description: "Turing Machine transducer that computes the 2's complement of a binary number (f(w) = -w in 2's complement).",
    formalTitle: "Transducer: f(w) = 2's Complement of w",
    language: "f(w) = 2's Complement of w (Base 2)",
    states: ['q0', 'q1', 'q2', 'q_accept', 'q_reject'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'B'],
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: '1100',
    presetInputs,
    algorithmPhases: [
      { id: 'SEEK_LSB', label: 'SEEK LSB', description: 'Scan right to find least significant bit', states: ['q0'], color: '#2563eb' },
      { id: 'SCAN_TRAILING', label: 'PRESERVE TRAILING', description: 'Keep trailing 0s and first 1 unchanged', states: ['q1'], color: '#7c3aed' },
      { id: 'INVERT_PREFIX', label: 'INVERT PREFIX', description: 'Flip all bits left of the first 1 (0 ↔ 1)', states: ['q2'], color: '#0891b2' },
      { id: 'ACCEPT', label: 'COMPLETED', description: 'Position head at MSB and accept', states: ['q_accept'], color: '#16a34a' },
    ],
    statePositions: {
      q0: { x: 140, y: 140, label: 'q0', description: 'Scan to LSB', role: 'start', color: '#2563eb' },
      q1: { x: 380, y: 140, label: 'q1', description: 'Keep 0s & 1st 1', role: 'normal', color: '#7c3aed' },
      q2: { x: 620, y: 140, label: 'q2', description: 'Invert rest (0↔1)', role: 'normal', color: '#0891b2' },
      q_accept: { x: 840, y: 140, label: 'q_accept', description: 'Done ✓', role: 'accept', color: '#16a34a' },
      q_reject: { x: 380, y: 260, label: 'q_reject', description: 'Reject ✕', role: 'reject', color: '#dc2626' },
    },
    edgeLayouts: {
      'q0-->q0': { loopDirection: 'top' },
      'q0-->q1': { labelX: 260, labelY: 115, curveOffset: 0 },
      'q1-->q1': { loopDirection: 'top' },
      'q1-->q2': { labelX: 500, labelY: 115, curveOffset: 0 },
      'q1-->q_accept': { labelX: 610, labelY: 50, curveOffset: -30 },
      'q2-->q2': { loopDirection: 'top' },
      'q2-->q_accept': { labelX: 730, labelY: 115, curveOffset: 0 },
    },
    explanationGuide: {
      title: "2's Complement Direct Scan Algorithm",
      steps: [
        { step: 1, title: 'Locate LSB (Rightmost Bit)', desc: 'Scan tape right in state q0 until reaching trailing blank B, then step left into q1.', iconSymbol: '→', color: '#2563eb' },
        { step: 2, title: 'Preserve Trailing 0s & First 1', desc: 'In state q1, moving left: keep all trailing 0s unchanged. When the first 1 is encountered, leave it as 1 and enter state q2.', iconSymbol: '0*1', color: '#7c3aed' },
        { step: 3, title: 'Invert Remaining Bits', desc: 'In state q2, invert every remaining bit to the left (flip 0 to 1 and 1 to 0) until reaching left blank B.', iconSymbol: '0↔1', color: '#0891b2' },
        { step: 4, title: 'Reposition Head & Accept', desc: 'Hit left blank boundary, position head at most significant bit, and accept.', iconSymbol: '✓', color: '#16a34a' },
      ],
    },
  };
}

/**
 * Consistent Write Symbol Mapping:
 * Maps each input/read symbol to a deterministic, unique write marker symbol across the entire machine.
 * E.g. 'a' -> 'X', 'b' -> 'Y', 'c' -> 'Z', 'd' -> 'W'
 *      '0' -> 'X', '1' -> 'Y', '2' -> 'Z', '3' -> 'W'
 */
export function getConsistentWriteSymbol(readSym: string, alphabet?: string[]): string {
  const fixedMap: Record<string, string> = {
    'a': 'X',
    'b': 'Y',
    'c': 'Z',
    'd': 'W',
    'e': 'U',
    'f': 'V',
    '0': 'X',
    '1': 'Y',
    '2': 'Z',
    '3': 'W',
    '4': 'U',
    '5': 'V',
    'A': 'X',
    'B': 'Y',
    'C': 'Z',
    'D': 'W',
  };

  if (fixedMap[readSym]) {
    return fixedMap[readSym];
  }

  const markerList = ['X', 'Y', 'Z', 'W', 'U', 'V', 'M', 'N', 'P', 'Q'];
  if (alphabet && alphabet.length > 0) {
    const idx = alphabet.indexOf(readSym);
    if (idx >= 0 && idx < markerList.length) {
      return markerList[idx];
    }
  }

  return readSym.toUpperCase() !== readSym ? readSym.toUpperCase() : 'X';
}

/**
 * Parses free-form string targets, alphabets, and matching modes from queries
 */
export function extractTargetString(q: string): {
  target: string;
  alphabet: string[];
  mode: 'exact' | 'contains' | 'starts_with' | 'ends_with';
} | null {
  const lower = q.toLowerCase();
  let mode: 'exact' | 'contains' | 'starts_with' | 'ends_with' = 'exact';
  if (lower.includes('contain') || lower.includes('substring') || lower.includes('having')) {
    mode = 'contains';
  } else if (lower.includes('starts with') || lower.includes('start with') || lower.includes('beginning with')) {
    mode = 'starts_with';
  } else if (lower.includes('ends with') || lower.includes('end with') || lower.includes('ending with')) {
    mode = 'ends_with';
  }

  // 1. Quoted string: '01*0' or "01*0"
  const quoteMatch = q.match(/['"]([a-zA-Z0-9*+]+)['"]/);
  // 2. Set notation: L = { 01*0 } or { 01*0 }
  const setMatch = q.match(/\{\s*([a-zA-Z0-9*+]+)\s*\}/);
  // 3. Language / string / word <target>
  const langMatch = q.match(/(?:language|string|word|pattern)\s+['"]?([a-zA-Z0-9*+]+)['"]?/i);
  // 4. Accepts / recognizing <target>
  const acceptMatch = q.match(/(?:accepts|accepting|accept|recognizes|recognizing)\s+(?:language\s+)?['"]?([a-zA-Z0-9*+]+)['"]?/i);

  let target = quoteMatch?.[1] || setMatch?.[1] || langMatch?.[1] || acceptMatch?.[1];

  if (!target) return null;

  // Filter out stop words that might be matched accidentally
  const stopWords = new Set(['a', 'the', 'an', 'language', 'string', 'turing', 'machine', 'tm', 'binary', 'unary']);
  if (stopWords.has(target.toLowerCase()) && !quoteMatch && !setMatch) {
    return null;
  }

  // Parse alphabet if specified (e.g. input{0,1}, over {0,1}, sigma = {a,b})
  let customAlphabet: string[] = [];
  const alphaMatch = q.match(/(?:input|alphabet|over|sigma|∑)\s*[:=]?\s*[\{]?\s*([a-zA-Z0-9,\s]+)[\}]?/i);
  if (alphaMatch && alphaMatch[1]) {
    customAlphabet = alphaMatch[1]
      .split(/[,|\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length === 1 && /[a-zA-Z0-9]/.test(s));
  }

  const rawChars = target.replace(/[*+]/g, '').split('');
  const charSet = new Set<string>(rawChars);
  if (customAlphabet.length > 0) {
    customAlphabet.forEach((c) => charSet.add(c));
  } else {
    if (charSet.has('a') || charSet.has('b')) {
      charSet.add('a');
      charSet.add('b');
    } else if (charSet.has('0') || charSet.has('1')) {
      charSet.add('0');
      charSet.add('1');
    }
  }

  return {
    target,
    alphabet: Array.from(charSet),
    mode,
  };
}

/**
 * Dynamic Regular Expression Recognizer Builder for Star Patterns like 01*0 or a*b
 * Consistently replaces each input symbol with its dedicated marker (0 -> X, 1 -> Y).
 */
export function buildStarRegexMachine(pattern: string, customAlphabet?: string[]): TuringMachineDefinition {
  const starMatch = pattern.match(/^([a-zA-Z0-9]*?)([a-zA-Z0-9])\*([a-zA-Z0-9]*)$/);
  const prefix = starMatch ? starMatch[1] : '';
  const starChar = starMatch ? starMatch[2] : (pattern.replace(/[*+]/g, '')[0] || '1');
  const suffix = starMatch ? starMatch[3] : '';

  const rawChars = pattern.replace(/[*+]/g, '').split('');
  const charSet = new Set<string>(rawChars);
  if (customAlphabet && customAlphabet.length > 0) {
    customAlphabet.forEach((c) => charSet.add(c));
  } else {
    if (charSet.has('a') || charSet.has('b')) {
      charSet.add('a');
      charSet.add('b');
    } else if (charSet.has('0') || charSet.has('1')) {
      charSet.add('0');
      charSet.add('1');
    }
  }

  const inputAlphabet = Array.from(charSet);
  const prefixMarker = prefix ? getConsistentWriteSymbol(prefix, inputAlphabet) : '';
  const starMarker = getConsistentWriteSymbol(starChar, inputAlphabet);
  const suffixMarker = suffix ? getConsistentWriteSymbol(suffix, inputAlphabet) : '';

  const usedMarkers = Array.from(new Set(inputAlphabet.map((c) => getConsistentWriteSymbol(c, inputAlphabet))));
  const tapeAlphabet = Array.from(new Set([...inputAlphabet, ...usedMarkers, 'B']));

  const states = ['q0', 'q1', 'q2', 'q_accept', 'q_reject'];
  const transitions: Transition[] = [];

  // q0: Match prefix (e.g. '0') and write prefixMarker (e.g. 'X')
  if (prefix) {
    transitions.push({
      currentState: 'q0',
      readSymbol: prefix,
      writeSymbol: prefixMarker,
      moveDirection: 'R',
      nextState: 'q1',
      phaseName: 'PREFIX',
      description: `Matched starting prefix '${prefix}'. Rewrote cell as '${prefixMarker}' and moved to state q1.`,
    });
    for (const sym of tapeAlphabet) {
      if (sym !== prefix) {
        transitions.push({
          currentState: 'q0',
          readSymbol: sym,
          writeSymbol: sym,
          moveDirection: 'R',
          nextState: 'q_reject',
          phaseName: 'REJECT',
          description: `Expected initial '${prefix}', but read '${sym}'. Reject.`,
        });
      }
    }
  }

  // q1: Loop on starChar (e.g. '1*') and write starMarker (e.g. 'Y')
  transitions.push({
    currentState: 'q1',
    readSymbol: starChar,
    writeSymbol: starMarker,
    moveDirection: 'R',
    nextState: 'q1',
    phaseName: 'REPEAT',
    description: `Matched '${starChar}' in (${starChar}*) repetition. Rewrote cell as '${starMarker}'.`,
  });

  // q1: On suffix (e.g. '0'), write suffixMarker (e.g. 'X') and advance to q2
  if (suffix && suffix !== starChar) {
    transitions.push({
      currentState: 'q1',
      readSymbol: suffix,
      writeSymbol: suffixMarker,
      moveDirection: 'R',
      nextState: 'q2',
      phaseName: 'SUFFIX',
      description: `Matched closing '${suffix}'. Rewrote cell as '${suffixMarker}' and moved to state q2.`,
    });

    for (const sym of tapeAlphabet) {
      if (sym !== starChar && sym !== suffix) {
        transitions.push({
          currentState: 'q1',
          readSymbol: sym,
          writeSymbol: sym,
          moveDirection: 'R',
          nextState: 'q_reject',
          phaseName: 'REJECT',
          description: `Expected '${starChar}' or ending '${suffix}', but read '${sym}'. Reject.`,
        });
      }
    }
  } else {
    // If no suffix, q1 directly accepts on blank 'B'
    transitions.push({
      currentState: 'q1',
      readSymbol: 'B',
      writeSymbol: 'B',
      moveDirection: 'R',
      nextState: 'q_accept',
      phaseName: 'ACCEPT',
      description: `Reached trailing blank with valid repetition. ACCEPT ✓`,
    });
  }

  // q2: Confirm string boundary after suffix
  transitions.push({
    currentState: 'q2',
    readSymbol: 'B',
    writeSymbol: 'B',
    moveDirection: 'R',
    nextState: 'q_accept',
    phaseName: 'ACCEPT',
    description: `Reached trailing blank after valid "${pattern}" match. ACCEPT ✓`,
  });

  for (const sym of inputAlphabet) {
    transitions.push({
      currentState: 'q2',
      readSymbol: sym,
      writeSymbol: sym,
      moveDirection: 'R',
      nextState: 'q_reject',
      phaseName: 'REJECT',
      description: `Extra symbol '${sym}' detected after final suffix. Reject.`,
    });
  }

  const statePositions: Record<string, any> = {
    q0: { x: 130, y: 115, label: 'q0', description: `Match '${prefix}' → ${prefixMarker}`, role: 'start', color: '#2563eb' },
    q1: { x: 370, y: 115, label: 'q1', description: `Loop '${starChar}*' → ${starMarker}`, role: 'normal', color: '#7c3aed' },
    q2: { x: 610, y: 115, label: 'q2', description: `Match '${suffix}' → ${suffixMarker}`, role: 'normal', color: '#0891b2' },
    q_accept: { x: 830, y: 115, label: 'q_accept', description: 'Accept ✓', role: 'accept', color: '#16a34a' },
    q_reject: { x: 490, y: 295, label: 'q_reject', description: 'Reject ✕', role: 'reject', color: '#dc2626' },
  };

  const edgeLayouts: Record<string, any> = {
    'q0-->q1': { labelX: 250, labelY: 82, curveOffset: 0 },
    'q1-->q1': { loopDirection: 'top' },
    'q1-->q2': { labelX: 490, labelY: 82, curveOffset: 0 },
    'q2-->q_accept': { labelX: 720, labelY: 82, curveOffset: 0 },
  };

  const sampleZero = `${prefix}${suffix}`;
  const sampleOne = `${prefix}${starChar}${suffix}`;
  const sampleTwo = `${prefix}${starChar}${starChar}${suffix}`;
  const sampleThree = `${prefix}${starChar}${starChar}${starChar}${suffix}`;

  const sampleZeroOut = `${prefixMarker}${suffixMarker}`;
  const sampleOneOut = `${prefixMarker}${starMarker}${suffixMarker}`;
  const sampleTwoOut = `${prefixMarker}${starMarker}${starMarker}${suffixMarker}`;

  const presetInputs: PresetInput[] = [
    { label: `${sampleZero} (0 ones → ${sampleZeroOut})`, value: sampleZero, expected: 'ACCEPT', note: 'Zero repetitions' },
    { label: `${sampleOne} (1 one → ${sampleOneOut})`, value: sampleOne, expected: 'ACCEPT', note: 'Single repetition' },
    { label: `${sampleTwo} (2 ones → ${sampleTwoOut})`, value: sampleTwo, expected: 'ACCEPT', note: 'Double repetition' },
    { label: `${sampleThree} (3 ones)`, value: sampleThree, expected: 'ACCEPT', note: 'Multiple repetitions' },
    { label: `${prefix} (Missing end)`, value: prefix, expected: 'REJECT', note: 'No ending suffix' },
    { label: `${prefix}${starChar} (Missing end)`, value: `${prefix}${starChar}`, expected: 'REJECT', note: 'Ends in repetition char' },
    { label: `${sampleOne}1 (Extra char)`, value: `${sampleOne}1`, expected: 'REJECT', note: 'Extra symbol after suffix' },
  ];

  return {
    id: `regex-${pattern.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}`,
    name: `Regex: ${pattern} (Tape: ${prefixMarker}, ${starMarker})`,
    category: 'Basic',
    description: `Turing Machine for Regular Language L = { ${pattern} } over Σ = { ${inputAlphabet.join(', ')} } consistently writing markers '${prefix}'→'${prefixMarker}', '${starChar}'→'${starMarker}'.`,
    formalTitle: `Language Recognition: L = { ${pattern} }`,
    language: `L = { ${pattern} }`,
    states,
    inputAlphabet,
    tapeAlphabet,
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: sampleOne,
    presetInputs,
    algorithmPhases: [
      { id: 'PREFIX', label: `MARK PREFIX (${prefixMarker})`, description: `Verify initial symbol '${prefix}' and write marker '${prefixMarker}'`, states: ['q0'], color: '#2563eb' },
      { id: 'REPEAT', label: `MARK REPETITION (${starMarker})`, description: `Process zero or more '${starChar}' characters and write marker '${starMarker}'`, states: ['q1'], color: '#7c3aed' },
      { id: 'SUFFIX', label: `MARK SUFFIX (${suffixMarker})`, description: `Verify closing '${suffix}' symbol and write marker '${suffixMarker}'`, states: ['q2'], color: '#0891b2' },
      { id: 'ACCEPT', label: 'ACCEPT', description: 'Confirm string ends at blank symbol', states: ['q_accept'], color: '#16a34a' },
      { id: 'REJECT', label: 'REJECT', description: 'Invalid symbol or premature string termination', states: ['q_reject'], color: '#dc2626' },
    ],
    statePositions,
    edgeLayouts,
    explanationGuide: {
      title: `Regular Language Recognition for ${pattern}`,
      steps: [
        { step: 1, title: `Mark Prefix with "${prefixMarker}"`, desc: `In state q0, verify starting symbol '${prefix}', write consistent marker '${prefixMarker}', and advance right.`, iconSymbol: prefixMarker || '→', color: '#2563eb' },
        { step: 2, title: `Mark Repetitions with "${starMarker}"`, desc: `In state q1, replace each '${starChar}' with consistent marker '${starMarker}' in a self-loop.`, iconSymbol: starMarker, color: '#7c3aed' },
        { step: 3, title: `Mark Suffix with "${suffixMarker}" & Accept`, desc: `Upon reading closing '${suffix}', write consistent marker '${suffixMarker}', enter state q2, verify trailing blank B, and accept.`, iconSymbol: suffixMarker || '✓', color: '#16a34a' },
      ],
    },
  };
}

/**
 * Dynamic Exact String Recognizer Builder: L = { target }
 * Enforces consistent 1-to-1 write symbol per read symbol across the whole machine (e.g. all 'a' -> 'X', all 'b' -> 'Y').
 */
export function buildExactStringMachine(target: string, customAlphabet?: string[]): TuringMachineDefinition {
  const chars = target.split('');
  const charSet = new Set<string>(chars);
  if (customAlphabet && customAlphabet.length > 0) {
    customAlphabet.forEach((c) => charSet.add(c));
  } else {
    if (charSet.has('a') || charSet.has('b')) {
      charSet.add('a');
      charSet.add('b');
    } else if (charSet.has('0') || charSet.has('1')) {
      charSet.add('0');
      charSet.add('1');
    }
  }

  const inputAlphabet = Array.from(charSet);
  const usedMarkers = Array.from(new Set(inputAlphabet.map((c) => getConsistentWriteSymbol(c, inputAlphabet))));
  const tapeAlphabet = Array.from(new Set([...inputAlphabet, ...usedMarkers, 'B']));
  const k = chars.length;

  const states: string[] = [];
  for (let i = 0; i <= k; i++) {
    states.push(`q${i}`);
  }
  states.push('q_accept', 'q_reject');

  const transitions: Transition[] = [];

  for (let i = 0; i < k; i++) {
    const expected = chars[i];
    const writeMarker = getConsistentWriteSymbol(expected, inputAlphabet);
    const currState = `q${i}`;
    const nextState = `q${i + 1}`;

    // On correct character -> advance and rewrite tape with consistent marker
    transitions.push({
      currentState: currState,
      readSymbol: expected,
      writeSymbol: writeMarker,
      moveDirection: 'R',
      nextState: nextState,
      phaseName: 'MATCH',
      description: `Matched '${expected}' at position ${i + 1}. Rewrote cell as '${writeMarker}' and moved to state ${nextState}.`,
    });

    // On any other symbol (including blank or wrong char) -> reject
    for (const sym of tapeAlphabet) {
      if (sym !== expected) {
        transitions.push({
          currentState: currState,
          readSymbol: sym,
          writeSymbol: sym,
          moveDirection: 'R',
          nextState: 'q_reject',
          phaseName: 'REJECT',
          description: `Expected '${expected}', but read '${sym}'. Reject.`,
        });
      }
    }
  }

  // Final state qk: check for trailing blank
  const endState = `q${k}`;
  transitions.push({
    currentState: endState,
    readSymbol: 'B',
    writeSymbol: 'B',
    moveDirection: 'R',
    nextState: 'q_accept',
    phaseName: 'ACCEPT',
    description: `Reached trailing blank after matching "${target}". ACCEPT ✓`,
  });

  for (const sym of inputAlphabet) {
    transitions.push({
      currentState: endState,
      readSymbol: sym,
      writeSymbol: sym,
      moveDirection: 'R',
      nextState: 'q_reject',
      phaseName: 'REJECT',
      description: `String contains extra trailing symbol '${sym}'. Reject.`,
    });
  }

  // Layout node coordinates
  const statePositions: Record<string, any> = {};
  const spacing = Math.min(180, Math.max(120, Math.floor(700 / (k + 2))));
  const startX = Math.max(80, Math.floor((900 - (k + 2) * spacing) / 2));

  for (let i = 0; i <= k; i++) {
    const symDesc = i < k ? `'${chars[i]}' → ${getConsistentWriteSymbol(chars[i], inputAlphabet)}` : 'Check Blank B';
    statePositions[`q${i}`] = {
      x: startX + i * spacing,
      y: 115,
      label: `q${i}`,
      description: i === 0 ? `Start & read '${chars[0]}'` : symDesc,
      role: i === 0 ? 'start' : 'normal',
      color: i === 0 ? '#2563eb' : '#7c3aed',
    };
  }

  statePositions['q_accept'] = {
    x: startX + (k + 1) * spacing,
    y: 115,
    label: 'q_accept',
    description: 'Accept ✓',
    role: 'accept',
    color: '#16a34a',
  };

  statePositions['q_reject'] = {
    x: startX + Math.floor((k + 1) / 2) * spacing,
    y: 295,
    label: 'q_reject',
    description: 'Reject ✕',
    role: 'reject',
    color: '#dc2626',
  };

  const edgeLayouts: Record<string, any> = {};
  for (let i = 0; i < k; i++) {
    edgeLayouts[`q${i}-->q${i + 1}`] = {
      labelX: startX + i * spacing + spacing / 2,
      labelY: 82,
      curveOffset: 0,
    };
  }
  edgeLayouts[`q${k}-->q_accept`] = {
    labelX: startX + k * spacing + spacing / 2,
    labelY: 82,
    curveOffset: 0,
  };

  const outputPreview = chars.map((c) => getConsistentWriteSymbol(c, inputAlphabet)).join('');

  const presetInputs: PresetInput[] = [
    { label: `${target} (Exact → ${outputPreview})`, value: target, expected: 'ACCEPT', note: `Rewrites tape as ${outputPreview}` },
  ];
  if (k > 1) {
    presetInputs.push({ label: `${target.slice(0, -1)} (Prefix only)`, value: target.slice(0, -1), expected: 'REJECT', note: 'Missing end character' });
  }
  const altChar = inputAlphabet.find((c) => c !== chars[0]) || 'b';
  presetInputs.push(
    { label: `${target}${chars[0]} (Extra char)`, value: `${target}${chars[0]}`, expected: 'REJECT', note: 'Too long' },
    { label: `${altChar}${target.slice(1)} (Wrong start)`, value: `${altChar}${target.slice(1)}`, expected: 'REJECT', note: 'Incorrect 1st symbol' }
  );

  return {
    id: `exact-${target}-${Date.now()}`,
    name: `Exact: "${target}" (Tape: ${outputPreview})`,
    category: 'Basic',
    description: `Turing Machine to recognize language L = { "${target}" } over Σ = { ${inputAlphabet.join(', ')} }, consistently rewriting tape symbols (${inputAlphabet.map(c => `'${c}'→'${getConsistentWriteSymbol(c, inputAlphabet)}'`).join(', ')}).`,
    formalTitle: `Language Recognition: L = { "${target}" }`,
    language: `L = { "${target}" }`,
    states,
    inputAlphabet,
    tapeAlphabet,
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: target,
    presetInputs,
    algorithmPhases: [
      { id: 'MATCH', label: 'MATCH STRING', description: `Verify each symbol of "${target}" and rewrite with consistent markers`, states: states.slice(0, k), color: '#2563eb' },
      { id: 'ACCEPT', label: 'ACCEPT', description: 'Confirm end of string with blank symbol B', states: [`q${k}`, 'q_accept'], color: '#16a34a' },
      { id: 'REJECT', label: 'REJECT', description: 'Symbol mismatch or improper string length', states: ['q_reject'], color: '#dc2626' },
    ],
    statePositions,
    edgeLayouts,
    explanationGuide: {
      title: `Exact String Recognition for "${target}"`,
      steps: [
        { step: 1, title: 'Sequential Symbol Rewriting', desc: `Scan each tape cell and ensure it matches "${target}", rewriting each '${inputAlphabet[0]}' as '${getConsistentWriteSymbol(inputAlphabet[0], inputAlphabet)}' and '${inputAlphabet[1] || 'b'}' as '${getConsistentWriteSymbol(inputAlphabet[1] || 'b', inputAlphabet)}'.`, iconSymbol: '→', color: '#2563eb' },
        { step: 2, title: 'Boundary Verification', desc: 'Ensure no extra symbols follow by checking for blank marker B immediately after the final character.', iconSymbol: 'B', color: '#7c3aed' },
        { step: 3, title: 'Accept / Reject Decision', desc: 'Transition into q_accept if and only if the exact string matched; transition to q_reject otherwise.', iconSymbol: '✓', color: '#16a34a' },
      ],
    },
  };
}

/**
 * Dynamic Substring Machine Builder: L = { w | w contains target as substring }
 */
export function buildSubstringMachine(target: string, customAlphabet?: string[]): TuringMachineDefinition {
  const chars = target.split('');
  const charSet = new Set<string>(chars);
  if (customAlphabet && customAlphabet.length > 0) {
    customAlphabet.forEach((c) => charSet.add(c));
  } else {
    if (charSet.has('a') || charSet.has('b')) {
      charSet.add('a');
      charSet.add('b');
    } else if (charSet.has('0') || charSet.has('1')) {
      charSet.add('0');
      charSet.add('1');
    }
  }

  const inputAlphabet = Array.from(charSet);
  const tapeAlphabet = Array.from(new Set([...inputAlphabet, 'B']));
  const k = chars.length;

  const states: string[] = [];
  for (let i = 0; i <= k; i++) {
    states.push(`q${i}`);
  }
  states.push('q_accept', 'q_reject');

  const transitions: Transition[] = [];

  for (let i = 0; i < k; i++) {
    const currPrefix = target.slice(0, i);
    const currState = `q${i}`;

    transitions.push({
      currentState: currState,
      readSymbol: 'B',
      writeSymbol: 'B',
      moveDirection: 'R',
      nextState: 'q_reject',
      phaseName: 'REJECT',
      description: `Reached end of tape without finding "${target}". Reject.`,
    });

    for (const sym of inputAlphabet) {
      const candidate = currPrefix + sym;
      let nextLen = 0;
      for (let len = Math.min(k, candidate.length); len >= 1; len--) {
        if (candidate.endsWith(target.slice(0, len))) {
          nextLen = len;
          break;
        }
      }

      transitions.push({
        currentState: currState,
        readSymbol: sym,
        writeSymbol: sym,
        moveDirection: 'R',
        nextState: `q${nextLen}`,
        phaseName: nextLen === k ? 'MATCHED' : 'SCAN',
        description: nextLen === k 
          ? `Found complete substring "${target}"! Moving to matched state q${nextLen}.`
          : `Reading '${sym}' (matched prefix length ${nextLen}). Advance right.`,
      });
    }
  }

  const matchedState = `q${k}`;
  for (const sym of inputAlphabet) {
    transitions.push({
      currentState: matchedState,
      readSymbol: sym,
      writeSymbol: sym,
      moveDirection: 'R',
      nextState: matchedState,
      phaseName: 'MATCHED',
      description: `Substring "${target}" already found. Scanning past remaining '${sym}'.`,
    });
  }
  transitions.push({
    currentState: matchedState,
    readSymbol: 'B',
    writeSymbol: 'B',
    moveDirection: 'R',
    nextState: 'q_accept',
    phaseName: 'ACCEPT',
    description: `End of tape reached with confirmed substring "${target}". ACCEPT ✓`,
  });

  const spacing = Math.min(180, Math.max(120, Math.floor(700 / (k + 2))));
  const startX = Math.max(80, Math.floor((900 - (k + 2) * spacing) / 2));

  const statePositions: Record<string, any> = {};
  for (let i = 0; i <= k; i++) {
    statePositions[`q${i}`] = {
      x: startX + i * spacing,
      y: 115,
      label: `q${i}`,
      description: i === k ? 'Substring Matched' : `Matched ${i} char${i > 1 ? 's' : ''}`,
      role: i === 0 ? 'start' : 'normal',
      color: i === 0 ? '#2563eb' : i === k ? '#059669' : '#7c3aed',
    };
  }
  statePositions['q_accept'] = {
    x: startX + (k + 1) * spacing,
    y: 115,
    label: 'q_accept',
    description: 'Accept ✓',
    role: 'accept',
    color: '#16a34a',
  };
  statePositions['q_reject'] = {
    x: startX + Math.floor((k + 1) / 2) * spacing,
    y: 295,
    label: 'q_reject',
    description: 'Reject ✕',
    role: 'reject',
    color: '#dc2626',
  };

  const presetInputs: PresetInput[] = [
    { label: `${target} (Exact)`, value: target, expected: 'ACCEPT', note: 'Direct match' },
    { label: `a${target}b (Embedded)`, value: `a${target}b`, expected: 'ACCEPT', note: 'Substring in middle' },
    { label: `${target}${target} (Repeated)`, value: `${target}${target}`, expected: 'ACCEPT', note: 'Contains substring multiple times' },
    { label: `bb (No match)`, value: 'bb', expected: 'REJECT', note: 'Does not contain substring' },
  ];

  return {
    id: `substring-${target}-${Date.now()}`,
    name: `Contains "${target}"`,
    category: 'Basic',
    description: `Turing Machine to accept all strings containing "${target}" as a substring over Σ = { ${inputAlphabet.join(', ')} }.`,
    formalTitle: `Language Recognition: L = { w | w contains "${target}" }`,
    language: `L = { w ∈ {${inputAlphabet.join(',')}}* | w contains "${target}" }`,
    states,
    inputAlphabet,
    tapeAlphabet,
    initialState: 'q0',
    blankSymbol: 'B',
    acceptStates: ['q_accept'],
    rejectStates: ['q_reject'],
    transitions,
    defaultInput: `a${target}b`,
    presetInputs,
    algorithmPhases: [
      { id: 'SCAN', label: 'SEARCH SUBSTRING', description: `Scan tape searching for consecutive sequence "${target}"`, states: states.slice(0, k), color: '#2563eb' },
      { id: 'MATCHED', label: 'SUBSTRING FOUND', description: 'Advance past rest of tape once substring is found', states: [`q${k}`], color: '#059669' },
      { id: 'ACCEPT', label: 'ACCEPT', description: 'Reach tape blank after finding substring', states: ['q_accept'], color: '#16a34a' },
      { id: 'REJECT', label: 'REJECT', description: 'End of input without finding substring', states: ['q_reject'], color: '#dc2626' },
    ],
    statePositions,
    explanationGuide: {
      title: `Substring Recognition Algorithm for "${target}"`,
      steps: [
        { step: 1, title: 'State Prefix Tracking', desc: `States q0 to q${k-1} track the longest prefix of "${target}" matched so far in the input string.`, iconSymbol: '🔍', color: '#2563eb' },
        { step: 2, title: 'KMP State Transitioning', desc: 'When characters mismatch, fallback to the longest matching overlap state rather than restarting at zero.', iconSymbol: '↩', color: '#7c3aed' },
        { step: 3, title: 'Success State & Accept', desc: `Upon reaching state q${k}, the substring is guaranteed present. The TM sweeps to the end and accepts.`, iconSymbol: '✓', color: '#16a34a' },
      ],
    },
  };
}

/**
 * Main Question Interpreter & Analyzer
 * Parses free-form mathematical shorthand and natural language requests.
 */
export function analyzeQuestion(rawQuestion: string): InterpretationResult {
  const q = rawQuestion.trim().toLowerCase();

  // Pattern: a^n b^n c^n
  if (
    q.includes('a^n b^n c^n') ||
    q.includes('aⁿbⁿcⁿ') ||
    q.includes('anbncn') ||
    (q.includes('a') && q.includes('b') && q.includes('c') && (q.includes('equal') || q.includes('> 1') || q.includes('>= 1') || q.includes('n >= 1') || q.includes('n ≥ 1') || q.includes('same number')))
  ) {
    const isExact = q.includes('aⁿbⁿcⁿ') || q.includes('a^n b^n c^n') || q.includes('anbncn');
    return {
      isSupported: true,
      confidence: isExact ? 'high' : 'medium',
      normalizedQuestion: 'L = { aⁿbⁿcⁿ | n ≥ 1 }',
      interpretationText: 'Construct a Turing Machine for equal numbers of a, b, and c in that order, with n ≥ 1 (L = { aⁿbⁿcⁿ | n ≥ 1 }).',
      matchedId: 'anbncn',
      buildMachine: buildAnBnCnMachine,
      testCases: [
        { input: 'abc', expected: 'ACCEPT' },
        { input: 'aabbcc', expected: 'ACCEPT' },
        { input: 'aaabbbccc', expected: 'ACCEPT' },
        { input: 'aabbc', expected: 'REJECT' },
        { input: 'abcc', expected: 'REJECT' },
        { input: 'cba', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: a^n b^3n
  if (q.includes('aⁿb³ⁿ') || q.includes('a^n b^3n') || q.includes('anb3n') || (q.includes('triple') && q.includes('b'))) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'L = { aⁿb³ⁿ | n ≥ 1 }',
      interpretationText: 'Construct a Turing Machine where each "a" is matched with exactly three "b"s (L = { aⁿb³ⁿ | n ≥ 1 }).',
      matchedId: 'anb3n',
      buildMachine: buildAnBn3Machine,
      testCases: [
        { input: 'abbb', expected: 'ACCEPT' },
        { input: 'aabbbbbb', expected: 'ACCEPT' },
        { input: 'abb', expected: 'REJECT' },
        { input: 'abbbb', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: Binary Increment
  if (q.includes('binary increment') || q.includes('binary addition of 1') || q.includes('add 1 binary') || q.includes('w + 1 binary')) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Binary Increment: f(w) = w + 1 (Base 2)',
      interpretationText: 'Construct a Turing Machine transducer that adds 1 to a binary number with carry propagation.',
      matchedId: 'bininc',
      buildMachine: buildBinaryIncrementMachine,
      testCases: [
        { input: '1011', expected: 'ACCEPT' },
        { input: '111', expected: 'ACCEPT' },
        { input: '0', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: a^n b^n
  if (
    q.includes('aⁿbⁿ') ||
    q.includes('a^n b^n') ||
    q.includes('anbn') ||
    (q.includes('a') && q.includes('b') && !q.includes('c') && (q.includes('equal') || q.includes('n >= 1') || q.includes('n ≥ 1') || q.includes('> 0') || q.includes('same number')))
  ) {
    const isExact = q.includes('aⁿbⁿ') || q.includes('a^n b^n') || q.includes('anbn');
    return {
      isSupported: true,
      confidence: isExact ? 'high' : 'medium',
      normalizedQuestion: 'L = { aⁿbⁿ | n ≥ 1 }',
      interpretationText: 'Construct a Turing Machine to accept strings containing equal numbers of a and b in that exact order, with n ≥ 1.',
      matchedId: 'anbn',
      buildMachine: () => ({ ...AN_BN_MACHINE, id: 'anbn-generated' }),
      testCases: [
        { input: 'ab', expected: 'ACCEPT' },
        { input: 'aabb', expected: 'ACCEPT' },
        { input: 'aaabbb', expected: 'ACCEPT' },
        { input: 'aabbb', expected: 'REJECT' },
        { input: 'ba', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: a^n b^2n
  if (q.includes('aⁿb²ⁿ') || q.includes('a^n b^2n') || q.includes('anb2n') || (q.includes('double') && q.includes('b'))) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'L = { aⁿb²ⁿ | n ≥ 1 }',
      interpretationText: 'Construct a Turing Machine where each "a" is matched with exactly two "b"s (L = { aⁿb²ⁿ | n ≥ 1 }).',
      matchedId: 'anb2n',
      buildMachine: () => ({ ...AN_B2N_MACHINE, id: 'anb2n-generated' }),
      testCases: [
        { input: 'abb', expected: 'ACCEPT' },
        { input: 'aabbbb', expected: 'ACCEPT' },
        { input: 'ab', expected: 'REJECT' },
        { input: 'abbb', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: Palindrome
  if (q.includes('palindrome') || q.includes('w = w^r') || q.includes('w = wᴿ') || q.includes('reverse')) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Binary Palindrome: L = { w ∈ {0,1}* | w = wᴿ }',
      interpretationText: 'Construct a Turing Machine to verify if a binary string is equal to its reverse by matching outermost characters symmetrically.',
      matchedId: 'palindrome',
      buildMachine: () => ({ ...PALINDROME_MACHINE, id: 'palindrome-generated' }),
      testCases: [
        { input: '101', expected: 'ACCEPT' },
        { input: '1001', expected: 'ACCEPT' },
        { input: '10', expected: 'REJECT' },
        { input: '110', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: Equal 0s and 1s
  if ((q.includes('0') && q.includes('1') && q.includes('equal')) || q.includes('equal number of 0') || q.includes('n0 = n1')) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Equal 0s and 1s: L = { w ∈ {0,1}* | N₀(w) = N₁(w) }',
      interpretationText: 'Construct a Turing Machine that pairs every 0 with an opposing 1 anywhere in the string regardless of order.',
      matchedId: 'equal01',
      buildMachine: () => ({ ...EQUAL_01_MACHINE, id: 'equal01-generated' }),
      testCases: [
        { input: '01', expected: 'ACCEPT' },
        { input: '010110', expected: 'ACCEPT' },
        { input: '0', expected: 'REJECT' },
        { input: '101', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: Even 1s Parity
  if (q.includes('even') && (q.includes('1') || q.includes('one'))) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Even Number of 1s: L = { w ∈ {0,1}* | count(1) is even }',
      interpretationText: 'Construct a Turing Machine that determines whether the count of 1s in a binary string is even.',
      matchedId: 'even1s',
      buildMachine: () => ({ ...EVEN_1S_MACHINE, id: 'even1s-generated' }),
      testCases: [
        { input: '11', expected: 'ACCEPT' },
        { input: '101011', expected: 'ACCEPT' },
        { input: '1', expected: 'REJECT' },
        { input: '101', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: Unary Increment
  if (q.includes('unary increment') || q.includes('unary addition') || q.includes('x + 1 unary') || (q.includes('1') && q.includes('increment'))) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Unary Increment: f(x) = x + 1',
      interpretationText: 'Construct a Turing Machine transducer that increments a unary number represented by a sequence of 1s.',
      matchedId: 'unaryIncrement',
      buildMachine: () => ({ ...UNARY_INCREMENT_MACHINE, id: 'unaryinc-generated' }),
      testCases: [
        { input: '1', expected: 'ACCEPT' },
        { input: '111', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: Unary to Binary Converter
  if (
    q.includes('unary to binary') ||
    q.includes('unary-to-binary') ||
    q.includes('unary 2 binary') ||
    q.includes('convert unary to binary') ||
    q.includes('unary to bin') ||
    q.includes('base 1 to base 2') ||
    q.includes('base 1 to 2') ||
    q.includes('f(1^n) = bin(n)') ||
    q.includes('f(1ⁿ) = bin(n)') ||
    (q.includes('unary') && q.includes('binary') && !q.includes('addition') && !q.includes('subtraction'))
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Unary to Binary: f(1ⁿ) = bin(n)',
      interpretationText: 'Construct a Turing Machine transducer that converts an arbitrary unary number (a string of n 1s) into its exact binary representation.',
      matchedId: 'unaryToBinary',
      buildMachine: () => ({ ...UNARY_TO_BINARY_MACHINE, id: 'u2b-generated' }),
      testCases: [
        { input: '1', expected: 'ACCEPT' },
        { input: '11', expected: 'ACCEPT' },
        { input: '111', expected: 'ACCEPT' },
        { input: '11111', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: Binary Decrement (w - 1)
  if (
    q.includes('decrement') ||
    q.includes('w - 1') ||
    q.includes('w-1') ||
    q.includes('x - 1') ||
    q.includes('x-1') ||
    q.includes('subtract 1') ||
    q.includes('subtract one') ||
    q.includes('minus 1') ||
    q.includes('minus one')
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Binary Decrement: f(w) = w - 1 (Base 2)',
      interpretationText: 'Construct a Turing Machine transducer that subtracts 1 from a binary number using borrow propagation and leading-zero normalization.',
      matchedId: 'binaryDecrement',
      buildMachine: () => ({ ...BINARY_DECREMENT_MACHINE, id: 'bindec-generated' }),
      testCases: [
        { input: '10', expected: 'ACCEPT' },
        { input: '100', expected: 'ACCEPT' },
        { input: '111', expected: 'ACCEPT' },
        { input: '1000', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: 1's Complement
  if (
    q.includes("1's complement") ||
    q.includes("1s complement") ||
    q.includes("ones complement") ||
    q.includes("one's complement") ||
    q.includes("first complement") ||
    (q.includes('1') && q.includes('complement') && !q.includes('2'))
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: "1's Complement: f(w) = w̄ (Base 2)",
      interpretationText: "Construct a Turing Machine transducer that computes the 1's complement of a binary string by inverting each bit (0 ↔ 1).",
      matchedId: 'onesComplement',
      buildMachine: buildOnesComplementMachine,
      testCases: [
        { input: '1011', expected: 'ACCEPT' },
        { input: '1100', expected: 'ACCEPT' },
        { input: '0', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: 2's Complement
  if (
    q.includes("2's complement") ||
    q.includes("2s complement") ||
    q.includes("twos complement") ||
    q.includes("two's complement") ||
    q.includes("second complement") ||
    (q.includes('2') && q.includes('complement'))
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: "2's Complement: f(w) = -w (Base 2)",
      interpretationText: "Construct a Turing Machine transducer that computes the 2's complement of a binary string (preserves trailing 0s and first 1, inverts remaining bits).",
      matchedId: 'twosComplement',
      buildMachine: buildTwosComplementMachine,
      testCases: [
        { input: '1100', expected: 'ACCEPT' },
        { input: '1011', expected: 'ACCEPT' },
        { input: '1010', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: String Copy (w -> w#w or w -> ww)
  if (
    q.includes('string copy') ||
    q.includes('copy string') ||
    q.includes('duplicate string') ||
    q.includes('w -> ww') ||
    q.includes('w -> w w') ||
    q.includes('w -> w#w') ||
    q.includes('w # w') ||
    q.includes('f(w) = ww') ||
    q.includes('f(w) = w w') ||
    q.includes('f(w) = w#w')
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'String Duplication: f(w) = w # w',
      interpretationText: 'Construct a Turing Machine transducer that duplicates an arbitrary binary input string onto the tape separated by delimiter "#".',
      matchedId: 'stringCopy',
      buildMachine: () => ({ ...STRING_COPY_MACHINE, id: 'stringcopy-generated' }),
      testCases: [
        { input: '01', expected: 'ACCEPT' },
        { input: '101', expected: 'ACCEPT' },
        { input: '11', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: Binary Addition (A + B)
  if (
    q.includes('binary addition') ||
    q.includes('add binary') ||
    q.includes('addition of binary') ||
    q.includes('addition of two') ||
    q.includes('binary adder') ||
    q.includes('a + b') ||
    q.includes('a+b') ||
    q.includes('a # b')
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Binary Addition: f(a # b) = a + b',
      interpretationText: 'Construct a Turing Machine transducer that computes the binary sum of two numbers separated by delimiter "#".',
      matchedId: 'binaryAddition',
      buildMachine: () => ({ ...BINARY_ADDITION_MACHINE, id: 'binadd-generated' }),
      testCases: [
        { input: '10#11', expected: 'ACCEPT' },
        { input: '11#01', expected: 'ACCEPT' },
        { input: '0#1', expected: 'ACCEPT' },
      ],
    };
  }

  // Pattern: Binary Subtraction (A - B)
  if (
    q.includes('binary subtraction') ||
    q.includes('subtract binary') ||
    q.includes('subtraction of binary') ||
    q.includes('subtraction of two') ||
    q.includes('binary subtractor') ||
    q.includes('a - b') ||
    q.includes('a-b')
  ) {
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: 'Binary Subtraction: f(a # b) = a - b (for a ≥ b)',
      interpretationText: 'Construct a Turing Machine transducer that computes binary subtraction A - B for non-negative result (A ≥ B).',
      matchedId: 'binarySubtraction',
      buildMachine: () => ({ ...BINARY_SUBTRACTION_MACHINE, id: 'binsub-generated' }),
      testCases: [
        { input: '11#01', expected: 'ACCEPT' },
        { input: '100#01', expected: 'ACCEPT' },
        { input: '01#10', expected: 'REJECT' },
      ],
    };
  }

  // Pattern: Dynamic string, regex, substring, prefix or suffix recognition
  const extracted = extractTargetString(rawQuestion);
  if (extracted && extracted.target.length >= 1) {
    const { target, alphabet, mode } = extracted;

    // Regular Expression with Kleene star (e.g. '01*0', 'a*b', '0*1')
    if (target.includes('*')) {
      const starMatch = target.match(/^([a-zA-Z0-9]*?)([a-zA-Z0-9])\*([a-zA-Z0-9]*)$/);
      const prefix = starMatch ? starMatch[1] : '';
      const starChar = starMatch ? starMatch[2] : '1';
      const suffix = starMatch ? starMatch[3] : '';

      return {
        isSupported: true,
        confidence: 'high',
        normalizedQuestion: `L = { ${target} } over Σ = { ${alphabet.join(', ')} }`,
        interpretationText: `Construct a Turing Machine that recognizes the regular language L = { ${target} } (starts with '${prefix || 'ε'}', followed by zero or more '${starChar}'s, ending with '${suffix || 'ε'}') over Σ = { ${alphabet.join(', ')} }.`,
        matchedId: `regex_${target.replace(/[^a-zA-Z0-9]/g, '_')}`,
        buildMachine: () => buildStarRegexMachine(target, alphabet),
        testCases: [
          { input: `${prefix}${suffix}`, expected: 'ACCEPT' },
          { input: `${prefix}${starChar}${suffix}`, expected: 'ACCEPT' },
          { input: `${prefix}${starChar}${starChar}${suffix}`, expected: 'ACCEPT' },
          { input: `${prefix}${starChar}`, expected: 'REJECT' },
          { input: `${prefix}${starChar}${suffix}1`, expected: 'REJECT' },
        ],
      };
    }

    if (mode === 'contains') {
      return {
        isSupported: true,
        confidence: 'high',
        normalizedQuestion: `L = { w ∈ {${alphabet.join(',')}}* | w contains "${target}" }`,
        interpretationText: `Construct a Turing Machine to accept strings containing the substring "${target}" over alphabet Σ = { ${alphabet.join(', ')} }.`,
        matchedId: `substring_${target}`,
        buildMachine: () => buildSubstringMachine(target, alphabet),
        testCases: [
          { input: target, expected: 'ACCEPT' },
          { input: `a${target}b`, expected: 'ACCEPT' },
          { input: `${target}${target}`, expected: 'ACCEPT' },
          { input: 'bb', expected: target.includes('bb') ? 'ACCEPT' : 'REJECT' },
        ],
      };
    }

    // Default exact string match: L = { "target" }
    return {
      isSupported: true,
      confidence: 'high',
      normalizedQuestion: `L = { "${target}" } over Σ = { ${alphabet.join(', ')} }`,
      interpretationText: `Construct a Turing Machine that accepts only the exact string "${target}" over alphabet Σ = { ${alphabet.join(', ')} }.`,
      matchedId: `exact_${target}`,
      buildMachine: () => buildExactStringMachine(target, alphabet),
      testCases: [
        { input: target, expected: 'ACCEPT' },
        { input: `${target}a`, expected: 'REJECT' },
        { input: `${target}b`, expected: 'REJECT' },
      ],
    };
  }

  // Unsupported or too ambiguous
  return {
    isSupported: false,
    confidence: 'unsupported',
    normalizedQuestion: rawQuestion,
    interpretationText: 'I can understand the problem topic, but cannot reliably construct a mathematically verified Turing Machine automatically for this exact formulation yet.',
    matchedId: 'unsupported',
    buildMachine: () => {
      throw new Error('Unsupported machine type');
    },
    testCases: [],
  };
}

/**
 * Validates a generated machine against known test cases before allowing simulation
 */
export function verifyGeneratedMachine(
  machine: TuringMachineDefinition,
  testCases: { input: string; expected: 'ACCEPT' | 'REJECT' }[]
): { isValid: boolean; failedInput?: string } {
  for (const tc of testCases) {
    let sim = initializeSimulation(machine, tc.input);
    let steps = 0;
    const maxSteps = 400;

    while (sim.status !== 'ACCEPTED' && sim.status !== 'REJECTED' && steps < maxSteps) {
      sim = stepSimulation(machine, sim);
      steps++;
    }

    const expectedStatus = tc.expected === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    if (sim.status !== expectedStatus) {
      return { isValid: false, failedInput: tc.input };
    }
  }

  return { isValid: true };
}
