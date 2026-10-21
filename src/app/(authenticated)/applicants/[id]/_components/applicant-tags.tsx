import { auth } from "~/lib/auth";
import { headers } from "next/headers";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import type { api } from "~/lib/trpc/server";

import { EditableApplicantTags } from "./editable-applicant-tags";

type ApplicantPromise = Promise<
  Awaited<ReturnType<typeof api.applicant.getById>>
>;

type ApplicantTagsProps = {
  applicantPromise: ApplicantPromise;
};

export async function ApplicantTags({ applicantPromise }: ApplicantTagsProps) {
  const applicant = await applicantPromise;

  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        applicant: ["update"],
      },
    },
  });

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <h2>Etiquetas</h2>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <EditableApplicantTags
          applicantId={applicant.id}
          initialTags={applicant.tags}
          canEdit={permission.success}
        />
      </CardContent>
    </Card>
  );
}
