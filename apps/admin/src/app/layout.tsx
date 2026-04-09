import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akiba Admin",
  description: "Back-office admin panel for the Akiba wealth management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen antialiased">
        <Sidebar />
        <div className="pl-[240px] transition-all duration-300">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
