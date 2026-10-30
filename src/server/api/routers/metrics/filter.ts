import { tz } from "@date-fns/tz";
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";

import type { Prisma } from "~/generated/prisma/client";
import type {
  MetricsFilterInput,
  MetricsPeriod,
} from "~/lib/validations/metrics";

const utc = tz("UTC");
const utcContext = { in: utc } as const;

type DateRange = {
  gte: Date;
  lte: Date;
};

function getSemesterRange(referenceDate: Date): DateRange {
  const utcDate = utc(referenceDate);
  const startMonth = utcDate.getMonth() < 6 ? 0 : 6;
  const semesterStart = utc(
    new Date(Date.UTC(utcDate.getFullYear(), startMonth, 1)),
  );
  const semesterEndReference = utc(
    new Date(Date.UTC(utcDate.getFullYear(), startMonth + 5, 1)),
  );

  return {
    gte: startOfMonth(semesterStart, utcContext),
    lte: endOfMonth(semesterEndReference, utcContext),
  };
}

export function getMetricsClosingDateRange(
  period: MetricsPeriod,
  now = new Date(),
): DateRange | undefined {
  switch (period) {
    case "currentMonth":
      return {
        gte: startOfMonth(now, utcContext),
        lte: endOfMonth(now, utcContext),
      };
    case "previousMonth": {
      const previousMonth = subMonths(now, 1, utcContext);
      return {
        gte: startOfMonth(previousMonth, utcContext),
        lte: endOfMonth(previousMonth, utcContext),
      };
    }
    case "currentQuarter":
      return {
        gte: startOfQuarter(now, utcContext),
        lte: endOfQuarter(now, utcContext),
      };
    case "previousQuarter": {
      const previousQuarter = subQuarters(now, 1, utcContext);
      return {
        gte: startOfQuarter(previousQuarter, utcContext),
        lte: endOfQuarter(previousQuarter, utcContext),
      };
    }
    case "currentSemester":
      return getSemesterRange(now);
    case "previousSemester":
      return getSemesterRange(subMonths(now, 6, utcContext));
    case "currentYear":
      return {
        gte: startOfYear(now, utcContext),
        lte: endOfYear(now, utcContext),
      };
    case "previousYear": {
      const previousYear = subYears(now, 1, utcContext);
      return {
        gte: startOfYear(previousYear, utcContext),
        lte: endOfYear(previousYear, utcContext),
      };
    }
    case "all":
      return undefined;
  }
}

export function getMetricsJobOpeningWhere(
  filters: MetricsFilterInput,
): Prisma.JobOpeningWhereInput {
  const closingDateRange = getMetricsClosingDateRange(filters.period);

  return {
    status: "Closed",
    closingDate: {
      not: null,
      ...closingDateRange,
    },
    ...(filters.areaId ? { areaId: filters.areaId } : {}),
  };
}
