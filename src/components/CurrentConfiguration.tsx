import React from 'react';
import { Terminal, Info } from 'lucide-react';
import { TapeCell } from '../engine/types';
import { computeInstantaneousDescription } from '../engine/turingMachine';

interface CurrentConfigurationProps {
  tape: TapeCell[];
  headIndex: number;
  currentState: string;
}

export const CurrentConfiguration: React.FC<CurrentConfigurationProps> = ({
  tape,
  headIndex,
  currentState,
}) => {
  const currentSymbol = tape[headIndex]?.symbol ?? 'B';
  const mathematicalHeadIndex = tape[headIndex]?.index ?? headIndex;
  const instantaneousDescription = computeInstantaneousDescription(tape, headIndex, currentState);

  // Non-blank tape snippet around head
  const tapeSnippet = tape
    .slice(Math.max(0, headIndex - 4), Math.min(tape.length, headIndex + 5))
    .map((c) => c.symbol)
    .join(' ');

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl bg-slate-900/60 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Current Configuration & Instantaneous Description (ID)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
          Formal ID: u q v
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Instantaneous Description */}
        <div className="md:col-span-2 bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">
            Mathematical ID Notation
          </div>
          <div className="font-mono text-base sm:text-lg text-cyan-300 font-bold tracking-wider overflow-x-auto whitespace-nowrap">
            {instantaneousDescription}
          </div>
        </div>

        {/* State & Coordinate info */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-center text-xs font-mono">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            Tape Snapshot
          </div>
          <div className="text-slate-300 truncate">
            {tapeSnippet}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            Scanning: <span className="font-bold underline">'{currentSymbol}'</span> at pos {mathematicalHeadIndex}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
        <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <span>
          The machine is currently in state <strong className="text-cyan-300 font-mono">{currentState}</strong>, with the tape head positioned at the highlighted symbol <strong className="text-amber-300 font-mono">'{currentSymbol}'</strong> at coordinate {mathematicalHeadIndex}.
        </span>
      </div>
    </div>
  );
};
