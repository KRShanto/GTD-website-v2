"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadAuthorImageServer,
  deleteImageFromSupabaseServer,
} from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function updateAuthor(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const avatar = formData.get("avatar") as File | null;

    if (!name) {
      return { error: "Name is required" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current author data
    const { data: currentAuthor, error: fetchError } = await supabase
      .from("authors")
      .select("avatar_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Prepare update data
    const updateData: {
      name: string;
      email?: string | null;
      avatar_url?: string;
    } = {
      name,
    };

    // Handle email update
    if (email && email.trim()) {
      updateData.email = email.trim();
    } else {
      // Set email to null if not provided
      updateData.email = null;
    }

    // Handle avatar update if new file is provided
    if (avatar) {
      const uploadResult = await uploadAuthorImageServer(avatar, avatar.name);

      if (!uploadResult.success || !uploadResult.url) {
        return {
          error: uploadResult.error || "Failed to upload new avatar",
        };
      }

      // Delete old avatar if exists
      if (currentAuthor?.avatar_url) {
        await deleteImageFromSupabaseServer(currentAuthor.avatar_url);
      }

      updateData.avatar_url = uploadResult.url;
    }

    // Update author in database
    const { data: author, error: updateError } = await supabase
      .from("authors")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/admin/authors");
    return { author };
  } catch (error) {
    console.error("Update author error:", error);
    return { error: "Failed to update author" };
  }
}
