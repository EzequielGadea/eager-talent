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

const controlClassName =
  "h-7.5 w-7.5 rounded-lg border border-border-default bg-surface-card p-0 text-text-secondary shadow-none hover:bg-surface-sunken hover:text-text-primary";

export function ListPagination(props: {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(props.totalItems / props.pageSize));
  const currentPage = props.currentPage;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    props.onPageChange(page);
  };
  const startItem =
    props.totalItems === 0 ? 0 : (currentPage - 1) * props.pageSize + 1;
  const endItem = Math.min(currentPage * props.pageSize, props.totalItems);
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex flex-col items-center gap-3 border-t border-border-default px-4 py-3 sm:flex-row sm:justify-between">
      <p className="text-small font-normal text-text-secondary">
        Mostrando {startItem} - {endItem} de {props.totalItems}{" "}
        {props.itemLabel}
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
              className={`${controlClassName} pl-0! [&>span]:hidden [&_svg]:size-4 ${
                isFirstPage ? "pointer-events-none" : ""
              }`}
            />
          </PaginationItem>

          {currentPage >= 4 && (
            <>
              <PageLink page={1} onSelect={goToPage} />
              <PaginationEllipsis className="h-7.5 w-7.5 text-text-secondary" />
            </>
          )}

          {pages.map((page) => (
            <PaginationItem
              key={page}
              // On small screens only the current page ±1 and the edges fit.
              className={
                Math.abs(page - currentPage) > 1 &&
                page !== 1 &&
                page !== totalPages
                  ? "max-sm:hidden"
                  : undefined
              }
            >
              <PageLinkButton
                page={page}
                isActive={page === currentPage}
                onSelect={goToPage}
              />
            </PaginationItem>
          ))}

          {currentPage <= totalPages - 3 && (
            <>
              <PaginationEllipsis className="h-7.5 w-7.5 text-text-secondary" />
              <PageLink page={totalPages} onSelect={goToPage} />
            </>
          )}

          <PaginationItem>
            <PaginationNext
              aria-disabled={isLastPage}
              tabIndex={isLastPage ? -1 : undefined}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
              className={`${controlClassName} pr-0! [&>span]:hidden [&_svg]:size-4 ${
                isLastPage ? "pointer-events-none" : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function PageLink(props: { page: number; onSelect: (page: number) => void }) {
  return (
    <PaginationItem>
      <PageLinkButton
        page={props.page}
        isActive={false}
        onSelect={props.onSelect}
      />
    </PaginationItem>
  );
}

function PageLinkButton(props: {
  page: number;
  isActive: boolean;
  onSelect: (page: number) => void;
}) {
  return (
    <PaginationLink
      href="#"
      isActive={props.isActive}
      onClick={(e) => {
        e.preventDefault();
        props.onSelect(props.page);
      }}
      className={`h-7.5 w-7.5 rounded-lg border p-0 text-small shadow-none ${
        props.isActive
          ? "border-surface-dark bg-surface-dark font-semibold text-text-on-dark hover:bg-surface-dark hover:text-text-on-dark"
          : "border-border-default bg-surface-card font-normal text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
      }`}
    >
      {props.page}
    </PaginationLink>
  );
}
