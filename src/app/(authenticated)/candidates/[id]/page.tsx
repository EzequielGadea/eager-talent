import { Suspense } from "react";

import Loading from "~/components/ui/loading";
import { CandidateDetails } from "./_components/candidate-details";

type CandidatePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CandidatePage({
  params,
  searchParams,
}: CandidatePageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CandidateDetails params={params} searchParams={searchParams} />
    </Suspense>
  );
}
