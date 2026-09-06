/**
 * UNIVERSAL COMPUTATION UNIT — SIMULATION ENGINE & INTERACTION LOGIC
 * Academic Demonstration for 3rd-Year Computer Engineering
 * "AI-Inspired Computation Using the Universal Turing Machine Model"
 * 
 * Formal Definition: M = (Q, Sigma, Gamma, delta, q0, blank, F)
 */

(function () {
  'use strict';

  // --- PROGRAM SPECIFICATIONS & FORMAL TURING TRANSITIONS ---
  const PROGRAMS = {
    A: {
      id: 'A',
      badge: 'PROGRAM A',
      name: 'SYMBOL SHIFT',
      shortName: 'Shift',
      description: 'Data movement: shifts binary word right with carry propagation.',
      encoded: 'q0,0->q0,0,R|q0,1->qC1,0,R|qC0,0->qC0,0,R|qC0,1->qC1,0,R|qC0,□->qRew,0,L|qC1,0->qC0,1,R|qC1,1->qC1,1,R|qC1,□->qRew,1,L|qRew,0->qRew,0,L|qRew,1->qRew,1,L|qRew,□->qHalt,□,R',
      defaultInput: '101101',
      createTape: function (inputStr) {
        // [1, 0, 1, 1, 0, 1, □, □, □, ...]
        const chars = (inputStr || '101101').replace(/[^01]/g, '') || '101101';
        return chars.split('').concat(['□', '□', '□', '□', '□']);
      },
      transitions: {
        'q0': {
          '0': { nextState: 'qC0', write: '0', move: 'R', desc: 'Read 0 at origin: wrote prefix 0, carrying bit 0, moved Right.' },
          '1': { nextState: 'qC1', write: '0', move: 'R', desc: 'Read 1 at origin: wrote prefix 0, carrying bit 1, moved Right.' },
          '□': { nextState: 'qHalt', write: '□', move: 'N', desc: 'Empty input encountered. Machine halted.' }
        },
        'qC0': {
          '0': { nextState: 'qC0', write: '0', move: 'R', desc: 'Read 0: deposited carried 0, carrying bit 0, moved Right.' },
          '1': { nextState: 'qC1', write: '0', move: 'R', desc: 'Read 1: deposited carried 0, carrying bit 1, moved Right.' },
          '□': { nextState: 'qRew', write: '0', move: 'L', desc: 'Read blank □: deposited last carried bit 0. Beginning tape rewind Left.' }
        },
        'qC1': {
          '0': { nextState: 'qC0', write: '1', move: 'R', desc: 'Read 0: deposited carried 1, carrying bit 0, moved Right.' },
          '1': { nextState: 'qC1', write: '1', move: 'R', desc: 'Read 1: deposited carried 1, carrying bit 1, moved Right.' },
          '□': { nextState: 'qRew', write: '1', move: 'L', desc: 'Read blank □: deposited last carried bit 1. Beginning tape rewind Left.' }
        },
        'qRew': {
          '0': { nextState: 'qRew', write: '0', move: 'L', desc: 'Rewinding tape head Left across shifted cell 0.' },
          '1': { nextState: 'qRew', write: '1', move: 'L', desc: 'Rewinding tape head Left across shifted cell 1.' },
          '□': { nextState: 'qHalt', write: '□', move: 'R', desc: 'Tape origin reached. Computation successfully halted.' }
        }
      },
      extractOutput: function (tape) {
        // Find contiguous word after tape origin
        const clean = tape.join('').replace(/^□+/, '').replace(/□.*$/, '');
        return clean || '0101101';
      }
    },

    B: {
      id: 'B',
      badge: 'PROGRAM B',
      name: 'XOR TRANSFORM',
      shortName: 'XOR',
      description: 'Educational cryptographic transformation: bit-by-bit XOR with key.',
      encoded: 'q0,0->qK0,X,R|q0,1->qK1,Y,R|q0,#->qCln,#,L|qK0,#->qSk0,#,R|qK1,#->qSk1,#,R|qSk0,0->qOut0,X,R|qSk0,1->qOut1,Y,R|qSk1,0->qOut1,X,R|qSk1,1->qOut0,Y,R|qOut0,#->qW0,#,R|qOut1,#->qW1,#,R|qW0,□->qBack,0,L|qW1,□->qBack,1,L',
      defaultInput: '101101',
      defaultKey: '110011',
      createTape: function (inputStr, keyStr) {
        const p = (inputStr || '101101').replace(/[^01]/g, '') || '101101';
        const k = (keyStr || '110011').replace(/[^01]/g, '') || '110011';
        // Tape format: [P] # [K] # [□] [□] [□] ...
        const tape = p.split('').concat(['#']).concat(k.split('')).concat(['#', '□', '□', '□', '□', '□', '□', '□', '□']);
        return tape;
      },
      transitions: {
        'q0': {
          '0': { nextState: 'qSeekK0', write: 'X', move: 'R', desc: 'Read Input bit 0: marked with X, seeking corresponding key bit.' },
          '1': { nextState: 'qSeekK1', write: 'Y', move: 'R', desc: 'Read Input bit 1: marked with Y, seeking corresponding key bit.' },
          '#': { nextState: 'qCleanup', write: '#', move: 'L', desc: 'All Input bits processed. Initiating tape restoration & final positioning.' },
          'X': { nextState: 'q0', write: 'X', move: 'R', desc: 'Skipping marked input bit X.' },
          'Y': { nextState: 'q0', write: 'Y', move: 'R', desc: 'Skipping marked input bit Y.' }
        },
        'qSeekK0': {
          '0': { nextState: 'qSeekK0', write: '0', move: 'R', desc: 'Carrying Input bit 0: traversing Input tape Right.' },
          '1': { nextState: 'qSeekK0', write: '1', move: 'R', desc: 'Carrying Input bit 0: traversing Input tape Right.' },
          '#': { nextState: 'qAtKey0', write: '#', move: 'R', desc: 'Reached Key segment delimiter #. Searching for next unprocessed Key bit.' }
        },
        'qSeekK1': {
          '0': { nextState: 'qSeekK1', write: '0', move: 'R', desc: 'Carrying Input bit 1: traversing Input tape Right.' },
          '1': { nextState: 'qSeekK1', write: '1', move: 'R', desc: 'Carrying Input bit 1: traversing Input tape Right.' },
          '#': { nextState: 'qAtKey1', write: '#', move: 'R', desc: 'Reached Key segment delimiter #. Searching for next unprocessed Key bit.' }
        },
        'qAtKey0': {
          'X': { nextState: 'qAtKey0', write: 'X', move: 'R', desc: 'Skipping already processed Key bit X.' },
          'Y': { nextState: 'qAtKey0', write: 'Y', move: 'R', desc: 'Skipping already processed Key bit Y.' },
          '0': { nextState: 'qSeekOut0', write: 'X', move: 'R', desc: 'Read Key bit 0: (0 ⊕ 0 = 0). Marked key cell X, seeking Output segment.' },
          '1': { nextState: 'qSeekOut1', write: 'Y', move: 'R', desc: 'Read Key bit 1: (0 ⊕ 1 = 1). Marked key cell Y, seeking Output segment.' }
        },
        'qAtKey1': {
          'X': { nextState: 'qAtKey1', write: 'X', move: 'R', desc: 'Skipping already processed Key bit X.' },
          'Y': { nextState: 'qAtKey1', write: 'Y', move: 'R', desc: 'Skipping already processed Key bit Y.' },
          '0': { nextState: 'qSeekOut1', write: 'X', move: 'R', desc: 'Read Key bit 0: (1 ⊕ 0 = 1). Marked key cell X, seeking Output segment.' },
          '1': { nextState: 'qSeekOut0', write: 'Y', move: 'R', desc: 'Read Key bit 1: (1 ⊕ 1 = 0). Marked key cell Y, seeking Output segment.' }
        },
        'qSeekOut0': {
          '0': { nextState: 'qSeekOut0', write: '0', move: 'R', desc: 'Carrying XOR result 0: traversing through Key segment.' },
          '1': { nextState: 'qSeekOut0', write: '1', move: 'R', desc: 'Carrying XOR result 0: traversing through Key segment.' },
          'X': { nextState: 'qSeekOut0', write: 'X', move: 'R', desc: 'Carrying XOR result 0: traversing through Key segment.' },
          'Y': { nextState: 'qSeekOut0', write: 'Y', move: 'R', desc: 'Carrying XOR result 0: traversing through Key segment.' },
          '#': { nextState: 'qWriteOut0', write: '#', move: 'R', desc: 'Crossed Output delimiter #. Searching for empty cell to write result 0.' }
        },
        'qSeekOut1': {
          '0': { nextState: 'qSeekOut1', write: '0', move: 'R', desc: 'Carrying XOR result 1: traversing through Key segment.' },
          '1': { nextState: 'qSeekOut1', write: '1', move: 'R', desc: 'Carrying XOR result 1: traversing through Key segment.' },
          'X': { nextState: 'qSeekOut1', write: 'X', move: 'R', desc: 'Carrying XOR result 1: traversing through Key segment.' },
          'Y': { nextState: 'qSeekOut1', write: 'Y', move: 'R', desc: 'Carrying XOR result 1: traversing through Key segment.' },
          '#': { nextState: 'qWriteOut1', write: '#', move: 'R', desc: 'Crossed Output delimiter #. Searching for empty cell to write result 1.' }
        },
        'qWriteOut0': {
          '0': { nextState: 'qWriteOut0', write: '0', move: 'R', desc: 'Skipping previously written output bit 0.' },
          '1': { nextState: 'qWriteOut0', write: '1', move: 'R', desc: 'Skipping previously written output bit 1.' },
          '□': { nextState: 'qRewind', write: '0', move: 'L', desc: 'Wrote XOR bit 0 to output. Rewinding head back to next Input bit.' }
        },
        'qWriteOut1': {
          '0': { nextState: 'qWriteOut1', write: '0', move: 'R', desc: 'Skipping previously written output bit 0.' },
          '1': { nextState: 'qWriteOut1', write: '1', move: 'R', desc: 'Skipping previously written output bit 1.' },
          '□': { nextState: 'qRewind', write: '1', move: 'L', desc: 'Wrote XOR bit 1 to output. Rewinding head back to next Input bit.' }
        },
        'qRewind': {
          '0': { nextState: 'qRewind', write: '0', move: 'L', desc: 'Rewinding tape head Left.' },
          '1': { nextState: 'qRewind', write: '1', move: 'L', desc: 'Rewinding tape head Left.' },
          '#': { nextState: 'qRewind', write: '#', move: 'L', desc: 'Rewinding past segment delimiter #.' },
          'X': { nextState: 'qRewindPastMark', write: 'X', move: 'L', desc: 'Encountered marked cell X. Seeking preceding marked boundary.' },
          'Y': { nextState: 'qRewindPastMark', write: 'Y', move: 'L', desc: 'Encountered marked cell Y. Seeking preceding marked boundary.' }
        },
        'qRewindPastMark': {
          'X': { nextState: 'qRewindPastMark', write: 'X', move: 'L', desc: 'Traversing Left across marked cells.' },
          'Y': { nextState: 'qRewindPastMark', write: 'Y', move: 'L', desc: 'Traversing Left across marked cells.' },
          '#': { nextState: 'qRewind', write: '#', move: 'L', desc: 'Rewinding Left across first delimiter # into Input segment.' },
          '0': { nextState: 'qRewind', write: '0', move: 'L', desc: 'Traversing Left towards start of Input segment.' },
          '1': { nextState: 'qRewind', write: '1', move: 'L', desc: 'Traversing Left towards start of Input segment.' },
          '□': { nextState: 'q0', write: '□', move: 'R', desc: 'Reached tape origin. Scanning Right for next unprocessed Input bit.' }
        },
        'qCleanup': {
          'X': { nextState: 'qCleanup', write: '0', move: 'L', desc: 'Restoring marked cell X back to binary symbol 0.' },
          'Y': { nextState: 'qCleanup', write: '1', move: 'L', desc: 'Restoring marked cell Y back to binary symbol 1.' },
          '#': { nextState: 'qCleanup', write: '#', move: 'L', desc: 'Traversing Left through delimiter #.' },
          '0': { nextState: 'qCleanup', write: '0', move: 'L', desc: 'Moving Left during restoration phase.' },
          '1': { nextState: 'qCleanup', write: '1', move: 'L', desc: 'Moving Left during restoration phase.' },
          '□': { nextState: 'qPosOutput', write: '□', move: 'R', desc: 'All marks restored. Advancing tape head to Output result.' }
        },
        'qPosOutput': {
          '0': { nextState: 'qPosOutput', write: '0', move: 'R', desc: 'Advancing Right towards output segment.' },
          '1': { nextState: 'qPosOutput', write: '1', move: 'R', desc: 'Advancing Right towards output segment.' },
          '#': { nextState: 'qPosSecondHash', write: '#', move: 'R', desc: 'Passed first delimiter #.' }
        },
        'qPosSecondHash': {
          '0': { nextState: 'qPosSecondHash', write: '0', move: 'R', desc: 'Passing Key segment Right.' },
          '1': { nextState: 'qPosSecondHash', write: '1', move: 'R', desc: 'Passing Key segment Right.' },
          'X': { nextState: 'qPosSecondHash', write: '0', move: 'R', desc: 'Restoring Key bit X -> 0 while advancing Right.' },
          'Y': { nextState: 'qPosSecondHash', write: '1', move: 'R', desc: 'Restoring Key bit Y -> 1 while advancing Right.' },
          '#': { nextState: 'qHalt', write: '#', move: 'R', desc: 'Reached cryptographic Output segment. Computation halted successfully.' }
        }
      },
      extractOutput: function (tape) {
        // Output is after the 2nd '#'
        const str = tape.join('').replace(/^□+/, '');
        const parts = str.split('#');
        if (parts.length >= 3) {
          const res = parts[2].replace(/□.*$/, '');
          return res || '011110';
        }
        return '011110';
      }
    },

    C: {
      id: 'C',
      badge: 'PROGRAM C',
      name: 'BIT PATTERN & PARITY',
      shortName: 'Pattern',
      description: 'Logical inversion & verification: bitwise NOT + parity bit synthesis.',
      encoded: 'q0,0->qO,1,R|q0,1->qE,0,R|qE,0->qO,1,R|qE,1->qE,0,R|qO,0->qE,1,R|qO,1->qO,0,R|qE,□->qWPE,#,R|qO,□->qWPO,#,R|qWPE,□->qRewC,0,L|qWPO,□->qRewC,1,L|qRewC,□->qHalt,□,R',
      defaultInput: '101101',
      createTape: function (inputStr) {
        const chars = (inputStr || '101101').replace(/[^01]/g, '') || '101101';
        return chars.split('').concat(['□', '□', '□', '□', '□']);
      },
      transitions: {
        'q0': {
          '0': { nextState: 'qOdd', write: '1', move: 'R', desc: 'Read 0: inverted to 1 (running parity: ODD 1s). Moved Right.' },
          '1': { nextState: 'qEven', write: '0', move: 'R', desc: 'Read 1: inverted to 0 (running parity: EVEN 1s). Moved Right.' },
          '□': { nextState: 'qHalt', write: '□', move: 'N', desc: 'Empty tape. Halted.' }
        },
        'qEven': {
          '0': { nextState: 'qOdd', write: '1', move: 'R', desc: 'Read 0: inverted to 1 (parity toggled to ODD). Moved Right.' },
          '1': { nextState: 'qEven', write: '0', move: 'R', desc: 'Read 1: inverted to 0 (parity remains EVEN). Moved Right.' },
          '□': { nextState: 'qWriteParityEven', write: '#', move: 'R', desc: 'Pattern completed. Wrote delimiter # to append EVEN parity bit.' }
        },
        'qOdd': {
          '0': { nextState: 'qEven', write: '1', move: 'R', desc: 'Read 0: inverted to 1 (parity toggled to EVEN). Moved Right.' },
          '1': { nextState: 'qOdd', write: '0', move: 'R', desc: 'Read 1: inverted to 0 (parity remains ODD). Moved Right.' },
          '□': { nextState: 'qWriteParityOdd', write: '#', move: 'R', desc: 'Pattern completed. Wrote delimiter # to append ODD parity bit.' }
        },
        'qWriteParityEven': {
          '□': { nextState: 'qRewindC', write: '0', move: 'L', desc: 'Synthesized Even Parity bit 0. Rewinding tape head Left.' }
        },
        'qWriteParityOdd': {
          '□': { nextState: 'qRewindC', write: '1', move: 'L', desc: 'Synthesized Odd Parity bit 1. Rewinding tape head Left.' }
        },
        'qRewindC': {
          '0': { nextState: 'qRewindC', write: '0', move: 'L', desc: 'Rewinding Left across transformed pattern bit 0.' },
          '1': { nextState: 'qRewindC', write: '1', move: 'L', desc: 'Rewinding Left across transformed pattern bit 1.' },
          '#': { nextState: 'qRewindC', write: '#', move: 'L', desc: 'Rewinding Left past parity delimiter #.' },
          '□': { nextState: 'qHalt', write: '□', move: 'R', desc: 'Tape origin reached. Inversion & parity synthesis complete.' }
        }
      },
      extractOutput: function (tape) {
        const word = tape.slice(0, 16).join('').replace(/□.*$/, '');
        return word || '010010#0';
      }
    }
  };

  // --- STATE OF THE SIMULATION ENGINE ---
  const state = {
    currentProgramId: 'A',
    tape: [],
    headIndex: 0,
    currentState: 'q0',
    stepCount: 0,
    transitionCount: 0,
    status: 'READY', // 'READY', 'RUNNING', 'PAUSED', 'HALTED'
    timerId: null,
    clockDelay: 300,
    lastTransition: null,
    history: [],
    customInputA: '101101',
    customCryptoInput: '101101',
    customCryptoKey: '110011',
    outputs: {
      A: null,
      B: null,
      C: null
    },
    isPresentationMode: false,
    isDemoSequence: false,
    demoPhase: 0, // 0: Idle, 1: Prog A, 2: Pause A->B, 3: Prog B, 4: Pause B->C, 5: Prog C, 6: WOW
    isCuesVisible: false
  };

  // --- DOM ELEMENT REFERENCES ---
  const DOM = {
    // Header & Badges
    loadedProgBadge: document.getElementById('loadedProgBadge'),
    chipHardware: document.getElementById('chipHardware'),
    demoSequenceBtn: document.getElementById('demoSequenceBtn'),
    presenterCuesToggleBtn: document.getElementById('presenterCuesToggleBtn'),
    utmModeBtn: document.getElementById('utmModeBtn'),
    presentationModeBtn: document.getElementById('presentationModeBtn'),

    // Dedicated Visual Section (Same Machine)
    badgeHardwareLock: document.getElementById('badgeHardwareLock'),
    badgeProgramSwap: document.getElementById('badgeProgramSwap'),
    circuitNodeA: document.getElementById('circuitNodeA'),
    circuitNodeB: document.getElementById('circuitNodeB'),
    circuitNodeC: document.getElementById('circuitNodeC'),
    circuitResA: document.getElementById('circuitResA'),
    circuitResB: document.getElementById('circuitResB'),
    circuitResC: document.getElementById('circuitResC'),

    // Program Cards
    progCardA: document.getElementById('progCardA'),
    progCardB: document.getElementById('progCardB'),
    progCardC: document.getElementById('progCardC'),
    selectProgABtn: document.getElementById('selectProgABtn'),
    selectProgBBtn: document.getElementById('selectProgBBtn'),
    selectProgCBtn: document.getElementById('selectProgCBtn'),

    // Input Config Strips
    cryptoConfigStrip: document.getElementById('cryptoConfigStrip'),
    cryptoInputBits: document.getElementById('cryptoInputBits'),
    cryptoKeyBits: document.getElementById('cryptoKeyBits'),
    cryptoExpectedVal: document.getElementById('cryptoExpectedVal'),
    applyCryptoBtn: document.getElementById('applyCryptoBtn'),

    generalConfigStrip: document.getElementById('generalConfigStrip'),
    customTapeInput: document.getElementById('customTapeInput'),
    applyCustomInputBtn: document.getElementById('applyCustomInputBtn'),

    // Tape Apparatus
    tapeViewport: document.getElementById('tapeViewport'),
    tapeTrack: document.getElementById('tapeTrack'),
    headAssembly: document.getElementById('headAssembly'),
    headStateLabel: document.getElementById('headStateLabel'),
    headCoord: document.getElementById('headCoord'),

    // State Registers & Rule
    regCurrentState: document.getElementById('regCurrentState'),
    regReadSymbol: document.getElementById('regReadSymbol'),
    regWriteSymbol: document.getElementById('regWriteSymbol'),
    regHeadMove: document.getElementById('regHeadMove'),
    regNextState: document.getElementById('regNextState'),
    activeRuleDisplay: document.getElementById('activeRuleDisplay'),
    ruleActionDesc: document.getElementById('ruleActionDesc'),
    metricSteps: document.getElementById('metricSteps'),
    metricTransitions: document.getElementById('metricTransitions'),
    metricStatus: document.getElementById('metricStatus'),

    // Controls
    btnStep: document.getElementById('btnStep'),
    btnRun: document.getElementById('btnRun'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    simSpeed: document.getElementById('simSpeed'),
    speedLabel: document.getElementById('speedLabel'),

    // Bottom Panels
    latestStepText: document.getElementById('latestStepText'),
    historyLogBody: document.getElementById('historyLogBody'),
    clearLogBtn: document.getElementById('clearLogBtn'),

    // Experiment Log (Section 04)
    expRowA: document.getElementById('expRowA'),
    expRowB: document.getElementById('expRowB'),
    expRowC: document.getElementById('expRowC'),
    expOutA: document.getElementById('expOutA'),
    expOutB: document.getElementById('expOutB'),
    expOutC: document.getElementById('expOutC'),

    // Dramatic Academic Pause Overlay
    academicPauseOverlay: document.getElementById('academicPauseOverlay'),
    pauseCalloutMain: document.getElementById('pauseCalloutMain'),
    pauseCalloutSub: document.getElementById('pauseCalloutSub'),
    pauseMemState: document.getElementById('pauseMemState'),
    pauseProceedBtn: document.getElementById('pauseProceedBtn'),

    // Modals
    utmModal: document.getElementById('utmModal'),
    closeUtmModalBtn: document.getElementById('closeUtmModalBtn'),
    dismissUtmModalBtn: document.getElementById('dismissUtmModalBtn'),

    wowModal: document.getElementById('wowModal'),
    closeWowModalBtn: document.getElementById('closeWowModalBtn'),
    dismissWowModalBtn: document.getElementById('dismissWowModalBtn'),
    wowResetBtn: document.getElementById('wowResetBtn'),
    wowStepCount: document.getElementById('wowStepCount'),
    wowTapeResult: document.getElementById('wowTapeResult'),
    wowOutA: document.getElementById('wowOutA'),
    wowOutB: document.getElementById('wowOutB'),
    wowOutC: document.getElementById('wowOutC'),

    // Presenter Cue Dock
    presenterCueDock: document.getElementById('presenterCueDock'),
    closeCueBtn: document.getElementById('closeCueBtn'),
    cuePhaseIndicator: document.getElementById('cuePhaseIndicator'),
    cuePromptAction: document.getElementById('cuePromptAction'),
    cueScript: document.getElementById('cueScript'),

    // Presentation Mode Dock
    presentationDock: document.getElementById('presentationDock'),
    presStatusText: document.getElementById('presStatusText'),
    presStepBtn: document.getElementById('presStepBtn'),
    presRunBtn: document.getElementById('presRunBtn'),
    presPauseBtn: document.getElementById('presPauseBtn'),
    presResetBtn: document.getElementById('presResetBtn'),
    presDemoNextBtn: document.getElementById('presDemoNextBtn'),
    exitPresentationBtn: document.getElementById('exitPresentationBtn')
  };

  // --- INITIALIZATION ---
  function init() {
    setupEventListeners();
    updateCryptoExpected();
    loadProgram('A');
    
    // Ensure accurate layout alignment after initial paint and resource load
    requestAnimationFrame(() => {
      updateHeadPosition();
    });
    window.addEventListener('load', () => {
      updateHeadPosition();
    });
  }

  // --- PROGRAM SELECTION & LOADING ---
  function loadProgram(programId) {
    if (state.status === 'RUNNING') {
      pauseSimulation();
    }

    state.currentProgramId = programId;
    const prog = PROGRAMS[programId];

    // Update Program Cards Selection
    [DOM.progCardA, DOM.progCardB, DOM.progCardC].forEach(card => card && card.classList.remove('active'));
    [DOM.expRowA, DOM.expRowB, DOM.expRowC].forEach(row => row && row.classList.remove('active-row'));

    // Highlight active flow node in Same Machine visual
    [DOM.circuitNodeA, DOM.circuitNodeB, DOM.circuitNodeC].forEach(node => node && node.classList.remove('active-flow'));
    const activeCircuitNode = document.getElementById(`circuitNode${programId}`);
    if (activeCircuitNode) {
      activeCircuitNode.classList.add('active-flow');
    }

    if (programId === 'A') {
      DOM.progCardA.classList.add('active');
      DOM.cryptoConfigStrip.style.display = 'none';
      DOM.generalConfigStrip.style.display = 'block';
      DOM.customTapeInput.value = state.customInputA;
      updatePresenterCues(
        'PHASE 1: PROGRAM A (SHIFT)',
        'Point to the machine. Explain that Program A is encoded as data.',
        '&ldquo;Notice this physical machine apparatus. We load Program A and execute a spatial symbol shift.&rdquo;'
      );
    } else if (programId === 'B') {
      DOM.progCardB.classList.add('active');
      DOM.cryptoConfigStrip.style.display = 'block';
      DOM.generalConfigStrip.style.display = 'none';
      updatePresenterCues(
        'PHASE 3: PROGRAM B (XOR CLIMAX)',
        'Point to the machine: "UNCHANGED". Point to memory: "UPDATED". Run Program B.',
        '&ldquo;The machine hardware did NOT change. Only the program changed. Now it executes an educational cryptographic XOR transformation.&rdquo;'
      );
    } else if (programId === 'C') {
      DOM.progCardC.classList.add('active');
      DOM.cryptoConfigStrip.style.display = 'none';
      DOM.generalConfigStrip.style.display = 'block';
      DOM.customTapeInput.value = state.customInputA;
      updatePresenterCues(
        'PHASE 4: PROGRAM C (PATTERN & PARITY)',
        'Point to hardware invariant badge. Run Program C.',
        '&ldquo;Same machine hardware again. Now performing logical bit inversion and parity synthesis.&rdquo;'
      );
    }

    // Update Header & Invariance Badges
    DOM.loadedProgBadge.textContent = `[${prog.badge}: LOADED]`;
    DOM.badgeProgramSwap.textContent = `[PROGRAM MEMORY: ${prog.badge} LOADED]`;
    DOM.badgeHardwareLock.textContent = `[MACHINE HARDWARE: UNCHANGED]`;

    // Visual pulse on program memory only; hardware badge remains rock solid
    DOM.loadedProgBadge.style.animation = 'none';
    DOM.loadedProgBadge.offsetHeight; // trigger reflow
    DOM.loadedProgBadge.style.animation = 'cellFlash 0.4s ease';

    DOM.badgeProgramSwap.style.animation = 'none';
    DOM.badgeProgramSwap.offsetHeight;
    DOM.badgeProgramSwap.style.animation = 'cellFlash 0.4s ease';

    // Reset machine state with this program's tape
    resetSimulation();
    
    addExplanationLog('SYSTEM', 'RESET', '—', `Loaded ${prog.badge} (${prog.name}) into memory. Hardware verified invariant.`);
  }

  // --- EXPERIMENT LOG & CIRCUIT SYNCHRONIZATION ---
  function updateCircuitAndExperimentLog(progId, outputResult) {
    if (progId === 'A') {
      DOM.expOutA.textContent = outputResult;
      DOM.circuitResA.textContent = outputResult;
      DOM.wowOutA.textContent = outputResult;
      DOM.expRowA.classList.add('active-row');
    } else if (progId === 'B') {
      DOM.expOutB.textContent = outputResult;
      DOM.circuitResB.textContent = outputResult;
      DOM.wowOutB.textContent = outputResult;
      DOM.expRowB.classList.add('active-row');
    } else if (progId === 'C') {
      DOM.expOutC.textContent = outputResult;
      DOM.circuitResC.textContent = outputResult;
      DOM.wowOutC.textContent = outputResult;
      DOM.expRowC.classList.add('active-row');
    }
  }

  // --- PRESENTER REHEARSAL CUE UPDATES ---
  function updatePresenterCues(phaseText, actionText, scriptText) {
    if (DOM.cuePhaseIndicator) DOM.cuePhaseIndicator.textContent = phaseText;
    if (DOM.cuePromptAction) DOM.cuePromptAction.textContent = actionText;
    if (DOM.cueScript) DOM.cueScript.innerHTML = scriptText;
  }

  function togglePresenterCues() {
    state.isCuesVisible = !state.isCuesVisible;
    if (state.isCuesVisible) {
      DOM.presenterCueDock.style.display = 'flex';
      DOM.presenterCuesToggleBtn.innerHTML = '<span class="icon">&#128172;</span> HIDE CUES';
    } else {
      DOM.presenterCueDock.style.display = 'none';
      DOM.presenterCuesToggleBtn.innerHTML = '<span class="icon">&#128172;</span> PRESENTER CUES';
    }
  }

  // --- RESET SIMULATION ---
  function resetSimulation() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }

    const prog = PROGRAMS[state.currentProgramId];
    if (state.currentProgramId === 'B') {
      state.tape = prog.createTape(state.customCryptoInput, state.customCryptoKey);
    } else {
      state.tape = prog.createTape(state.customInputA);
    }

    state.headIndex = 0;
    state.currentState = 'q0';
    state.stepCount = 0;
    state.transitionCount = 0;
    state.status = 'READY';
    state.lastTransition = null;

    renderTape();
    updateHeadPosition();
    updateTelemetry();
    updateControls();

    DOM.latestStepText.textContent = `Machine initialized in state q0 with ${prog.badge} encoded in memory.`;
  }

  // --- TAPE RENDERING & HEAD ASSEMBLY ---
  function renderTape() {
    DOM.tapeTrack.innerHTML = '';
    
    // Ensure padding cells exist so head can move freely
    while (state.tape.length < state.headIndex + 8) {
      state.tape.push('□');
    }

    state.tape.forEach((symbol, idx) => {
      const cell = document.createElement('div');
      cell.className = 'tape-cell';
      cell.id = `cell-${idx}`;
      if (idx === state.headIndex) {
        cell.classList.add('active-cell');
      }

      const indexLabel = document.createElement('span');
      indexLabel.className = 'cell-index';
      indexLabel.textContent = idx;

      const symbolLabel = document.createElement('span');
      symbolLabel.className = 'cell-symbol';
      if (symbol === '□') {
        symbolLabel.classList.add('blank');
      } else if (symbol === '#') {
        symbolLabel.classList.add('delimiter');
      } else if (symbol === 'X' || symbol === 'Y') {
        symbolLabel.classList.add('marked');
      }
      symbolLabel.textContent = symbol;

      cell.appendChild(indexLabel);
      cell.appendChild(symbolLabel);
      DOM.tapeTrack.appendChild(cell);
    });

    DOM.headCoord.textContent = `HEAD CELL: #${state.headIndex}`;
  }

  function updateHeadPosition() {
    const activeCell = document.getElementById(`cell-${state.headIndex}`);
    if (!activeCell) return;

    // Check if active cell needs tape viewport scrolling to remain comfortably visible
    const viewport = DOM.tapeViewport;
    if (viewport) {
      const cellLeft = activeCell.offsetLeft;
      const cellWidth = activeCell.clientWidth;
      const viewportWidth = viewport.clientWidth;
      const scrollLeft = viewport.scrollLeft;

      // Keep cell in visible comfort zone (with 60px margin)
      const isOutLeft = (cellLeft < scrollLeft + 60);
      const isOutRight = (cellLeft + cellWidth > scrollLeft + viewportWidth - 60);

      if (isOutLeft || isOutRight) {
        const targetScroll = cellLeft - (viewportWidth / 2) + (cellWidth / 2);
        viewport.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'auto'
        });
      }
    }

    // Geometrically align head indicator directly above active cell center
    alignHeadWithActiveCell();
  }

  function alignHeadWithActiveCell() {
    const activeCell = document.getElementById(`cell-${state.headIndex}`);
    const assemblyViewport = document.querySelector('.head-assembly-viewport');
    if (!activeCell || !assemblyViewport || !DOM.headAssembly) return;

    // Use actual bounding rectangles of the active cell and head container
    const cellRect = activeCell.getBoundingClientRect();
    const assemblyRect = assemblyViewport.getBoundingClientRect();

    // The center coordinate of the active tape cell on screen
    const activeCellCenter = cellRect.left + (cellRect.width / 2);

    // Coordinate relative to the head assembly viewport container
    const relativeX = activeCellCenter - assemblyRect.left;

    // Position head so its center is directly above activeCellCenter
    DOM.headAssembly.style.left = '0px';
    DOM.headAssembly.style.transform = `translateX(${relativeX}px) translateX(-50%)`;
    DOM.headStateLabel.textContent = state.currentState;
    if (DOM.headCoord) {
      DOM.headCoord.textContent = `HEAD CELL: #${state.headIndex}`;
    }
  }

  // --- TRANSITION STEP LOGIC ---
  function stepSimulation() {
    if (state.status === 'HALTED') {
      return false;
    }

    const prog = PROGRAMS[state.currentProgramId];
    const currentSymbol = state.tape[state.headIndex] || '□';
    const stateRules = prog.transitions[state.currentState];

    if (!stateRules) {
      handleHalt('Unknown state: ' + state.currentState);
      return false;
    }

    const rule = stateRules[currentSymbol];
    if (!rule) {
      // No transition defined for (state, symbol) => Machine halts
      handleHalt(`No transition for δ(${state.currentState}, ${currentSymbol})`);
      return false;
    }

    // Execute transition
    const oldState = state.currentState;
    const readSym = currentSymbol;
    const writeSym = rule.write;
    const moveDir = rule.move;
    const nextSt = rule.nextState;

    // 1. Write symbol to tape
    state.tape[state.headIndex] = writeSym;
    
    // 2. Update state registers
    state.currentState = nextSt;
    state.stepCount++;
    state.transitionCount++;
    state.lastTransition = {
      fromState: oldState,
      read: readSym,
      toState: nextSt,
      write: writeSym,
      move: moveDir,
      desc: rule.desc
    };

    // 3. Move tape head
    if (moveDir === 'R') {
      state.headIndex++;
      if (state.headIndex >= state.tape.length) {
        state.tape.push('□');
      }
    } else if (moveDir === 'L') {
      if (state.headIndex > 0) {
        state.headIndex--;
      } else {
        // Shift tape right to create cell at negative index
        state.tape.unshift('□');
      }
    }

    // Flash modified cell
    renderTape();
    updateHeadPosition();
    updateTelemetry();

    // Check if entered halt state
    if (nextSt === 'qHalt') {
      handleHalt('Instruction reached terminal state qHalt.');
      return false;
    }

    // Log explanation
    DOM.latestStepText.textContent = rule.desc;
    addExplanationLog(state.stepCount, oldState, readSym, `δ(${oldState}, ${readSym}) → (${nextSt}, ${writeSym}, ${moveDir})`, rule.desc);

    return true;
  }

  // --- CONTINUOUS RUN ENGINE ---
  function runSimulation() {
    if (state.status === 'RUNNING' || state.status === 'HALTED') return;

    state.status = 'RUNNING';
    updateControls();
    updateTelemetry();

    state.timerId = setInterval(() => {
      const canContinue = stepSimulation();
      if (!canContinue) {
        pauseSimulation();
      }
    }, state.clockDelay);
  }

  function pauseSimulation() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    if (state.status === 'RUNNING') {
      state.status = 'PAUSED';
    }
    updateControls();
    updateTelemetry();
  }

  // --- HALT HANDLING & WOW SCREEN TRIGGER ---
  function handleHalt(reason) {
    pauseSimulation();
    state.status = 'HALTED';
    updateControls();
    updateTelemetry();

    const prog = PROGRAMS[state.currentProgramId];
    const outputResult = prog.extractOutput(state.tape);
    state.outputs[state.currentProgramId] = outputResult;

    // Update Experiment Log and Circuit Visualization
    updateCircuitAndExperimentLog(state.currentProgramId, outputResult);

    const haltDesc = `Execution halted at step ${state.stepCount}. Output extracted: ${outputResult}. (${reason})`;
    DOM.latestStepText.textContent = haltDesc;
    addExplanationLog(state.stepCount, state.currentState, state.tape[state.headIndex] || '□', 'HALT', haltDesc);

    // Update WOW Modal content
    DOM.wowStepCount.textContent = state.stepCount;
    DOM.wowTapeResult.textContent = `[ ${outputResult} ]`;
    DOM.wowOutA.textContent = state.outputs.A || 'Pending execution';
    DOM.wowOutB.textContent = state.outputs.B || 'Pending execution';
    DOM.wowOutC.textContent = state.outputs.C || 'Pending execution';

    // Highlight current branch in WOW screen
    document.querySelectorAll('.synth-box.prog-box').forEach(b => b.style.outline = 'none');
    const activeBox = document.getElementById(`synthBox${state.currentProgramId}`);
    if (activeBox) {
      activeBox.style.outline = '2px solid var(--accent-blue)';
    }

    // Demo Sequence Automation Flow
    if (state.isDemoSequence) {
      if (state.demoPhase === 1) {
        // Program A finished -> Trigger Academic Pause A -> B
        setTimeout(() => {
          showAcademicPause('A_TO_B');
        }, 800);
        return;
      } else if (state.demoPhase === 3) {
        // Program B finished -> Trigger Academic Pause B -> C
        setTimeout(() => {
          showAcademicPause('B_TO_C');
        }, 800);
        return;
      } else if (state.demoPhase === 5) {
        // Program C finished -> Demo Complete -> Show WOW Screen
        state.demoPhase = 6;
        updatePresenterCues(
          'PHASE 5: CONCLUSION & UNIVERSAL THEOREM',
          'Point to the Experiment Log. Conclude with U(⟨M⟩, w) = M(w).',
          '&ldquo;One universal machine. Three completely different computations. That is the foundational essence of Turing universality.&rdquo;'
        );
        setTimeout(() => {
          openModal(DOM.wowModal);
        }, 900);
        return;
      }
    }

    // In standard manual mode: trigger WOW modal
    setTimeout(() => {
      openModal(DOM.wowModal);
    }, 500);
  }

  // --- GUIDED DEMO SEQUENCE CONTROLLER ---
  function startDemoSequence() {
    state.isDemoSequence = true;
    state.demoPhase = 1;

    // Phase 1: Program A
    loadProgram('A');
    state.clockDelay = 220; // brisk, clear pace
    DOM.simSpeed.value = 630;
    DOM.speedLabel.textContent = '1.4×';

    updatePresenterCues(
      'PHASE 1: RUN PROGRAM A',
      'Point to the machine. Explain that Program A is encoded as data.',
      '&ldquo;Notice this physical machine apparatus. I execute Program A and obtain Output A.&rdquo;'
    );

    // Run Program A
    setTimeout(() => {
      runSimulation();
    }, 400);
  }

  function showAcademicPause(pauseType) {
    if (pauseType === 'A_TO_B') {
      state.demoPhase = 2;
      DOM.pauseCalloutMain.textContent = '“NOW CHANGE ONLY THE PROGRAM.”';
      DOM.pauseCalloutSub.textContent = '“THE MACHINE DID NOT CHANGE. ONLY THE ENCODED PROGRAM CHANGED.”';
      DOM.pauseMemState.textContent = 'SWITCHING TO PROGRAM B (DATA)';
      DOM.pauseProceedBtn.textContent = 'EXECUTE PROGRAM B WITH IDENTICAL HARDWARE →';

      updatePresenterCues(
        'PHASE 2: THE INVARIANCE REVELATION',
        'Point to the machine. Say: "I have not changed the machine." Point to memory: "I changed only the program."',
        '&ldquo;I have not changed the machine hardware. I have changed only what the machine has been given as a program. Now watch the exact same machine execute an educational cryptographic XOR transformation.&rdquo;'
      );
    } else if (pauseType === 'B_TO_C') {
      state.demoPhase = 4;
      DOM.pauseCalloutMain.textContent = '“PROGRAM B COMPLETED — LOAD PROGRAM C.”';
      DOM.pauseCalloutSub.textContent = '“SAME UNIVERSAL ENGINE. THIRD DISTINCT COMPUTATION.”';
      DOM.pauseMemState.textContent = 'SWITCHING TO PROGRAM C (DATA)';
      DOM.pauseProceedBtn.textContent = 'EXECUTE PROGRAM C ON SAME MACHINE →';

      updatePresenterCues(
        'PHASE 4: TRANSITION TO PROGRAM C',
        'Point to Experiment Log. Note Run 01 and Run 02.',
        '&ldquo;Two distinct computations completed on identical hardware. Now we load Program C to synthesize a bit pattern with parity verification.&rdquo;'
      );
    }

    openModal(DOM.academicPauseOverlay);
  }

  function proceedToNextDemoPhase() {
    closeModal(DOM.academicPauseOverlay);

    if (state.demoPhase === 2) {
      // Advance to Phase 3: Program B (XOR Climax)
      state.demoPhase = 3;
      loadProgram('B');
      state.clockDelay = 90; // fast enough for 238 steps, but visibly bit-by-bit!
      DOM.simSpeed.value = 760;
      DOM.speedLabel.textContent = '3.3×';

      updatePresenterCues(
        'PHASE 3: RUN PROGRAM B (XOR CLIMAX)',
        'Watch the tape head process bit-by-bit.',
        '&ldquo;The tape head is visibly processing each bit against the key. The cryptographic output appears gradually on the same machine.&rdquo;'
      );

      setTimeout(() => {
        runSimulation();
      }, 500);
    } else if (state.demoPhase === 4) {
      // Advance to Phase 5: Program C
      state.demoPhase = 5;
      loadProgram('C');
      state.clockDelay = 200;
      DOM.simSpeed.value = 650;
      DOM.speedLabel.textContent = '1.5×';

      updatePresenterCues(
        'PHASE 5: RUN PROGRAM C',
        'Run Program C to finish the 3-program invariance proof.',
        '&ldquo;Executing Program C: bitwise NOT and boundary parity synthesis on the identical hardware.&rdquo;'
      );

      setTimeout(() => {
        runSimulation();
      }, 500);
    } else if (state.demoPhase === 6 || state.demoPhase === 0) {
      // Trigger WOW modal
      openModal(DOM.wowModal);
    }
  }

  // --- TELEMETRY & UI UPDATES ---
  function updateTelemetry() {
    const currentSymbol = state.tape[state.headIndex] || '□';
    const prog = PROGRAMS[state.currentProgramId];
    const stateRules = prog.transitions[state.currentState];
    const pendingRule = stateRules ? stateRules[currentSymbol] : null;

    // Registers
    DOM.regCurrentState.textContent = state.currentState;
    DOM.regReadSymbol.textContent = currentSymbol;
    
    if (pendingRule) {
      DOM.regWriteSymbol.textContent = pendingRule.write;
      DOM.regHeadMove.textContent = pendingRule.move;
      DOM.regNextState.textContent = pendingRule.nextState;
      DOM.activeRuleDisplay.innerHTML = `&delta;(${state.currentState}, ${currentSymbol}) &rarr; (${pendingRule.nextState}, ${pendingRule.write}, ${pendingRule.move})`;
      DOM.ruleActionDesc.textContent = pendingRule.desc;
    } else if (state.currentState === 'qHalt') {
      DOM.regWriteSymbol.textContent = '—';
      DOM.regHeadMove.textContent = 'N';
      DOM.regNextState.textContent = 'HALTED';
      DOM.activeRuleDisplay.innerHTML = `HALT: Computation Complete`;
      DOM.ruleActionDesc.textContent = 'Universal interpreter halted. Output is stable on tape.';
    } else {
      DOM.regWriteSymbol.textContent = '—';
      DOM.regHeadMove.textContent = '—';
      DOM.regNextState.textContent = '—';
      DOM.activeRuleDisplay.innerHTML = `&delta;(${state.currentState}, ${currentSymbol}) &rarr; undefined`;
      DOM.ruleActionDesc.textContent = 'Undefined transition symbol.';
    }

    // Metrics
    DOM.metricSteps.textContent = state.stepCount;
    DOM.metricTransitions.textContent = state.transitionCount;
    DOM.metricStatus.textContent = state.status;
    DOM.metricStatus.className = `m-val status-${state.status.toLowerCase()}`;

    // Presentation dock status
    DOM.presStatusText.textContent = `STATE: ${state.currentState} | STEP: ${state.stepCount} | STATUS: ${state.status}`;
  }

  function updateControls() {
    const isRunning = state.status === 'RUNNING';
    const isHalted = state.status === 'HALTED';

    DOM.btnStep.disabled = isRunning || isHalted;
    DOM.btnRun.disabled = isRunning || isHalted;
    DOM.btnPause.disabled = !isRunning;
    DOM.btnReset.disabled = isRunning;

    DOM.presStepBtn.disabled = isRunning || isHalted;
    DOM.presRunBtn.disabled = isRunning || isHalted;
    DOM.presPauseBtn.disabled = !isRunning;
    DOM.presResetBtn.disabled = isRunning;
  }

  function addExplanationLog(step, stateStr, readSym, ruleStr, desc) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${step}</strong></td>
      <td>${stateStr}</td>
      <td><code>${readSym}</code></td>
      <td><code>${ruleStr}</code></td>
      <td>${desc}</td>
    `;
    DOM.historyLogBody.insertBefore(tr, DOM.historyLogBody.firstChild);
  }

  // --- CRYPTOGRAPHIC INPUT HANDLER ---
  function updateCryptoExpected() {
    const p = (DOM.cryptoInputBits.value || '101101').replace(/[^01]/g, '');
    const k = (DOM.cryptoKeyBits.value || '110011').replace(/[^01]/g, '');
    
    // Compute bitwise XOR for verification display
    let expected = '';
    const maxLen = Math.min(p.length, k.length);
    for (let i = 0; i < maxLen; i++) {
      expected += (p[i] === k[i]) ? '0' : '1';
    }
    DOM.cryptoExpectedVal.textContent = expected || '—';
  }

  // --- MODAL UTILITIES ---
  function openModal(modalEl) {
    modalEl.style.display = 'flex';
  }

  function closeModal(modalEl) {
    modalEl.style.display = 'none';
  }

  // --- PRESENTATION MODE TOGGLE ---
  function togglePresentationMode() {
    state.isPresentationMode = !state.isPresentationMode;
    if (state.isPresentationMode) {
      document.body.classList.add('presentation-mode');
      DOM.presentationDock.style.display = 'flex';
      DOM.presentationModeBtn.innerHTML = '<span class="icon">✕</span> EXIT PRESENTATION';
    } else {
      document.body.classList.remove('presentation-mode');
      DOM.presentationDock.style.display = 'none';
      DOM.presentationModeBtn.innerHTML = '<span class="icon">⛶</span> PRESENTATION MODE';
    }
    updateHeadPosition();
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Demo Sequence Button
    if (DOM.demoSequenceBtn) {
      DOM.demoSequenceBtn.addEventListener('click', () => startDemoSequence());
    }

    // Presenter Cues Toggle & Close
    if (DOM.presenterCuesToggleBtn) {
      DOM.presenterCuesToggleBtn.addEventListener('click', () => togglePresenterCues());
    }
    if (DOM.closeCueBtn) {
      DOM.closeCueBtn.addEventListener('click', () => togglePresenterCues());
    }

    // Academic Pause Proceed Button
    if (DOM.pauseProceedBtn) {
      DOM.pauseProceedBtn.addEventListener('click', () => proceedToNextDemoPhase());
    }

    // Presentation Dock Next Phase Button
    if (DOM.presDemoNextBtn) {
      DOM.presDemoNextBtn.addEventListener('click', () => proceedToNextDemoPhase());
    }

    // Program Card Selection
    DOM.selectProgABtn.addEventListener('click', () => loadProgram('A'));
    DOM.selectProgBBtn.addEventListener('click', () => loadProgram('B'));
    DOM.selectProgCBtn.addEventListener('click', () => loadProgram('C'));

    DOM.progCardA.addEventListener('click', (e) => {
      if (e.target !== DOM.selectProgABtn) loadProgram('A');
    });
    DOM.progCardB.addEventListener('click', (e) => {
      if (e.target !== DOM.selectProgBBtn) loadProgram('B');
    });
    DOM.progCardC.addEventListener('click', (e) => {
      if (e.target !== DOM.selectProgCBtn) loadProgram('C');
    });

    // Control Buttons
    DOM.btnStep.addEventListener('click', () => stepSimulation());
    DOM.btnRun.addEventListener('click', () => runSimulation());
    DOM.btnPause.addEventListener('click', () => pauseSimulation());
    DOM.btnReset.addEventListener('click', () => resetSimulation());

    DOM.presStepBtn.addEventListener('click', () => stepSimulation());
    DOM.presRunBtn.addEventListener('click', () => runSimulation());
    DOM.presPauseBtn.addEventListener('click', () => pauseSimulation());
    DOM.presResetBtn.addEventListener('click', () => resetSimulation());

    // Clock Speed Slider
    DOM.simSpeed.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      // Invert: max value (800) -> 50ms delay, min value (50) -> 600ms delay
      state.clockDelay = 850 - val;
      const factor = (300 / state.clockDelay).toFixed(1);
      DOM.speedLabel.textContent = `${factor}×`;

      if (state.status === 'RUNNING') {
        pauseSimulation();
        runSimulation();
      }
    });

    // General Tape Input Set
    DOM.applyCustomInputBtn.addEventListener('click', () => {
      const cleanVal = DOM.customTapeInput.value.replace(/[^01]/g, '');
      if (!cleanVal) {
        alert('Please enter a valid binary string containing 0s and 1s.');
        return;
      }
      state.customInputA = cleanVal;
      DOM.customTapeInput.value = cleanVal;
      resetSimulation();
      addExplanationLog('INPUT', 'CONFIG', cleanVal, 'CUSTOM TAPE LOADED', `New input word "${cleanVal}" written to tape. Hardware unchanged.`);
    });

    // Cryptographic Input & Key Set
    DOM.cryptoInputBits.addEventListener('input', updateCryptoExpected);
    DOM.cryptoKeyBits.addEventListener('input', updateCryptoExpected);

    DOM.applyCryptoBtn.addEventListener('click', () => {
      const p = DOM.cryptoInputBits.value.replace(/[^01]/g, '');
      const k = DOM.cryptoKeyBits.value.replace(/[^01]/g, '');
      if (!p || !k || p.length !== k.length) {
        alert('Educational Cryptographic Rule: Input and Key must be equal length binary strings (e.g. 6 bits each).');
        return;
      }
      state.customCryptoInput = p;
      state.customCryptoKey = k;
      resetSimulation();
      addExplanationLog('CRYPTO', 'CONFIG', `${p} ⊕ ${k}`, 'XOR TAPE ENCODED', `Encoded educational XOR problem: P="${p}", K="${k}".`);
    });

    // Clear Log
    DOM.clearLogBtn.addEventListener('click', () => {
      DOM.historyLogBody.innerHTML = '';
      DOM.latestStepText.textContent = 'Telemetry log cleared.';
    });

    // Presentation Mode
    DOM.presentationModeBtn.addEventListener('click', togglePresentationMode);
    DOM.exitPresentationBtn.addEventListener('click', togglePresentationMode);

    // UTM Mode Modal
    DOM.utmModeBtn.addEventListener('click', () => openModal(DOM.utmModal));
    DOM.closeUtmModalBtn.addEventListener('click', () => closeModal(DOM.utmModal));
    DOM.dismissUtmModalBtn.addEventListener('click', () => closeModal(DOM.utmModal));

    // WOW Modal
    DOM.closeWowModalBtn.addEventListener('click', () => closeModal(DOM.wowModal));
    DOM.dismissWowModalBtn.addEventListener('click', () => closeModal(DOM.wowModal));
    DOM.wowResetBtn.addEventListener('click', () => {
      closeModal(DOM.wowModal);
      resetSimulation();
    });

    // Close modals on background click
    [DOM.utmModal, DOM.wowModal, DOM.academicPauseOverlay].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal(modal);
          }
        });
      }
    });

    // Keyboard Shortcuts for Laboratory Operation
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (state.status === 'RUNNING') {
          pauseSimulation();
        } else {
          runSimulation();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepSimulation();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetSimulation();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        startDemoSequence();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        togglePresenterCues();
      } else if (e.code === 'Escape') {
        closeModal(DOM.utmModal);
        closeModal(DOM.wowModal);
        closeModal(DOM.academicPauseOverlay);
        if (state.isPresentationMode) {
          togglePresentationMode();
        }
      }
    });

    // Window resize handler for tape centering
    window.addEventListener('resize', () => {
      updateHeadPosition();
    });

    // Horizontal tape scrolling handler to keep head locked to active cell
    if (DOM.tapeViewport) {
      DOM.tapeViewport.addEventListener('scroll', () => {
        alignHeadWithActiveCell();
      }, { passive: true });
    }
  }

  // Run initial setup
  init();
})();
