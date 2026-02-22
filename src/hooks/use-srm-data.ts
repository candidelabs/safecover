"use client";

import { useSocialRecoveryModule } from "./use-social-recovery-module";
import { useAccount, usePublicClient } from "wagmi";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { safeWalletAbi } from "@/utils/abis/safeWalletAbi";
import { getRpcUrl } from "@/utils/get-rpc-url";
import { RecoveryInfo } from "@/types";

export interface SrmData {
  owners?: Address[];
  safeThreshold?: number;
  guardians?: Address[];
  recoveryInfo?: RecoveryInfo;
  threshold?: number;
}

export function useSrmData(safeAddress?: Address, chainId?: number) {
  const { address, chainId: accountChainId } = useAccount();
  const { srm } = useSocialRecoveryModule({ safeAddress, chainId });

  const chainIdToFetch = chainId ?? accountChainId;
  const addressToFetch = safeAddress ?? address;

  const publicClient = usePublicClient({ chainId: chainIdToFetch });

  const query = useQuery<SrmData>({
    queryKey: ["guardians", chainIdToFetch, addressToFetch, srm?.moduleAddress],
    queryFn: async () => {
      if (!addressToFetch || !publicClient) {
        throw new Error("Account, srm or client not available");
      }

      const safeWalletResults = await publicClient.multicall({
        contracts: [
          {
            address: addressToFetch,
            abi: safeWalletAbi,
            functionName: "getOwners",
          },
          {
            address: addressToFetch,
            abi: safeWalletAbi,
            functionName: "getThreshold",
          },
        ],
      });

      const output = {} as SrmData;

      output.owners =
        safeWalletResults[0].status === "success"
          ? (safeWalletResults[0].result as Address[])
          : [];
      if (safeWalletResults[1].status === "success")
        output.safeThreshold = Number(safeWalletResults[1].result);

      if (!srm) {
        output.guardians = [];
        return output;
      }

      const nodeRpcUrl = getRpcUrl(publicClient);

      const [guardians, threshold, recoveryRequest] = await Promise.all([
        srm.getGuardians(nodeRpcUrl, addressToFetch),
        srm.threshold(nodeRpcUrl, addressToFetch),
        srm.getRecoveryRequest(nodeRpcUrl, addressToFetch),
      ]);

      output.guardians = guardians as Address[];
      output.threshold = Number(threshold);

      if (recoveryRequest.executeAfter > BigInt(0) || recoveryRequest.newOwners.length > 0) {
        output.recoveryInfo = {
          guardiansApprovalCount: Number(recoveryRequest.guardiansApprovalCount),
          newThreshold: Number(recoveryRequest.newThreshold),
          executeAfter: Number(recoveryRequest.executeAfter),
          newOwners: recoveryRequest.newOwners as Address[],
        };
      }

      return output;
    },
    structuralSharing: false,
    enabled: Boolean(addressToFetch) && Boolean(publicClient),
  });

  return query.data ?? {};
}
