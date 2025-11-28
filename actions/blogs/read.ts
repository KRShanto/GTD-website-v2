"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBlogs() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*, authors(id, name, email, avatar_url)")
      .order("created_at", { ascending: false });
    if (error) return { error: error.message, blogs: [] };
    return { blogs: data, error: null };
  } catch (error) {
    return { error: "Failed to fetch blogs", blogs: [] };
  }
}

export async function getBlogById(id: number) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*, authors(id, name, email, avatar_url)")
      .eq("id", id)
      .single();
    if (error || !data)
      return { error: error?.message || "Not found", blog: null };
    return { blog: data, error: null };
  } catch (error) {
    return { error: "Failed to fetch blog", blog: null };
  }
}

export async function getBlogMetadatas() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select(
        "id, created_at, updated_at, title, description, featured_image_url, author_id, is_published, seo_title, seo_description, keywords, authors(id, name, email, avatar_url)"
      )
      .order("created_at", { ascending: false });
    if (error) return { error: error.message, blogs: [] };
    return { blogs: data, error: null };
  } catch (error) {
    return { error: "Failed to fetch blog metadata", blogs: [] };
  }
}

export async function getBlogCount() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("blogs")
      .select("id", { count: "exact", head: true });
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
