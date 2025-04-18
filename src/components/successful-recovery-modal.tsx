"use client";
import AddressSection from "./address-section";
import { STYLES } from "@/constants/styles";
import { Address } from "viem";
import { Modal } from "./modal";

export default function SuccessfulRecoveryModal({
  isOpen,
  setIsOpen,
  safeAddress,
  newOwners,
  newThreshold,
}: {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean) => void;
  safeAddress: Address;
  newOwners: Address[];
  newThreshold: number;
}) {
  const handleNext = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex flex-1 items-center justify-center mx-8">
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Successful recovery!"
        description="The recovery process was approved and it's being executed. The signers will be updated in a few seconds."
        currentStep={1}
        totalSteps={1}
        onNext={handleNext}
        nextLabel={"Close"}
        isNextDisabled={false}
        isProgress={false}
      >
        <div className="space-y-5">
          <div className="flex flex-row justify-start">
            <div className="w-2 min-h-max border-l-2 border-solid border-white opacity-20"></div>
            <div className="flex flex-col gap-5">
              <AddressSection title="Safe Account" addresses={[safeAddress]} />
              <AddressSection title="New Signers" addresses={newOwners} />
              <div className="space-y-3">
                <p className={STYLES.modalSectionTitle}>New Threshold</p>
                <p className={STYLES.modalSectionDescription}>
                  Minimum {newThreshold} signers to approve transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
