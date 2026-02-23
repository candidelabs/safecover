"use client";

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { isAddress } from "viem";

export interface RecoveryQueryParams {
  safeAddress: string;
  newOwners: string[];
  newThreshold: number;
  chainId: string;
}

const isBrowser = typeof window !== "undefined";

export const createFinalUrl = (params: RecoveryQueryParams): string => {
  let baseUrl = "";
  if (isBrowser) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    baseUrl = `${protocol}//${host}`;
  }

  const payload = {
    s: params.safeAddress,
    o: params.newOwners,
    t: params.newThreshold,
    c: params.chainId,
  };
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload));

  return `${baseUrl}/manage-recovery/dashboard#${compressed}`;
};

export const isValidLink = (link: string): boolean => {
  try {
    const hashPart = link.split("#")[1];
    if (!hashPart) return false;

    const decompressed = decompressFromEncodedURIComponent(hashPart);
    if (!decompressed) return false;

    const payload = JSON.parse(decompressed) as {
      s?: string;
      o?: string[];
      t?: number | string;
      c?: number | string;
    };

    if (!payload.s || !isAddress(payload.s)) return false;
    if (!payload.o || !Array.isArray(payload.o) || payload.o.length === 0)
      return false;
    if (!payload.o.every((owner) => isAddress(owner))) return false;

    const newThreshold = Number(payload.t);
    const chainId = Number(payload.c);

    if (
      !Number.isInteger(newThreshold) ||
      newThreshold <= 0 ||
      newThreshold > payload.o.length
    ) {
      return false;
    }

    if (!Number.isInteger(chainId) || chainId <= 0) return false;

    return true;
  } catch (error) {
    console.error("Error validating link:", error);
    return false;
  }
};
