import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNavigation } from "@/components/site-navigation";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pinpoint AI",
  description: "Analyzing the moments that decide outcomes through pressure-point insight for coaches.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteNavigation isAuthenticated={Boolean(user)} />
        <main className="app-main">
          {children}
        </main>
      </body>
    </html>
  );
}
