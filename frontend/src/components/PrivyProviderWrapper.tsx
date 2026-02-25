"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    // Check if the appId is missing, completely empty, or the default placeholder
    if (!mounted || !appId || appId === "" || appId === "your_privy_app_id_here") {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center space-y-4 font-mono">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h1 className="text-2xl text-red-400 font-bold tracking-widest uppercase">Missing Privy App ID</h1>
                <p className="text-slate-400 max-w-lg">
                    The Next.js environment is missing the <code className="bg-slate-800 text-blue-400 px-2 py-1 rounded">NEXT_PUBLIC_PRIVY_APP_ID</code> variable, which is required securely boot the DApp.
                </p>
                <p className="text-slate-500 text-sm mt-4">
                    Please open <code className="text-slate-300">frontend/.env.local</code> and enter your App ID, then restart the frontend server.
                </p>
            </div>
        );
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                loginMethods: ["email", "wallet", "google", "apple"],
                appearance: {
                    theme: "dark",
                    accentColor: "#6b21a8", // Purple to match Metarchy theme
                    logo: "https://auth.privy.io/logos/privy-logo-dark.png", // We can replace with Metarchy logo later
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: "users-without-wallets",
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
