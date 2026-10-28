"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PressableIcon from "@/components/pressable-icon";
import { supportedChains } from "@/providers/Web3Provider";
import {
  getRpcOverrides,
  saveRpcOverrides,
  validateRpcUrl,
  type RpcOverrides,
} from "@/utils/rpc-settings";
import { Server } from "lucide-react";
import { useEffect, useState } from "react";

export function RpcSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  // Read after mount: storage isn't available during static export
  const [hasOverrides, setHasOverrides] = useState(false);
  useEffect(() => {
    setHasOverrides(Object.keys(getRpcOverrides()).length > 0);
  }, []);

  return (
    <>
      <div className="relative">
        <PressableIcon
          icon={Server}
          size={18}
          onClick={() => setIsOpen(true)}
          ariaLabel="RPC settings"
        />
        {hasOverrides && (
          <span
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"
            title="Using a custom RPC"
          />
        )}
      </div>
      {isOpen && <RpcSettingsModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

function RpcSettingsModal({ onClose }: { onClose: () => void }) {
  const [drafts, setDrafts] = useState<RpcOverrides>(getRpcOverrides);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const saved = getRpcOverrides();
    const overrides: RpcOverrides = {};
    const nextErrors: Record<number, string> = {};

    await Promise.all(
      supportedChains.map(async (chain) => {
        const url = drafts[chain.id]?.trim();
        if (!url) return;
        // Only re-check URLs the user changed
        const error =
          url === saved[chain.id]
            ? undefined
            : await validateRpcUrl(url, chain.id);
        if (error) nextErrors[chain.id] = error;
        else overrides[chain.id] = url;
      })
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setIsSaving(false);
      return;
    }
    if (!saveRpcOverrides(overrides)) {
      setFormError("Couldn't save: browser storage is blocked.");
      setIsSaving(false);
      return;
    }
    // The wagmi config is built once per load, so reload to apply
    window.location.reload();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-content-background border-none rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-roboto-mono">
            RPC Settings
          </DialogTitle>
          <DialogDescription className="text-sm font-medium opacity-60 font-roboto-mono">
            Use your own RPC if the default one is blocked or unreliable. It is
            tried first, with the default RPCs as fallback. Settings stay in
            this browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1">
          {supportedChains.map((chain) => (
            <label key={chain.id} className="flex flex-col gap-1">
              <span className="text-sm font-bold font-roboto-mono">
                {chain.name}
              </span>
              <div className="flex gap-2">
                <Input
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Default RPC"
                  value={drafts[chain.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [chain.id]: e.target.value }))
                  }
                  className="font-roboto-mono"
                />
                {drafts[chain.id] && (
                  <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setDrafts((prev) => ({ ...prev, [chain.id]: "" }));
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
              {errors[chain.id] && (
                <span className="text-xs text-alert font-roboto-mono">
                  {errors[chain.id]}
                </span>
              )}
            </label>
          ))}
        </div>

        {formError && (
          <p className="text-sm text-alert font-roboto-mono">{formError}</p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Checking…" : "Save and reload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
