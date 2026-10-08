import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TapeCell } from '../engine/types';

interface TapeProps {
  tape: TapeCell[];
  headIndex: number;
  currentState: string;
  writtenCellIndex: number | null;
  prevSymbol: string | null;
  nextSymbol: string | null;
}

export const Tape: React.FC<TapeProps> = ({
  tape,
  headIndex,
  currentState,
  writtenCellIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headCellRef = useRef<HTMLDivElement>(null);

  // Auto-scroll tape horizontally so the active head stays centered
  useEffect(() => {
    if (headCellRef.current && containerRef.current) {
      const container = containerRef.current;
      const target = headCellRef.current;
      const containerWidth = container.offsetWidth;
      const targetLeft = target.offsetLeft;
      const targetWidth = target.offsetWidth;

      const scrollTarget = targetLeft - containerWidth / 2 + targetWidth / 2;

      container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth',
      });
    }
  }, [headIndex]);

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Tape Scroll Container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto py-11 px-12 relative flex items-center justify-start sm:justify-center scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex items-center gap-2.5 relative">
          {tape.map((cell, idx) => {
            const isHead = idx === headIndex;
            const isJustWritten = writtenCellIndex === idx;

            // Theme-aware symbol colors and cell backgrounds
            let symbolColor = 'text-slate-800 dark:text-slate-200';
            let cellBg = 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800';
            let borderGlow = '';

            if (cell.symbol === 'X') {
              symbolColor = 'text-blue-600 dark:text-cyan-400 font-extrabold';
              cellBg = 'bg-blue-50 dark:bg-cyan-950/40 border-blue-400 dark:border-cyan-700/80';
              borderGlow = 'shadow-sm';
            } else if (cell.symbol === 'Y') {
              symbolColor = 'text-purple-600 dark:text-purple-400 font-extrabold';
              cellBg = 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700/80';
              borderGlow = 'shadow-sm';
            } else if (cell.symbol === 'Z') {
              symbolColor = 'text-emerald-600 dark:text-emerald-400 font-extrabold';
              cellBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700/80';
              borderGlow = 'shadow-sm';
            } else if (cell.symbol === 'W') {
              symbolColor = 'text-amber-600 dark:text-amber-400 font-extrabold';
              cellBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700/80';
              borderGlow = 'shadow-sm';
            } else if (cell.symbol === 'a') {
              symbolColor = 'text-indigo-700 dark:text-blue-300 font-bold';
              cellBg = 'bg-indigo-50/50 dark:bg-blue-950/30 border-indigo-200 dark:border-blue-800/60';
            } else if (cell.symbol === 'b') {
              symbolColor = 'text-amber-700 dark:text-amber-300 font-bold';
              cellBg = 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60';
            } else if (cell.symbol === '1') {
              symbolColor = 'text-emerald-700 dark:text-emerald-300 font-bold';
              cellBg = 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60';
            } else if (cell.symbol === '0') {
              symbolColor = 'text-teal-700 dark:text-teal-300 font-bold';
              cellBg = 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/60';
            } else if (cell.symbol === '#') {
              symbolColor = 'text-rose-600 dark:text-rose-400 font-extrabold';
              cellBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700/80';
              borderGlow = 'shadow-sm';
            } else if (cell.symbol === 'c') {
              symbolColor = 'text-pink-700 dark:text-pink-300 font-bold';
              cellBg = 'bg-pink-50/50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800/60';
            } else if (cell.symbol === 'B') {
              symbolColor = 'text-slate-400 dark:text-slate-600 font-medium';
              cellBg = 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-850';
            }

            return (
              <div
                key={cell.id}
                ref={isHead ? headCellRef : null}
                className="flex flex-col items-center flex-shrink-0 relative select-none"
              >
                {/* PHYSICAL PROMINENT HEAD POINTER */}
                {isHead && (
                  <motion.div
                    layoutId="physicalTapeHeadPointer"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute -top-12 flex flex-col items-center z-30 pointer-events-none"
                  >
                    {/* State badge above the pointer */}
                    <div className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-600 dark:bg-cyan-500 text-white dark:text-black shadow-md flex items-center gap-1.5 whitespace-nowrap">
                      <span>HEAD</span>
                      <span className="bg-black/20 dark:bg-black/20 px-1 rounded font-extrabold">{currentState}</span>
                    </div>

                    {/* Stem & Downward Arrow */}
                    <div className="w-0.5 h-3 bg-blue-600 dark:bg-cyan-400 mt-0.5" />
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-blue-600 dark:border-t-cyan-400" />
                  </motion.div>
                )}

                {/* THE TAPE CELL BOX */}
                <motion.div
                  animate={{
                    scale: isJustWritten ? [1, 1.2, 1] : isHead ? 1.05 : 1,
                    borderColor: isHead
                      ? undefined
                      : isJustWritten
                      ? '#7c3aed'
                      : undefined,
                  }}
                  transition={{ duration: 0.28 }}
                  className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all ${cellBg} ${borderGlow} ${
                    isHead
                      ? 'border-blue-600 dark:border-cyan-400 shadow-md ring-4 ring-blue-500/20 dark:ring-cyan-500/20 z-20'
                      : 'hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Subtle inner cell index corner badge */}
                  <span className="absolute top-1 left-2 text-[9px] font-mono text-slate-400 dark:text-slate-500 pointer-events-none">
                    {cell.index}
                  </span>

                  {/* Symbol with Animated Transformation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={cell.symbol + cell.id}
                      initial={{ y: -8, opacity: 0, scale: 0.7 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 8, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.2 }}
                      className={`text-2xl sm:text-3xl font-mono ${symbolColor}`}
                    >
                      {cell.symbol}
                    </motion.div>
                  </AnimatePresence>

                  {/* Active highlight glow spot */}
                  {isHead && (
                    <motion.div
                      layoutId="activeCellHighlight"
                      className="absolute inset-0 rounded-2xl bg-blue-500/10 dark:bg-cyan-400/10 pointer-events-none"
                    />
                  )}
                </motion.div>

                {/* Bottom Read Symbol Prompt */}
                {isHead && (
                  <motion.div
                    layoutId="bottomReadIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute -bottom-8 flex flex-col items-center z-20 pointer-events-none"
                  >
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-blue-600 dark:border-b-cyan-400" />
                    <span className="text-[10px] font-mono font-semibold text-blue-700 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300 dark:border-cyan-500/50 shadow-sm whitespace-nowrap">
                      reads '{cell.symbol}'
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fading left & right edges for infinite illusion */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 dark:from-[#070b12] to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 dark:from-[#070b12] to-transparent pointer-events-none z-20" />
    </div>
  );
};
