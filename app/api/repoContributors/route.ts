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
      `https://api.github.com/repos/${owner}/${repoName}/contributors?per_page=100`,
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
    const data = await res.json();
    const contributors = Array.isArray(data)
      ? data.map(
          (c: {
            id: number;
            login: string;
            avatar_url: string;
            contributions: number;
            type?: string;
            html_url?: string;
          }) => ({
            id: c.id,
            login: c.login,
            avatarUrl: c.avatar_url,
            contributions: c.contributions,
            type: c.type ?? "User",
            htmlUrl: c.html_url ?? `https://github.com/${c.login}`,
          })
        )
      : [];
    return NextResponse.json({ success: true, data: contributors });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch contributors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
