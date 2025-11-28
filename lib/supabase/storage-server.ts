"use server";

import { createClient } from "./server";
import { SUPABASE_BUCKETS, SUPABASE_FOLDERS } from "./storage-constants";

/**
 * Result interface for Supabase storage operations (server-side)
 */
export interface SupabaseUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Generates a unique file name with timestamp and sanitized original name
 * @param fileName - Original file name
 * @param folder - Folder path within the bucket
 * @returns Unique file path
 */
function generateUniqueFileName(fileName: string, folder: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  // Sanitize file name - remove special characters but keep extension
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = folder
    ? `${folder}/${timestamp}-${randomString}-${sanitizedName}`
    : `${timestamp}-${randomString}-${sanitizedName}`;
  return path;
}

/**
 * Uploads a file to Supabase Storage (server-side)
 * @param file - File to upload (from FormData)
 * @param fileName - Original file name
 * @param bucket - Supabase bucket name
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and path
 */
export async function uploadFileToSupabaseServer(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = ""
): Promise<SupabaseUploadResult> {
  try {
    const supabase = await createClient();
    const uniquePath = generateUniqueFileName(fileName, folder);

    // Convert File to ArrayBuffer for Supabase upload
    // In server environment, we need to convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload file using Supabase client
    // Supabase storage accepts File, Blob, ArrayBuffer, or Buffer
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniquePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to get public URL",
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: uniquePath,
    };
  } catch (error) {
    console.error("Supabase upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Uploads an image file to Supabase Storage (server-side)
 * @param file - Image file to upload
 * @param fileName - Original file name
 * @param bucket - Supabase bucket name
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and path
 */
export async function uploadImageToSupabaseServer(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = ""
): Promise<SupabaseUploadResult> {
  return uploadFileToSupabaseServer(file, fileName, bucket, folder);
}

/**
 * Deletes a file from Supabase Storage (server-side)
 * @param bucket - Supabase bucket name
 * @param filePath - Path to the file within the bucket
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFileFromSupabaseServer(
  bucket: string,
  filePath: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Supabase delete error:", error);
    return false;
  }
}

/**
 * Deletes a file from Supabase Storage using its URL (server-side)
 * @param url - Full Supabase storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFileFromSupabaseByUrlServer(
  url: string
): Promise<boolean> {
  try {
    // Check if this is a Firebase URL (old storage) - skip deletion
    if (url.includes("firebasestorage.googleapis.com")) {
      console.log("Skipping deletion of Firebase URL (migrated to Supabase):", url);
      return true; // Return true to not break the flow, but skip actual deletion
    }

    // Check if this is a Supabase URL
    if (!url.includes("supabase.co") && !url.includes("supabase.in")) {
      console.error("Invalid storage URL format (not Supabase or Firebase):", url);
      return false;
    }

    // Extract bucket and path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.indexOf("public");

    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      console.error("Invalid Supabase URL format:", url);
      return false;
    }

    const bucket = pathParts[bucketIndex + 1];
    const filePath = pathParts.slice(bucketIndex + 2).join("/");

    return deleteFileFromSupabaseServer(bucket, decodeURIComponent(filePath));
  } catch (error) {
    console.error("Error deleting file from Supabase:", error);
    return false;
  }
}

/**
 * Deletes an image from Supabase Storage using its URL (server-side)
 * @param imageUrl - Full Supabase storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteImageFromSupabaseServer(
  imageUrl: string
): Promise<boolean> {
  return deleteFileFromSupabaseByUrlServer(imageUrl);
}

/**
 * Convenience functions for specific buckets (server-side)
 */

/**
 * Upload image to team bucket (server-side)
 */
export async function uploadTeamImageServer(
  file: File,
  fileName: string
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabaseServer(
    file,
    fileName,
    SUPABASE_BUCKETS.TEAM,
    SUPABASE_FOLDERS.TEAM
  );
}

/**
 * Upload image to authors bucket (server-side)
 */
export async function uploadAuthorImageServer(
  file: File,
  fileName: string
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabaseServer(
    file,
    fileName,
    SUPABASE_BUCKETS.AUTHORS,
    SUPABASE_FOLDERS.AUTHORS
  );
}

/**
 * Upload image to blog bucket (server-side)
 */
export async function uploadBlogImageServer(
  file: File,
  fileName: string,
  folder: string = ""
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabaseServer(
    file,
    fileName,
    SUPABASE_BUCKETS.BLOG,
    folder || SUPABASE_FOLDERS.BLOG
  );
}

/**
 * Upload image to gallery bucket (server-side)
 */
export async function uploadGalleryImageServer(
  file: File,
  fileName: string
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabaseServer(
    file,
    fileName,
    SUPABASE_BUCKETS.GALLERY,
    SUPABASE_FOLDERS.GALLERY_IMAGES
  );
}

