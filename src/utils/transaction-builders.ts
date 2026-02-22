import { Address, PublicClient, encodeFunctionData, zeroAddress } from "viem";
import { SocialRecoveryModule } from "abstractionkit";
import { getIsModuleEnabled } from "@/utils/getIsModuleEnabled";
import { socialRecoveryModuleAbi } from "@/utils/abis/socialRecoveryModuleAbi";
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
  prevGuardian: Address,
  guardians: Address[],
  threshold: number
): Promise<BaseTx[]> {
  const txs = [];

  for (const guardian of guardians) {
    const revokeGuardianTx = {
      to: srm.moduleAddress,
      data: encodeFunctionData({
        abi: socialRecoveryModuleAbi,
        functionName: "revokeGuardianWithThreshold",
        args: [prevGuardian, guardian, BigInt(threshold)],
      }),
      value: BigInt(0),
    };
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
  const removeGuardiansTxs = [];
  for (const [idx, guardian] of guardians.entries()) {
    const prevGuardian = `${zeroAddress.slice(0, -1)}1` as Address;
    const revokeGuardianTx = {
      to: oldSrm.moduleAddress,
      data: encodeFunctionData({
        abi: socialRecoveryModuleAbi,
        functionName: "revokeGuardianWithThreshold",
        args: [prevGuardian, guardian, BigInt(guardians.length - idx - 1)],
      }),
      value: BigInt(0),
    };
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
