"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { ChartContainer } from "~/components/ui/chart";
import {
  ChartSkeleton,
  DistributionTable,
  EmptyChart,
} from "./disqualification-chart";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type Sources =
  inferRouterOutputs<AppRouter>["metrics"]["getMetricsSummary"]["applicationSources"];
const COLORS = [
  "var(--accent-green)",
  "var(--accent-purple)",
  "var(--info)",
  "var(--warning)",
  "var(--accent-purple-strong)",
  "var(--text-tertiary)",
];

export function SourcesChart({
  sources,
  isLoading,
}: {
  sources: Sources;
  isLoading: boolean;
}) {
  return (
    <Card className="h-full gap-0">
      <CardContent className="flex flex-col">
        <CardTitle>Fuentes de postulación</CardTitle>
        {isLoading ? (
          <ChartSkeleton />
        ) : sources.length === 0 ? (
          <EmptyChart message="Todavía no hay postulaciones asociadas a vacantes cerradas." />
        ) : (
          <>
            <div className="mt-4 flex h-64 shrink-0 items-center justify-center">
              <ChartContainer
                className="size-56 shrink-0"
                label="Distribución de postulaciones por fuente"
              >
                <PieChart>
                  <Tooltip
                    formatter={(value) => [`${Number(value)} postulaciones`]}
                  />
                  <Pie
                    data={sources}
                    dataKey="count"
                    nameKey="name"
                    innerRadius="47.6%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {sources.map((source, index) => (
                      <Cell
                        key={source.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <DistributionTable label="Fuente" items={sources} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
