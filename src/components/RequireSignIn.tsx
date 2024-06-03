"use client";

import SignInButton from "./SignInButton";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";

export default function RequireSignIn() {
  return (
    <div className="w-full ring-2 ring-zinc-300 dark:ring-zinc-700 rounded-lg">
      <div className="p-4">
        <Heading level={2}>
          Sign in to use this tool
        </Heading>
        <Text>
          To use this tool, you need to sign in with your GitHub account.
        </Text>
        <div className="mt-4">
          <SignInButton />
        </div>
      </div>
    </div>
  )
}