"use server";

import { createClient } from "@/lib/supabase/server";
import { deleteImageFromSupabaseServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export async function deleteGalleryImage(id: number) {
  try {
    const supabase = await createClient();

    // Get image data first to get URL
    const { data: image, error: fetchError } = await supabase
      .from("gallery-images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("gallery-images")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Remove from Redis order list
    await redis.lrem("gallery:images:order", 0, id);

    // Delete image from Supabase Storage
    if (image?.image_url) {
      await deleteImageFromSupabaseServer(image.image_url);
    }

    revalidatePath("/admin/gallery/images");
    return { success: true };
  } catch (error) {
    console.error("Delete gallery image error:", error);
    return { error: "Failed to delete gallery image" };
  }
}

export async function deleteMultipleGalleryImages(ids: number[]) {
  try {
    const supabase = await createClient();

    // Get image URLs first
    const { data: images, error: fetchError } = await supabase
      .from("gallery-images")
      .select("image_url")
      .in("id", ids);

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("gallery-images")
      .delete()
      .in("id", ids);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Delete all images from Supabase Storage
    const deletePromises = images
      .filter((image) => image.image_url)
      .map((image) => deleteImageFromSupabaseServer(image.image_url));

    await Promise.all(deletePromises);

    revalidatePath("/admin/gallery/images");
    return { success: true };
  } catch (error) {
    console.error("Delete multiple gallery images error:", error);
    return { error: "Failed to delete gallery images" };
  }
}
