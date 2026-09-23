"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";

import type { AvailableApplicant } from "./add-applicant-types";
import { AddApplicantApplicationForm } from "./add-applicant-application-form";
import { AddApplicantSelection } from "./add-applicant-selection";

type AddApplicantDialogProps = {
  jobOpeningId: string;
};

type Step = "select" | "application";

export function AddApplicantDialog({ jobOpeningId }: AddApplicantDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [selectedApplicant, setSelectedApplicant] =
    useState<AvailableApplicant | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setStep("select");
      setSelectedApplicant(null);
    }
  }

  function handleSelectApplicant(applicant: AvailableApplicant) {
    setSelectedApplicant(applicant);
    setStep("application");
  }

  function handleSuccess() {
    setOpen(false);
    setStep("select");
    setSelectedApplicant(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        className="h-10 gap-2 rounded-full px-5"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Candidato
      </Button>

      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden p-0">
        {step === "select" ? (
          <>
            <div className="border-b border-border-default px-6 py-5">
              <DialogTitle className="text-lg font-semibold text-text-primary">
                Agregar Candidato
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-text-secondary">
                Seleccioná un candidato para agregarlo a esta vacante.
              </DialogDescription>
            </div>

            <AddApplicantSelection
              jobOpeningId={jobOpeningId}
              onSelect={handleSelectApplicant}
            />
          </>
        ) : selectedApplicant ? (
          <AddApplicantApplicationForm
            jobOpeningId={jobOpeningId}
            applicant={selectedApplicant}
            onBack={() => setStep("select")}
            onSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
