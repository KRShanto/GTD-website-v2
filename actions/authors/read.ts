"use server";

import { prisma } from "@/lib/db";

/**
 * Fetches all authors from the database
 *
 * @returns Object with either the authors array or an error message
 */
export async function getAuthors() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: authors };
  } catch (error) {
    console.error("Get authors error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Fetches all authors (alias for compatibility)
 *
 * @returns Object with authors array and error message
 */
export async function getAllAuthors() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { createdAt: "asc" },
    });

    return { authors, error: null };
  } catch (error) {
    console.error("Get authors error:", error);
    return { authors: [], error: "An unexpected error occurred" };
  }
}

/**
 * Fetches a single author by ID
 *
 * @param id - The UUID string of the author to retrieve
 * @returns Object with either the author data or an error message
 */
export async function getAuthor(id: string) {
  try {
    const author = await prisma.author.findUnique({
      where: { id },
    });

    if (!author) {
      return { error: "Author not found" };
    }

    return { success: true, data: author };
  } catch (error) {
    console.error("Get author error:", error);
    return { error: "An unexpected error occurred" };
  }
}
