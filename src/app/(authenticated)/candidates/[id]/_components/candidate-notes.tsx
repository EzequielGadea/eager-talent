import { api } from "~/lib/trpc/server";

import { CandidateNotesEditor } from "./candidate-notes-editor";

type CandidateNotesProps = {
  candidateId: string;
};

export async function CandidateNotes({ candidateId }: CandidateNotesProps) {
  const note = await api.candidateNote.getByCandidateId({
    candidateId,
  });

  return (
    <CandidateNotesEditor
      candidateId={candidateId}
      content={note?.content ?? null}
      lastModifiedAt={note?.lastModified.toISOString() ?? null}
    />
  );
}
