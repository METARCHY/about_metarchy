"use client";

import React from 'react';
import { LocationType } from '@/types/game';

const locations = [
  { id: LocationType.UNIVERSITY, name: 'University', type: 'Human', color: 'bg-blue-900/80 border-blue-400' },
  { id: LocationType.THEATER, name: 'Theater', type: 'Human', color: 'bg-purple-900/80 border-purple-400' },
  { id: LocationType.SQUARE, name: 'Square', type: 'Human', color: 'bg-yellow-900/80 border-yellow-400' },
  { id: LocationType.FACTORY, name: 'Factory', type: 'Robot', color: 'bg-red-900/80 border-red-400' },
  { id: LocationType.ENERGY_PLANT, name: 'Energy Plant', type: 'Robot', color: 'bg-emerald-900/80 border-emerald-400' },
  { id: LocationType.DUMP, name: 'Dump', type: 'Robot', color: 'bg-orange-900/80 border-orange-400' }
];

export default function MetarchyBoard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden font-sans">

      {/* Header */}
      <div className="absolute top-8 text-center z-10">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 text-transparent bg-clip-text">
          METARCHY
        </h1>
        <p className="text-slate-400 mt-2 font-mono uppercase tracking-widest text-sm">Phase 1 • Distribution</p>
      </div>

      {/* Isometric Board Container */}
      <div className="w-full max-w-6xl h-[700px] flex items-center justify-center [perspective:1200px]">
        {/* The Grid */}
        <div className="grid grid-cols-3 gap-6 [transform:rotateX(60deg)_rotateZ(-45deg)] transition-transform duration-1000 ease-out hover:[transform:rotateX(55deg)_rotateZ(-40deg)]">
          {locations.map((loc, idx) => (
            <div
              key={loc.id}
              className={`
                relative w-48 h-48 border-2 ${loc.color} 
                backdrop-blur-sm
                shadow-[-15px_15px_0px_rgba(0,0,0,0.6)] 
                hover:shadow-[-25px_25px_15px_rgba(0,0,0,0.8)]
                hover:-translate-y-4 hover:translate-x-4
                transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center
                group
                [transform-style:preserve-3d]
              `}
            >
              {/* Pseudo 3D Depth Sides */}
              <div className={`absolute top-0 right-[-17px] w-[15px] h-full ${loc.color.replace('/80', '')} brightness-75 origin-left [transform:rotateY(90deg)_skewY(45deg)]`} />
              <div className={`absolute bottom-[-17px] right-0 w-full h-[15px] ${loc.color.replace('/80', '')} brightness-50 origin-top [transform:rotateX(-90deg)_skewX(45deg)]`} />

              {/* Text / Content that pops up so it faces the camera */}
              <div className="flex flex-col items-center justify-center [transform:translateZ(40px)_rotateZ(45deg)_rotateX(-60deg)] group-hover:[transform:translateZ(60px)_rotateZ(40deg)_rotateX(-55deg)] transition-all duration-300">
                <span className="font-bold text-xl tracking-wide drop-shadow-md">{loc.name}</span>
                <span className="text-xs uppercase tracking-wider text-slate-300 mt-1 opacity-70">[{loc.type}]</span>

                {/* Example Actor Slot Placeholder */}
                <div className="mt-4 w-12 h-12 rounded-full border border-dashed border-white/30 flex items-center justify-center bg-black/20 group-hover:bg-white/10 transition-colors">
                  <span className="text-xs">Drop</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actor Dock placeholder */}
      <div className="absolute bottom-8 w-full max-w-3xl h-32 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl flex items-center justify-evenly p-4 shadow-2xl z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-blue-400 cursor-grab hover:scale-110 transition-transform">👔</div>
          <span className="text-xs text-slate-400 mt-2 block uppercase font-bold tracking-wider">Politic</span>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-purple-400 cursor-grab hover:scale-110 transition-transform">🧑‍🔬</div>
          <span className="text-xs text-slate-400 mt-2 block uppercase font-bold tracking-wider">Scientist</span>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-600 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-pink-400 cursor-grab hover:scale-110 transition-transform">🧑‍🎨</div>
          <span className="text-xs text-slate-400 mt-2 block uppercase font-bold tracking-wider">Artist</span>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-orange-400 cursor-grab hover:scale-110 transition-transform">🤖</div>
          <span className="text-xs text-slate-400 mt-2 block uppercase font-bold tracking-wider">Robot</span>
        </div>
      </div>
    </div>
  );
}
