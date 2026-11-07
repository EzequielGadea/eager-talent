import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "~/lib/auth";
import { PUBLIC_LINK_BASE_PATH } from "~/lib/public-link-url";
import { prisma } from "~/lib/prisma";

const authRoutes = ["/login", "/signup", "/accept-invite", "/reset-password"];
const publicRoutes = ["/", ...authRoutes];

const UPLOAD_PATH = "/api/files/upload";

// 4 MiB for the file + margin for the multipart overhead.
// Must match MAX_BODY in the upload route.
const MAX_BODY = 4 * 1024 * 1024 + 64 * 1024;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Upload route checks run BEFORE touching the database, so an oversized
  // or malformed request costs nothing.
  if (pathname === UPLOAD_PATH) {
    if (request.method !== "POST") {
      return Response.json({ message: "Método no permitido" }, { status: 405 });
    }

    const length = Number(request.headers.get("content-length"));

    if (!Number.isFinite(length) || length <= 0) {
      return Response.json(
        { message: "Content-Length requerido" },
        { status: 411 },
      );
    }

    if (length > MAX_BODY) {
      return Response.json(
        { message: "El archivo supera el tamaño máximo de 4 MB" },
        { status: 413 },
      );
    }

    const uploadSession = await auth.api.getSession({
      headers: request.headers,
    });

    if (!uploadSession) {
      return Response.json({ message: "No autorizado" }, { status: 401 });
    }

    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    /^\/accept-invite\/[^/]+$/.test(pathname) ||
    pathname.startsWith(`${PUBLIC_LINK_BASE_PATH}/`);

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!["/login", "/signup"].includes(pathname) || !session)
    return NextResponse.next();

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
  matcher: [
    // The upload route is listed explicitly because the general pattern excludes /api.
    "/api/files/upload",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
