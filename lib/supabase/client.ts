"use client";

import { createBrowserClient } from "@supabase/ssr";

let client: any = null;

export function createClient(supabaseUrl?: string, supabaseKey?: string) {
  // If URL and key are provided, use them (from server action)
  if (supabaseUrl && supabaseKey) {
    if (!client) {
      client = createBrowserClient(supabaseUrl, supabaseKey);
    }
    return client;
  }

  // Fallback to environment variables if available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error(
      "Supabase URL and key must be provided via server action or environment variables"
    );
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }

  return client;
}
