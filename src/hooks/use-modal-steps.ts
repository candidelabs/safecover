"use client";

import { useState, useCallback } from "react";

interface UseModalStepsOptions {
  totalSteps: number;
  onFinalStep?: () => void;
  onClose?: () => void;
}

export function useModalSteps({
  totalSteps,
  onFinalStep,
  onClose,
}: UseModalStepsOptions) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onFinalStep?.();
    }
  }, [currentStep, totalSteps, onFinalStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  return {
    currentStep,
    totalSteps,
    handleNext,
    handleBack,
    reset,
    handleClose,
  };
}
