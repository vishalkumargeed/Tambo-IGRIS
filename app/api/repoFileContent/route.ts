import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    let token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      const session = await auth();
      token = session?.accessToken ?? undefined;
    }
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repoName = searchParams.get("repoName");
    const path = searchParams.get("path");
    if (!owner || !repoName || !path) {
      return NextResponse.json(
        { error: "Missing owner, repoName, or path" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "GitHub API error", message: err },
        { status: res.status }
      );
    }
    try {
      const content = await res.text();
      return NextResponse.json({ success: true, data: { content } });
    } catch {
      return NextResponse.json(
        { success: true, data: { content: "[Binary or unreadable file]" } }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch file content",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
