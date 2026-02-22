import { Address, PublicClient } from "viem";
import { SocialRecoveryModule } from "abstractionkit";
import { getIsModuleEnabled } from "@/utils/getIsModuleEnabled";
import { getRpcUrl } from "@/utils/get-rpc-url";
import { BaseTx } from "@/types";

function toBaseTxs(
  txs: { to: string; data: string; value: bigint }[]
): BaseTx[] {
  return txs.map((tx) => ({
    to: tx.to as Address,
    data: tx.data as `0x${string}`,
    value: tx.value,
  }));
}

export async function buildAddGuardiansTxs(
  srm: SocialRecoveryModule,
  publicClient: PublicClient,
  signer: Address,
  guardians: Address[],
  currentGuardiansCount: number,
  threshold: number
): Promise<BaseTx[]> {
  const txs = [];

  const isModuleEnabled = await getIsModuleEnabled(
    publicClient,
    signer,
    srm.moduleAddress as Address
  );

  if (!isModuleEnabled) {
    const enableModuleTx = srm.createEnableModuleMetaTransaction(signer);
    txs.push(enableModuleTx);
  }

  for (const [idx, guardian] of guardians.entries()) {
    const addGuardianTx = srm.createAddGuardianWithThresholdMetaTransaction(
      guardian,
      BigInt(
        currentGuardiansCount + idx + 1 > threshold
          ? threshold
          : currentGuardiansCount + idx + 1
      )
    );
    txs.push(addGuardianTx);
  }

  return toBaseTxs(txs);
}

export async function buildRevokeGuardiansTxs(
  srm: SocialRecoveryModule,
  publicClient: PublicClient,
  accountAddress: Address,
  guardians: Address[],
  threshold: number
): Promise<BaseTx[]> {
  const nodeRpcUrl = getRpcUrl(publicClient);
  const txs = [];

  for (const guardian of guardians) {
    const revokeGuardianTx =
      await srm.createRevokeGuardianWithThresholdMetaTransaction(
        nodeRpcUrl,
        accountAddress,
        guardian,
        BigInt(threshold)
      );
    txs.push(revokeGuardianTx);
  }

  return toBaseTxs(txs);
}

export async function buildUpdateDelayPeriodTxs(
  oldSrm: SocialRecoveryModule,
  newSrm: SocialRecoveryModule,
  publicClient: PublicClient,
  signer: Address,
  guardians: Address[],
  threshold: number
): Promise<BaseTx[]> {
  const nodeRpcUrl = getRpcUrl(publicClient);
  const removeGuardiansTxs = [];

  for (const [idx, guardian] of guardians.entries()) {
    const revokeGuardianTx =
      await oldSrm.createRevokeGuardianWithThresholdMetaTransaction(
        nodeRpcUrl,
        signer,
        guardian,
        BigInt(guardians.length - idx - 1)
      );
    removeGuardiansTxs.push(revokeGuardianTx);
  }

  const addGuardiansTxs = await buildAddGuardiansTxs(
    newSrm,
    publicClient,
    signer,
    guardians,
    0,
    threshold
  );

  return [...toBaseTxs(removeGuardiansTxs), ...addGuardiansTxs];
}

export async function buildUpdateThresholdTxs(
  srm: SocialRecoveryModule,
  threshold: number
): Promise<BaseTx[]> {
  const tx = srm.createChangeThresholdMetaTransaction(BigInt(threshold));
  return toBaseTxs([tx]);
}
