"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadGalleryImageServer,
  deleteImageFromSupabaseServer,
} from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export async function updateGalleryImage(id: number, formData: FormData) {
  try {
    const alt = formData.get("alt") as string;
    const image = formData.get("image") as File | null;
    const image_url = formData.get("image_url") as string | null;

    if (!alt) {
      return { error: "Alt text is required" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current image data
    const { data: currentImage, error: fetchError } = await supabase
      .from("gallery-images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Prepare update data
    const updateData: { alt: string; image_url?: string } = { alt };

    // Handle image update if new file is provided (server-side upload)
    if (image) {
      const uploadResult = await uploadGalleryImageServer(image, image.name);

      if (!uploadResult.success || !uploadResult.url) {
        return {
          error: uploadResult.error || "Failed to upload new image",
        };
      }

      // Delete old image if exists
      if (currentImage?.image_url) {
        await deleteImageFromSupabaseServer(currentImage.image_url);
      }

      updateData.image_url = uploadResult.url;
    } else if (image_url) {
      // Handle case where image was uploaded client-side and URL is provided
      // Delete old image if exists and URL is different
      if (currentImage?.image_url && currentImage.image_url !== image_url) {
        await deleteImageFromSupabaseServer(currentImage.image_url);
      }
      updateData.image_url = image_url;
    }

    // Update in database
    const { data: galleryImage, error: updateError } = await supabase
      .from("gallery-images")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/admin/gallery/images");
    return { image: galleryImage };
  } catch (error) {
    console.error("Update gallery image error:", error);
    return { error: "Failed to update gallery image" };
  }
}

export async function updateMultipleGalleryImages(
  updates: { id: number; alt: string; position: number }[]
) {
  try {
    const supabase = await createClient();

    // Update all images in database
    const { data: galleryImages, error } = await supabase
      .from("gallery-images")
      .upsert(
        updates.map((update) => ({
          id: update.id,
          alt: update.alt,
          position: update.position,
        }))
      )
      .select();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/gallery/images");
    return { images: galleryImages };
  } catch (error) {
    console.error("Update multiple gallery images error:", error);
    return { error: "Failed to update gallery images" };
  }
}

export async function reorderGalleryImages(ids: number[]) {
  await redis.del("gallery:images:order");
  if (ids.length > 0) {
    await redis.rpush("gallery:images:order", ...ids);
  }
  return { success: true };
}
