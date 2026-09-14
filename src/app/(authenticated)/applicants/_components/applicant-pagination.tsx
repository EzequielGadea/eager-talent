'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

export function ApplicantPagination(props : {countApplicants : number}) {

    return (
        <div className="mt-4 flex items-center justify-between pb-6">
        <p className="text-sm font-medium text-dashboard-text-muted">
          Mostrando 1 - 8 de { props.countApplicants } candidatos
        </p>

        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href="#"
                isActive
                className="h-7 w-7 rounded-md bg-dashboard-dark text-sm font-bold text-white shadow-sm hover:bg-dashboard-dark-hover hover:text-white"
              >
                1
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href="#"
                className="h-7 w-7 rounded-md text-sm font-semibold text-dashboard-text-muted hover:bg-dashboard-track"
              >
                2
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
}