"use client";

import { WagmiProvider, createConfig, http, injected } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import type { ReactNode } from "react";

const walletConnectProjectId = "02b6cf06bc1d1b779db60f301acca581";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, optimism, arbitrum, base, polygon, sepolia],
    transports: {
      [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? ""),
      [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL ?? ""),
      [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ?? ""),
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL ?? ""),
      [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? ""),
      [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
        ? http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
        : http("https://sepolia.gateway.tenderly.co"),
    },
    connectors: [
      injected(),
      walletConnect({
        projectId: walletConnectProjectId,
        showQrModal: false,
      }),
    ],

    // Required API Keys
    walletConnectProjectId,

    // Required App Info
    appName: "Candide Account Recovery",
    // Optional App Info
    appDescription: "Recover Safe Wallets",
    appUrl: "https://candide-account-recovey.vercel.app",
    appIcon: "https://github.com/candidelabs.png",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          options={{
            walletConnectName: "WalletConnect",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
