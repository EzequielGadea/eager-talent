import type { CSSProperties } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Empty, EmptyHeader, EmptyDescription } from "~/components/ui/empty";
import { getCandidate } from "../_lib/get-candidate";
import { Badge } from "~/components/ui/badge";

type CandidateTagsProps = { candidateId: string };

export async function CandidateTags({ candidateId }: CandidateTagsProps) {
  const { tags } = await getCandidate(candidateId);
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <h2>Etiquetas</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <Empty className="p-0">
            <EmptyHeader>
              <EmptyDescription>Sin etiquetas</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {tags.map((tag) => {
          const tagColor = tag.color ?? "var(--muted-foreground)";

          return (
            <Badge
              key={tag.id}
              variant="tag"
              className="h-auto max-w-full whitespace-normal"
              style={
                {
                  "--badge-background": `color-mix(in srgb, ${tagColor} 16%, transparent)`,
                  "--badge-border": `color-mix(in srgb, ${tagColor} 44%, transparent)`,
                  "--badge-foreground": `color-mix(in srgb, ${tagColor} 35%, var(--card-foreground))`,
                } as CSSProperties
              }
            >
              <span className="min-w-0 break-words">{tag.name}</span>
            </Badge>
          );
        })}
      </CardContent>
    </Card>
  );
}
