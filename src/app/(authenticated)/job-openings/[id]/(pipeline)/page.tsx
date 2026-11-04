import { Suspense } from "react";
import { redirect } from "next/navigation";

import { JobOpeningLayoutSkeleton } from "./_components/job-opening-layout-skeleton";

type JobOpeningPageProps = {
  params: Promise<{ id: string }>;
};

export default function JobOpeningPage({ params }: JobOpeningPageProps) {
  return (
    <Suspense fallback={<JobOpeningLayoutSkeleton />}>
      <JobOpeningRedirect params={params} />
    </Suspense>
  );
}

async function JobOpeningRedirect({ params }: JobOpeningPageProps) {
  const { id } = await params;

  return redirect(`/job-openings/${id}/pipeline`);
}
