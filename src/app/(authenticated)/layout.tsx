import Link from "next/link";

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
      <aside className="w-full shrink-0 space-y-1 border-b border-foreground/10 p-4 sm:w-56 sm:border-r sm:border-b-0">
        <Link
          href="/dashboard"
          className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-foreground/10"
        >
          Dashboard
        </Link>

        <Link
          href="/profile"
          className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-foreground/10"
        >
          My Profile
        </Link>

        <Link
          href="/applicants"
          className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-foreground/10"
        >
          Candidates
        </Link>
      </aside>

      <main className="min-w-0 flex-1 p-4">{children}</main>
    </div>
  );
}
