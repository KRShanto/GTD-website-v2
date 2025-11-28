import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

interface SetupRequest {
  name: string;
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    // Check setup token for security
    const setupToken = request.headers.get("X-TOKEN");

    if (!setupToken || setupToken !== process.env.SETUP_TOKEN) {
      return NextResponse.json(
        { error: "Invalid or missing setup token" },
        { status: 401 }
      );
    }

    const { name, username, password }: SetupRequest = await request.json();

    // Validate required fields
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user with same name already exists
    const existingUser = await prisma.user.findFirst({
      where: { name: name },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this name already exists" },
        { status: 400 }
      );
    }

    // Check if user with same username already exists
    const existingUserEmail = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUserEmail) {
      return NextResponse.json(
        { error: "User with this username already exists" },
        { status: 400 }
      );
    }

    // Check if admin username already exists
    const existingAdminEmail = await prisma.user.findFirst({
      where: { username },
    });

    if (existingAdminEmail) {
      return NextResponse.json(
        { error: "Admin username already exists" },
        { status: 400 }
      );
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 2. Create Admin User
      const adminUser = await tx.user.create({
        data: {
          name: name,
          username: username,
          password: hashedPassword,
        },
      });

      return {
        id: adminUser.id,
        name: adminUser.name,
        username: adminUser.username,
      };
    });

    return NextResponse.json({
      message: "Setup completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 }
    );
  }
}
