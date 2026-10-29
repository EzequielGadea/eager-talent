import { api } from "~/lib/trpc/server";

import { ProfileCard } from "./profile-card";

export async function ProfileDetails() {
  const user = await api.user.getCurrent();

  return <ProfileCard user={user} />;
}
