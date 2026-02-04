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

    const [prRes, searchRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${owner}/${repoName}/pulls?state=open&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      ),
      fetch(
        `https://api.github.com/search/issues?q=repo:${owner}/${repoName}+is:issue+is:open`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      ),
    ]);

    const prLink = prRes.headers.get("link");
    const getLastPage = (link: string | null): number => {
      if (!link) return 0;
      const m = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
      return m ? parseInt(m[1], 10) : 0;
    };

    let openPrs = 0;
    let openIssues = 0;
    if (prRes.ok) {
      const prData = await prRes.json();
      openPrs = getLastPage(prLink) || (Array.isArray(prData) ? prData.length : 0);
    }
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      openIssues = typeof searchData.total_count === "number" ? searchData.total_count : 0;
    }

    return NextResponse.json({
      success: true,
      data: { openPrs, openIssues },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch counts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
