import { headers } from "next/headers";
import { Suspense } from "react";

import { auth } from "~/lib/auth";

import { PipelineHorizontalScroll } from "../../_components/pipeline-horizontal-scroll";
import { PipelineColumn } from "./pipeline-column";
import { PipelineColumnSkeleton } from "./pipeline-column-skeleton";
import type { PipelineStage } from "./types";
import { PipelineDndProviderClient } from "./pipeline-dnd-provider-client";

type PipelineProps = {
  jobOpeningId: string;
  stages: PipelineStage[];
  search?: string;
};

export async function Pipeline({
  jobOpeningId,
  stages,
  search,
}: PipelineProps) {
  const requestHeaders = await headers();

  const [canUpdateApplication, canCreateInterview, canDeleteInterview] =
    await Promise.all([
      auth.api.hasPermission({
        headers: requestHeaders,
        body: {
          permissions: {
            application: ["update"],
          },
        },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: {
          permissions: {
            interview: ["create"],
          },
        },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: {
          permissions: {
            interview: ["delete"],
          },
        },
      }),
    ]);

  return (
    <PipelineHorizontalScroll>
      <PipelineDndProviderClient jobOpeningId={jobOpeningId}>
        <div className="flex flex-col gap-4 pb-4 sm:min-w-max sm:flex-row">
          {stages.map((stage, index) => (
            <Suspense key={stage.name} fallback={<PipelineColumnSkeleton />}>
              <PipelineColumn
                jobOpeningId={jobOpeningId}
                stage={stage}
                isLastStage={index === stages.length - 1}
                search={search}
                canUpdateApplication={canUpdateApplication.success}
                canCreateInterview={canCreateInterview.success}
                canDeleteInterview={canDeleteInterview.success}
              />
            </Suspense>
          ))}
        </div>
      </PipelineDndProviderClient>
    </PipelineHorizontalScroll>
  );
}
