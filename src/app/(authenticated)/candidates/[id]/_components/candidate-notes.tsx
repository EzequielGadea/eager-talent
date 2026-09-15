import type { JSONContent } from "@tiptap/react";

import { NotesEditor } from "~/components/notes-editor";
import { api } from "~/lib/trpc/server";

type CandidateNotesProps = {
  candidateId: string;
};

export async function saveCandidateNote(
  candidateId: string,
  content: JSONContent,
) {
  "use server";

  const result = await api.candidateNote.save({ candidateId, content });

  return { lastModified: result.lastModified.toISOString() };
}

export async function CandidateNotes({ candidateId }: CandidateNotesProps) {
  const note = await api.candidateNote.getByCandidateId({ candidateId });
  const save = saveCandidateNote.bind(null, candidateId);

  return (
    <NotesEditor
      id={`candidate-notes-${candidateId}`}
      content={note?.content ?? null}
      lastModifiedAt={note?.lastModified.toISOString() ?? null}
      editorAriaLabel="Notas del candidato"
      onSave={save}
    />
  );
}