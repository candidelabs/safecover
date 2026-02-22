import { Address } from "viem";
import { SocialRecoveryModuleGracePeriodSelector } from "abstractionkit";

export interface NewAddress {
  nickname: string;
  address: string;
  status?: string;
}

export interface BaseTx {
  to: Address;
  value: bigint;
  data: `0x${string}`;
}

export type SrmAddress =
  | SocialRecoveryModuleGracePeriodSelector.After3Minutes
  | SocialRecoveryModuleGracePeriodSelector.After3Days
  | SocialRecoveryModuleGracePeriodSelector.After7Days
  | SocialRecoveryModuleGracePeriodSelector.After14Days;

export interface RecoveryInfo {
  guardiansApprovalCount: number;
  newThreshold: number;
  executeAfter: number;
  newOwners: readonly Address[];
}

export interface ApprovalsInfo {
  guardiansApprovals: NewAddress[];
  totalGuardianApprovals: number;
  guardiansThreshold: number | undefined;
  pendingGuardians: Address[];
}
