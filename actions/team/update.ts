"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadTeamImageServer,
  deleteImageFromSupabaseServer,
} from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function updateTeamMember(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File | null;

    if (!name || !title || !bio) {
      const missing = [];
      if (!name) missing.push("name");
      if (!title) missing.push("job title");
      if (!bio) missing.push("biography");
      return { error: `Missing required fields: ${missing.join(", ")}` };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current member data
    const { data: currentMember, error: fetchError } = await supabase
      .from("team")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Prepare update data
    const updateData: {
      name: string;
      title: string;
      bio: string;
      image_url: string;
    } = {
      name,
      title,
      bio,
      image_url: currentMember.image_url, // Preserve existing image_url by default
    };

    // Handle image update if new file is provided
    if (image) {
      const imageUploadResult = await uploadTeamImageServer(image, image.name);

      if (!imageUploadResult.success || !imageUploadResult.url) {
        return {
          error: imageUploadResult.error || "Failed to upload new image",
        };
      }

      // Delete old image if exists
      if (currentMember?.image_url) {
        await deleteImageFromSupabaseServer(currentMember.image_url);
      }

      updateData.image_url = imageUploadResult.url;
    }

    // Update in database
    const { data: teamMember, error: updateError } = await supabase
      .from("team")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { member: teamMember };
  } catch (error) {
    console.error("Update team member error:", error);
    return { error: "Failed to update team member" };
  }
}

export async function updateMultipleTeamMembers(
  updates: { id: number; name: string; title: string; bio: string }[]
) {
  try {
    const supabase = await createClient();

    // Update all members in database
    const { data: teamMembers, error } = await supabase
      .from("team")
      .upsert(
        updates.map((update) => ({
          id: update.id,
          name: update.name,
          title: update.title,
          bio: update.bio,
        }))
      )
      .select();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { members: teamMembers };
  } catch (error) {
    console.error("Update multiple team members error:", error);
    return { error: "Failed to update team members" };
  }
}

export async function reorderTeamMembers(ids: number[]) {
  // Store the order in Redis, similar to gallery images/videos
  const { redis } = await import("@/lib/redis");
  await redis.del("team:order");
  if (ids.length > 0) {
    await redis.rpush("team:order", ...ids);
  }
  return { success: true };
}
