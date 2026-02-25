"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ResourceType } from '@/types/game';

interface DraggableChipProps {
    id: string; // e.g. "hand-PRODUCTION"
    resourceType: ResourceType;
    inHand: boolean;
    count?: number; // How many of this chip they have
}

const getChipDetails = (type: ResourceType) => {
    switch (type) {
        case ResourceType.PRODUCTION:
            return { icon: '⚙️', color: 'bg-emerald-600', border: 'border-emerald-400', label: 'Win', shape: 'rounded-full' };
        case ResourceType.ELECTRICITY:
            return { icon: '🔋', color: 'bg-cyan-600', border: 'border-cyan-400', label: 'Lose', shape: 'rounded-full' };
        case ResourceType.RECYCLING:
            return { icon: '♻️', color: 'bg-amber-600', border: 'border-amber-400', label: 'Draw', shape: 'rounded-full' };
    }
}

export function DraggableChip({ id, resourceType, inHand, count = 1 }: DraggableChipProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: {
            type: 'chip',
            resourceType
        },
        disabled: count <= 0 // Prevent dragging if they have none left
    });

    const details = getChipDetails(resourceType);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    return (
        <div className="text-center group flex flex-col items-center" ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <div className={`
                relative
                ${inHand ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-xl'} 
                ${details.color} ${details.shape} flex items-center justify-center 
                shadow-[0_4px_0_rgba(0,0,0,0.5),inset_0_-2px_0_rgba(0,0,0,0.2)] border-2 ${details.border}
                ${count > 0 ? 'cursor-grab active:cursor-grabbing group-hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'}
                transition-transform
            `}>
                {details.icon}

                {/* Badge showing remaining count */}
                {inHand && (
                    <div className="absolute -top-2 -right-2 bg-slate-900 border border-slate-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                        {count}
                    </div>
                )}
            </div>
            {inHand && (
                <div className="mt-2 text-center">
                    <span className="text-xs text-slate-300 block uppercase font-bold tracking-wider leading-tight">
                        {resourceType}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                        Bet: {details.label}
                    </span>
                </div>
            )}
        </div>
    );
}
