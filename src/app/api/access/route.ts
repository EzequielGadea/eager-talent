import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      lastAccess: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
