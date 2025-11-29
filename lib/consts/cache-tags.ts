/**
 * Cache tags for Next.js fetch() and revalidateTag()
 * Used for on-demand revalidation of static pages
 */
export const CACHE_TAGS = {
  GALLERY_IMAGES: "gallery-images",
  GALLERY_VIDEOS: "gallery-videos",
  TESTIMONIALS: "testimonials",
  TEAM: "team",
} as const;
