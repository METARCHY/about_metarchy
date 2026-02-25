import React from 'react';
import { ArgumentType } from '@/types/game';

interface ArgumentSelectorProps {
    availableArgs: ArgumentType[];
    onSelect: (argument: ArgumentType) => void;
}

export function ArgumentSelector({ availableArgs, onSelect }: ArgumentSelectorProps) {
    if (availableArgs.length === 0) return null;

    return (
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 rounded-xl p-2 shadow-2xl flex flex-col items-center z-50 backdrop-blur-md w-max pointer-events-auto transition-all animate-in fade-in zoom-in duration-200">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Select Argument</span>

            <div className="flex space-x-1">
                {availableArgs.includes(ArgumentType.ROCK) && (
                    <button onClick={() => onSelect(ArgumentType.ROCK)} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-stone-600 rounded-lg transition-colors border border-slate-700 hover:border-stone-400 shadow-sm" title="Rock">🪨</button>
                )}
                {availableArgs.includes(ArgumentType.PAPER) && (
                    <button onClick={() => onSelect(ArgumentType.PAPER)} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors border border-slate-700 hover:border-white shadow-sm" title="Paper">📄</button>
                )}
                {availableArgs.includes(ArgumentType.SCISSORS) && (
                    <button onClick={() => onSelect(ArgumentType.SCISSORS)} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-red-800 rounded-lg transition-colors border border-slate-700 hover:border-red-400 shadow-sm" title="Scissors">✂️</button>
                )}
                {availableArgs.includes(ArgumentType.DUMMY) && (
                    <button onClick={() => onSelect(ArgumentType.DUMMY)} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-fuchsia-800 rounded-lg transition-colors border border-slate-700 hover:border-fuchsia-400 shadow-sm" title="Dummy">🎭</button>
                )}
            </div>

            {/* Pointer Triangle */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-700"></div>
        </div>
    );
}
