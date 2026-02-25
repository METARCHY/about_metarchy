"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ArgumentType } from '@/types/game';

interface DraggableArgumentProps {
    id: string; // e.g. "arg-hand-ROCK" or "arg-placed-ROCK"
    argumentType: ArgumentType;
    inHand: boolean;
    disabled?: boolean;
}

const getArgumentDetails = (type: ArgumentType) => {
    switch (type) {
        case ArgumentType.ROCK:
            return { icon: '🪨', color: 'bg-stone-600', border: 'border-stone-400', label: 'Rock' };
        case ArgumentType.PAPER:
            return { icon: '📄', color: 'bg-slate-200 text-slate-900', border: 'border-white', label: 'Paper' };
        case ArgumentType.SCISSORS:
            return { icon: '✂️', color: 'bg-red-800', border: 'border-red-400', label: 'Scissors' };
        case ArgumentType.DUMMY:
            return { icon: '🎭', color: 'bg-fuchsia-800', border: 'border-fuchsia-400', label: 'Dummy' };
    }
}

export function DraggableArgument({ id, argumentType, inHand, disabled = false }: DraggableArgumentProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: {
            type: 'argument',
            argumentType
        },
        disabled: disabled
    });

    const details = getArgumentDetails(argumentType);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    return (
        <div className="text-center group flex flex-col items-center" ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <div className={`
                relative
                ${inHand ? 'w-12 h-12 text-2xl' : 'w-8 h-8 text-sm'} 
                ${details.color} rounded-lg flex items-center justify-center 
                shadow-[0_4px_0_rgba(0,0,0,0.5),inset_0_-2px_0_rgba(0,0,0,0.2)] border-2 ${details.border}
                ${!disabled ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'}
                transition-transform
            `}>
                {details.icon}
            </div>
            {inHand && (
                <div className="mt-1 text-center">
                    <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider leading-tight">
                        {details.label}
                    </span>
                </div>
            )}
        </div>
    );
}
