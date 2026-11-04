import { Suspense } from "react";
import { connection } from "next/server";
import AcceptInvitePage from "./_components/accept-invite-form";
import { InvalidToken } from "./_components/invalid-token";
import { InviteShell } from "./_components/invite-shell";
import { Skeleton } from "~/components/ui/skeleton";
import { prisma } from "~/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { tz } from "@date-fns/tz";

const ROLE_LABELS: Record<string, string> = {
  hiringManager: "Hiring Manager",
  hiring_manager: "Hiring Manager",
  recruiter: "Recruiter",
};

function formatExpiry(date: Date) {
  return format(date, "d 'de' MMMM", {
    locale: es,
    in: tz("America/Montevideo"),
  });
}

function formatRole(role: string | null) {
  return (role ?? "")
    .split(",")
    .map((r) => ROLE_LABELS[r.trim()] ?? r.trim())
    .filter(Boolean)
    .join(", ");
}

async function getInvitation(invitationId: string) {
  const inv = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      user: { select: { name: true } },
    },
  });

  if (!inv || inv.status !== "pending" || inv.expiresAt < new Date()) {
    return null;
  }

  const invitee = await prisma.user.findUnique({
    where: { email: inv.email },
    select: { name: true },
  });

  return {
    invitationId,
    email: inv.email,
    name: invitee?.name ?? "",
    role: formatRole(inv.role),
    inviterName: inv.user.name,
    expiresAt: formatExpiry(inv.expiresAt),
  };
}

async function InvitationContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ invitationId: string }>;
  searchParamsPromise: Promise<{ token?: string; error?: string }>;
}) {
  await connection();
  const { invitationId } = await paramsPromise;
  const { token, error } = await searchParamsPromise;

  if (error || !token) return <InvalidToken />;

  const [inv, verification] = await Promise.all([
    getInvitation(invitationId),
    prisma.verification.findFirst({
      where: {
        identifier: `reset-password:${token}`,
      },
      select: { id: true, expiresAt: true },
    }),
  ]);

  if (!inv || !verification || verification.expiresAt < new Date()) {
    return <InvalidToken />;
  }

  return (
    <AcceptInvitePage
      token={token}
      invitation={{
        invitationId: inv.invitationId,
        name: inv.name,
        email: inv.email,
        role: inv.role,
        inviterName: inv.inviterName,
        expiresAt: inv.expiresAt,
      }}
    />
  );
}

function AcceptInviteFallback() {
  return (
    <InviteShell>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <Skeleton className="mt-5 h-14 w-full rounded-xl" />

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </InviteShell>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <InvitationContent
        paramsPromise={params}
        searchParamsPromise={searchParams}
      />
    </Suspense>
  );
}
