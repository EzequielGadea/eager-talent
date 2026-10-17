"use client";

import { useState } from "react";
import { api } from "~/lib/trpc/react";
import { Badge } from "~/components/ui/badge";
import { TagSelector } from "../../new-applicant/_components/tag-selector";
import { getTagStyles } from "~/lib/tags/get-tag-styles";

type Tag = {
  id: string;
  name: string;
  color: string | null;
};

type Props = {
  applicantId: string;
  initialTags: Tag[];
  canEdit: boolean;
};

export function EditableApplicantTags({
  applicantId,
  initialTags,
  canEdit,
}: Props) {
  const [selectedIds, setSelectedIds] = useState(
    initialTags.map((tag) => tag.id),
  );
  const [saveError, setSaveError] = useState("");

  const utils = api.useUtils();

  const { data: availableTags } = api.tag.getAllTags.useQuery(
    {},
    { enabled: canEdit },
  );

  const updateTags = api.applicant.updateApplicantTags.useMutation({
    onSuccess: async () => {
      await utils.applicant.getById.invalidate({ id: applicantId });
    },
  });

  const allTags = [
    ...initialTags,
    ...(availableTags ?? []).filter(
      (tag) => !initialTags.some((initial) => initial.id === tag.id),
    ),
  ];

  const handleChange = async (newIds: string[]) => {
    if (updateTags.isPending) return;

    const previousIds = selectedIds;

    setSelectedIds(newIds);
    setSaveError("");

    try {
      await updateTags.mutateAsync({
        applicantId,
        tagIds: newIds,
      });
    } catch {
      setSelectedIds(previousIds);
      setSaveError("No se pudieron guardar las etiquetas.");
    }
  };

  if (canEdit) {
    return (
      <div className="space-y-2">
        <div
          className={
            updateTags.isPending ? "pointer-events-none opacity-60" : undefined
          }
        >
          <TagSelector
            tags={allTags.map((tag) => ({
              ...tag,
              color: tag.color ?? "gray",
            }))}
            value={selectedIds}
            onChange={(ids) => void handleChange(ids)}
            variant="inline"
          />
        </div>

        {updateTags.isPending && (
          <p className="text-xs text-text-secondary">Guardando...</p>
        )}

        {saveError && (
          <p role="alert" className="text-xs text-danger">
            {saveError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {initialTags.length === 0 && (
        <p className="text-sm text-text-secondary">Sin etiquetas</p>
      )}

      {initialTags.map((tag) => {
        return (
          <Badge
            key={tag.id}
            variant="tag"
            className="h-auto max-w-full whitespace-normal"
            style={getTagStyles(tag.color ?? "gray")}
          >
            <span className="min-w-0 wrap-break-word">{tag.name}</span>
          </Badge>
        );
      })}
    </div>
  );
}
