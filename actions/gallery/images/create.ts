"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import {
  uploadGalleryImageServer,
} from "@/lib/sevalla/storage-server";

/**
 * Creates a single gallery image:
 * - uploads the file to Sevalla
 * - stores the resulting URL in PostgreSQL via Prisma
 * - pushes the new ID to the Redis order list (at the start)
 *
 * Expected FormData fields:
 * - "image": File (required)
 * - "alt": string (optional, max 200 chars)
 */
export async function createGalleryImage(formData: FormData) {
  try {
    const image = formData.get("image") as File | null;
    const alt = (formData.get("alt") as string | null) || "";

    if (!image) {
      return { error: "Image file is required" };
    }

    if (alt.length > 200) {
      return { error: "Alt text must be less than 200 characters" };
    }

    // Upload image to Sevalla
    const uploadResult = await uploadGalleryImageServer(image, image.name);

    if (!uploadResult.success || !uploadResult.url) {
      return {
        error: uploadResult.error || "Failed to upload image",
      };
    }

    // Create gallery image record in PostgreSQL via Prisma
    const created = await prisma.galleryImage.create({
      data: {
        imageUrl: uploadResult.url,
        alt: alt.trim(),
      },
    });

    // Maintain Redis order (newest at the beginning)
    await redis.lpush("gallery:images:order", created.id);

    // Revalidate relevant paths
    revalidatePath("/admin/gallery/images");
    revalidatePath("/");

    return { success: true, data: created };
  } catch (error) {
    console.error("Create gallery image error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Creates multiple gallery images in one call.
 *
 * This expects the caller to have already uploaded images to Sevalla and
 * simply provides the resulting URLs + alt text. It is primarily used by
 * the multiple image upload UI after it has performed individual uploads.
 *
 * This keeps the existing shape used by the UI: [{ imageUrl, alt }].
 */
interface GalleryImageData {
  imageUrl: string;
  alt: string;
}

export async function createMultipleGalleryImages(
  imagesData: GalleryImageData[]
) {
  try {
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

    // Create all images in a single Prisma transaction
    const createdImages = await prisma.$transaction(
      imagesData.map((image) =>
        prisma.galleryImage.create({
          data: {
            imageUrl: image.imageUrl,
            alt: image.alt?.trim() || "",
          },
        })
      )
    );

    // Add new image IDs to Redis order list (at the beginning)
    const imageIds = createdImages.map((image) => image.id);
    if (imageIds.length > 0) {
      await redis.lpush("gallery:images:order", ...imageIds);
    }

    // Revalidate paths
    revalidatePath("/admin/gallery/images");
    revalidatePath("/");

    return { success: true, data: createdImages, count: imagesData.length };
  } catch (error) {
    console.error("Create multiple gallery images error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Creates multiple gallery images from FormData containing files and alts.
 *
 * Expected FormData fields (repeated per image, same ordering):
 * - "images": File
 * - "alts": string
 */
export async function createMultipleGalleryImagesFromFormData(
  formData: FormData
) {
  try {
    const files = formData.getAll("images") as File[];
    const altsRaw = formData.getAll("alts");

    if (!files.length) {
      return { error: "Please select at least one image" };
    }

    if (files.length !== altsRaw.length) {
      return { error: "Images and alt text count do not match" };
    }

    // Upload each file to Sevalla and accumulate metadata
    const toCreate: { imageUrl: string; alt: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const alt = (altsRaw[i] as string | null) || "";

      if (!file) {
        return { error: `Image ${i + 1}: File is missing` };
      }

      if (alt.length > 200) {
        return {
          error: `Image ${i + 1}: Alt text must be less than 200 characters`,
        };
      }

      const uploadResult = await uploadGalleryImageServer(file, file.name);

      if (!uploadResult.success || !uploadResult.url) {
        return {
          error:
            uploadResult.error ||
            `Failed to upload image ${i + 1}: ${file.name}`,
        };
      }

      toCreate.push({
        imageUrl: uploadResult.url,
        alt: alt.trim(),
      });
    }

    // Create all images in database using a single Prisma transaction
    const createdImages = await prisma.$transaction(
      toCreate.map((image) =>
        prisma.galleryImage.create({
          data: {
            imageUrl: image.imageUrl,
            alt: image.alt,
          },
        })
      )
    );

    // Maintain Redis order (newest IDs at the beginning)
    const imageIds = createdImages.map((image) => image.id);
    if (imageIds.length > 0) {
      await redis.lpush("gallery:images:order", ...imageIds);
    }

    // Revalidate paths
    revalidatePath("/admin/gallery/images");
    revalidatePath("/");

    return {
      success: true,
      data: createdImages,
      count: createdImages.length,
    };
  } catch (error) {
    console.error("Create multiple gallery images (FormData) error:", error);
    return { error: "An unexpected error occurred" };
  }
}
