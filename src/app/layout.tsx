import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "~/lib/trpc/react";
import { Toaster } from "~/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Inter", "system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "EagerTalent",
  description: "Gestioná tus candidatos y vacantes en EagerTalent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCReactProvider>
          <Toaster>{children}</Toaster>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
