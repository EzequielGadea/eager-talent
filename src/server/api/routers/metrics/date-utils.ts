import { tz } from "@date-fns/tz";
import { differenceInCalendarDays } from "date-fns";

const utcContext = { in: tz("UTC") } as const;

export function differenceInMetricDays(laterDate: Date, earlierDate: Date) {
  return differenceInCalendarDays(laterDate, earlierDate, utcContext);
}
