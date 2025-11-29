"use server";

import { prisma } from "@/lib/db";
import { Blog } from "@/lib/generated/prisma/client";

/**
 * Fetches all blogs with their author information
 *
 * @returns Object with either the blogs array or an error message
 */
export async function getBlogs() {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { blogs, error: null };
  } catch (error) {
    console.error("Get blogs error:", error);
    return { error: "Failed to fetch blogs", blogs: [] };
  }
}

/**
 * Fetches a single blog by ID with its author information
 *
 * @param id - Blog ID (UUID string)
 * @returns Object with either the blog or an error message
 */
export async function getBlogById(id: string) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!blog) {
      return { error: "Not found", blog: null };
    }

    return { blog, error: null };
  } catch (error) {
    console.error("Get blog by ID error:", error);
    return { error: "Failed to fetch blog", blog: null };
  }
}

/**
 * Fetches blog metadata (without full content) for listing pages
 *
 * @returns Object with either the blogs array or an error message
 */
export async function getBlogMetadatas() {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return blogs;
  } catch (error) {
    console.error("Get blog metadatas error:", error);
    return [];
  }
}

/**
 * Gets the total count of blogs
 *
 * @returns Total number of blogs
 */
export async function getBlogCount() {
  try {
    const count = await prisma.blog.count();
    return count;
  } catch (error) {
    console.error("Get blog count error:", error);
    return 0;
  }
}
