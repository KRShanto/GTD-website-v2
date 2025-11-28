import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";

// Firebase Storage folder structure
export const FIREBASE_FOLDERS = {
  TEAM: "team",
  AUTHORS: "authors",
  BLOG: "blog",
  GALLERY_IMAGES: "gallery/images",
  GALLERY_VIDEOS: "gallery/videos",
  GALLERY_THUMBNAILS: "gallery/thumbnails",
} as const;

export interface FirebaseUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadProgressCallback {
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
}

// Helper function to generate unique file name
function generateUniqueFileName(fileName: string, folder: string): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "");
  return `${folder}/${timestamp}-${sanitizedName}`;
}

// Helper function to convert Buffer/File to Blob
function convertToBlob(file: File | Buffer, contentType: string): Blob {
  if (file instanceof Buffer) {
    // Convert Buffer to Uint8Array for Blob compatibility
    // Create a new Uint8Array from the Buffer, which creates a new ArrayBuffer
    const uint8Array = new Uint8Array(file.length);
    uint8Array.set(file);
    return new Blob([uint8Array.buffer], { type: contentType });
  }
  // File is already a Blob, but we need to ensure correct content type
  // File is compatible with BlobPart, so we can use it directly
  if (file instanceof File) {
    return new Blob([file], { type: contentType });
  }
  // This should never happen, but TypeScript needs this for type safety
  throw new Error("Unsupported file type");
}

// Upload file to Firebase Storage with progress tracking
export async function uploadFileToFirebase(
  file: File | Buffer,
  fileName: string,
  folder: string,
  contentType: string,
  callbacks?: UploadProgressCallback
): Promise<FirebaseUploadResult> {
  try {
    const uniqueFileName = generateUniqueFileName(fileName, folder);
    const storageRef = ref(storage, uniqueFileName);
    const fileBlob = convertToBlob(file, contentType);

    if (callbacks?.onProgress) {
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, fileBlob);

      return new Promise((resolve) => {
        uploadTask.on(
          "state_changed",
          (snapshot: UploadTaskSnapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            callbacks.onProgress?.(progress);
          },
          (error) => {
            const errorMessage =
              error instanceof Error ? error.message : "Upload failed";
            callbacks.onError?.(errorMessage);
            resolve({
              success: false,
              error: errorMessage,
            });
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            callbacks.onComplete?.(downloadURL);
            resolve({
              success: true,
              url: downloadURL,
              path: uniqueFileName,
            });
          }
        );
      });
    } else {
      // Use simple upload without progress tracking
      const snapshot = await uploadBytes(storageRef, fileBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: uniqueFileName,
      };
    }
  } catch (error) {
    console.error("Firebase upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Upload image to Firebase Storage
export async function uploadImageToFirebase(
  file: File | Buffer,
  fileName: string,
  folder: string,
  callbacks?: UploadProgressCallback
): Promise<FirebaseUploadResult> {
  return uploadFileToFirebase(file, fileName, folder, "image/jpeg", callbacks);
}

// Upload video to Firebase Storage
export async function uploadVideoToFirebase(
  file: File | Buffer,
  fileName: string,
  folder: string,
  callbacks?: UploadProgressCallback
): Promise<FirebaseUploadResult> {
  return uploadFileToFirebase(file, fileName, folder, "video/mp4", callbacks);
}

// Delete file from Firebase Storage
export async function deleteFileFromFirebase(
  fileUrl: string
): Promise<boolean> {
  try {
    const path = extractFirebasePathFromUrl(fileUrl);
    if (!path) {
      console.error("Invalid Firebase URL format:", fileUrl);
      return false;
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Firebase delete error:", error);
    return false;
  }
}

// Delete image from Firebase Storage
export async function deleteImageFromFirebase(
  imageUrl: string
): Promise<boolean> {
  return deleteFileFromFirebase(imageUrl);
}

// Delete video from Firebase Storage
export async function deleteVideoFromFirebase(
  videoUrl: string
): Promise<boolean> {
  return deleteFileFromFirebase(videoUrl);
}

// Helper function to extract Firebase path from URL
export function extractFirebasePathFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/o/");
    if (urlParts.length < 2) {
      return null;
    }

    const pathWithParams = urlParts[1];
    return decodeURIComponent(pathWithParams.split("?")[0]);
  } catch (error) {
    console.error("Error extracting Firebase path:", error);
    return null;
  }
}

// Batch upload multiple files
export async function batchUploadToFirebase(
  files: Array<{
    file: File | Buffer;
    fileName: string;
    folder: string;
    contentType: string;
  }>,
  callbacks?: {
    onTotalProgress?: (progress: number) => void;
    onFileProgress?: (fileName: string, progress: number) => void;
    onFileComplete?: (fileName: string, url: string) => void;
    onFileError?: (fileName: string, error: string) => void;
  }
): Promise<FirebaseUploadResult[]> {
  const results: FirebaseUploadResult[] = [];
  let totalProgress = 0;

  for (const { file, fileName, folder, contentType } of files) {
    const result = await uploadFileToFirebase(
      file,
      fileName,
      folder,
      contentType,
      {
        onProgress: (progress) => {
          callbacks?.onFileProgress?.(fileName, progress);
          totalProgress = (results.length * 100 + progress) / files.length;
          callbacks?.onTotalProgress?.(totalProgress);
        },
        onComplete: (url) => {
          callbacks?.onFileComplete?.(fileName, url);
        },
        onError: (error) => {
          callbacks?.onFileError?.(fileName, error);
        },
      }
    );
    results.push(result);
  }

  return results;
}
