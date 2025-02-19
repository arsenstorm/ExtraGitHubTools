"use client";

import { authClient } from "@/auth.client";
import { Button } from "@/components/ui/button";

export default function SignInButton() {
	return (
		<Button
			color="dark/white"
			onClick={async () => {
        authClient.signIn.social({
					provider: "github",
				});
			}}
		>
			Sign in with GitHub
		</Button>
	);
}
