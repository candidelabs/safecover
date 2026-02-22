"use client";

import { useSocialRecoveryModule } from "./use-social-recovery-module";
import { useCallback } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useExecuteTransaction } from "./use-execute-transaction";
import { useSrmData } from "./use-srm-data";
import {
  buildUpdateDelayPeriodTxs,
  buildUpdateThresholdTxs,
} from "@/utils/transaction-builders";
import { delayPeriodMap } from "@/utils/delay-period";
import { SrmAddress } from "@/types";

export function useUpdateParameters({
  threshold,
  delayPeriod,
  onSuccess,
  onError,
}: {
  threshold: number | undefined;
  delayPeriod: number | undefined;
  srmAddress?: SrmAddress;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const { address: signer } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { srm: oldSrm } = useSocialRecoveryModule();
  const newSrmAddress = delayPeriod ? delayPeriodMap[delayPeriod] : undefined;
  const { srm: newSrm } = useSocialRecoveryModule({
    srmAddress: newSrmAddress,
  });
  const { guardians } = useSrmData();

  const buildTxFn = useCallback(async () => {
    if (
      !signer ||
      !walletClient ||
      !publicClient ||
      !threshold ||
      !delayPeriod ||
      !oldSrm ||
      !newSrm ||
      !guardians ||
      !guardians.length
    ) {
      throw new Error("Missing params");
    }

    return oldSrm.moduleAddress === newSrm.moduleAddress
      ? buildUpdateThresholdTxs(oldSrm, threshold)
      : buildUpdateDelayPeriodTxs(
          oldSrm,
          newSrm,
          publicClient,
          signer,
          guardians,
          threshold
        );
  }, [
    signer,
    publicClient,
    walletClient,
    guardians,
    threshold,
    oldSrm,
    newSrm,
    delayPeriod,
  ]);

  return useExecuteTransaction({
    buildTxFn,
    onSuccess,
    onError,
  });
}
