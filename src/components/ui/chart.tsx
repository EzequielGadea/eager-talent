"use client";

import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

type ChartContainerProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

export function ChartContainer({
  children,
  className,
  label,
}: ChartContainerProps) {
  return (
    <div role="img" aria-label={label} className={className} data-slot="chart">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
