import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/createIssue
 * Create a new issue in a GitHub repository.
 * Body: { owner, repoName, title, body? }
 */
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
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const issueBody = typeof body.body === "string" ? body.body.trim() : undefined;

    if (!owner || !repoName) {
      return NextResponse.json(
        { error: "Missing owner or repoName" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          ...(issueBody !== undefined && issueBody !== "" && { body: issueBody }),
        }),
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
        error: "Failed to create issue",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
