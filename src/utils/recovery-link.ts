"use client";

import { Address, isAddress } from "viem";

export interface RecoveryQueryParams {
  safeAddress: string;
  newOwners: string[];
  newThreshold: number;
}

export type LinkParams = {
  safeAddress?: string;
  newOwners?: string;
  newThreshold?: string;
};

export const createFinalUrl = (params: RecoveryQueryParams): string => {
  const baseUrl = window !== undefined && window.location.host;
  const hashParams = new URLSearchParams();
  hashParams.append("safeAddress", params.safeAddress);
  hashParams.append("newOwners", params.newOwners.join(","));
  hashParams.append("newThreshold", params.newThreshold.toString());
  return `${baseUrl}#${hashParams.toString()}`;
};

export const recoverLinkParams = (linkParams: LinkParams) => {
  const safeAddress = linkParams.safeAddress as Address;
  const newOwners = linkParams?.newOwners?.split(",");
  const newThreshold =
    linkParams?.newThreshold !== undefined
      ? Number(linkParams.newThreshold)
      : undefined;
  const recoveryLink =
    safeAddress &&
    newOwners &&
    newThreshold &&
    validateLinkParams({ safeAddress, newOwners, newThreshold }).isValid
      ? createFinalUrl({ safeAddress, newOwners, newThreshold })
      : undefined;

  return { safeAddress, recoveryLink, newOwners, newThreshold };
};

export const validateLinkParams = ({
  safeAddress,
  newOwners,
  newThreshold,
}: RecoveryQueryParams): { isValid: boolean; reason: string } => {
  if (!isAddress(safeAddress))
    return { isValid: false, reason: "Safe address is not an address." };

  for (const owner of newOwners) {
    if (!isAddress(owner))
      return { isValid: false, reason: "One of the owners is not an address." };
  }

  if (newThreshold < 1 || newThreshold > newOwners.length)
    return {
      isValid: false,
      reason: "Threshold must be between 1 and number of owners.",
    };

  return { isValid: true, reason: "" };
};
