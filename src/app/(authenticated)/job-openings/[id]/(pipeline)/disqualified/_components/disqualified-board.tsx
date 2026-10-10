import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import type { PipelineStage } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/types";

import { DisqualifiedColumn } from "./disqualified-column";
import type { DisqualifiedApplication } from "../types";

type DisqualifiedBoardProps = {
  jobOpeningId: string;
  stages: PipelineStage[];
  applications: DisqualifiedApplication[];
  canRequalify: boolean;
};

export function DisqualifiedBoard({
  jobOpeningId,
  stages,
  applications,
  canRequalify,
}: DisqualifiedBoardProps) {
  return (
    <div className="flex flex-col gap-4">
      {applications.length === 0 && (
        <p className="text-sm text-text-secondary">
          Todavía no hay postulaciones descalificadas en esta vacante.
        </p>
      )}

      <ScrollArea className="w-full">
        <div className="flex min-w-max gap-4 pb-4">
          {stages.map((stage) => (
            <DisqualifiedColumn
              key={stage.name}
              jobOpeningId={jobOpeningId}
              stageName={stage.name}
              canRequalify={canRequalify}
              applications={applications.filter(
                (application) => application.stage === stage.name,
              )}
            />
          ))}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
