"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadAuthorImageServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function createAuthor(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const avatar = formData.get("avatar") as File;

    if (!name || !avatar) {
      return { error: "Name and avatar are required" };
    }

    // Upload avatar to Supabase Storage
    const uploadResult = await uploadAuthorImageServer(avatar, avatar.name);

    if (!uploadResult.success || !uploadResult.url) {
      return { error: uploadResult.error || "Failed to upload avatar" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Prepare author data
    const authorData: { name: string; email?: string; avatar_url: string } = {
      name,
      avatar_url: uploadResult.url,
    };

    // Only add email if provided
    if (email && email.trim()) {
      authorData.email = email.trim();
    }

    // Insert author into database
    const { data: author, error } = await supabase
      .from("authors")
      .insert([authorData])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/authors");
    return { author };
  } catch (error) {
    console.error("Create author error:", error);
    return { error: "Failed to create author" };
  }
}
