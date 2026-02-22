import { PublicClient } from "viem";

export function getRpcUrl(publicClient: PublicClient): string {
  const url = (publicClient.transport as { url?: string }).url;
  if (!url) throw new Error("Could not resolve RPC URL from public client");
  return url;
}
