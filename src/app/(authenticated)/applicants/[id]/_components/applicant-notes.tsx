import type { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NotesEditor } from "~/components/notes-editor";
import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";
import type { Applicant } from "./applicant-details";

type ApplicantNotesProps = {
  applicantPromise: Promise<Applicant>;
};

export async function saveApplicantNote(
  applicantId: string,
  content: JSONContent,
) {
  "use server";

  const result = await api.applicantNote.save({ applicantId, content });
  revalidatePath(`/applicants/${applicantId}`);

  return {
    lastModified: result.lastModified.toISOString(),
    lastModifiedBy: result.lastModifiedBy,
  };
}

export async function ApplicantNotes({
  applicantPromise,
}: ApplicantNotesProps) {
  const applicant = await applicantPromise;
  const note = await api.applicantNote.getByApplicantId({
    applicantId: applicant.id,
  });
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        applicantNote: [note ? "update" : "create"],
      },
    },
  });
  const save = saveApplicantNote.bind(null, applicant.id);

  return (
    <NotesEditor
      content={note?.content ?? null}
      lastModifiedAt={note?.lastModified.toISOString() ?? null}
      lastModifiedBy={note?.lastModifiedBy ?? null}
      canEditNotes={permission.success}
      editorAriaLabel="Notas del candidato"
      onSave={save}
    />
  );
}
