"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Authenticates a user with username and password
 *
 * This function validates user credentials against the database,
 * verifies the password using bcrypt, and creates a JWT session token.
 * The token is stored in an HTTP-only cookie for security.
 *
 * @param username - User's username
 * @param password - User's plain text password
 * @returns Object with error message if authentication fails, or redirects on success
 *
 * @example
 * ```typescript
 * const result = await login("admin", "password123");
 * if (result?.error) {
 *   console.error(result.error);
 * }
 * ```
 */
export async function login(username: string, password: string) {
  try {
    // Find user by username in the database
    const user = await prisma.user.findFirst({
      where: { username },
    });

    // Return generic error to prevent user enumeration
    if (!user) {
      return { error: "Invalid credentials" };
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { error: "Invalid credentials" };
    }

    // Create session data for JWT token
    const sessionData = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    // Sign JWT token with session data
    const token = await signJWT(sessionData);

    // Get cookie store and set authentication cookie
    const cookieStore = await cookies();
    cookieStore.set(process.env.JWT_COOKIE_NAME || "token", token, {
      httpOnly: true, // Prevents JavaScript access for security
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      path: "/", // Available site-wide
      maxAge: parseInt(process.env.SESSION_MAX_AGE_HOURS || "720") * 60 * 60, // Default 30 days (720 hours)
    });

    // Redirect to admin dashboard on successful login
    redirect("/admin");
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Internal server error" };
  }
}
