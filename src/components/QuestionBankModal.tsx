import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, CheckCircle, Clock, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { QUESTION_BANK_CATALOG, AVAILABLE_MACHINES } from '../data/machines';
import { TuringMachineDefinition, QuestionBankItem } from '../engine/types';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMachineId: string;
  onSelectMachine: (machine: TuringMachineDefinition) => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  currentMachineId,
  onSelectMachine,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Basic' | 'Intermediate' | 'Advanced'>('All');

  if (!isOpen) return null;

  const filteredItems = QUESTION_BANK_CATALOG.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const handleChoose = (item: QuestionBankItem) => {
    if (item.status === 'Coming Soon') return;
    const found = AVAILABLE_MACHINES.find((m) => m.id === item.id);
    if (found) {
      onSelectMachine(found);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 max-h-[90vh] flex flex-col transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-800">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Turing Machine Question Bank
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Standard Automata & Formal Languages Curricula Problems
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['All', 'Basic', 'Intermediate', 'Advanced'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {filteredItems.length} problems catalogued
            </span>
          </div>

          {/* Grid of Problems */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => {
              const isSelected = item.id === currentMachineId;
              const isReady = item.status === 'Ready';

              let catColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
              if (item.category === 'Intermediate') {
                catColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
              } else if (item.category === 'Advanced') {
                catColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => isReady && handleChoose(item)}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isReady
                      ? 'cursor-pointer hover:border-blue-500 dark:hover:border-cyan-500 hover:shadow-md'
                      : 'opacity-70 cursor-not-allowed bg-slate-50 dark:bg-slate-950/40'
                  } ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-cyan-950/30 border-blue-500 dark:border-cyan-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${catColor}`}>
                        {item.category}
                      </span>
                      {isReady ? (
                        <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Coming Soon
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {item.title}
                    </h4>
                    <span className="text-xs text-blue-600 dark:text-cyan-400 font-mono block mt-0.5">
                      {item.language}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                    {item.defaultInput ? (
                      <span className="text-[11px] font-mono text-slate-500">
                        Sample: <strong className="text-slate-700 dark:text-slate-300">"{item.defaultInput}"</strong>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Advanced problem</span>
                    )}

                    {isReady && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChoose(item);
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        <span>{isSelected ? 'Loaded' : 'Load Machine'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Select any verified problem to load its 7-tuple, tape, transition table, and state diagram.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
