import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "~/lib/auth";
import { PUBLIC_LINK_BASE_PATH } from "~/lib/public-link-url";
import { prisma } from "~/lib/prisma";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Routes are regular expresions, if they include \/[^/]+$/ at the end, they
// need a subroute otherwise they fail. /login is allowed but /login/a isn't.
// this is checked by using the .test(string) method, returns true if the string
// follows the regular expresion.
const authRoutes = [
  /^\/login$/,
  /^\/signup$/,
  /^\/accept-invite\/[^/]+$/,
  /^\/reset-password\/[^/]+$/,
];
const publicBase = new RegExp(
  `^\\/${escapeRegex(PUBLIC_LINK_BASE_PATH)}\\/[^/]+$`,
);

const publicRoutes = ["/", ...authRoutes];
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthRoute = authRoutes.some((route) => route.test(pathname));
  const isPublicRoute =
    publicRoutes.includes(pathname) || isAuthRoute || publicBase.test(pathname);

  if (!session) {
    return isPublicRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isAuthRoute) return NextResponse.next();

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
