"use client";

import { useSocialRecoveryModule } from "./use-social-recovery-module";
import { Address, zeroAddress } from "viem";
import { useExecuteTransaction } from "./use-execute-transaction";
import { useCallback } from "react";
import { useSrmData } from "./use-srm-data";
import { buildRevokeGuardiansTxs } from "@/utils/transaction-builders";

export function useRevokeGuardians({
  guardians,
  threshold,
  onSuccess,
  onError,
}: {
  guardians: Address[] | undefined;
  threshold: number | undefined;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const { srm } = useSocialRecoveryModule();
  const { guardians: currentGuardians } = useSrmData();

  const buildTxFn = useCallback(async () => {
    if (!guardians) throw new Error("Missing guardians");
    if (threshold === undefined) throw new Error("Missing threshold");
    if (!srm) throw new Error("Missing srm");
    if (!currentGuardians) throw new Error("Missing currentGuardians");

    const prevGuardian = `${zeroAddress.slice(0, -1)}1` as Address;

    return buildRevokeGuardiansTxs(srm, prevGuardian, guardians, threshold);
  }, [guardians, threshold, srm, currentGuardians]);

  return useExecuteTransaction({
    buildTxFn,
    onSuccess,
    onError,
  });
}
