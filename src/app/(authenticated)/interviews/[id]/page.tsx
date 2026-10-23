import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import { InterviewDetails } from "./_components/interview-details";
import { InterviewHeader } from "./_components/interview-header";
import { InterviewNotes } from "./_components/interview-notes";
import {
  InterviewDetailsSkeleton,
  InterviewHeaderSkeleton,
  InterviewNotesSkeleton,
  InterviewPageSkeleton,
} from "./_components/interview-page-skeleton";
import { InterviewSessionProvider } from "./_components/interview-session";

type InterviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function InterviewPage({ params }: InterviewPageProps) {
  return (
    <Suspense fallback={<InterviewPageSkeleton />}>
      <InterviewPageContent params={params} />
    </Suspense>
  );
}

async function InterviewPageContent({ params }: InterviewPageProps) {
  const { id } = await params;
  const interviewPromise = api.interview
    .getById({ id })
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        notFound();
      }
      throw error;
    });

  return (
    <InterviewSessionProvider key={id}>
      <div className="flex min-w-0 flex-col gap-4 selection:bg-tag-green-bg selection:text-tag-green-fg">
        <Suspense fallback={<InterviewHeaderSkeleton />}>
          <InterviewHeader interviewPromise={interviewPromise} />
        </Suspense>

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,480px)]">
          <Suspense fallback={<InterviewNotesSkeleton />}>
            <InterviewNotes interviewPromise={interviewPromise} />
          </Suspense>

          <aside className="flex min-w-0 flex-col gap-4">
            <Suspense fallback={<InterviewDetailsSkeleton />}>
              <InterviewDetails interviewPromise={interviewPromise} />
            </Suspense>
          </aside>
        </div>
      </div>
    </InterviewSessionProvider>
  );
}
