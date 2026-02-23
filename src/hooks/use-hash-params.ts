"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import { decompressFromEncodedURIComponent } from "lz-string";

const isBrowser = typeof window !== "undefined";

type RecoveryParams = {
  safeAddress: Address | undefined;
  newOwners: Address[] | undefined;
  newThreshold: number | undefined;
  chainId: number | undefined;
  recoveryLink: string | undefined;
};

function parseCompressedHash(hash: string): RecoveryParams {
  const result = {} as RecoveryParams;

  try {
    const decompressed = decompressFromEncodedURIComponent(hash);
    if (!decompressed) return result;

    const payload = JSON.parse(decompressed);
    if (payload.s) result.safeAddress = payload.s as Address;
    if (payload.o) result.newOwners = payload.o as Address[];
    if (payload.t) result.newThreshold = payload.t;
    if (payload.c) result.chainId = Number(payload.c);
  } catch {
    return result;
  }

  return result;
}

function useHashParams(): RecoveryParams {
  const [params, setParams] = useState<RecoveryParams>({} as RecoveryParams);

  useEffect(() => {
    if (!isBrowser) return;

    const hash = window.location.hash.substring(1);
    const result = {} as RecoveryParams;

    if (!hash) {
      setParams(result);
      return;
    }

    const parsed = parseCompressedHash(hash);
    result.safeAddress = parsed.safeAddress;
    result.newOwners = parsed.newOwners;
    result.newThreshold = parsed.newThreshold;
    result.chainId = parsed.chainId;

    result.recoveryLink =
      result.safeAddress && result.newOwners && result.newThreshold
        ? window.location.href
        : undefined;

    setParams(result);
  }, []);

  return params;
}

export default useHashParams;
