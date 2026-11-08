import { Suspense } from "react";

import { EditJobOpeningContent } from "./_components/edit-job-opening-content";
import { EditJobOpeningSkeleton } from "./_components/edit-job-opening-skeleton";

type EditJobOpeningPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function EditJobOpeningContentFromParams({
  params,
}: EditJobOpeningPageProps) {
  const { id } = await params;

  return <EditJobOpeningContent jobOpeningId={id} />;
}

export default function EditJobOpeningPage({
  params,
}: EditJobOpeningPageProps) {
  return (
    <Suspense fallback={<EditJobOpeningSkeleton />}>
      <EditJobOpeningContentFromParams params={params} />
    </Suspense>
  );
}
