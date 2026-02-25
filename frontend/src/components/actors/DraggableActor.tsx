"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ActorType } from '@/types/game';
import { useSkinStore } from '@/store/useSkinStore';

interface DraggableActorProps {
    id: string; // e.g. "hand-POLITIC" or "placed-POLITIC"
    actorType: ActorType;
    inHand: boolean;
}

const getActorDetails = (type: ActorType) => {
    switch (type) {
        case ActorType.POLITIC: return { icon: '👔', color: 'bg-blue-600', border: 'border-blue-400' };
        case ActorType.SCIENTIST: return { icon: '🧑‍🔬', color: 'bg-purple-600', border: 'border-purple-400' };
        case ActorType.ARTIST: return { icon: '🧑‍🎨', color: 'bg-pink-600', border: 'border-pink-400' };
        case ActorType.ROBOT: return { icon: '🤖', color: 'bg-orange-600', border: 'border-orange-400' };
    }
}

export function DraggableActor({ id, actorType, inHand }: DraggableActorProps) {
    const skinData = useSkinStore((state) => state.actorSkins[actorType]);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: {
            type: 'actor',
            actorType
        }
    });

    const details = getActorDetails(actorType);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    return (
        <div className="text-center group" ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <div className={`
        ${inHand ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-2xl'} 
        ${details.color} rounded-xl flex items-center justify-center 
        shadow-lg border-2 ${details.border} cursor-grab active:cursor-grabbing 
        group-hover:scale-110 group-active:scale-110 transition-transform overflow-hidden relative
      `}>
                {skinData ? (
                    <img
                        src={skinData.imageUrl}
                        alt={skinData.name}
                        className="w-full h-full object-cover bg-slate-900 absolute inset-0 mix-blend-screen"
                        draggable={false}
                    />
                ) : (
                    details.icon
                )}
            </div>
            {inHand && (
                <span className="text-xs text-slate-400 mt-2 block uppercase font-bold tracking-wider">
                    {actorType}
                </span>
            )}
        </div>
    );
}
