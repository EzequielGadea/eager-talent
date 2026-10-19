import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";
import { PUBLIC_LINK_BASE_PATH } from "~/lib/public-link-url";

const authRoutes = ["/login", "/signup", "/accept-invite", "/reset-password"];
const publicRoutes = ["/", ...authRoutes];
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith(`${PUBLIC_LINK_BASE_PATH}/`);

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!["/login", "/signup"].includes(pathname)) return NextResponse.next();

  const organizationId = session?.session.activeOrganizationId;

  // Esto no deberia suceder, ya que hay un database hook en la configuracion
  // de Better Auth que establece la Active Organization al iniciar sesion.
  if (!organizationId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
    select: {
      role: true,
    },
  });

  const destination =
    membership?.role === "hiringManager" ? "/job-openings" : "/dashboard";

  return NextResponse.redirect(new URL(destination, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
