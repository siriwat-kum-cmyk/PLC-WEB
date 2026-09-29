import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { DataProvider } from "@/context/data-context";
import { ThemeProvider } from "@/context/theme-context";

export const metadata: Metadata = {
  title: "PLC Alarm & Maintenance Management System | Automation Engineering",
  description:
    "Industrial Automation & Machine Maintenance Web Application built with Next.js, Tailwind CSS, Supabase, GitHub Actions, and Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>{children}</DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
