/**
 * Supabase Storage bucket names
 * These should match the buckets created in your Supabase dashboard
 */
export const SUPABASE_BUCKETS = {
  TEAM: "Team",
  AUTHORS: "Author",
  BLOG: "Blog",
  GALLERY: "Gallery",
} as const;

/**
 * Storage folder paths within buckets
 * Used for organizing files within each bucket
 */
export const SUPABASE_FOLDERS = {
  TEAM: "",
  AUTHORS: "",
  BLOG: "",
  GALLERY_IMAGES: "images",
  GALLERY_THUMBNAILS: "thumbnails",
} as const;

/**
 * Type for bucket names
 */
export type SupabaseBucket =
  (typeof SUPABASE_BUCKETS)[keyof typeof SUPABASE_BUCKETS];
