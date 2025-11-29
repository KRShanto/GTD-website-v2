import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createSevallaClient } from "@/lib/sevalla/client";
import {
  SEVALLA_BUCKET,
  SEVALLA_FOLDERS,
} from "@/lib/sevalla/storage-constants";
import { getUser } from "@/lib/auth";

interface PresignRequestBody {
  fileName: string;
  contentType: string;
  folder?: string; // Optional folder within blog bucket (e.g., "images", "featured")
}

/**
 * Generates a unique, sanitized Sevalla object key for a given file name and folder.
 */
function generateSevallaKey(fileName: string, folder: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const base = `${timestamp}-${randomString}-${sanitizedName}`;
  return folder ? `${folder}/${base}` : base;
}

/**
 * POST /api/sevalla/blog-image-presign
 *
 * Authenticated route that returns a presigned URL for uploading a blog image
 * (featured image or inline editor image) directly from the client to Sevalla,
 * plus the resulting public URL.
 */
export async function POST(req: NextRequest) {
  // Require authenticated admin user
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PresignRequestBody;
  try {
    body = (await req.json()) as PresignRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fileName, contentType, folder = "images" } = body;

  if (!fileName || !contentType) {
    return NextResponse.json(
      { error: "fileName and contentType are required" },
      { status: 400 }
    );
  }

  try {
    const client = createSevallaClient();

    // Use blog folder + optional subfolder (e.g., "blog/images" or "blog/featured")
    const fullFolder = folder
      ? `${SEVALLA_FOLDERS.BLOG}/${folder}`
      : SEVALLA_FOLDERS.BLOG;

    const key = generateSevallaKey(fileName, fullFolder);

    const command = new PutObjectCommand({
      Bucket: SEVALLA_BUCKET,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    // Default expiry: 1 hour
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    const publicUrl = `https://${SEVALLA_BUCKET}.sevalla.storage/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Sevalla presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

