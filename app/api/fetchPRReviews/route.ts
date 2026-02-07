import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repoName = searchParams.get("repoName");
    const prNumber = searchParams.get("prNumber");
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!owner || !repoName || !prNumber || !token) {
      return NextResponse.json(
        { error: "Missing owner, repoName, prNumber, or Authorization header" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/reviews`,
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
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch PR reviews",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
