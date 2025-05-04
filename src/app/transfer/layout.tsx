import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Bulk Transfer Repositories",
	description:
		"Move your repositories in bulk between organizations and personal accounts.",
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <Suspense fallback={null}>{children}</Suspense>;
}
