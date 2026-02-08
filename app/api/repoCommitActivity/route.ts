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
      `https://api.github.com/repos/${owner}/${repoName}/stats/commit_activity`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (res.status === 202) {
      return NextResponse.json(
        { success: false, pending: true, message: "Stats are being computed; retry in a few seconds." },
        { status: 202 }
      );
    }
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "GitHub API error", message: err },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const points = data.map((week: { week: number; total: number }) => ({
      date: new Date(week.week * 1000).toISOString().slice(0, 10),
      weekStart: new Date(week.week * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
      commits: week.total ?? 0,
    }));

    return NextResponse.json({ success: true, data: points });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch commit activity",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
