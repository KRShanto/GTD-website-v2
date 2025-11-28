import { SignJWT, jwtVerify } from "jose";

// Environment variable validation and fallback
// In production, JWT_SECRET should always be set via environment variables
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set in environment variables!");
  console.warn(
    "Using fallback secret key - this is NOT secure for production!"
  );
}

// Use environment variable or fallback to a default secret
// Note: The fallback is only for development/testing purposes
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Interface defining the structure of JWT session payload
 *
 * This interface represents the data that will be encoded in the JWT token.
 * The 'iat' (issued at) and 'exp' (expiration) fields are automatically
 * added by the JWT library during token creation.
 */
interface SessionPayload {
  id: string;
  username: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Creates and signs a JWT token with user session data
 *
 * This function takes user information and creates a cryptographically
 * signed JWT token that can be used for authentication. The token
 * includes an expiration time and is signed using the HS256 algorithm.
 *
 * @param payload - User session data to encode in the token
 * @param payload.id - Unique user identifier
 * @param payload.username - User's username
 * @param payload.name - User's display name
 *
 * @returns Promise<string> - The signed JWT token
 *
 * @example
 * ```typescript
 * const token = await signJWT({
 *   id: "user123",
 *   username: "john_doe",
 *   name: "John Doe",
 * });
 * ```
 *
 * @throws {Error} If JWT signing fails due to invalid secret or payload
 */
export async function signJWT(payload: Omit<SessionPayload, "iat" | "exp">) {
  // Convert the secret key to a Uint8Array for cryptographic operations
  const secret = new TextEncoder().encode(JWT_SECRET);

  // Create and sign the JWT token
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // Use HMAC SHA-256 algorithm
    .setExpirationTime("30d") // Token expires in 30 days
    .sign(secret);

  return token;
}

/**
 * Verifies and decodes a JWT token
 *
 * This function validates the cryptographic signature of a JWT token
 * and extracts the user session data if the token is valid and not expired.
 * It includes comprehensive error handling and logging for debugging.
 *
 * @param token - The JWT token string to verify
 *
 * @returns Promise<SessionPayload | null> - Decoded session data or null if invalid
 *
 * @example
 * ```typescript
 * const session = await verifyJWT("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
 * if (session) {
 *   console.log(`User ${session.name} is authenticated`);
 * }
 * ```
 *
 * @throws {Error} If token verification fails (caught and handled internally)
 */
export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  // Early return if no token is provided
  if (!token) {
    console.log("No token provided to verifyJWT");
    return null;
  }

  try {
    // Convert the secret key to a Uint8Array for verification
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verify the token's signature and decode the payload
    const { payload } = await jwtVerify(token, secret);

    // Validate that the payload contains all required fields with correct types
    // This ensures type safety and prevents runtime errors
    if (
      typeof payload.id === "string" &&
      typeof payload.name === "string" &&
      typeof payload.username === "string"
    ) {
      // Construct and return the validated session payload
      // Type assertion is safe here due to the validation above
      return {
        id: payload.id,
        username: payload.username,
        name: payload.name,
        iat: payload.iat,
        exp: payload.exp,
      } as SessionPayload;
    }

    // Log invalid payload structure for debugging
    console.error("Invalid payload structure:", payload);
    return null;
  } catch (error) {
    // Comprehensive error handling with security-conscious logging
    if (error instanceof Error) {
      console.error("JWT verification error:", {
        message: error.message,
        name: error.name,
        // Only log first 10 characters of token for security
        // Full tokens should never be logged to prevent token theft
        token: token.substring(0, 10) + "...",
      });
    }
    return null;
  }
}
