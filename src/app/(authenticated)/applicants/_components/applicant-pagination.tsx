"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { ITEMS_PER_PAGE } from "../constants";

export function ApplicantPagination(props: {
  countApplicants: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(props.countApplicants / ITEMS_PER_PAGE),
  );
  const currentPage = props.currentPage;
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    props.onPageChange?.(page);
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
    <div className="mt-4 flex items-center justify-between pb-6">
      <p className="text-sm font-medium text-dashboard-text-muted">
        Mostrando {startItem} - {endItem} de {props.countApplicants} candidatos
      </p>

      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
              className={
                "h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              }
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
                className={`h-7 w-7 rounded-md text-sm font-bold shadow-sm ${
                  page === currentPage
                    ? "bg-dashboard-dark text-white"
                    : "text-dashboard-text-muted"
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
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
              className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
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
            className={`h-7 w-7 rounded-md text-sm font-bold shadow-sm text-dashboard-text-muted`}
          >
            1
          </PaginationLink>
        </PaginationItem>
        <span>...</span>
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
        <span>...</span>
        <PaginationItem>
          <PaginationLink
            href="#"
            isActive={false}
            onClick={(e) => {
              e.preventDefault();
              props.gotoPage(props.totalPages);
            }}
            className={`h-7 w-7 rounded-md text-sm font-bold shadow-sm text-dashboard-text-muted`}
          >
            {props.totalPages}
          </PaginationLink>
        </PaginationItem>
      </>
    );
  }
  return <></>;
}
