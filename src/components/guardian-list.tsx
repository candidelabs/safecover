import { cn } from "@/lib/utils";
import { GuardianRow } from "./guardian-row";
import { STYLES } from "@/constants/styles";
import { useState } from "react";
import { Modal } from "./modal";
import ThresholdStep from "./protect-account-steps/threshold";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import ReviewStepSection from "./protect-account-steps/review";
import { useRevokeGuardians } from "@/hooks/use-revoke-guardians";
import { Address } from "viem";
import LoadingModal from "./loading-modal";
import { toast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { getEtherscanAddressLink } from "@/utils/get-etherscan-link";

export interface NewAddress {
  nickname: string;
  address: string;
  status?: string;
}

interface GuardianListProps {
  guardians: NewAddress[];
  isNewGuardianList?: boolean;
  onRemoveGuardian?: (guardian: NewAddress) => void;
  onOpenGuardianModal?: () => void;
  resetQueries: () => void;
  linkChainId?: number;
}

const totalSteps = 3;

export function GuardianList({
  guardians,
  isNewGuardianList,
  onRemoveGuardian,
  onOpenGuardianModal,
  resetQueries,
  linkChainId,
}: GuardianListProps) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isLastGuardianModalOpen, setIsLastGuardianModalOpen] = useState(false);
  const [guardianToRemove, setGuardianToRemove] = useState<NewAddress>();
  const [currentStep, setCurrentStep] = useState(1);
  const [threshold, setThreshold] = useState(1);

  const { chainId: connectedChainId } = useAccount();
  const chainId = linkChainId ?? connectedChainId;

  const {
    trigger: revokeGuardians,
    isLoading,
    loadingMessage,
    cancel,
  } = useRevokeGuardians({
    guardians: [guardianToRemove?.address as Address],
    threshold: isLastGuardianModalOpen ? 0 : threshold,
    onSuccess: () => {
      toast({
        title: "Guardian removed.",
        description: "This address will no longer be a guardian.",
      });
      setIsRemoveModalOpen(false);
      setIsLastGuardianModalOpen(false);
      setGuardianToRemove({ nickname: "", address: "" });
      setCurrentStep(1);
      resetQueries();
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleConfirmRemove();
    }
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRemoveClick = (guardian: NewAddress) => {
    setGuardianToRemove(guardian);
    if (guardians.length === 1) {
      setIsLastGuardianModalOpen(true);
      return;
    }
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (guardianToRemove && onRemoveGuardian) {
      onRemoveGuardian(guardianToRemove);
    }
    revokeGuardians();
  };

  const handleExternalLink = (address: string): void => {
    if (window && chainId) {
      window.open(getEtherscanAddressLink(Number(chainId), address));
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <GuardiansToBeRemoved
              nickname={guardianToRemove?.nickname || ""}
              address={guardianToRemove?.address || ""}
              onExternalLink={() =>
                guardianToRemove?.address &&
                handleExternalLink(guardianToRemove.address)
              }
            />
          </div>
        );

      case 2:
        return (
          <ThresholdStep
            totalGuardians={guardians.length - 1}
            currentThreshold={threshold}
            onThresholdChange={handleThresholdChange}
            isNewThreshold
          />
        );
      case 3:
        return (
          <div className="space-y-5">
            <span className="text-lg font-bold font-roboto-mono opacity-60">
              Guardians to be removed
            </span>
            <div className="space-y-5">
              <GuardiansToBeRemoved
                nickname={guardianToRemove?.nickname || ""}
                address={guardianToRemove?.address || ""}
                onExternalLink={() =>
                  guardianToRemove?.address &&
                  handleExternalLink(guardianToRemove.address)
                }
              />
            </div>
            <ReviewStepSection threshold={threshold} />
          </div>
        );
      default:
        return "";
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Remove Guardian";
      case 2:
        return "Define New Threshold";
      case 3:
        return "Review and Confirm Removal";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Removing a guardian will reduce the number of trusted accounts protecting your account. To proceed, you will need to adjust the threshold required for approvals.";
      case 2:
        return "Set a new threshold for recover approvals. The threshold determines how many guardians are required to approve recover actions.";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className={cn(STYLES.label, "grid grid-cols-[1fr,3fr,1fr] gap-4")}>
          <div>NICKNAME</div>
          <div>ADDRESS</div>
          {!isNewGuardianList && (
            <div className="text-right mr-4">APPROVAL</div>
          )}
        </div>
        <div className="space-y-2">
          {guardians.map((guardian) => (
            <GuardianRow
              key={guardian.nickname}
              guardian={guardian}
              isNewGuardianList={isNewGuardianList}
              onRemoveGuardian={() => handleRemoveClick(guardian)}
              chainId={chainId}
            />
          ))}
        </div>
      </div>
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title={getStepTitle()}
        description={getStepDescription()}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isProgress
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={isLoading}
        nextLabel={
          currentStep === 2
            ? "Finish and review"
            : currentStep === 3
            ? "Confirm Removal"
            : "Next"
        }
      >
        {getStepContent()}
      </Modal>
      <Modal
        isOpen={isLastGuardianModalOpen}
        onClose={() => setIsLastGuardianModalOpen(false)}
        title="Are you sure you want to remove this guardian?"
        description="Removing the last guardian will leave your account unprotected, interrupt any ongoing recovery processes, and block future recovery attempts."
        currentStep={2}
        totalSteps={1}
        onNext={onOpenGuardianModal}
        onBack={handleConfirmRemove}
        nextLabel="Add Guardians"
        backLabel="Confirm Removal"
        isNextDisabled={isLoading}
      >
        <div className="space-y-5">
          <p className="text-base font-bold font-roboto-mono">
            We strongly recommend adding a new guardian before proceeding.
          </p>
          <GuardiansToBeRemoved
            nickname={guardianToRemove?.nickname || ""}
            address={guardianToRemove?.address || ""}
            onExternalLink={() =>
              guardianToRemove?.address &&
              handleExternalLink(guardianToRemove.address)
            }
          />
        </div>
      </Modal>
      <LoadingModal
        loading={isLoading}
        loadingText={loadingMessage}
        onCancel={cancel}
      />
    </>
  );
}

function GuardiansToBeRemoved({
  nickname,
  address,
  onExternalLink,
}: {
  nickname: string;
  address: string;
  onExternalLink: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-[1fr,2fr]">
        <div className="flex items-center">
          <label className="text-sm font-bold font-roboto-mono opacity-50">
            NICKNAME
          </label>
        </div>
        <label className="text-sm font-bold opacity-50 font-roboto-mono ml-2">
          ADDRESS
        </label>
      </div>
      <div className="grid grid-cols-[1fr,2fr] gap-2">
        <Input readOnly value={nickname} className={STYLES.input} />
        <div className="flex flex-1 gap-2 items-center">
          <Input
            readOnly
            value={address}
            className={cn(STYLES.input, "flex-1")}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-background group"
            onClick={onExternalLink}
            type="button"
          >
            <ExternalLink
              size={16}
              className="opacity-50 group-hover:opacity-100"
            />
          </Button>
        </div>
      </div>
    </>
  );
}
