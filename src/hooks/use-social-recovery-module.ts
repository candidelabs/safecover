import {
  SocialRecoveryModule,
  SocialRecoveryModuleGracePeriodSelector,
} from "abstractionkit";
import { useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useQuery } from "@tanstack/react-query";
import { getRpcUrl } from "@/utils/get-rpc-url";
import { SrmAddress } from "@/types";

const srmAddresses: SrmAddress[] = [
  SocialRecoveryModuleGracePeriodSelector.After3Minutes,
  SocialRecoveryModuleGracePeriodSelector.After3Days,
  SocialRecoveryModuleGracePeriodSelector.After7Days,
  SocialRecoveryModuleGracePeriodSelector.After14Days,
];

interface UseSocialRecoveryModuleParams {
  srmAddress?: SrmAddress;
  safeAddress?: string;
  chainId?: number;
}

const delayPeriodMap: Record<SrmAddress, string> = {
  [SocialRecoveryModuleGracePeriodSelector.After3Minutes]: "3-minute",
  [SocialRecoveryModuleGracePeriodSelector.After3Days]: "3-day",
  [SocialRecoveryModuleGracePeriodSelector.After7Days]: "7-day",
  [SocialRecoveryModuleGracePeriodSelector.After14Days]: "14-day",
};

export function useSocialRecoveryModule(
  params?: UseSocialRecoveryModuleParams
): {
  srm: SocialRecoveryModule | undefined;
  delayPeriod: string | undefined;
  modulesWithGuardians: SrmAddress[] | undefined;
} {
  const { srmAddress, safeAddress, chainId } = params ?? {};
  const { address, chainId: accountChainId } = useAccount();

  const chainIdToFetch = chainId ?? accountChainId;
  const addressToFetch = safeAddress ?? address;

  const publicClient = usePublicClient({ chainId: chainIdToFetch });

  const { data: modulesWithGuardians } = useQuery({
    queryKey: ["allGuardians", chainIdToFetch, addressToFetch],
    queryFn: async () => {
      if (!publicClient) throw new Error("missing public client");
      if (!addressToFetch) throw new Error("missing address to fetch");
      if (!chainIdToFetch) throw new Error("missing chainId");

      const nodeRpcUrl = getRpcUrl(publicClient);

      const guardianCounts = await Promise.all(
        srmAddresses.map((addr) => {
          const srmInstance = new SocialRecoveryModule(addr);
          return srmInstance
            .guardiansCount(nodeRpcUrl, addressToFetch)
            .catch(() => BigInt(0));
        })
      );

      return srmAddresses.filter(
        (_, index) => guardianCounts[index] > BigInt(0)
      );
    },
  });

  const srm = useMemo(() => {
    if (srmAddress) return new SocialRecoveryModule(srmAddress);
    if (chainIdToFetch && chainIdToFetch === sepolia.id)
      return new SocialRecoveryModule(
        SocialRecoveryModuleGracePeriodSelector.After3Minutes
      );
    if (modulesWithGuardians && modulesWithGuardians.length > 0)
      return new SocialRecoveryModule(modulesWithGuardians[0]);
    return undefined;
  }, [srmAddress, chainIdToFetch, modulesWithGuardians]);

  const delayPeriod = useMemo(
    () => srm && delayPeriodMap[srm.moduleAddress as SrmAddress],
    [srm]
  );

  return { srm, delayPeriod, modulesWithGuardians };
}
