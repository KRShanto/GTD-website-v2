"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import { deleteImageFromSevallaServer } from "@/lib/sevalla/storage-server";

/**
 * Deletes a single gallery image:
 * - removes DB record via Prisma
 * - removes its ID from Redis order
 * - deletes the image from Sevalla storage
 */
export async function deleteGalleryImage(id: string) {
  try {
    // Get image data first to get URL
    const image = await prisma.galleryImage.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!image) {
      return { error: "Gallery image not found" };
    }

    // Delete from database
    await prisma.galleryImage.delete({
      where: { id },
    });

    // Remove from Redis order list
    await redis.lrem("gallery:images:order", 0, id);

    // Delete image from Sevalla Storage
    if (image.imageUrl) {
      await deleteImageFromSevallaServer(image.imageUrl);
    }

    revalidatePath("/admin/gallery/images");
    return { success: true };
  } catch (error) {
    console.error("Delete gallery image error:", error);
    return { error: "Failed to delete gallery image" };
  }
}

/**
 * Deletes multiple gallery images at once using Prisma and Sevalla.
 */
export async function deleteMultipleGalleryImages(ids: string[]) {
  try {
    if (!ids.length) {
      return { error: "No images selected for deletion" };
    }

    // Get image URLs first
    const images = await prisma.galleryImage.findMany({
      where: { id: { in: ids } },
      select: { id: true, imageUrl: true },
    });

    // Delete from database
    await prisma.galleryImage.deleteMany({
      where: { id: { in: ids } },
    });

    // Remove all IDs from Redis order list
    for (const id of ids) {
      await redis.lrem("gallery:images:order", 0, id);
    }

    // Delete all images from Sevalla Storage
    const deletePromises = images
      .filter((image) => image.imageUrl)
      .map((image) => deleteImageFromSevallaServer(image.imageUrl));

    await Promise.all(deletePromises);

    revalidatePath("/admin/gallery/images");
    return { success: true };
  } catch (error) {
    console.error("Delete multiple gallery images error:", error);
    return { error: "Failed to delete gallery images" };
  }
}
