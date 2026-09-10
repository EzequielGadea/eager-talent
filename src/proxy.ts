import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "~/lib/auth";

const authRoutes = ["/login", "/signup"];
const publicRoutes = ["/", ...authRoutes];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!publicRoutes.includes(pathname) && !session) {
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
