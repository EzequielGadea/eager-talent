"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { ITEMS_PER_PAGE } from "../constants";

export function ApplicantPagination(props: {
  countApplicants: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(props.countApplicants / ITEMS_PER_PAGE),
  );
  const currentPage = props.currentPage;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    props.onPageChange(page);
  };
  const startItem =
    props.countApplicants === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, props.countApplicants);
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pages = [
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
  ];

  return (
    <div className="flex items-center justify-between border-t border-dashboard-border px-4 py-3">
      <p className="text-[13px] font-normal leading-5 text-dashboard-text-muted">
        Mostrando {startItem} - {endItem} de {props.countApplicants} candidatos
      </p>

      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={isFirstPage}
              tabIndex={isFirstPage ? -1 : undefined}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
              className={`h-7.5 w-7.5 rounded-lg border border-dashboard-border bg-white p-0 pl-0! text-dashboard-text-muted shadow-none hover:bg-dashboard-track [&>span]:hidden [&_svg]:size-4 ${
                isFirstPage ? "pointer-events-none" : ""
              }`}
            />
          </PaginationItem>
          <FirstPage currentPage={currentPage} gotoPage={goToPage} />

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(page);
                }}
                className={`h-7.5 w-7.5 rounded-lg border p-0 text-[13px] shadow-none ${
                  page === currentPage
                    ? "border-dashboard-dark bg-dashboard-dark font-semibold text-white hover:bg-dashboard-dark"
                    : "border-dashboard-border bg-white font-normal text-dashboard-text-muted hover:bg-dashboard-track"
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <LastPage
            currentPage={currentPage}
            totalPages={totalPages}
            gotoPage={goToPage}
          />

          <PaginationItem>
            <PaginationNext
              aria-disabled={isLastPage}
              tabIndex={isLastPage ? -1 : undefined}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
              className={`h-7.5 w-7.5 rounded-lg border border-dashboard-border bg-white p-0 pr-0! text-dashboard-text-muted shadow-none hover:bg-dashboard-track [&>span]:hidden [&_svg]:size-4 ${
                isLastPage ? "pointer-events-none" : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function FirstPage(props: {
  currentPage: number;
  gotoPage: (page: number) => void;
}) {
  if (props.currentPage >= 4) {
    return (
      <>
        <PaginationItem>
          <PaginationLink
            href="#"
            isActive={false}
            onClick={(e) => {
              e.preventDefault();
              props.gotoPage(1);
            }}
            className="h-7.5 w-7.5 rounded-lg border border-dashboard-border bg-white p-0 text-[13px] font-normal text-dashboard-text-muted shadow-none hover:bg-dashboard-track"
          >
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationEllipsis className="h-7.5 w-7.5 text-dashboard-text-muted" />
      </>
    );
  }
  return <></>;
}

function LastPage(props: {
  currentPage: number;
  totalPages: number;
  gotoPage: (page: number) => void;
}) {
  if (props.currentPage <= props.totalPages - 3) {
    return (
      <>
        <PaginationEllipsis className="h-7.5 w-7.5 text-dashboard-text-muted" />
        <PaginationItem>
          <PaginationLink
            href="#"
            isActive={false}
            onClick={(e) => {
              e.preventDefault();
              props.gotoPage(props.totalPages);
            }}
            className="h-7.5 w-7.5 rounded-lg border border-dashboard-border bg-white p-0 text-[13px] font-normal text-dashboard-text-muted shadow-none hover:bg-dashboard-track"
          >
            {props.totalPages}
          </PaginationLink>
        </PaginationItem>
      </>
    );
  }
  return <></>;
}
