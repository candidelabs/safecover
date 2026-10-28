"use client";

// User-chosen RPC URLs, keyed by chain id. Stored only in this browser so the
// app keeps working when the bundled RPCs are blocked or rate limited.
// Never read these from URL params: a malicious RPC can misreport recovery state.
const STORAGE_KEY = "safecover:rpc-overrides:v1" as const;

export type RpcOverrides = Record<number, string>;

export const getRpcOverrides = (): RpcOverrides => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return {};
    const parsed = JSON.parse(item) as Record<string, unknown>;
    const overrides: RpcOverrides = {};
    for (const [chainId, url] of Object.entries(parsed)) {
      if (typeof url === "string" && url) overrides[Number(chainId)] = url;
    }
    return overrides;
  } catch {
    // No storage during static export, or blocked in private mode
    return {};
  }
};

export const saveRpcOverrides = (overrides: RpcOverrides) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    return true;
  } catch (e) {
    console.error("[saveRpcOverrides] Error storing RPC overrides:", e);
    return false;
  }
};

// Returns an error message, or undefined if the RPC answers for `chainId`
export const validateRpcUrl = async (
  url: string,
  chainId: number
): Promise<string | undefined> => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Not a valid URL.";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
    return "Use an http(s) URL.";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_chainId",
        params: [],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const { result } = (await response.json()) as { result?: string };
    if (!result) return "RPC did not return a chain id.";
    if (Number(result) !== chainId)
      return `RPC is for chain ${Number(result)}, not ${chainId}.`;
  } catch {
    return "Couldn't reach this RPC (offline, blocked, or no CORS).";
  }
};
