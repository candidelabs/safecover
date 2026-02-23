"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import GuardiansStep from "@/components/protect-account-steps/guardians";
import ReviewStepSection from "@/components/protect-account-steps/review";
import DelayPeriodStep from "@/components/protect-account-steps/delay-period";
import ThresholdStep from "@/components/protect-account-steps/threshold";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { useAccount } from "wagmi";
import { useAddGuardians } from "@/hooks/use-add-guardians";
import { useIsSafeAccount } from "@/hooks/use-is-safe-account";
import { Address } from "viem";
import { storeGuardians } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { NewAddress } from "@/types";
import LoadingModal from "@/components/loading-modal";
import { sepolia } from "wagmi/chains";
import { BaseForm } from "@/components/base-form";
import { useSrmData } from "@/hooks/use-srm-data";
import { getEtherscanAddressLink } from "@/utils/get-etherscan-link";
import { delayPeriodMap } from "@/utils/delay-period";
import { WhatIsSafeModal } from "@/components/what-is-safe-modal";

const totalSteps = 4;

const isBrowser = typeof window !== "undefined";

export default function ProtectAccount() {
  const [currentStep, setCurrentStep] = useState(1);
  const [threshold, setThreshold] = useState(1);
  const [showWhatIsSafeModal, setShowWhatIsSafeModal] = useState(false);

  const [guardians, setGuardians] = useState<NewAddress[]>([]);

  const {
    address,
    chainId,
    isConnected: isWalletConnected,
    isConnecting: isWalletConnecting,
  } = useAccount();

  const { isSafeAccount, isChecking } = useIsSafeAccount();

  const [delayPeriod, setDelayPeriod] = useState(3);

  useEffect(() => {
    if (chainId === sepolia.id) setDelayPeriod(1);
  }, [chainId]);

  const { toast } = useToast();
  const router = useRouter();

  const { guardians: currentGuardians } = useSrmData();

  const onSuccess = () => {
    if (chainId && address) {
      storeGuardians(guardians, chainId, address);
    }
    toast({
      title: "Guardian added.",
      description:
        "Your new guardian will now be part of your account recovery setup.",
    });
    router.push("/manage-recovery/dashboard");
  };

  const {
    trigger: postGuardians,
    isLoading: isLoadingPostGuardians,
    loadingMessage,
    cancel,
  } = useAddGuardians({
    guardians: guardians.map((guardian) => guardian.address) as Address[],
    threshold,
    srmAddress: delayPeriodMap[delayPeriod],
    onSuccess,
  });

  const handleAddGuardian = (newGuardian: NewAddress): void => {
    setGuardians((prev) => [...prev, newGuardian]);
  };

  const handleRemoveGuardian = (index: number): void => {
    setGuardians((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExternalLink = useCallback(
    (address: string): void => {
      if (isBrowser && chainId) {
        window.open(getEtherscanAddressLink(chainId, address));
      }
    },
    [chainId]
  );

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      postGuardians();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
  };

  const handleDelayPeriodChange = (value: number) => {
    setDelayPeriod(value);
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <GuardiansStep
              guardians={guardians}
              onAddGuardian={handleAddGuardian}
              onExternalLink={handleExternalLink}
              onRemoveGuardian={handleRemoveGuardian}
            />
          </div>
        );
      case 2:
        return (
          <ThresholdStep
            totalGuardians={guardians.length}
            onThresholdChange={handleThresholdChange}
            currentThreshold={threshold}
          />
        );
      case 3:
        return (
          <DelayPeriodStep
            delayPeriod={delayPeriod}
            onDelayPeriodChange={handleDelayPeriodChange}
          />
        );
      case 4:
        return (
          <div className="space-y-5">
            <>
              <span className="text-lg font-bold font-roboto-mono opacity-60">
                Guardians
              </span>
              <div className="mt-3">
                <GuardiansStep
                  guardians={guardians}
                  onAddGuardian={handleAddGuardian}
                  onRemoveGuardian={handleRemoveGuardian}
                  onExternalLink={handleExternalLink}
                  isReview={true}
                />
              </div>
              <ReviewStepSection
                threshold={threshold}
                delayPeriod={delayPeriod}
              />
              <br />
            </>
          </div>
        );
      default:
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Add Guardians";
      case 2:
        return "Set the Approval Threshold";
      case 3:
        return "Set the Recovery Delay Period";
      case 4:
        return "Review Account Recovery Setup";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Guardians are trusted contacts that will help recover your account. You can add multiple guardians.";
      case 2:
        return "Threshold determines the minimum number of guardian approvals required to recover your account.";
      case 3:
        return "Set the time period during which you can cancel a initiated recovery request.";
      default:
        return "";
    }
  };

  if (
    currentGuardians &&
    currentGuardians.length > 0 &&
    !isLoadingPostGuardians
  )
    router.push("/manage-recovery/dashboard");

  if (isWalletConnecting || (isWalletConnected && isChecking))
    return <LoadingScreen />;

  return (
    <div className="flex flex-1 items-center justify-center mx-8">
      {isWalletConnected ? (
        isSafeAccount ? (
          <>
            <BaseForm
              title={getStepTitle()}
              description={getStepDescription()}
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onBack={handleBack}
              isNextDisabled={
                (currentStep === 1 && guardians.length === 0) ||
                (currentStep === 4 && isLoadingPostGuardians)
              }
              nextLabel={
                currentStep === 3
                  ? "Finish and Review"
                  : currentStep === 4
                  ? isLoadingPostGuardians
                    ? "Loading..."
                    : "Setup Recovery"
                  : "Next"
              }
              isProgress
            >
              {getStepContent()}
            </BaseForm>
            <LoadingModal
              loading={isLoadingPostGuardians}
              loadingText={loadingMessage}
              onCancel={cancel}
            />
          </>
        ) : (
          <NotASafeAccount
            onShowWhatIsSafe={() => setShowWhatIsSafeModal(true)}
          />
        )
      ) : (
        <WalletNotConnected onShowWhatIsSafe={() => setShowWhatIsSafeModal(true)} />
      )}
      <WhatIsSafeModal
        isOpen={showWhatIsSafeModal}
        onClose={() => setShowWhatIsSafeModal(false)}
      />
    </div>
  );
}

function WalletNotConnected({
  onShowWhatIsSafe,
}: {
  onShowWhatIsSafe: () => void;
}) {
  return (
    <div className="max-w-2xl text-center">
      <h2 className="text-2xl text-primary font-bold font-roboto-mono text-center ">
        Connect the Safe Account you want to protect.{" "}
      </h2>
      <p className="text-lg font-roboto-mono text-center text-foreground mb-6 mt-4">
        The recovery module helps you regain control of your account if your key
        is lost or compromised by relying on trusted guardians you add to your
        account.
      </p>
      <ConnectWalletButton />
      <p className="mt-4">
        <button
          onClick={onShowWhatIsSafe}
          className="text-sm text-primary underline hover:no-underline font-roboto-mono"
        >
          What is a Safe?
        </button>
      </p>
    </div>
  );
}

function NotASafeAccount({ onShowWhatIsSafe }: { onShowWhatIsSafe: () => void }) {
  return (
    <div className="max-w-2xl text-center">
      <h2 className="text-2xl text-primary font-bold font-roboto-mono text-center ">
        Wrong Wallet Type
      </h2>
      <p className="text-lg font-roboto-mono text-center text-foreground mb-6 mt-4">
        This feature requires a Safe (smart contract wallet), but you likely connected
        with a regular wallet (EOA). Please reconnect using your Safe account.
      </p>
      <ConnectWalletButton />
      <p className="mt-4">
        <button
          onClick={onShowWhatIsSafe}
          className="text-sm text-primary underline hover:no-underline font-roboto-mono"
        >
          What is a Safe?
        </button>
      </p>
    </div>
  );
}

function LoadingScreen() {
  return <div className="w-full h-full text-center"></div>;
}
