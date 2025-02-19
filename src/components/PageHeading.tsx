"use client";

import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import SignInButton from "@/components/SignInButton";
import { useAuth } from "@/app/providers";

export default function PageHeading({
	title = "Extra GitHub Tools",
	description = "Extra tools for GitHub that you didn’t know you needed.",
}: Readonly<{
	readonly title?: string;
	readonly description?: string;
}>): JSX.Element {
	const { token, isLoading } = useAuth();
	const showButton = !token || token?.length === 0;

	return (
		<>
			<div className="flex w-full flex-wrap items-center justify-between gap-4">
				<div className="flex flex-col">
					<Heading>{title}</Heading>
					<Text>{description}</Text>
				</div>
				{showButton && (
					<div className="flex gap-4">
						<SignInButton disabled={isLoading} />
					</div>
				)}
			</div>
			<Divider className="my-6" />
		</>
	);
}
