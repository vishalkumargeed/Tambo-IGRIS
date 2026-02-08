import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const PER_PAGE = 100;
const MAX_PAGES = 50;

function getStartDate(range: string): Date {
  const now = new Date();
  const d = new Date(now);
  if (range === "7d") d.setDate(d.getDate() - 7);
  else if (range === "3m") d.setMonth(d.getMonth() - 3);
  else if (range === "6m") d.setMonth(d.getMonth() - 6);
  else d.setMonth(d.getMonth() - 3);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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
    const range = searchParams.get("range") ?? "3m";
    if (!owner || !repoName) {
      return NextResponse.json(
        { error: "Missing owner or repoName" },
        { status: 400 }
      );
    }

    const startDate = getStartDate(range);
    const countsByDay: Record<string, number> = {};
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/stargazers?per_page=${PER_PAGE}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3.star+json",
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
      if (!Array.isArray(data) || data.length === 0) break;

      for (const item of data) {
        const starredAt = item.starred_at;
        if (!starredAt) continue;
        const d = new Date(starredAt);
        if (d < startDate) continue;
        const key = toDateKey(d);
        countsByDay[key] = (countsByDay[key] ?? 0) + 1;
      }
      if (data.length < PER_PAGE) hasMore = false;
      else page++;
    }

    const today = new Date();
    const from = new Date(startDate);
    let cumulative = 0;
    const points: { date: string; stars: number }[] = [];
    for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d);
      cumulative += countsByDay[key] ?? 0;
      points.push({ date: key, stars: cumulative });
    }
    if (points.length === 0) {
      points.push({ date: toDateKey(today), stars: 0 });
    }
    return NextResponse.json({ success: true, data: points });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch repo stars",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
