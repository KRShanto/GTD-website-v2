"use server";

import { createClient } from "@/lib/supabase/server";
import { deleteImageFromSupabaseServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function deleteAuthor(id: number) {
  try {
    const supabase = await createClient();

    // Get author data first to get avatar URL
    const { data: author, error: fetchError } = await supabase
      .from("authors")
      .select("avatar_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("authors")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Delete avatar from Supabase Storage
    if (author?.avatar_url) {
      await deleteImageFromSupabaseServer(author.avatar_url);
    }

    revalidatePath("/admin/authors");
    return { success: true };
  } catch (error) {
    console.error("Delete author error:", error);
    return { error: "Failed to delete author" };
  }
}
