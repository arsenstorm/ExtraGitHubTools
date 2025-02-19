"use client";

import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Subheading } from "@/components/ui/heading";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { useState } from "react";

const options = [
	{
		label: "Bulk Transfer Repositories",
		description:
			"Move your repositories in bulk between organizations and personal accounts.",
		href: "/transfer",
	},
];

export default function Home() {
	return (
		<div className="flex flex-col justify-center h-full">
			<PageHeading />
			<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{options.map(({ label, description, href }) => (
					<div
						key={label}
						className="flex flex-col p-4 bg-zinc-200 dark:bg-zinc-800 ring-2 ring-zinc-300 dark:ring-zinc-700 rounded-lg"
					>
						<Subheading level={3}>{label}</Subheading>
						<Text>{description}</Text>
						<Button href={href} color="cyan" className="mt-4">
							Transfer Repositories
						</Button>
					</div>
				))}
			</main>
			<Divider className="my-6" />
			<div className="flex flex-col gap-y-4 max-w-2xl">
				<div>
					<Subheading level={2}>About this project</Subheading>
					<Text>
						I started this project in open-source because I needed a tool that
						can help me transfer repositories between organizations and personal
						accounts and one was not readily available.
					</Text>
				</div>
				<div>
					<Subheading level={2}>More tools</Subheading>
					<Text>
						If you have any ideas for tools that you’d like to see, send me an
						email at{" "}
						<TextLink href="mailto:arsen@shkrumelyak.com">
							arsen@shkrumelyak.com
						</TextLink>
						!
					</Text>
				</div>
			</div>
		</div>
	);
}
