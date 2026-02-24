"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { LocationType } from '@/types/game';

interface LocationSlotProps {
    locationId: LocationType;
    name: string;
    type: string;
    color: string;
    children: React.ReactNode;
}

export function LocationSlot({ locationId, name, type, color, children }: LocationSlotProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `location-${locationId}`,
        data: {
            locationId
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={`
        relative w-48 h-48 border-2 ${color} 
        backdrop-blur-sm
        shadow-[-15px_15px_0px_rgba(0,0,0,0.6)] 
        transition-all duration-300
        flex flex-col items-center justify-center
        group
        [transform-style:preserve-3d]
        ${isOver ? 'ring-4 ring-white shadow-[-20px_20px_20px_rgba(255,255,255,0.2)] -translate-y-6 translate-x-6' : 'hover:-translate-y-4 hover:translate-x-4 hover:shadow-[-25px_25px_15px_rgba(0,0,0,0.8)] cursor-pointer'}
      `}
        >
            {/* Pseudo 3D Depth Sides */}
            <div className={`absolute top-0 right-[-17px] w-[15px] h-full ${color.replace('/80', '')} brightness-75 origin-left [transform:rotateY(90deg)_skewY(45deg)] ${isOver ? 'opacity-50' : ''}`} />
            <div className={`absolute bottom-[-17px] right-0 w-full h-[15px] ${color.replace('/80', '')} brightness-50 origin-top [transform:rotateX(-90deg)_skewX(45deg)] ${isOver ? 'opacity-50' : ''}`} />

            {/* Content rotated to face camera */}
            <div className={`flex flex-col items-center justify-center transition-all duration-300
        [transform:translateZ(40px)_rotateZ(45deg)_rotateX(-60deg)] 
        ${isOver ? '[transform:translateZ(70px)_rotateZ(40deg)_rotateX(-55deg)] scale-110' : 'group-hover:[transform:translateZ(60px)_rotateZ(40deg)_rotateX(-55deg)]'}
      `}>
                <span className="font-bold text-xl tracking-wide drop-shadow-md">{name}</span>
                <span className="text-xs uppercase tracking-wider text-slate-300 mt-1 opacity-70">[{type}]</span>

                {/* The Drop Target / Resident Actor Container */}
                <div className={`
          mt-4 w-12 h-12 flex items-center justify-center transition-all duration-300
          ${children ? '' : 'rounded-full border border-dashed border-white/30 bg-black/20 group-hover:bg-white/10'}
          ${isOver && !children ? 'border-white bg-white/30 scale-125' : ''}
        `}>
                    {children ? children : <span className="text-xs opacity-50">Drop</span>}
                </div>
            </div>
        </div>
    );
}
