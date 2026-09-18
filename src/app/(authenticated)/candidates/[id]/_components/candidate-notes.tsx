import type { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NotesEditor } from "~/components/notes-editor";
import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";
import type { Candidate } from "./candidate-details";

type CandidateNotesProps = {
  candidatePromise: Promise<Candidate>;
};

export async function saveCandidateNote(
  candidateId: string,
  content: JSONContent,
) {
  "use server";

  const result = await api.candidateNote.save({ candidateId, content });
  revalidatePath(`/candidates/${candidateId}`);

  return {
    lastModified: result.lastModified.toISOString(),
    lastModifiedBy: result.lastModifiedBy,
  };
}

export async function CandidateNotes({
  candidatePromise,
}: CandidateNotesProps) {
  const candidate = await candidatePromise;
  const note = await api.candidateNote.getByCandidateId({
    candidateId: candidate.id,
  });
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        applicantNote: [note ? "update" : "create"],
      },
    },
  });
  const save = saveCandidateNote.bind(null, candidate.id);

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
