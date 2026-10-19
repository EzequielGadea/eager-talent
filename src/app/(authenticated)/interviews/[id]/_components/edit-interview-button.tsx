"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  EditInterviewDialog,
  type EditableInterview,
} from "./edit-interview-dialog";

type EditInterviewButtonProps = {
  interview: EditableInterview;
  candidateName: string;
};

export function EditInterviewButton({
  interview,
  candidateName,
}: EditInterviewButtonProps) {
  const [open, setOpen] = useState(false);

  // Remounts the form with fresh defaults once the refreshed data arrives.
  const formKey = [
    interview.exploratoryName,
    interview.stageId,
    interview.jobOpeningId,
    interview.date?.getTime(),
    interview.duration,
    interview.modality,
    interview.interviewers.map(({ id }) => id).join(","),
  ].join("|");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-full px-3 text-xs"
        style={{ touchAction: "manipulation" }}
        onClick={() => setOpen(true)}
      >
        <Pencil aria-hidden="true" />
        Editar
      </Button>

      <EditInterviewDialog
        key={formKey}
        open={open}
        onOpenChange={setOpen}
        interview={interview}
        candidateName={candidateName}
      />
    </>
  );
}
