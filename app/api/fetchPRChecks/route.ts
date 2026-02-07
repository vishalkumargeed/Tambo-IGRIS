import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repoName = searchParams.get("repoName");
    const ref = searchParams.get("ref"); // commit SHA
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!owner || !repoName || !ref || !token) {
      return NextResponse.json(
        { error: "Missing owner, repoName, ref, or Authorization header" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/commits/${ref}/check-runs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: "GitHub API error", message: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    const checkRuns = (data.check_runs ?? []) as Array<{
      id: number;
      name: string;
      status: string;
      conclusion: string | null;
      html_url?: string;
      output?: { title?: string; summary?: string };
    }>;
    return NextResponse.json({ success: true, data: checkRuns });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch check runs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
