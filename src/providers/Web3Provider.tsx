"use client";

import { WagmiProvider, createConfig, fallback, http, injected } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import {
  arbitrum,
  avalanche,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useState, type ReactNode } from "react";
import { getRpcOverrides, type RpcOverrides } from "@/utils/rpc-settings";

const walletConnectProjectId = "02b6cf06bc1d1b779db60f301acca581";

export const supportedChains = [
  mainnet,
  optimism,
  arbitrum,
  avalanche,
  base,
  polygon,
  sepolia,
] as const;

// Build-time RPCs. Read each env var explicitly so Next can inline it.
const bundledRpcUrls: Record<number, string | undefined> = {
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
  [optimism.id]: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL,
  [arbitrum.id]: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL,
  [base.id]: process.env.NEXT_PUBLIC_BASE_RPC_URL,
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
  [avalanche.id]: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL,
  [sepolia.id]:
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
    "https://sepolia.gateway.tenderly.co",
};

// The user's RPC first, then the bundled one, then the chain's public default,
// so no single provider can take the app down
const buildTransport = (
  chain: (typeof supportedChains)[number],
  overrides: RpcOverrides
) => {
  const urls = [
    overrides[chain.id],
    bundledRpcUrls[chain.id],
    ...chain.rpcUrls.default.http,
  ].filter((url, i, all): url is string => !!url && all.indexOf(url) === i);
  return fallback(urls.map((url) => http(url)));
};

type SupportedChainId = (typeof supportedChains)[number]["id"];

const createWagmiConfig = (overrides: RpcOverrides) =>
  createConfig(
    getDefaultConfig({
      // Your dApps chains
      chains: supportedChains,
      transports: Object.fromEntries(
        supportedChains.map((chain) => [
          chain.id,
          buildTransport(chain, overrides),
        ])
      ) as Record<SupportedChainId, ReturnType<typeof fallback>>,
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
      appUrl: "https://recovery.candide.dev",
      appIcon: "https://github.com/candidelabs.png",
    })
  );

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  // Built once per page load; saving RPC settings reloads the page
  const [config] = useState(() => createWagmiConfig(getRpcOverrides()));
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
