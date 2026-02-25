import { create } from 'zustand';
import { ActorType } from '@/types/game';

interface SkinData {
    name: string;
    imageUrl: string;
}

interface SkinState {
    actorSkins: Partial<Record<ActorType, SkinData>>;
    isFetching: boolean;
    setSkins: (skins: Partial<Record<ActorType, SkinData>>) => void;
    setIsFetching: (fetching: boolean) => void;
    clearSkins: () => void;
}

export const useSkinStore = create<SkinState>((set) => ({
    actorSkins: {},
    isFetching: false,
    setSkins: (skins) => set({ actorSkins: skins }),
    setIsFetching: (fetching) => set({ isFetching: fetching }),
    clearSkins: () => set({ actorSkins: {}, isFetching: false }),
}));
