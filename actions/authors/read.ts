"use server";

import { createClient } from "@/lib/supabase/server";

// Get all authors
export async function getAuthors() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("authors")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get authors error:", error);
    return { error: "An unexpected error occurred" };
  }
}

// Get all authors (alias for compatibility)
export async function getAllAuthors() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("authors")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return { authors: [], error: error.message };
    }

    return { authors: data, error: null };
  } catch (error) {
    console.error("Get authors error:", error);
    return { authors: [], error: "An unexpected error occurred" };
  }
}

// Get single author
export async function getAuthor(id: number) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("authors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get author error:", error);
    return { error: "An unexpected error occurred" };
  }
}
