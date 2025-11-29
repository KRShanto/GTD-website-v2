import { requireAuth } from "@/lib/auth";
import SevallaUploadClient from "./sevalla-upload-client";

export const dynamic = "force-dynamic";

/**
 * Sevalla File Upload Utility Page
 *
 * This page provides a UI for uploading files (including large files) to Sevalla storage
 * in the root directory. Files are uploaded directly to Sevalla using presigned URLs.
 */
export default async function SevallaUploadPage() {
  // Require authentication
  await requireAuth();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Sevalla File Upload
        </h1>
        <p className="text-gray-400 mb-8">
          Upload files to Sevalla storage root directory. Large files are supported
          via direct upload.
        </p>
        <SevallaUploadClient />
      </div>
    </div>
  );
}


