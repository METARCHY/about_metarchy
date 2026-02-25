"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

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
                    createOnLogin: "users-without-wallets",
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
