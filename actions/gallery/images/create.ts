"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

interface GalleryImageData {
  imageUrl: string;
  alt: string;
}

export async function createGalleryImage(imageData: GalleryImageData) {
  try {
    const supabase = await createClient();

    // Insert new image into Supabase
    const { data: insertData, error } = await supabase
      .from("gallery-images")
      .insert({
        image_url: imageData.imageUrl,
        alt: imageData.alt?.trim() || "",
      })
      .select()
      .single();
    if (error) {
      return { error: error.message };
    }
    // Add new image ID to Redis order list (at the start)
    if (insertData?.id) {
      await redis.lpush("gallery:images:order", insertData.id);
    }
    revalidatePath("/admin/gallery/images");
    return { success: true, data: insertData };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function createMultipleGalleryImages(
  imagesData: GalleryImageData[]
) {
  try {
    const supabase = await createClient();

    if (imagesData.length === 0) {
      return { error: "Please select at least one image" };
    }

    // Validate all images
    for (let i = 0; i < imagesData.length; i++) {
      const image = imagesData[i];

      if (!image.imageUrl) {
        return {
          error: `Image ${i + 1}: Image URL is required`,
        };
      }

      if (image.alt && image.alt.length > 200) {
        return {
          error: `Image ${i + 1}: Alt text must be less than 200 characters`,
        };
      }
    }

    // Prepare database entries
    const galleryEntries = imagesData.map((image) => ({
      image_url: image.imageUrl,
      alt: image.alt?.trim() || "",
    }));

    // Insert all images into database
    const { data, error } = await supabase
      .from("gallery-images")
      .insert(galleryEntries)
      .select();

    if (error) {
      return { error: "Failed to save image information. Please try again." };
    }

    // Add new image IDs to Redis order list (at the beginning)
    if (data && data.length > 0) {
      const imageIds = data.map((image) => image.id);
      await redis.lpush("gallery:images:order", ...imageIds);
    }

    // Revalidate paths
    revalidatePath("/admin/gallery/images");
    revalidatePath("/");

    return { success: true, data, count: imagesData.length };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}
