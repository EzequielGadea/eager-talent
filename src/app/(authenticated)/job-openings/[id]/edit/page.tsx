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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header>
        <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
          Editar vacante
        </h1>
      </header>

      <Suspense fallback={<EditJobOpeningSkeleton />}>
        <EditJobOpeningContentFromParams params={params} />
      </Suspense>
    </div>
  );
}
