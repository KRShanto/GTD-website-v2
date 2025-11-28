"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Logs out the current user by clearing the authentication cookie
 * 
 * This function removes the JWT token from the HTTP-only cookie,
 * effectively ending the user's session. After logout, the user
 * is redirected to the login page.
 * 
 * @returns Object with error message if logout fails, or redirects on success
 * 
 * @example
 * ```typescript
 * const result = await logout();
 * if (result?.error) {
 *   console.error(result.error);
 * }
 * ```
 */
export async function logout() {
  try {
    // Get cookie store and delete the authentication token
    const cookieStore = await cookies();
    const cookieName = process.env.JWT_COOKIE_NAME || "token";
    
    // Delete the cookie by setting it with an expired date
    cookieStore.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    // Redirect to login page after successful logout
    redirect("/admin/login");
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Failed to logout. Please try again." };
  }
}
