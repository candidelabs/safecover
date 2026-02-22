"use client";

import { useSocialRecoveryModule } from "./use-social-recovery-module";
import { useCallback } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useExecuteTransaction } from "./use-execute-transaction";
import { useSrmData } from "./use-srm-data";
import { buildAddGuardiansTxs } from "@/utils/transaction-builders";
import { SrmAddress } from "@/types";

export function useAddGuardians({
  guardians,
  threshold,
  srmAddress,
  onSuccess,
  onError,
}: {
  guardians: `0x${string}`[] | undefined;
  threshold: number | undefined;
  srmAddress?: SrmAddress;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const { address: signer } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { srm } = useSocialRecoveryModule({ srmAddress });
  const { guardians: currentGuardians } = useSrmData();

  const buildTxFn = useCallback(async () => {
    if (
      !signer ||
      !walletClient ||
      !publicClient ||
      !guardians ||
      !threshold ||
      !currentGuardians ||
      !srm
    ) {
      throw new Error("Missing params");
    }

    return buildAddGuardiansTxs(
      srm,
      publicClient,
      signer,
      guardians,
      currentGuardians.length,
      threshold
    );
  }, [
    signer,
    publicClient,
    walletClient,
    guardians,
    threshold,
    srm,
    currentGuardians,
  ]);

  return useExecuteTransaction({
    buildTxFn,
    onSuccess,
    onError,
  });
}
