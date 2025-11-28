import { S3Client } from "@aws-sdk/client-s3";

/**
 * Creates and configures the Sevalla S3 client
 *
 * Sevalla is S3-compatible, so we use the AWS S3 SDK
 * with custom endpoint configuration pointing to Sevalla
 *
 * @returns Configured S3Client instance
 */
export function createSevallaClient(): S3Client {
  // Get environment variables
  const sevallaUrl = process.env.SEVALLA_URL;
  const accessKey = process.env.SEVALLA_ACCESS_KEY;
  const secretKey = process.env.SEVALLA_SECRET_KEY;

  // Validate required environment variables
  if (!sevallaUrl || !accessKey || !secretKey) {
    throw new Error(
      "Sevalla configuration missing. Please set SEVALLA_URL, SEVALLA_ACCESS_KEY, and SEVALLA_SECRET_KEY environment variables."
    );
  }

  console.log("Sevalla URL:", sevallaUrl);
  console.log("Sevalla Access Key:", accessKey);
  console.log("Sevalla Secret Key:", secretKey);

  // Create S3 client with Sevalla endpoint
  // Sevalla uses S3-compatible API, so we configure the endpoint
  const client = new S3Client({
    endpoint: sevallaUrl, // Sevalla endpoint URL
    region: "auto", // Sevalla uses 'auto' as region
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for S3-compatible services
  });

  return client;
}
