type CandidateTags = {
  id: string;
  name: string;
  color: string | null;
};

type CandidateTagsProps = {
  tags: CandidateTags[];
};

export function CandidateTags({ tags }: CandidateTagsProps) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
        Etiquetas
      </h2>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
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
            </span>
          );
        })}
      </div>
    </section>
  );
}
