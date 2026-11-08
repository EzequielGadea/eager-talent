"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ListPagination } from "~/components/list-pagination";

export function UsersPagination(props: {
  totalUsers: number;
  pageSize: number;
  currentPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updatePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <ListPagination
      totalItems={props.totalUsers}
      pageSize={props.pageSize}
      currentPage={props.currentPage}
      itemLabel="usuarios"
      onPageChange={updatePage}
    />
  );
}
