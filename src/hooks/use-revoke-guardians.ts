"use client";

import { useSocialRecoveryModule } from "./use-social-recovery-module";
import { Address } from "viem";
import { useExecuteTransaction } from "./use-execute-transaction";
import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
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
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { srm } = useSocialRecoveryModule();
  const { guardians: currentGuardians } = useSrmData();

  const buildTxFn = useCallback(async () => {
    if (!guardians) throw new Error("Missing guardians");
    if (threshold === undefined) throw new Error("Missing threshold");
    if (!srm) throw new Error("Missing srm");
    if (!currentGuardians) throw new Error("Missing currentGuardians");
    if (!publicClient) throw new Error("Missing publicClient");
    if (!address) throw new Error("Missing account address");

    return buildRevokeGuardiansTxs(
      srm,
      publicClient,
      address,
      guardians,
      threshold
    );
  }, [guardians, threshold, srm, currentGuardians, publicClient, address]);

  return useExecuteTransaction({
    buildTxFn,
    onSuccess,
    onError,
  });
}
