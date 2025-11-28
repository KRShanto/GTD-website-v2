"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadTeamImageServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function createTeamMember(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File;

    if (!name || !title || !bio || !image) {
      const missing = [];
      if (!name) missing.push("name");
      if (!title) missing.push("job title");
      if (!bio) missing.push("biography");
      if (!image) missing.push("profile image");
      return { error: `Missing required fields: ${missing.join(", ")}` };
    }

    // Upload image to Supabase Storage
    const imageUploadResult = await uploadTeamImageServer(image, image.name);

    if (!imageUploadResult.success || !imageUploadResult.url) {
      return { error: imageUploadResult.error || "Failed to upload image" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Insert into database
    const { data: teamMember, error } = await supabase
      .from("team")
      .insert([
        {
          name,
          title,
          bio,
          image_url: imageUploadResult.url,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { member: teamMember };
  } catch (error) {
    console.error("Create team member error:", error);
    return { error: "Failed to create team member" };
  }
}
