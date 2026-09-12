import { Suspense } from "react";

import Loading from "~/components/ui/loading";
import { CandidateDetails } from "./_components/candidate-details";

type CandidatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function CandidatePage({ params }: CandidatePageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CandidateDetails params={params} />
    </Suspense>
  );
}
