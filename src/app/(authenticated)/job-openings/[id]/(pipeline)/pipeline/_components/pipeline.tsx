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
  isJobOpeningOpen: boolean;
};

export async function Pipeline({
  jobOpeningId,
  stages,
  search,
  isJobOpeningOpen,
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
        <div className="flex min-w-max gap-4 pb-4">
          {stages.map((stage, index) => (
            <Suspense key={stage.name} fallback={<PipelineColumnSkeleton />}>
              <PipelineColumn
                jobOpeningId={jobOpeningId}
                stage={stage}
                isLastStage={index === stages.length - 1}
                search={search}
                canUpdateApplication={
                  canUpdateApplication.success && isJobOpeningOpen
                }
                canCreateInterview={
                  canCreateInterview.success && isJobOpeningOpen
                }
                canDeleteInterview={
                  canDeleteInterview.success && isJobOpeningOpen
                }
              />
            </Suspense>
          ))}
        </div>
      </PipelineDndProviderClient>
    </PipelineHorizontalScroll>
  );
}
