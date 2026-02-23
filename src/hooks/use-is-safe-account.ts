import { useQuery } from "@tanstack/react-query";
import { Address, isAddress, parseAbi } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

interface SafeDetectionResult {
  isSafeAccount: boolean;
  isChecking: boolean;
}

const SAFE_ABI = parseAbi([
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
]);

export function useIsSafeAccount(): SafeDetectionResult {
  const { address: signer, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { data: isSafeContract, isLoading: isLoadingSafeContract } = useQuery({
    queryKey: ["isSafeContract", chainId, signer],
    queryFn: async () => {
      if (!publicClient) throw new Error("missing public client");
      if (!signer) throw new Error("missing signer");

      try {
        const [owners, threshold] = await Promise.all([
          publicClient.readContract({
            address: signer as Address,
            abi: SAFE_ABI,
            functionName: "getOwners",
          }),
          publicClient.readContract({
            address: signer as Address,
            abi: SAFE_ABI,
            functionName: "getThreshold",
          }),
        ]);

        const normalizedOwners = owners.filter((owner) => isAddress(owner));
        const thresholdNumber = Number(threshold);

        return (
          normalizedOwners.length > 0 &&
          Number.isFinite(thresholdNumber) &&
          thresholdNumber > 0 &&
          thresholdNumber <= normalizedOwners.length
        );
      } catch {
        return false;
      }
    },
    enabled: Boolean(publicClient) && Boolean(signer),
  });

  const isSafeType = walletClient?.account?.type?.toLowerCase() === "safe";
  const isChecking = Boolean(signer) && (isLoadingSafeContract || !publicClient);
  const isSafeAccount = Boolean(isSafeType || isSafeContract);

  return { isSafeAccount, isChecking };
}
