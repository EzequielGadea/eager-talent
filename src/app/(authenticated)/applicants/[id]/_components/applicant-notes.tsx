import type { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";
import { ApplicantNotesEditor } from "./applicant-notes-editor";

type Applicant = Awaited<ReturnType<typeof api.applicant.getById>>;

type ApplicantNotesProps = {
  applicantPromise: Promise<Applicant>;
};

export async function saveApplicantNote(
  applicantId: string,
  content: JSONContent,
  { createEditActivity }: { createEditActivity: boolean },
) {
  "use server";

  const result = await api.applicantNote.save({
    applicantId,
    content,
    createEditActivity,
  });
  revalidatePath(`/applicants/${applicantId}`);

  return {
    lastModified: result.lastModified.toISOString(),
    lastModifiedBy: result.lastModifiedBy,
    activityLogged: result.activityLogged,
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
    <ApplicantNotesEditor
      applicantId={applicant.id}
      content={note?.content ?? null}
      lastModifiedAt={note?.lastModified.toISOString() ?? null}
      lastModifiedBy={note?.lastModifiedBy ?? null}
      canEditNotes={permission.success}
      editorAriaLabel="Notas del candidato"
      onSave={save}
    />
  );
}
