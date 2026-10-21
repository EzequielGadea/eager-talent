"use client";

import type { JSONContent } from "@tiptap/react";

import { NotesEditor, type NotesEditorProps } from "~/components/notes-editor";
import { api } from "~/lib/trpc/react";
import { useApplicantProfileVisit } from "./applicant-profile-session";

type SaveApplicantNote = (
  content: JSONContent,
  options: { createEditActivity: boolean },
) => Promise<
  Awaited<ReturnType<NotesEditorProps["onSave"]>> & { activityLogged: boolean }
>;

type ApplicantNotesEditorProps = Omit<NotesEditorProps, "onSave"> & {
  applicantId: string;
  onSave: SaveApplicantNote;
};

export function ApplicantNotesEditor({
  applicantId,
  onSave,
  ...props
}: ApplicantNotesEditorProps) {
  const visitRef = useApplicantProfileVisit();
  const utils = api.useUtils();

  async function saveWithVisit(content: JSONContent) {
    const visit = visitRef.current;
    const createEditActivity = !visit.noteActivityLogged;
    // Claimed before the request, so other saves of this visit send false.
    visit.noteActivityLogged = true;

    try {
      const result = await onSave(content, { createEditActivity });
      // Nothing was logged (no real content change): the next save may log.
      if (createEditActivity && !result.activityLogged) {
        visit.noteActivityLogged = false;
      }
      // A new log exists: refresh every variant of this applicant's logs
      // (any page, with or without jobOpeningId). Not awaited so the editor
      // status is not delayed by the refetch.
      if (result.activityLogged) {
        void utils.activity.getByApplicantId.invalidate({ applicantId });
      }
      return result;
    } catch (error) {
      if (createEditActivity) visit.noteActivityLogged = false;
      throw error;
    }
  }

  return <NotesEditor {...props} onSave={saveWithVisit} />;
}
