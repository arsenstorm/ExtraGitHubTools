"use client";

import { authClient } from "@/auth.client";
import { Button } from "@/components/ui/button";

export default function SignInButton({
	disabled = false,
}: Readonly<{
	disabled?: boolean;
}>) {
	return (
		<Button
			color="dark/white"
			onClick={async () => {
				authClient.signIn.social({
					provider: "github",
				});
			}}
			disabled={disabled}
		>
			Sign in with GitHub
		</Button>
	);
}
