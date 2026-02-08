import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const owner = typeof body.owner === "string" ? body.owner.trim() : "";
    const repoName = typeof body.repoName === "string" ? body.repoName.trim() : "";
    const issueNumber = body.issueNumber != null ? String(body.issueNumber) : "";
    const commentBody = typeof body.body === "string" ? body.body.trim() : "";

    if (!owner || !repoName || !issueNumber) {
      return NextResponse.json(
        { error: "Missing owner, repoName, or issueNumber" },
        { status: 400 }
      );
    }

    if (!commentBody) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/issues/${encodeURIComponent(issueNumber)}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentBody }),
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
    return NextResponse.json(
      {
        error: "Failed to add comment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
