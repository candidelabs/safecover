"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";

type RecoveryParams = {
  safeAddress: Address | undefined;
  newOwners: Address[] | undefined;
  newThreshold: number | undefined;
  recoveryLink: string | undefined;
};

function useHashParams(): RecoveryParams {
  const [params, setParams] = useState<RecoveryParams>({
    safeAddress: undefined,
    newOwners: undefined,
    newThreshold: undefined,
    recoveryLink: undefined,
  });

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const result: RecoveryParams = {
      safeAddress: undefined,
      newOwners: undefined,
      newThreshold: undefined,
      recoveryLink: undefined,
    };

    if (!hash) {
      setParams(result);
      return;
    }

    const pairs = hash.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      if (key === "safeAddress" && value) {
        result.safeAddress = value as Address;
      }
      if (key === "newOwners" && value) {
        result.newOwners = value.split(",") as Address[];
      }
      if (key === "newThreshold" && value) {
        result.newThreshold = Number(value);
      }
    }

    result.recoveryLink =
      result.safeAddress && result.newOwners && result.newThreshold
        ? window.location.href
        : undefined;

    setParams(result);
  }, []);

  return params;
}

export default useHashParams;
