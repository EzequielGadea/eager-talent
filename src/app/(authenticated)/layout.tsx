import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-1 bg-slate-50">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />

        <main className="flex-1 p-8">
          <div className="mx-auto w-full min-w-0 max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
