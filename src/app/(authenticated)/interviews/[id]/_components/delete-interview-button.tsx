"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { DeleteInterviewDialog } from "./delete-interview-dialog";

type DeleteInterviewButtonProps = {
  interviewId: string;
  interviewName: string;
  applicantId: string;
};

export function DeleteInterviewButton({
  interviewId,
  interviewName,
  applicantId,
}: DeleteInterviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="w-full gap-1.5 border border-destructive"
        style={{ touchAction: "manipulation" }}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" />
        Eliminar entrevista
      </Button>

      <DeleteInterviewDialog
        open={open}
        onOpenChange={setOpen}
        interviewId={interviewId}
        interviewName={interviewName}
        applicantId={applicantId}
      />
    </>
  );
}
