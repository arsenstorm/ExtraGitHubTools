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
						can help me transfer repositories between organisations and personal
						accounts and one was not readily available.
					</Text>
				</div>
				<div>
					<Subheading level={2}>Important Information</Subheading>
					<Text>
						When you sign in with GitHub, your personal access token{" "}
						<Strong>is stored</Strong>.
					</Text>
					<Text>
						You can delete your data <Strong>at any time</Strong> via the{" "}
						<Strong>“delete my account”</Strong> button.
					</Text>
					<Text>
						The code is <Strong>100% open-source</Strong> and you can{" "}
						<TextLink href="https://github.com/arsenstorm/ExtraGitHubTools">
							find it here on GitHub
						</TextLink>
						.
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
