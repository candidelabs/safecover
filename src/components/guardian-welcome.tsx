"use client";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { ExternalLink, Shield, CheckCircle, Clock } from "lucide-react";
import { Address } from "viem";
import { Button } from "@/components/ui/button";

interface ApprovalInfo {
  approvals: string[];
  needed: number;
}

interface GuardianWelcomeProps {
  safeAddress: string;
  newOwners: Address[];
  newThreshold: number;
  chainId: number;
  approvalsInfo?: ApprovalInfo | null;
  onExternalLink: (address: string, chainId: number) => void;
  userHasApproved?: boolean;
}

export function GuardianWelcome({
  safeAddress,
  newOwners,
  newThreshold,
  chainId,
  approvalsInfo,
  onExternalLink,
  userHasApproved = false,
}: GuardianWelcomeProps) {
  const approvalsReceived = approvalsInfo?.approvals?.length ?? 0;
  const approvalsNeeded = approvalsInfo?.needed ?? newThreshold;
  const approvalsRemaining = Math.max(0, approvalsNeeded - approvalsReceived);

  return (
    <div className="flex flex-1 items-center justify-center mx-8 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-roboto-mono text-primary">
            Recovery Request
          </h2>
          <p className="text-lg font-roboto-mono text-foreground/70 mt-2">
            Someone has requested to recover their Safe account. As a guardian,
            you can approve this request.
          </p>
        </div>

        <div className="bg-content-background rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-sm font-roboto-mono text-foreground/60 mb-2">
              Safe Account to Recover
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-background px-3 py-2 rounded-lg flex-1 text-sm font-roboto-mono break-all">
                {safeAddress}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background shrink-0"
                onClick={() => onExternalLink(safeAddress, chainId)}
              >
                <ExternalLink size={16} />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-roboto-mono text-foreground/60 mb-2">
              New Signers (after recovery)
            </p>
            <div className="space-y-2">
              {newOwners.map((owner, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="bg-background px-3 py-2 rounded-lg flex-1 text-sm font-roboto-mono break-all">
                    {owner}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background shrink-0"
                    onClick={() => onExternalLink(owner, chainId)}
                  >
                    <ExternalLink size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background/50 rounded-xl p-4">
            <p className="text-sm font-roboto-mono text-foreground/60 mb-3">
              New Safe Threshold (signers needed for transactions)
            </p>
            <p className="text-2xl font-bold font-roboto-mono text-primary">
              {newThreshold} of {newOwners.length} signers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-roboto-mono text-foreground/60 mb-1">
                Guardian Approvals
              </p>
              <p className="font-roboto-mono">
                {approvalsReceived} approved
                {approvalsRemaining > 0 && (
                  <span className="text-foreground/60"> ({approvalsRemaining} more needed)</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {approvalsReceived >= approvalsNeeded ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-roboto-mono text-sm">
                {approvalsReceived >= approvalsNeeded
                  ? "Ready to execute"
                  : "Waiting for approvals"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          {userHasApproved ? (
            <p className="text-lg font-roboto-mono text-green-500">
              You have approved this recovery request
            </p>
          ) : (
            <>
              <p className="text-sm font-roboto-mono text-foreground/60 mb-4">
                Connect your wallet to approve this recovery request
              </p>
              <ConnectWalletButton />
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs font-roboto-mono text-foreground/40">
          By approving, you authorize the transfer of ownership from the current
          Safe signers to the new signers listed above.
        </p>
      </div>
    </div>
  );
}
