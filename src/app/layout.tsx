import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Navigation } from "@/components/Navigation";
import { Providers } from "./providers";
import clsx from "clsx";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Extra GitHub Tools",
    template: "%s - Extra GitHub Tools",
  },
  description: "Extra tools for GitHub that aren’t part of the main interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={clsx(
        "h-full antialiased",
        "bg-white lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950"
      )}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <Providers>
          <Navigation>
            {children}
          </Navigation>
        </Providers>
      </body>
    </html>
  );
}
