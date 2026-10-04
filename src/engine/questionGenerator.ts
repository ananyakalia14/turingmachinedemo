import { TuringMachineDefinition, Transition, Direction } from './types';
import { initializeSimulation, stepSimulation } from './turingMachine';
import {
  AN_BN_MACHINE,
  AN_B2N_MACHINE,
  PALINDROME_MACHINE,
  EQUAL_01_MACHINE,
  EVEN_1S_MACHINE,
  UNARY_INCREMENT_MACHINE,
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
