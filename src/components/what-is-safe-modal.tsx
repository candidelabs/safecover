"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, KeyRound, ExternalLink } from "lucide-react";

interface WhatIsSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatIsSafeModal({ isOpen, onClose }: WhatIsSafeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-content-background border-none rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-roboto-mono text-center">
            What is a Safe?
          </DialogTitle>
          <DialogDescription className="text-base font-medium opacity-70 font-roboto-mono text-center">
            A Safe (formerly Gnosis Safe) is a smart contract wallet that provides
            enhanced security and recovery options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3 items-start">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold font-roboto-mono">Multi-signature Security</p>
              <p className="text-sm opacity-70 font-roboto-mono">
                Requires multiple approvals for transactions
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="bg-primary/10 p-2 rounded-lg">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold font-roboto-mono">Account Recovery</p>
              <p className="text-sm opacity-70 font-roboto-mono">
                Recover access through trusted guardians if you lose your keys
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open("https://safe.global/", "_blank")}
          >
            Learn more on Safe.global
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
