type CandidateTag = {
  id: string;
  name: string;
  color: string | null;
  isSkill: boolean;
};

type CandidateTagsProps = {
  tags: CandidateTag[];
};

export function CandidateTags({ tags }: CandidateTagsProps) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
        Etiquetas
      </h2>

      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin etiquetas</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: tag.color ? `${tag.color}2A` : undefined,
                borderColor: tag.color ? `${tag.color}70` : undefined,
                color: tag.color
                  ? `color-mix(in srgb, ${tag.color} 70%, black)`
                  : undefined,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
