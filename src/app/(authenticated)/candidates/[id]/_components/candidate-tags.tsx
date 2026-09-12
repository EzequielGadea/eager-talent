import { Plus, X } from "lucide-react";

type CandidateTags = {
  id: string;
  name: string;
  color: string | null;
  isSkill: boolean;
};

type CandidateTagsProps = {
  tags: CandidateTags[];
  canEditProfile: boolean;
};

export function CandidateTags({ tags, canEditProfile }: CandidateTagsProps) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
        Etiquetas
      </h2>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && !canEditProfile && (
          <p className="text-sm text-muted-foreground">Sin etiquetas</p>
        )}

        {tags.map((tag) => {
          const tagColor = tag.color ?? "#64748b";

          return (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium"
              style={{
                backgroundColor: `${tagColor}2A`,
                borderColor: `${tagColor}70`,
                color: `color-mix(in srgb, ${tagColor} 65%, black)`,
              }}
            >
              {tag.name}

              {canEditProfile && (
                <button
                  type="button"
                  aria-label={`Eliminar etiqueta ${tag.name}`}
                  className="flex items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </span>
          );
        })}

        {canEditProfile && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-4" />
            Agregar etiqueta
          </button>
        )}
      </div>
    </section>
  );
}
