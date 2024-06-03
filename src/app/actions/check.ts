"use server";

import { createClient } from "@/utils/server";

export async function checkSessionReturnToken() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.provider_token) {
    return session.provider_token;
  }

  return null;
}