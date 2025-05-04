import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Commit Fame",
  description: "See how your commits compare to your colleagues.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
