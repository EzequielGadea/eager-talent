import { Suspense } from "react";
import AcceptInvitePage from "./_components/accept-invite-form";
import { InvalidToken } from "./_components/invalid-token";
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

export async function getInvitation(invitationId: string) {
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
  const { invitationId } = await paramsPromise;
  const { token, error } = await searchParamsPromise;

  const inv = await getInvitation(invitationId);

  if (error || !token || !inv) return <InvalidToken />;

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

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">Cargando invitación...</div>
        </div>
      }
    >
      <InvitationContent
        paramsPromise={params}
        searchParamsPromise={searchParams}
      />
    </Suspense>
  );
}
