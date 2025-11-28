"use server";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createSevallaClient } from "./client";
import { SEVALLA_BUCKET, SEVALLA_FOLDERS } from "./storage-constants";

/**
 * Result interface for Sevalla storage operations (server-side)
 */
export interface SevallaUploadResult {
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
 * Constructs the public URL for a file in Sevalla storage
 *
 * Sevalla provides a public domain in the format: {bucket-name}.sevalla.storage
 * This is different from the endpoint URL used for API calls
 *
 * @param bucket - Bucket name (e.g., "gtd-website-391ds")
 * @param filePath - Path to the file within the bucket
 * @returns Public URL
 */
function getSevallaPublicUrl(bucket: string, filePath: string): string {
  // Sevalla public URLs use the format: https://{bucket-name}.sevalla.storage/{filePath}
  // The bucket name from the dashboard is used directly in the domain
  return `https://${bucket}.sevalla.storage/${filePath}`;
}

/**
 * Uploads a file to Sevalla Storage (server-side)
 * @param file - File to upload (from FormData)
 * @param fileName - Original file name
 * @param bucket - Sevalla bucket name
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and path
 */
export async function uploadFileToSevallaServer(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = ""
): Promise<SevallaUploadResult> {
  try {
    const client = createSevallaClient();
    const uniquePath = generateUniqueFileName(fileName, folder);

    // Convert File to Buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload file using S3 PutObject command
    // Note: ACL is removed as many S3-compatible services (including Sevalla)
    // don't support ACLs or require bucket-level public access configuration
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: uniquePath,
      Body: fileBuffer,
      ContentType: file.type || "application/octet-stream",
    });

    await client.send(command);

    // Get public URL
    const publicUrl = getSevallaPublicUrl(bucket, uniquePath);

    return {
      success: true,
      url: publicUrl,
      path: uniquePath,
    };
  } catch (error) {
    console.error("Sevalla upload error:", error);

    // Provide more detailed error messages
    let errorMessage = "Upload failed";
    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific error types
      if (
        error.message.includes("Access Denied") ||
        error.message.includes("403")
      ) {
        errorMessage =
          "Access Denied. Please check:\n" +
          "1. Your SEVALLA_ACCESS_KEY and SEVALLA_SECRET_KEY are correct\n" +
          "2. The bucket '" +
          bucket +
          "' exists and you have write permissions\n" +
          "3. Your credentials have the necessary permissions for this bucket";
      } else if (
        error.message.includes("NoSuchBucket") ||
        error.message.includes("404")
      ) {
        errorMessage = `Bucket '${bucket}' does not exist. Please create it in your Sevalla dashboard.`;
      } else if (error.message.includes("InvalidAccessKeyId")) {
        errorMessage =
          "Invalid access key. Please check your SEVALLA_ACCESS_KEY.";
      } else if (error.message.includes("SignatureDoesNotMatch")) {
        errorMessage =
          "Invalid secret key. Please check your SEVALLA_SECRET_KEY.";
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Uploads an image file to Sevalla Storage (server-side)
 * @param file - Image file to upload
 * @param fileName - Original file name
 * @param bucket - Sevalla bucket name
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and path
 */
export async function uploadImageToSevallaServer(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = ""
): Promise<SevallaUploadResult> {
  return uploadFileToSevallaServer(file, fileName, bucket, folder);
}

/**
 * Uploads a video file to Sevalla Storage (server-side)
 * @param file - Video file to upload
 * @param fileName - Original file name
 * @param bucket - Sevalla bucket name
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and path
 */
export async function uploadVideoToSevallaServer(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = ""
): Promise<SevallaUploadResult> {
  return uploadFileToSevallaServer(file, fileName, bucket, folder);
}

/**
 * Deletes a file from Sevalla Storage (server-side)
 * @param bucket - Sevalla bucket name
 * @param filePath - Path to the file within the bucket
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFileFromSevallaServer(
  bucket: string,
  filePath: string
): Promise<boolean> {
  try {
    const client = createSevallaClient();

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filePath,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error("Sevalla delete error:", error);
    return false;
  }
}

/**
 * Deletes a file from Sevalla Storage using its URL (server-side)
 * @param url - Full Sevalla storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFileFromSevallaByUrlServer(
  url: string
): Promise<boolean> {
  try {
    // Check if this is a Firebase URL (old storage) - skip deletion
    if (url.includes("firebasestorage.googleapis.com")) {
      console.log(
        "Skipping deletion of Firebase URL (migrated to Sevalla):",
        url
      );
      return true; // Return true to not break the flow, but skip actual deletion
    }

    // Check if this is a Supabase URL (old storage) - skip deletion
    if (url.includes("supabase.co") || url.includes("supabase.in")) {
      console.log(
        "Skipping deletion of Supabase URL (migrated to Sevalla):",
        url
      );
      return true; // Return true to not break the flow, but skip actual deletion
    }

    // Extract bucket and path from Sevalla URL
    // Public URL format: https://{bucket-name}.sevalla.storage/{filePath}
    // Endpoint URL format: https://{endpoint-url}/{bucket}/{filePath}

    // Check if this is a public Sevalla URL (bucket-name.sevalla.storage)
    const publicUrlMatch = url.match(
      /^https:\/\/([^\/]+)\.sevalla\.storage\/(.+)$/
    );
    if (publicUrlMatch) {
      const bucket = publicUrlMatch[1];
      const filePath = decodeURIComponent(publicUrlMatch[2]);
      return deleteFileFromSevallaServer(bucket, filePath);
    }

    // Fallback: Try to parse as endpoint URL format
    const sevallaUrl = process.env.SEVALLA_URL;
    if (sevallaUrl) {
      const baseUrl = sevallaUrl.replace(/\/$/, "");
      if (url.startsWith(baseUrl)) {
        // Remove base URL to get bucket/path
        const pathAfterBase = url.replace(baseUrl + "/", "");
        const pathParts = pathAfterBase.split("/");

        if (pathParts.length >= 2) {
          const bucket = pathParts[0];
          const filePath = pathParts.slice(1).join("/");
          return deleteFileFromSevallaServer(
            bucket,
            decodeURIComponent(filePath)
          );
        }
      }
    }

    console.error("Invalid Sevalla URL format:", url);
    return false;
  } catch (error) {
    console.error("Error deleting file from Sevalla:", error);
    return false;
  }
}

/**
 * Deletes an image from Sevalla Storage using its URL (server-side)
 * @param imageUrl - Full Sevalla storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteImageFromSevallaServer(
  imageUrl: string
): Promise<boolean> {
  return deleteFileFromSevallaByUrlServer(imageUrl);
}

/**
 * Deletes a video from Sevalla Storage using its URL (server-side)
 * @param videoUrl - Full Sevalla storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteVideoFromSevallaServer(
  videoUrl: string
): Promise<boolean> {
  return deleteFileFromSevallaByUrlServer(videoUrl);
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
): Promise<SevallaUploadResult> {
  return uploadImageToSevallaServer(
    file,
    fileName,
    SEVALLA_BUCKET,
    SEVALLA_FOLDERS.TEAM
  );
}

/**
 * Upload image to authors bucket (server-side)
 */
export async function uploadAuthorImageServer(
  file: File,
  fileName: string
): Promise<SevallaUploadResult> {
  return uploadImageToSevallaServer(
    file,
    fileName,
    SEVALLA_BUCKET,
    SEVALLA_FOLDERS.AUTHORS
  );
}

/**
 * Upload image to blog bucket (server-side)
 */
export async function uploadBlogImageServer(
  file: File,
  fileName: string,
  folder: string = ""
): Promise<SevallaUploadResult> {
  return uploadImageToSevallaServer(
    file,
    fileName,
    SEVALLA_BUCKET,
    folder || SEVALLA_FOLDERS.BLOG
  );
}

/**
 * Upload image to gallery bucket (server-side)
 */
export async function uploadGalleryImageServer(
  file: File,
  fileName: string
): Promise<SevallaUploadResult> {
  return uploadImageToSevallaServer(
    file,
    fileName,
    SEVALLA_BUCKET,
    SEVALLA_FOLDERS.GALLERY_IMAGES
  );
}

/**
 * Upload video to gallery bucket (server-side)
 */
export async function uploadGalleryVideoServer(
  file: File,
  fileName: string
): Promise<SevallaUploadResult> {
  return uploadVideoToSevallaServer(
    file,
    fileName,
    SEVALLA_BUCKET,
    SEVALLA_FOLDERS.GALLERY_VIDEOS
  );
}

/**
 * Upload thumbnail to gallery bucket (server-side)
 */
export async function uploadGalleryThumbnailServer(
  file: File,
  fileName: string
): Promise<SevallaUploadResult> {
  return uploadImageToSevallaServer(
    file,
    fileName,
    SEVALLA_BUCKET,
    SEVALLA_FOLDERS.GALLERY_THUMBNAILS
  );
}
