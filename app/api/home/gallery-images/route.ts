import { NextResponse } from "next/server";
import { getGalleryImages } from "@/actions/gallery/images/get";

/**
 * GET /api/home/gallery-images
 *
 * Returns gallery images for the home page with caching.
 * Cache tag: 'gallery-images' for revalidation.
 */
export async function GET() {
  try {
    const images = await getGalleryImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
