/**
 * Sevalla Storage bucket name
 * This should match the bucket name created in your Sevalla dashboard
 *
 * Note: Update this to match your actual bucket name from Sevalla dashboard
 * The bucket name shown in the dashboard (e.g., "gtd-website-391ds") should be used here
 */
export const SEVALLA_BUCKET = "gtd-website-39lds";

/**
 * Storage folder paths within buckets
 * Used for organizing files within each bucket
 */
export const SEVALLA_FOLDERS = {
  TEAM: "team",
  AUTHORS: "authors",
  BLOG: "blog",
  GALLERY_IMAGES: "gallery/images",
  GALLERY_VIDEOS: "gallery/videos",
  GALLERY_THUMBNAILS: "gallery/thumbnails",
} as const;
