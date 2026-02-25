import { useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useSkinStore } from '@/store/useSkinStore';
import { ActorType } from '@/types/game';

export function useFetchSkins() {
    const { wallets } = useWallets();
    const { setSkins, setIsFetching, clearSkins } = useSkinStore();

    useEffect(() => {
        const activeWallet = wallets[0];

        if (!activeWallet) {
            clearSkins();
            return;
        }

        const fetchSkins = async () => {
            setIsFetching(true);
            try {
                // TODO: Replace with real RPC or Alchemy API calls
                // For now, this mocks the Cross-Game Sync standard metadata parsing
                console.log(`[Cross-Game Sync] Fetching NFTs for wallet ${activeWallet.address}...`);

                // Simulate network latency
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Mock response representing NFTs that match our attributes
                // (e.g., an NFT that has trait "Skin" = "Robot" or similar)
                setSkins({
                    [ActorType.ROBOT]: {
                        name: "Mecha Knight #081",
                        imageUrl: "https://api.dicebear.com/9.x/bottts/svg?seed=MechaKnight081"
                    },
                    [ActorType.ARTIST]: {
                        name: "Cyber Painter",
                        imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=CyberPainter"
                    }
                });

            } catch (err) {
                console.error("Failed to fetch skins", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchSkins();
    }, [wallets, setSkins, setIsFetching, clearSkins]);
}
