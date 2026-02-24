import { create } from 'zustand';
import { ActorType, LocationType, ArgumentType, MatchState, ActorPlacement } from '../types/game';

interface GameState {
    match: MatchState | null;
    playerId: string | null;

    // Local state for Phase 1 Commit (dragging actors)
    localPlacements: ActorPlacement[];
    selectedActorQueue: [ArgumentType, ArgumentType, ArgumentType] | null;

    setMatch: (match: MatchState) => void;
    setPlayerId: (id: string) => void;
    placeActor: (actor: ActorType, location: LocationType, args: [ArgumentType, ArgumentType, ArgumentType]) => void;
    removeActorLocation: (actor: ActorType) => void;
    clearPlacements: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    match: null,
    playerId: null,
    localPlacements: [],
    selectedActorQueue: null,

    setMatch: (match) => set({ match }),
    setPlayerId: (id) => set({ playerId: id }),

    placeActor: (actor, location, args) => set((state) => {
        // Replace if actor already placed
        const remaining = state.localPlacements.filter(p => p.actor !== actor);
        return {
            localPlacements: [...remaining, { actor, location, argumentQueue: args }]
        };
    }),

    removeActorLocation: (actor) => set((state) => ({
        localPlacements: state.localPlacements.filter(p => p.actor !== actor)
    })),

    clearPlacements: () => set({ localPlacements: [] })
}));
