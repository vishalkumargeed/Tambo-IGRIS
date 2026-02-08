import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const token = session?.accessToken;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repoName = searchParams.get("repoName");
    if (!owner || !repoName) {
      return NextResponse.json(
        { error: "Missing owner or repoName" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/languages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
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

    const data = (await res.json()) as Record<string, number>;
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const points = Object.entries(data).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: total > 0 ? Math.round((bytes / total) * 100) : 0,
    })).sort((a, b) => b.bytes - a.bytes);

    return NextResponse.json({ success: true, data: points });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch languages",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
