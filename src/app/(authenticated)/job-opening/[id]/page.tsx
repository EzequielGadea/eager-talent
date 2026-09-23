import { redirect } from "next/navigation";

type JobOpeningPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobOpeningPage({
  params,
}: JobOpeningPageProps) {
  const { id } = await params;

  redirect(`/job-opening/${id}/pipeline`);
}