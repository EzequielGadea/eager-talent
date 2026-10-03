import {
  jobOpeningStageTypeSchema,
  type JobOpeningStageType,
  type UpdateJobOpeningInput,
} from "~/lib/validations/job-opening";
import { api } from "~/lib/trpc/server";

import { EditJobOpeningForm } from "./edit-job-opening-form";
import { JobOpeningDatesCard } from "./job-opening-dates-card";
import { JobOpeningDetailsCard } from "./job-opening-details-card";
import { JobOpeningHiringManagersCard } from "./job-opening-hiring-managers-card";
import { JobOpeningProcessCard } from "./job-opening-process-card";

type EditJobOpeningContentProps = {
  jobOpeningId: string;
};

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeLocation(
  location: string,
): UpdateJobOpeningInput["location"] {
  const normalizedLocation = location.toLocaleLowerCase("es");

  if (normalizedLocation.includes("argentina")) {
    return "Argentina";
  }

  if (normalizedLocation.includes("uruguay")) {
    return "Uruguay";
  }

  return "Indiferente";
}

function inferStageType(name: string): JobOpeningStageType {
  const normalizedName = name.toLocaleLowerCase("es");

  if (normalizedName.includes("contratad")) {
    return "hired";
  }

  if (normalizedName.includes("oferta") || normalizedName.includes("ofertad")) {
    return "offer";
  }

  if (normalizedName.includes("entrevista")) {
    return "interview";
  }

  return "none";
}

function normalizeStages(value: unknown): UpdateJobOpeningInput["stages"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((stage, index) => {
    if (typeof stage !== "object" || stage === null || Array.isArray(stage)) {
      return [];
    }

    const stageRecord = stage as Record<string, unknown>;

    if (
      typeof stageRecord.name !== "string" ||
      stageRecord.name.trim() === ""
    ) {
      return [];
    }

    const name = stageRecord.name.trim();
    const parsedType = jobOpeningStageTypeSchema.safeParse(stageRecord.type);

    const type = parsedType.success ? parsedType.data : inferStageType(name);

    return [
      {
        id:
          typeof stageRecord.id === "string" && stageRecord.id !== ""
            ? stageRecord.id
            : `stage-${index}`,
        name,
        type,
      },
    ];
  });
}

export async function EditJobOpeningContent({
  jobOpeningId,
}: EditJobOpeningContentProps) {
  const [jobOpening, areas, seniorities, assignableUsers] = await Promise.all([
    api.jobOpening.fetchById({
      id: jobOpeningId,
    }),
    api.area.getAllAreas({}),
    api.seniority.getAllSeniorities({}),
    api.jobOpening.listAssignableUsers({}),
  ]);

  const defaultValues: UpdateJobOpeningInput = {
    id: jobOpening.id,
    name: jobOpening.name,
    status: jobOpening.status,
    areaId: jobOpening.area.id,
    seniorityIds: jobOpening.seniorities.map((seniority) => seniority.id),
    location: normalizeLocation(jobOpening.location),
    openingDate: formatDateOnly(jobOpening.openingDate),
    targetClosingDate: formatDateOnly(jobOpening.targetClosingDate),
    stages: normalizeStages(jobOpening.stages),
    hiringManagerIds: jobOpening.hiringManagers.map(
      (hiringManager) => hiringManager.id,
    ),
  };

  return (
    <EditJobOpeningForm defaultValues={defaultValues}>
      <JobOpeningDetailsCard
        areaOptions={areas}
        seniorityOptions={seniorities}
      />

      <JobOpeningDatesCard />

      <JobOpeningProcessCard
        canEditStages={
          !jobOpening.hasBeenOpened && jobOpening.status !== "Open"
        }
      />

      <JobOpeningHiringManagersCard
        initialHiringManagers={jobOpening.hiringManagers}
        hiringManagerOptions={assignableUsers}
      />
    </EditJobOpeningForm>
  );
}
