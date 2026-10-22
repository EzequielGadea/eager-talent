import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";

import { api } from "~/lib/trpc/server";

import { ProfileCard } from "./profile-card";

export async function ProfileDetails() {
  let user: Awaited<ReturnType<typeof api.user.getCurrent>>;

  try {
    user = await api.user.getCurrent();
  } catch (error) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }

  return <ProfileCard user={user} />;
}
