import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * GET /api/githubUser
 * Returns the authenticated user's GitHub profile (GitHub REST API GET /user).
 */
export async function GET() {
  try {
    const session = await auth();
    const token = session?.accessToken;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch user", message: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
