"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/client";
import { toast } from "sonner";

export default function SignInButton() {
  const supabase = createClient();
  
  return (
    <Button
      color="dark/white"
      onClick={async () => {
        supabase.auth.onAuthStateChange((event, session) => {
          if (session?.provider_token) {
            window.localStorage.setItem('oauth_provider_token', session.provider_token)
          }

          if (session?.provider_refresh_token) {
            window.localStorage.setItem('oauth_provider_refresh_token', session.provider_refresh_token)
          }

          if (event === 'SIGNED_OUT') {
            window.localStorage.removeItem('oauth_provider_token')
            window.localStorage.removeItem('oauth_provider_refresh_token')
          }
        })

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            scopes: "admin:org,repo",
          }
        });

        if (error) {
          console.error(error);
          toast.error("Failed to sign in with GitHub. Please try again.");
        }
      }}
    >
      Sign in with GitHub
    </Button>
  )
}