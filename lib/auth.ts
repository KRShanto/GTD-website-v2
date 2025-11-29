import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";
import { prisma } from "./db";
import { redirect } from "next/navigation";

export async function getUser() {
  try {
    // Get token from cookies
    // const token = cookies().get("token")?.value;
    const cookieStore = await cookies();
    const token = cookieStore.get(
      process.env.JWT_COOKIE_NAME || "token"
    )?.value;

    if (!token) {
      return null;
    }

    // Verify token and get payload
    const payload = await verifyJWT(token);
    if (!payload) {
      return null;
    }

    // Get user from database with organizations
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    if (!user) {
      // Do not modify cookies here; just return null
      return null;
    }

    // Transform the data to a more convenient structure
    return {
      id: user.id,
      username: user.username,
      name: user.name,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

// Type for the returned user object
export type AuthUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

// Helper to use in Server Components to require authentication
export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
