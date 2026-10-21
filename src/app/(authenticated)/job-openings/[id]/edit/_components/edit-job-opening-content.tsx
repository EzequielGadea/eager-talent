import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";

import {
  jobOpeningStageTypeSchema,
  PERSISTED_TO_FORM_STAGE_TYPE,
  persistedStageTypeSchema,
  type JobOpeningStageType,
  type UpdateJobOpeningInput,
} from "~/lib/validations/job-opening";
import { api } from "~/lib/trpc/server";
import JobOpeningNotFound from "~/app/(authenticated)/job-openings/[id]/not-found";

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
    const persistedType = persistedStageTypeSchema.safeParse(stageRecord.type);
    const formType = jobOpeningStageTypeSchema.safeParse(stageRecord.type);

    const type = persistedType.success
      ? PERSISTED_TO_FORM_STAGE_TYPE[persistedType.data]
      : formType.success
        ? formType.data
        : inferStageType(name);

    return [
      {
        id:
          typeof stageRecord.id === "string" && stageRecord.id !== ""
            ? stageRecord.id
            : typeof stageRecord.key === "string" && stageRecord.key !== ""
              ? stageRecord.key
              : `stage-${index}`,
        name,
        type,
        color:
          typeof stageRecord.color === "string" &&
          stageRecord.color.trim() !== ""
            ? stageRecord.color
            : "#94a3b8",
      },
    ];
  });
}

export async function EditJobOpeningContent({
  jobOpeningId,
}: EditJobOpeningContentProps) {
  const [jobOpening, areas, seniorities, assignableUsers] = await Promise.all([
    api.jobOpening
      .fetchById({
        id: jobOpeningId,
      })
      .catch((error: unknown) => {
        if (
          error instanceof TRPCError &&
          (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
        ) {
          return null;
        }
        throw error;
      }),
    api.area.getAllAreas({}),
    api.seniority.getAllSeniorities({}),
    api.jobOpening.listAssignableUsers({}),
  ]);

  if (!jobOpening) {
    return <JobOpeningNotFound />;
  }

  if (jobOpening.status === "Closed" || jobOpening.status === "Cancelled") {
    redirect(`/job-openings/${jobOpening.id}/pipeline`);
  }

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header>
        <h1 className="font-heading text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
          Editar vacante
        </h1>
      </header>

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
    </div>
  );
}
