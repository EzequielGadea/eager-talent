import type { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";
import { InterviewNotesEditor } from "./interview-notes-editor";

type Interview = Awaited<ReturnType<typeof api.interview.getById>>;

type InterviewNotesProps = {
  interviewPromise: Promise<Interview>;
};

export async function saveInterviewNote(
  interviewId: string,
  content: JSONContent,
  { createEditActivity }: { createEditActivity: boolean },
) {
  "use server";

  const result = await api.interviewNote.save({
    interviewId,
    content,
    createEditActivity,
  });
  revalidatePath(`/interviews/${interviewId}`);

  return {
    lastModified: result.lastModified.toISOString(),
    lastModifiedBy: result.lastModifiedBy,
    activityLogged: result.activityLogged,
  };
}

export async function InterviewNotes({
  interviewPromise,
}: InterviewNotesProps) {
  const interview = await interviewPromise;
  const requestHeaders = await headers();
  const [note, session] = await Promise.all([
    api.interviewNote.getByInterviewId({ interviewId: interview.id }),
    auth.api.getSession({ headers: requestHeaders }),
  ]);
  const [canModifyAll, canModifyAssigned] = await Promise.all([
    auth.api.hasPermission({
      headers: requestHeaders,
      body: {
        permissions: { interviewNote: [note ? "update" : "create"] },
      },
    }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: {
        permissions: {
          interviewNote: [note ? "updateAssigned" : "createAssigned"],
        },
      },
    }),
  ]);
  const isAssigned = interview.interviewers.some(
    (interviewer) => interviewer.id === session?.user.id,
  );
  const save = saveInterviewNote.bind(null, interview.id);

  return (
    <InterviewNotesEditor
      applicantId={interview.applicantId}
      content={note?.content ?? null}
      lastModifiedAt={note?.lastModified.toISOString() ?? null}
      lastModifiedBy={note?.lastModifiedBy ?? null}
      canEditNotes={
        canModifyAll.success || (canModifyAssigned.success && isAssigned)
      }
      title="Notas del entrevistador"
      editorAriaLabel="Notas de la entrevista"
      editorClassName="h-130 xl:h-[calc(100svh-24rem)] xl:min-h-130"
      onSave={save}
    />
  );
}
