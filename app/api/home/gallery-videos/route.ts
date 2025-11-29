import { NextResponse } from "next/server";
import { getGalleryVideos } from "@/actions/gallery/videos/get";

/**
 * GET /api/home/gallery-videos
 *
 * Returns gallery videos for the home page with caching.
 * Cache tag: 'gallery-videos' for revalidation.
 */
export async function GET() {
  try {
    const videos = await getGalleryVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching gallery videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery videos" },
      { status: 500 }
    );
  }
}
