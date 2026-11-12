"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { ChartContainer } from "~/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type Motives =
  inferRouterOutputs<AppRouter>["metrics"]["getMetricsSummary"]["disqualificationMotives"];
const COLORS = [
  "var(--accent-green)",
  "var(--accent-purple)",
  "var(--info)",
  "var(--warning)",
  "var(--accent-purple-strong)",
  "var(--text-tertiary)",
];

export function DisqualificationChart({
  motives,
  isLoading,
}: {
  motives: Motives;
  isLoading: boolean;
}) {
  const maxValue = Math.max(
    10,
    Math.ceil(Math.max(...motives.map((item) => item.percentage), 0) / 10) * 10,
  );
  const ticks = Array.from(
    { length: maxValue / 10 + 1 },
    (_, index) => index * 10,
  );

  return (
    <Card className="h-full gap-0">
      <CardContent className="flex flex-col">
        <CardTitle>Motivos de descalificación</CardTitle>
        {isLoading ? (
          <ChartSkeleton />
        ) : motives.length === 0 ? (
          <EmptyChart message="Todavía no hay postulaciones descalificadas con un motivo registrado." />
        ) : (
          <>
            <div className="mt-4 flex h-64 shrink-0 items-center justify-center">
              <ChartContainer
                className="h-56 w-full"
                label="Porcentaje de postulaciones por motivo de descalificación"
              >
                <BarChart
                  data={motives}
                  margin={{ top: 12, right: 4, bottom: 0, left: 0 }}
                  barCategoryGap={10}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border-default)"
                  />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    height={28}
                    tickFormatter={(value: string) =>
                      value.length > 10 ? `${value.slice(0, 9)}…` : value
                    }
                  />
                  <YAxis
                    type="number"
                    domain={[0, maxValue]}
                    ticks={ticks}
                    interval={0}
                    width={46}
                    tickMargin={16}
                    tickFormatter={(value: number) => `${value}%`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value) => [
                      `${Number(value).toFixed(1)} %`,
                      "Porcentaje",
                    ]}
                  />
                  <Bar
                    dataKey="percentage"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={58}
                  >
                    {motives.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
            <DistributionTable label="Motivo" items={motives} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className="mt-4 flex min-h-[21rem] flex-col gap-4"
      role="status"
      aria-label="Cargando métricas"
    >
      <span className="sr-only">Cargando métricas</span>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <Empty className="mt-4 min-h-56 border-0">
      <EmptyHeader>
        <EmptyTitle>No hay datos para mostrar</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function DistributionTable({
  label,
  items,
}: {
  label: "Motivo" | "Fuente";
  items: Array<{ name: string; percentage: number }>;
}) {
  return (
    <table
      className="mt-2 w-full table-fixed border-collapse"
      aria-label={`Distribución por ${label.toLowerCase()}`}
    >
      <thead>
        <tr>
          <th
            scope="col"
            className="px-0.5 py-1.5 text-left text-label font-bold tracking-wider text-text-tertiary uppercase"
          >
            {label}
          </th>
          <th
            scope="col"
            className="w-16 px-0.5 py-1.5 text-right text-label font-bold tracking-wider text-text-tertiary uppercase"
          >
            %
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.name} className="border-t border-border-default">
            <td className="px-0.5 py-2.75 text-small text-text-primary">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-xs"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="min-w-0 break-words">{item.name}</span>
              </span>
            </td>
            <td className="px-0.5 py-2.75 text-right text-small font-semibold text-text-primary tabular-nums">
              {Math.round(item.percentage)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { DistributionTable };
