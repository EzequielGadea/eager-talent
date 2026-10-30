"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Share2 } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ListPagination } from "~/components/list-pagination";

import type { ApplicantInfo } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { ApplicantCardList } from "./applicant-card-list";
import { HiringManagerApplicantTableHeader } from "./applicant-table";
import { HiringManagerApplicantRow } from "./hiring-manager-applicant-row";
import { TableFallback } from "./fallbacks";

export function SharedApplicantsTable(props: {
  applicantsData: ApplicantInfo[];
  countApplicants: number;
  currentPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const hasAlreadyBeenVisible = useRef(false);

  useEffect(() => {
    if (!hasAlreadyBeenVisible.current) {
      hasAlreadyBeenVisible.current = true;
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  function updatePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sharedPage", String(page));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <div className="mt-4 w-full">
      <div className="rounded-t-xl border border-dashboard-border bg-tag-purple-bg px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-tag-purple-fg">
          <Share2 className="size-3.5 shrink-0" />
          <span>Compartidos con vos · Sin vacante</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-b-xl border-x border-b border-dashboard-border bg-white shadow-sm">
        <ApplicantCardList
          applicants={props.applicantsData}
          isPending={isPending}
          emptyMessage="No hay perfiles compartidos con vos."
          isHiringManagerView
          showSharedBy
        />

        <div className="hidden w-full overflow-x-auto md:block">
          <Table className="min-w-200 table-fixed">
            <HiringManagerApplicantTableHeader showSharedBy={true} />

            <TableBody className="divide-y divide-dashboard-border">
              {isPending ? (
                <TableFallback isHiringManagerView />
              ) : props.applicantsData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-dashboard-text-muted"
                  >
                    No hay perfiles compartidos con vos.
                  </TableCell>
                </TableRow>
              ) : (
                props.applicantsData.map((applicant) => (
                  <HiringManagerApplicantRow
                    key={applicant.id}
                    applicant={applicant}
                    showSharedBy={true}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination
          totalItems={props.countApplicants}
          pageSize={ITEMS_PER_PAGE}
          currentPage={props.currentPage}
          itemLabel="candidatos"
          onPageChange={updatePage}
        />
      </div>
    </div>
  );
}
