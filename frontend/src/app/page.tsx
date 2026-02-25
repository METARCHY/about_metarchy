"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { usePrivy } from '@privy-io/react-auth';
import { LocationType, ActorType, ActorPlacement, ArgumentType, GamePhase, ResourceType } from '@/types/game';
import { useSocket } from '@/contexts/SocketContext';
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { DraggableActor } from '@/components/actors/DraggableActor';
import { LocationSlot } from '@/components/board/LocationSlot';
import { DraggableChip } from '@/components/tokens/DraggableChip';
import { DraggableArgument } from '@/components/tokens/DraggableArgument';
import { ArgumentSelector } from '@/components/board/ArgumentSelector';
import { useFetchSkins } from '@/hooks/useFetchSkins';

const VALID_LOCATIONS: Record<ActorType, LocationType[]> = {
  [ActorType.POLITIC]: [LocationType.UNIVERSITY, LocationType.SQUARE],
  [ActorType.ARTIST]: [LocationType.THEATER, LocationType.SQUARE],
  [ActorType.SCIENTIST]: [LocationType.UNIVERSITY, LocationType.THEATER],
  [ActorType.ROBOT]: [LocationType.FACTORY, LocationType.ENERGY_PLANT, LocationType.DUMP]
};

const locations = [
  { id: LocationType.UNIVERSITY, name: 'University', type: 'Human', color: 'bg-blue-900/80 border-blue-400' },
  { id: LocationType.THEATER, name: 'Theater', type: 'Human', color: 'bg-purple-900/80 border-purple-400' },
  { id: LocationType.SQUARE, name: 'Square', type: 'Human', color: 'bg-yellow-900/80 border-yellow-400' },
  { id: LocationType.FACTORY, name: 'Factory', type: 'Robot', color: 'bg-red-900/80 border-red-400' },
  { id: LocationType.ENERGY_PLANT, name: 'Energy Plant', type: 'Robot', color: 'bg-emerald-900/80 border-emerald-400' },
  { id: LocationType.DUMP, name: 'Dump', type: 'Robot', color: 'bg-orange-900/80 border-orange-400' }
];

export default function MetarchyGame() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { socketId, isConnected, matchState, joinQueue, commitDistribution, commitBets, devForceAdvance, error } = useSocket();

  // Initiate NFT fetch for the given wallet
  useFetchSkins();

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
            {/* Logic: Wait for Privy to be ready, then require login, THEN allow entering queue */}
            {!ready ? (
              <button
                disabled
                className="w-full py-4 rounded-xl font-bold text-lg tracking-widest uppercase bg-slate-800 text-slate-500 cursor-not-allowed"
              >
                Initializing Secure Enclave...
              </button>
            ) : !authenticated ? (
              <button
                onClick={login}
                className="w-full py-4 rounded-xl font-bold text-lg tracking-widest uppercase bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-white"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">Connect Credentials (Login)</span>
              </button>
            ) : (
              // Authenticated but maybe not connected to websocket yet
              <div className="space-y-2">
                <button
                  onClick={joinQueue}
                  disabled={!isConnected}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg tracking-widest uppercase
                    transition-all duration-300 relative overflow-hidden group
                    ${isConnected
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-1 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative">
                    {!isConnected ? 'Locating Server...' : 'Enter Matchmaking'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2">
                  <span>Welcome, {user?.email?.address || user?.wallet?.address?.substring(0, 6) + "..." || "Agent"}</span>
                  <button onClick={logout} className="hover:text-slate-300 underline">Logout</button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 pt-4">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Server Online' : 'Server Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Local Placement State for Distribution Phase
  const [placements, setPlacements] = useState<Record<ActorType, { location: LocationType; argument: ArgumentType | null } | null>>({
    [ActorType.POLITIC]: null,
    [ActorType.SCIENTIST]: null,
    [ActorType.ARTIST]: null,
    [ActorType.ROBOT]: null
  });

  const allArgs = [ArgumentType.ROCK, ArgumentType.PAPER, ArgumentType.SCISSORS, ArgumentType.DUMMY];
  const placedArgs = Object.values(placements).map(p => p?.argument).filter(a => a !== null) as ArgumentType[];
  const argHand = allArgs.filter(a => !placedArgs.includes(a));

  const [hand, setHand] = useState<ActorType[]>([
    ActorType.POLITIC,
    ActorType.SCIENTIST,
    ActorType.ARTIST,
    ActorType.ROBOT
  ]);

  const [myTurnSalt, setMyTurnSalt] = useState<string | null>(null);

  // Local placement state for Bets Phase
  const [placedBets, setPlacedBets] = useState<Record<string, ResourceType>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const isDistribution = matchState.currentPhase === GamePhase.DISTRIBUTION;
  const isBets = matchState.currentPhase === GamePhase.BETS;
  const isResolution = matchState.currentPhase === GamePhase.RESOLUTION;

  const myState = socketId ? matchState.players[socketId] : undefined;
  const oppId = matchState.playerIds.find(id => id !== socketId);
  const oppState = oppId ? matchState.players[oppId] : undefined;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return; // Dropped outside a location

    const itemType = active.data.current?.type;
    const locationId = over.data.current?.locationId as LocationType;

    if (itemType === 'actor' && isDistribution) {
      const actorType = active.data.current?.actorType as ActorType;

      if (actorType && locationId) {
        // Enforce Valid Locations
        if (!VALID_LOCATIONS[actorType].includes(locationId)) {
          return; // Invalid Drop, snap back!
        }

        setPlacements(prev => {
          const prevEntry = prev[actorType];
          return {
            ...prev,
            [actorType]: { location: locationId, argument: prevEntry?.argument || null }
          };
        });

        // Always remove this actor from hand if it was there
        setHand(currentHand => currentHand.filter(a => a !== actorType));
      }
    }

    if (itemType === 'chip' && isBets) {
      const resourceType = active.data.current?.resourceType as ResourceType;
      // You can only bet on your OWN actors. Validate this.
      const myActorAtLocation = myState?.actorsPlacements.find(p => p.location === locationId);

      if (myActorAtLocation) {
        setPlacedBets(prev => ({
          ...prev,
          [myActorAtLocation.actor]: resourceType
        }));
      }
    }
  };

  const handleClearArgument = (actorType: ActorType) => {
    setPlacements(prev => {
      const entry = prev[actorType];
      if (!entry) return prev;
      return { ...prev, [actorType]: { ...entry, argument: null } };
    });
  };

  const handleSelectArgument = (actorType: ActorType, argument: ArgumentType) => {
    setPlacements(prev => {
      const entry = prev[actorType];
      if (!entry) return prev;
      return {
        ...prev,
        [actorType]: { ...entry, argument }
      };
    });
  };



  const checkCanLock = () => {
    // 1. All 4 actors must be placed
    if (hand.length > 0) return false;

    // 2. All 4 placed actors must have exactly 1 argument each
    for (const actor of Object.values(placements)) {
      if (!actor || actor.argument === null) return false;
    }

    return true;
  };

  const handleLockPlacements = () => {
    if (!checkCanLock()) return;

    // 1. Generate client-side secret salt for this turn
    const salt = ethers.hexlify(ethers.randomBytes(32));
    setMyTurnSalt(salt);

    // Convert local placements Record into the expected ActorPlacement format
    const payload: ActorPlacement[] = Object.entries(placements)
      .filter(([_, entry]) => entry !== null)
      .map(([actorStr, entry]) => {
        const argument = entry!.argument!;
        // 2. Hash the argument and salt together
        const argumentHash = ethers.keccak256(ethers.toUtf8Bytes(`${argument}-${salt}`));

        return {
          actor: actorStr as ActorType,
          location: entry!.location,
          argumentHash,
          argument // Temporarily still sending the raw argument until Phase 5 Reveal is built
        };
      });

    commitDistribution({ placements: payload, turnSalt: salt });
  };

  const handleLockBets = () => {
    const payload = Object.entries(placedBets).map(([actorStr, betType]) => ({
      actor: actorStr as ActorType,
      bet: betType
    }));
    commitBets(payload);
  };

  const canLock = checkCanLock();

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

              {/* Waiting Status Message */}
              {myState?.hasCommittedDistribution && isDistribution && (
                <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-xs font-mono font-bold animate-pulse border border-yellow-700">Waiting for Opponent</span>
              )}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="text-xs text-slate-500 font-mono mb-1">Match ID</div>
            <div className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">{matchState.matchId.split('-')[0]}</div>
            {/* Dev Tool */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={devForceAdvance}
                className="mt-2 text-[10px] uppercase font-bold text-fuchsia-400 bg-fuchsia-950/50 hover:bg-fuchsia-900 border border-fuchsia-800 px-2 py-1 rounded"
              >
                Dev: Force Advance
              </button>
            )}
          </div>
        </div>

        {/* Isometric Board Container */}
        <div className="w-full max-w-6xl h-[700px] flex items-center justify-center [perspective:1200px]">
          {/* The Grid */}
          <div className="grid grid-cols-3 gap-8 w-full max-w-4xl p-8 [transform:rotateX(25deg)]">
            {locations.map((loc) => {
              // Who is here?
              let myActorsHere: Array<{ actor: ActorType, argument: ArgumentType | null }> = [];
              let oppActorsHere: ActorType[] = [];

              if (isDistribution) {
                // Find all my actors at this location
                Object.entries(placements).forEach(([actorStr, entry]) => {
                  if (entry?.location === loc.id) {
                    myActorsHere.push({ actor: actorStr as ActorType, argument: entry.argument });
                  }
                });
              } else {
                myActorsHere = (myState?.actorsPlacements || [])
                  .filter(p => p.location === loc.id)
                  .map(p => ({ actor: p.actor, argument: p.argument || null }));
                oppActorsHere = (oppState?.actorsPlacements || [])
                  .filter(p => p.location === loc.id)
                  .map(p => p.actor);
              }

              const confResult = isResolution ? matchState.conflictResults?.find(cr => cr.location === loc.id) : null;

              return (
                <React.Fragment key={loc.id}>
                  <div className="relative group/loc flex flex-col items-center justify-center">
                    <LocationSlot locationId={loc.id} name={loc.name} type={loc.type} color={loc.color}>

                      {/* Render Opponent's Actors */}
                      <div className="absolute top-1 left-1 flex flex-wrap gap-1 opacity-50 contrast-50 pointer-events-none scale-[0.6] origin-top-left z-0 w-[150%]">
                        {oppActorsHere.map(oppAct => (
                          <div key={`opp-${oppAct}`} className="relative">
                            <DraggableActor id={`opp-${oppAct}`} actorType={oppAct} inHand={false} />
                          </div>
                        ))}
                      </div>

                      {myActorsHere.map(myAct => {
                        const betOnThisActor = placedBets[myAct.actor] || null;

                        return (
                          <div key={`my-${myAct.actor}`} className="relative isolate flex flex-col items-center">
                            <DraggableActor id={`placed-${myAct.actor}`} actorType={myAct.actor} inHand={false} />

                            {/* Render Dropped Chip / Bet */}
                            {betOnThisActor && (
                              <div className="absolute -bottom-4 right-0 scale-75 pointer-events-none z-50">
                                <DraggableChip id={`bet-${loc.id}-${myAct.actor}`} resourceType={betOnThisActor} inHand={false} />
                              </div>
                            )}

                            {/* Render Selected Argument Token */}
                            {myAct.argument && (
                              <div className="absolute -top-4 right-[-10px] scale-75 z-40 pointer-events-none">
                                <DraggableArgument id={`placed-arg-${loc.id}-${myAct.actor}`} argumentType={myAct.argument} inHand={false} disabled={true} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </LocationSlot>
                  </div>
                  {/* Anti-isometric wrappers for UI Popups (Keeps UI flat to camera) */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none [transform:rotateX(-25deg)] flex items-center justify-center z-50">
                    {isDistribution && myActorsHere.map((myAct, index) => {
                      const showSelector = !myState?.hasCommittedDistribution && myAct.argument === null;
                      const canClear = !myState?.hasCommittedDistribution && myAct.argument !== null;

                      return (
                        <React.Fragment key={`ui-${myAct.actor}`}>
                          {showSelector && (
                            <div className="absolute" style={{ transform: `translateY(${index * -30}px)` }}>
                              <ArgumentSelector availableArgs={argHand} onSelect={(arg) => handleSelectArgument(myAct.actor, arg)} />
                            </div>
                          )}
                          {canClear && (
                            <div className="absolute" style={{ transform: `translate(-35px, ${-50 + index * 15}px)` }}>
                              <button
                                onClick={() => handleClearArgument(myAct.actor)}
                                className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 bg-red-950/90 rounded pointer-events-auto border border-red-800 backdrop-blur-md shadow-md"
                              >
                                Clear {myAct.actor.substring(0, 3)}
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Conflict Resolution Overlay */}
                    {confResult && (
                      <div className="absolute top-[-30px] pointer-events-auto bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl flex flex-col items-center z-[100] backdrop-blur-md w-max animate-in fade-in zoom-in duration-500 hover:scale-105 transition-transform">
                        <span className="text-[10px] uppercase tracking-widest font-black mb-1 bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text">Conflict</span>
                        {confResult?.winnerId === 'TIE' ? (
                          <div className="text-center">
                            <div className="text-lg mb-1">⚔️ TIE ⚔️</div>
                            <div className="text-[10px] text-slate-400">Mutual Destruction</div>
                          </div>
                        ) : confResult?.winnerId ? (
                          <div className="text-center">
                            <div className={`text-md font-bold mb-1 ${confResult.winnerId === socketId ? 'text-blue-400' : 'text-red-400'}`}>
                              {confResult.winnerId === socketId ? '🌟 VICTORIOUS' : '💀 DEFEATED'}
                            </div>
                            <div className="flex items-center space-x-2 text-xs pt-1 border-t border-slate-700">
                              <span className="text-slate-300">Reward:</span>
                              <span className="text-emerald-400 font-bold">+{confResult?.rewardCount} {confResult?.rewardType}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-emerald-400 text-xs font-bold pt-1">
                              Secured +{confResult?.rewardCount} {confResult?.rewardType}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* The Dock (Dynamic based on Phase) */}
        {
          !myState?.hasCommittedDistribution && isDistribution && (
            <div className="absolute bottom-8 w-full max-w-4xl h-36 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center shadow-2xl z-10 px-8">
              <div className="flex w-full justify-between items-center px-4 pt-2">
                <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">Distribution (Hand)</span>

                <div className="flex items-center space-x-4">
                  {!canLock && (
                    <span className="text-xs text-orange-400 opacity-80">
                      {hand.length > 0 ? "Place all actors." : "Give each actor 1 argument."}
                    </span>
                  )}
                  <button
                    disabled={!canLock}
                    onClick={handleLockPlacements}
                    className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${canLock ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                    Lock Placements
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full flex items-center justify-center space-x-6">
                {hand.length > 0 ? (
                  <>
                    {hand.includes(ActorType.POLITIC) && <DraggableActor id={`hand-${ActorType.POLITIC}`} actorType={ActorType.POLITIC} inHand={true} />}
                    {hand.includes(ActorType.SCIENTIST) && <DraggableActor id={`hand-${ActorType.SCIENTIST}`} actorType={ActorType.SCIENTIST} inHand={true} />}
                    {hand.includes(ActorType.ARTIST) && <DraggableActor id={`hand-${ActorType.ARTIST}`} actorType={ActorType.ARTIST} inHand={true} />}
                    {hand.includes(ActorType.ROBOT) && <DraggableActor id={`hand-${ActorType.ROBOT}`} actorType={ActorType.ROBOT} inHand={true} />}
                  </>
                ) : (
                  <>
                    {argHand.includes(ArgumentType.ROCK) && <DraggableArgument id={`hand-arg-${ArgumentType.ROCK}`} argumentType={ArgumentType.ROCK} inHand={true} />}
                    {argHand.includes(ArgumentType.PAPER) && <DraggableArgument id={`hand-arg-${ArgumentType.PAPER}`} argumentType={ArgumentType.PAPER} inHand={true} />}
                    {argHand.includes(ArgumentType.SCISSORS) && <DraggableArgument id={`hand-arg-${ArgumentType.SCISSORS}`} argumentType={ArgumentType.SCISSORS} inHand={true} />}
                    {argHand.includes(ArgumentType.DUMMY) && <DraggableArgument id={`hand-arg-${ArgumentType.DUMMY}`} argumentType={ArgumentType.DUMMY} inHand={true} />}
                    {argHand.length === 0 && <span className="text-slate-500 italic">All arguments deployed!</span>}
                  </>
                )}
              </div>

              <span className="absolute bottom-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {hand.length > 0 ? "1. Drag Actors to valid locations on the board" : "2. Drag an Argument Token onto each Actor"}
              </span>
            </div>
          )
        }

        {
          isBets && (
            <div className="absolute bottom-8 w-full max-w-4xl h-40 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center shadow-2xl z-10 px-8">
              <div className="flex w-full justify-between items-center px-4 pt-2">
                <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">Phase 3: Place Bets (Optional)</span>
                <button
                  disabled={myState?.hasCommittedBets}
                  onClick={handleLockBets}
                  className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${!myState?.hasCommittedBets ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  {myState?.hasCommittedBets ? 'Waiting for opponent...' : 'Lock Bets'}
                </button>
              </div>

              <div className="flex-1 w-full flex items-center justify-center space-x-12">
                <DraggableChip
                  id={`hand-${ResourceType.PRODUCTION}`}
                  resourceType={ResourceType.PRODUCTION}
                  inHand={true}
                  count={myState?.resourceTokens[ResourceType.PRODUCTION] || 0}
                />
                <DraggableChip
                  id={`hand-${ResourceType.ELECTRICITY}`}
                  resourceType={ResourceType.ELECTRICITY}
                  inHand={true}
                  count={myState?.resourceTokens[ResourceType.ELECTRICITY] || 0}
                />
                <DraggableChip
                  id={`hand-${ResourceType.RECYCLING}`}
                  resourceType={ResourceType.RECYCLING}
                  inHand={true}
                  count={myState?.resourceTokens[ResourceType.RECYCLING] || 0}
                />
              </div>
              <span className="absolute bottom-2 text-xs text-slate-500">Drag a resource token onto one of your Actors to play a bet.</span>
            </div>
          )
        }

        {
          isResolution && (
            <div className="absolute bottom-8 w-full max-w-4xl h-40 bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl flex flex-col justify-center items-center shadow-2xl z-10 px-8">
              <div className="flex w-full justify-between items-center px-4 pt-2">
                <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">Phase 5: Resolution</span>
                <button
                  onClick={devForceAdvance}
                  className="px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                >
                  Next Turn
                </button>
              </div>
              <div className="flex-1 w-full flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🏆</span>
                <span className="text-sm text-slate-300">Conflicts have been resolved! Review the results on the board.</span>
              </div>
            </div>
          )
        }
      </div >
    </DndContext >
  );
}
