import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "~/components/ui/table";

import { UsersTableHeader } from "./users-table-header";

export function UsersTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-surface-card">
      <Table >
        <UsersTableHeader />

        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow
              key={index}
              className="border-b border-border-default last:border-b-0"
            >
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>

              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-44" />
              </TableCell>

              <TableCell className="px-4 py-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>

              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </TableCell>

              <TableCell className="px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>

              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </TableCell>

              <TableCell className="px-4 py-3">
                <Skeleton className="ml-auto size-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}