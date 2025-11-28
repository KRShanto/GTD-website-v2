"use client";

import { createClient } from "./client";
import { SUPABASE_BUCKETS, SUPABASE_FOLDERS } from "./storage-constants";

/**
 * Result interface for Supabase storage operations
 */
export interface SupabaseUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Callback interface for upload progress tracking
 */
export interface UploadProgressCallback {
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
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
 * Uploads a file using XMLHttpRequest for real progress tracking
 * @internal
 */
async function uploadWithProgress(
  file: File,
  bucket: string,
  path: string,
  supabaseUrl: string,
  supabaseKey: string,
  accessToken: string | undefined,
  callbacks: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  // Build upload URL - Supabase Storage API endpoint
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && callbacks.onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        callbacks.onProgress(progress);
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Get public URL using Supabase client
        const supabase = createClient();
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);

        if (!urlData?.publicUrl) {
          const errorMessage = "Failed to get public URL";
          callbacks.onError?.(errorMessage);
          resolve({
            success: false,
            error: errorMessage,
          });
          return;
        }

        if (callbacks.onProgress) {
          callbacks.onProgress(100);
        }
        callbacks.onComplete?.(urlData.publicUrl);

        resolve({
          success: true,
          url: urlData.publicUrl,
          path: path,
        });
      } else {
        // Parse error response
        let errorMessage = "Upload failed";
        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMessage =
            errorData.error?.message || errorData.message || errorMessage;
        } catch {
          errorMessage = xhr.statusText || errorMessage;
        }

        callbacks.onError?.(errorMessage);
        resolve({
          success: false,
          error: errorMessage,
        });
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      const errorMessage = "Network error during upload";
      callbacks.onError?.(errorMessage);
      resolve({
        success: false,
        error: errorMessage,
      });
    });

    xhr.addEventListener("abort", () => {
      const errorMessage = "Upload aborted";
      callbacks.onError?.(errorMessage);
      resolve({
        success: false,
        error: errorMessage,
      });
    });

    // Open and send request
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("apikey", supabaseKey);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${accessToken || supabaseKey}`
    );
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );
    xhr.setRequestHeader("x-upsert", "false");

    xhr.send(file);
  });
}

/**
 * Extracts the file path from a Supabase storage URL
 * @param url - Full Supabase storage URL
 * @returns File path or null if URL is invalid
 */
export function extractSupabasePathFromUrl(url: string): string | null {
  try {
    // Supabase storage URLs typically look like:
    // https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.indexOf("public");

    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      return null;
    }

    // Extract path after bucket name
    const path = pathParts.slice(bucketIndex + 2).join("/");
    return decodeURIComponent(path);
  } catch (error) {
    console.error("Error extracting Supabase path:", error);
    return null;
  }
}

/**
 * Uploads a file to Supabase Storage with progress tracking
 * Uses XMLHttpRequest for real progress tracking
 * @param file - File to upload
 * @param fileName - Original file name
 * @param bucket - Supabase bucket name
 * @param folder - Optional folder path within the bucket
 * @param callbacks - Optional progress callbacks
 * @returns Upload result with URL and path
 */
export async function uploadFileToSupabase(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = "",
  callbacks?: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  try {
    const supabase = createClient();
    const uniquePath = generateUniqueFileName(fileName, folder);

    // Get session for authenticated upload
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Get Supabase URL and anon key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      const errorMessage = "Supabase configuration missing";
      callbacks?.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // If progress tracking is needed, use XMLHttpRequest for real progress
    if (callbacks?.onProgress) {
      return uploadWithProgress(
        file,
        bucket,
        uniquePath,
        supabaseUrl,
        supabaseKey,
        session?.access_token,
        callbacks
      );
    }

    // Otherwise, use Supabase client for simpler upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      const errorMessage = error.message || "Upload failed";
      callbacks?.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniquePath);

    if (!urlData?.publicUrl) {
      const errorMessage = "Failed to get public URL";
      callbacks?.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    callbacks?.onComplete?.(urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: uniquePath,
    };
  } catch (error) {
    console.error("Supabase upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    callbacks?.onError?.(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Uploads an image file to Supabase Storage
 * @param file - Image file to upload
 * @param fileName - Original file name
 * @param bucket - Supabase bucket name
 * @param folder - Optional folder path within the bucket
 * @param callbacks - Optional progress callbacks
 * @returns Upload result with URL and path
 */
export async function uploadImageToSupabase(
  file: File,
  fileName: string,
  bucket: string,
  folder: string = "",
  callbacks?: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  return uploadFileToSupabase(file, fileName, bucket, folder, callbacks);
}

/**
 * Deletes a file from Supabase Storage
 * @param bucket - Supabase bucket name
 * @param filePath - Path to the file within the bucket
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFileFromSupabase(
  bucket: string,
  filePath: string
): Promise<boolean> {
  try {
    const supabase = createClient();
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
 * Deletes a file from Supabase Storage using its URL
 * @param url - Full Supabase storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteFileFromSupabaseByUrl(
  url: string
): Promise<boolean> {
  try {
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

    return deleteFileFromSupabase(bucket, decodeURIComponent(filePath));
  } catch (error) {
    console.error("Error deleting file from Supabase:", error);
    return false;
  }
}

/**
 * Deletes an image from Supabase Storage using its URL
 * @param imageUrl - Full Supabase storage URL
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteImageFromSupabase(
  imageUrl: string
): Promise<boolean> {
  return deleteFileFromSupabaseByUrl(imageUrl);
}

/**
 * Batch upload multiple files to Supabase Storage
 * @param files - Array of files with metadata
 * @param bucket - Supabase bucket name
 * @param callbacks - Optional progress callbacks
 * @returns Array of upload results
 */
export async function batchUploadToSupabase(
  files: Array<{
    file: File;
    fileName: string;
    folder?: string;
  }>,
  bucket: string,
  callbacks?: {
    onTotalProgress?: (progress: number) => void;
    onFileProgress?: (fileName: string, progress: number) => void;
    onFileComplete?: (fileName: string, url: string) => void;
    onFileError?: (fileName: string, error: string) => void;
  }
): Promise<SupabaseUploadResult[]> {
  const results: SupabaseUploadResult[] = [];
  let completedCount = 0;

  for (const { file, fileName, folder = "" } of files) {
    const result = await uploadFileToSupabase(file, fileName, bucket, folder, {
      onProgress: (progress) => {
        callbacks?.onFileProgress?.(fileName, progress);
        // Calculate total progress
        const totalProgress = Math.round(
          (completedCount * 100 + progress) / files.length
        );
        callbacks?.onTotalProgress?.(totalProgress);
      },
      onComplete: (url) => {
        callbacks?.onFileComplete?.(fileName, url);
        completedCount++;
      },
      onError: (error) => {
        callbacks?.onFileError?.(fileName, error);
        completedCount++;
      },
    });
    results.push(result);
  }

  return results;
}

/**
 * Convenience functions for specific buckets
 */

/**
 * Upload image to team bucket
 */
export async function uploadTeamImage(
  file: File,
  fileName: string,
  callbacks?: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(
    file,
    fileName,
    SUPABASE_BUCKETS.TEAM,
    SUPABASE_FOLDERS.TEAM,
    callbacks
  );
}

/**
 * Upload image to authors bucket
 */
export async function uploadAuthorImage(
  file: File,
  fileName: string,
  callbacks?: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(
    file,
    fileName,
    SUPABASE_BUCKETS.AUTHORS,
    SUPABASE_FOLDERS.AUTHORS,
    callbacks
  );
}

/**
 * Upload image to blog bucket
 */
export async function uploadBlogImage(
  file: File,
  fileName: string,
  folder: string = "",
  callbacks?: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(
    file,
    fileName,
    SUPABASE_BUCKETS.BLOG,
    folder || SUPABASE_FOLDERS.BLOG,
    callbacks
  );
}

/**
 * Upload image to gallery bucket
 */
export async function uploadGalleryImage(
  file: File,
  fileName: string,
  callbacks?: UploadProgressCallback
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(
    file,
    fileName,
    SUPABASE_BUCKETS.GALLERY,
    SUPABASE_FOLDERS.GALLERY_IMAGES,
    callbacks
  );
}
