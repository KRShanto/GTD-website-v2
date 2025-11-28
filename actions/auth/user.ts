"use server";

import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
  user_metadata: {
    display_name?: string;
    full_name?: string;
  };
}

// Get current admin user
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    user_metadata: user.user_metadata,
  };
}
