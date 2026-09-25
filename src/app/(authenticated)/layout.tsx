import { Inter, Poppins } from "next/font/google";

import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-auth-body",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-auth-heading",
});

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div
      className={`${inter.variable} ${poppins.variable} flex min-h-screen flex-1 bg-slate-50 font-(family-name:--font-auth-body) [--font-sans:var(--font-auth-heading)]`}
    >
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
