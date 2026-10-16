import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "~/lib/auth";
import { PUBLIC_LINK_BASE_PATH } from "~/lib/public-link-url";

const authRoutes = ["/login", "/signup"];
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

  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
