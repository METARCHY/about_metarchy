"use client";

import React, { useState } from 'react';
import { LocationType, ActorType, ActorPlacement } from '@/types/game';
import { useSocket } from '@/contexts/SocketContext';
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { DraggableActor } from '@/components/actors/DraggableActor';
import { LocationSlot } from '@/components/board/LocationSlot';

const locations = [
  { id: LocationType.UNIVERSITY, name: 'University', type: 'Human', color: 'bg-blue-900/80 border-blue-400' },
  { id: LocationType.THEATER, name: 'Theater', type: 'Human', color: 'bg-purple-900/80 border-purple-400' },
  { id: LocationType.SQUARE, name: 'Square', type: 'Human', color: 'bg-yellow-900/80 border-yellow-400' },
  { id: LocationType.FACTORY, name: 'Factory', type: 'Robot', color: 'bg-red-900/80 border-red-400' },
  { id: LocationType.ENERGY_PLANT, name: 'Energy Plant', type: 'Robot', color: 'bg-emerald-900/80 border-emerald-400' },
  { id: LocationType.DUMP, name: 'Dump', type: 'Robot', color: 'bg-orange-900/80 border-orange-400' }
];

export default function MetarchyGame() {
  const { isConnected, matchState, joinQueue, commitDistribution, error } = useSocket();

  if (!matchState) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        <div className="absolute w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="z-10 text-center space-y-8 p-8 max-w-xl w-full">
          <div>
            <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-br from-blue-400 via-purple-400 to-red-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              METARCHY
            </h1>
            <p className="text-slate-400 mt-4 text-lg font-light tracking-wide">
              The Protocol of Power
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 pt-8">
            <button
              onClick={joinQueue}
              disabled={!isConnected}
              className={`
                w-full py-4 rounded-xl font-bold text-lg tracking-widest uppercase
                transition-all duration-300 relative overflow-hidden group
                ${isConnected
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-1'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
              `}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative">
                {!isConnected ? 'Connecting to Server...' : 'Enter Matchmaking'}
              </span>
            </button>

            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Server Online' : 'Server Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Local Placement State for Distribution Phase
  const [placements, setPlacements] = useState<Record<string, ActorType | null>>({
    [LocationType.UNIVERSITY]: null,
    [LocationType.THEATER]: null,
    [LocationType.SQUARE]: null,
    [LocationType.FACTORY]: null,
    [LocationType.ENERGY_PLANT]: null,
    [LocationType.DUMP]: null
  });

  const [hand, setHand] = useState<ActorType[]>([
    ActorType.POLITIC,
    ActorType.SCIENTIST,
    ActorType.ARTIST,
    ActorType.ROBOT
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return; // Dropped outside a location

    const actorType = active.data.current?.actorType as ActorType;
    const locationId = over.data.current?.locationId as LocationType;

    if (actorType && locationId) {
      setPlacements(prev => {
        // Find if this location already has an actor, if so, put it back in hand
        const existingActor = prev[locationId];

        // Find if this actor was already placed somewhere else
        const newPlacements = { ...prev };
        Object.keys(newPlacements).forEach(loc => {
          if (newPlacements[loc] === actorType) {
            newPlacements[loc] = null;
          }
        });

        // Set the new location
        newPlacements[locationId] = actorType;

        // Update Hand
        setHand(currentHand => {
          let updatedHand = currentHand.filter(a => a !== actorType);
          if (existingActor) updatedHand.push(existingActor);
          return updatedHand;
        });

        return newPlacements;
      });
    }
  };

  const handleLockPlacements = () => {
    // Convert local placements Record into the expected ActorPlacement[] array format
    // Defaulting argumentQueue for Phase V1 prototype (since UI doesn't allow setting it yet)
    const payload: ActorPlacement[] = Object.entries(placements)
      .filter(([_, actor]) => actor !== null)
      .map(([loc, actor]) => ({
        actor: actor as ActorType,
        location: loc as LocationType,
        argumentQueue: ['ROCK', 'PAPER', 'SCISSORS'] as any
      }));

    commitDistribution(payload);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden font-sans">

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-start z-10 w-full">
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 text-transparent bg-clip-text">
              METARCHY
            </h1>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono border border-slate-700">Turn {matchState.currentTurn}</span>
              <span className="text-slate-400 font-mono uppercase tracking-widest text-xs">{matchState.currentPhase}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-mono mb-1">Match ID</div>
            <div className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">{matchState.matchId.split('-')[0]}</div>
          </div>
        </div>

        {/* Isometric Board Container */}
        <div className="w-full max-w-6xl h-[700px] flex items-center justify-center [perspective:1200px]">
          {/* The Grid */}
          <div className="grid grid-cols-3 gap-6 [transform:rotateX(60deg)_rotateZ(-45deg)] transition-transform duration-1000 ease-out hover:[transform:rotateX(55deg)_rotateZ(-40deg)]">
            {locations.map((loc) => (
              <LocationSlot
                key={loc.id}
                locationId={loc.id}
                name={loc.name}
                type={loc.type}
                color={loc.color}
              >
                {placements[loc.id] && (
                  <DraggableActor
                    id={`placed-${placements[loc.id]}`}
                    actorType={placements[loc.id]!}
                    inHand={false}
                  />
                )}
              </LocationSlot>
            ))}
          </div>
        </div>

        {/* Bottom Actor Dock */}
        <div className="absolute bottom-8 w-full max-w-4xl h-36 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center shadow-2xl z-10 px-8">
          <div className="flex w-full justify-between items-center px-4 pt-2">
            <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">Your Hand</span>
            <button
              disabled={hand.length > 0}
              onClick={handleLockPlacements}
              className={`
              px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all
              ${hand.length === 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
            `}
            >
              Lock Placements
            </button>
          </div>

          <div className="flex-1 w-full flex items-center justify-center space-x-8">
            {hand.includes(ActorType.POLITIC) && <DraggableActor id={`hand-${ActorType.POLITIC}`} actorType={ActorType.POLITIC} inHand={true} />}
            {hand.includes(ActorType.SCIENTIST) && <DraggableActor id={`hand-${ActorType.SCIENTIST}`} actorType={ActorType.SCIENTIST} inHand={true} />}
            {hand.includes(ActorType.ARTIST) && <DraggableActor id={`hand-${ActorType.ARTIST}`} actorType={ActorType.ARTIST} inHand={true} />}
            {hand.includes(ActorType.ROBOT) && <DraggableActor id={`hand-${ActorType.ROBOT}`} actorType={ActorType.ROBOT} inHand={true} />}

            {hand.length === 0 && (
              <span className="text-slate-500 italic">All actors deployed.</span>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
