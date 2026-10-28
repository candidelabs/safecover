import type { Transport } from "abstractionkit";
import { PublicClient } from "viem";

// abstractionkit accepts any EIP-1193 style `request`, so reads go through the
// public client's own transport (including its fallback list) instead of a
// single URL
export function getRpcTransport(publicClient: PublicClient): Transport {
  return {
    request: <T>(args: { method: string; params?: unknown }) =>
      publicClient.request(args as never) as Promise<T>,
  };
}
