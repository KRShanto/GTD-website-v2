"use server";

import { createClient } from "@/lib/supabase/server";
import { deleteImageFromSupabaseServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function deleteTeamMember(id: number) {
  try {
    const supabase = await createClient();

    // Get member data first to get image URL
    const { data: member, error: fetchError } = await supabase
      .from("team")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("team")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Delete image from Supabase Storage
    if (member?.image_url) {
      await deleteImageFromSupabaseServer(member.image_url);
    }

    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Delete team member error:", error);
    return { error: "Failed to delete team member" };
  }
}

export async function deleteMultipleTeamMembers(ids: number[]) {
  try {
    const supabase = await createClient();

    // Get member URLs first
    const { data: members, error: fetchError } = await supabase
      .from("team")
      .select("image_url")
      .in("id", ids);

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("team")
      .delete()
      .in("id", ids);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Delete all images from Supabase Storage
    const deletePromises = members
      .filter((member) => member.image_url)
      .map((member) => deleteImageFromSupabaseServer(member.image_url!));

    await Promise.all(deletePromises);

    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Delete multiple team members error:", error);
    return { error: "Failed to delete team members" };
  }
}
