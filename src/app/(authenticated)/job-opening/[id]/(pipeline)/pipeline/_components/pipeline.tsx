import { headers } from "next/headers";
import { Suspense } from "react";

import { auth } from "~/lib/auth";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

import { PipelineColumn } from "./pipeline-column";
import { PipelineColumnSkeleton } from "./pipeline-column-skeleton";
import type { PipelineStage } from "./types";
import { PipelineDndProviderClient } from "./pipeline-dnd-provider-client";

type PipelineProps = {
  jobOpeningId: string;
  stages: PipelineStage[];
};

export async function Pipeline({ jobOpeningId, stages }: PipelineProps) {
  const requestHeaders = await headers();

  const [canUpdateApplication, canCreateInterview] = await Promise.all([
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
  ]);

  return (
    <ScrollArea className="w-full">
      <PipelineDndProviderClient jobOpeningId={jobOpeningId}>
        <div className="flex min-w-max gap-4 pb-4">
          {stages.map((stage) => (
            <Suspense key={stage.name} fallback={<PipelineColumnSkeleton />}>
              <PipelineColumn
                jobOpeningId={jobOpeningId}
                stage={stage}
                canUpdateApplication={canUpdateApplication.success}
                canCreateInterview={canCreateInterview.success}
              />
            </Suspense>
          ))}
        </div>
      </PipelineDndProviderClient>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
