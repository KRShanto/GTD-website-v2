"use server";

import { createClient } from "@/lib/supabase/server";
import { deleteImageFromSupabaseServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function deleteBlog(id: number, featuredImageUrl?: string) {
  try {
    const supabase = await createClient();
    // Delete from Supabase
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) return { error: error.message };
    // Delete featured image from Supabase if provided
    if (featuredImageUrl) {
      await deleteImageFromSupabaseServer(featuredImageUrl);
    }
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete blog" };
  }
}
