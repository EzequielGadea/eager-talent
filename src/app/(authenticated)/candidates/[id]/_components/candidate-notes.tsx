import type { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { NotesEditor } from "~/components/notes-editor";
import { api } from "~/lib/trpc/server";
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

  return { lastModified: result.lastModified.toISOString() };
}

export async function CandidateNotes({
  candidatePromise,
}: CandidateNotesProps) {
  const candidate = await candidatePromise;
  const note = await api.candidateNote.getByCandidateId({
    candidateId: candidate.id,
  });
  const save = saveCandidateNote.bind(null, candidate.id);

  return (
    <NotesEditor
      id={`candidate-notes-${candidate.id}`}
      content={note?.content ?? null}
      lastModifiedAt={note?.lastModified.toISOString() ?? null}
      editorAriaLabel="Notas del candidato"
      onSave={save}
    />
  );
}