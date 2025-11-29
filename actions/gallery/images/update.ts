"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import {
  uploadGalleryImageServer,
  deleteImageFromSevallaServer,
} from "@/lib/sevalla/storage-server";

/**
 * Updates a single gallery image record and optionally replaces the image file.
 *
 * Expected FormData fields:
 * - "alt": string (required)
 * - "image": File (optional)
 * - "image_url": string (optional, for compatibility if caller already uploaded)
 */
export async function updateGalleryImage(id: string, formData: FormData) {
  try {
    const alt = formData.get("alt") as string;
    const image = formData.get("image") as File | null;
    const image_url = formData.get("image_url") as string | null;

    if (!alt) {
      return { error: "Alt text is required" };
    }

    // Get current image data from Prisma
    const currentImage = await prisma.galleryImage.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!currentImage) {
      return { error: "Gallery image not found" };
    }

    // Prepare update data
    const updateData: { alt: string; imageUrl?: string } = { alt };

    // Handle image update if new file is provided (server-side upload)
    if (image) {
      const uploadResult = await uploadGalleryImageServer(image, image.name);

      if (!uploadResult.success || !uploadResult.url) {
        return {
          error: uploadResult.error || "Failed to upload new image",
        };
      }

      // Delete old image if exists
      if (currentImage?.imageUrl) {
        await deleteImageFromSevallaServer(currentImage.imageUrl);
      }

      updateData.imageUrl = uploadResult.url;
    } else if (image_url) {
      // Handle case where image was uploaded client-side and URL is provided
      // Delete old image if exists and URL is different
      if (currentImage?.imageUrl && currentImage.imageUrl !== image_url) {
        await deleteImageFromSevallaServer(currentImage.imageUrl);
      }
      updateData.imageUrl = image_url;
    }

    // Update in database via Prisma
    const galleryImage = await prisma.galleryImage.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/gallery/images");
    revalidateTag(CACHE_TAGS.GALLERY_IMAGES);
    return { image: galleryImage };
  } catch (error) {
    console.error("Update gallery image error:", error);
    return { error: "Failed to update gallery image" };
  }
}

export async function updateMultipleGalleryImages(
  updates: { id: string; alt: string; position: number }[]
) {
  try {
    // Bulk update of alt text only using Prisma transaction
    const updatePromises = updates.map((update) =>
      prisma.galleryImage.update({
        where: { id: update.id },
        data: {
          alt: update.alt,
        },
      })
    );

    const galleryImages = await Promise.all(updatePromises);

    revalidatePath("/admin/gallery/images");
    return { images: galleryImages };
  } catch (error) {
    console.error("Update multiple gallery images error:", error);
    return { error: "Failed to update gallery images" };
  }
}

/**
 * Persists gallery image ordering in Redis using Prisma UUID string IDs.
 */
export async function reorderGalleryImages(ids: string[]) {
  await redis.del("gallery:images:order");
  if (ids.length > 0) {
    await redis.rpush("gallery:images:order", ...ids);
  }
  return { success: true };
}
