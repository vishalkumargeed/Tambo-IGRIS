import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/prActions
 * Perform merge, close, or reopen on a PR via GitHub REST API.
 * Body: { owner, repoName, prNumber, action: "merge" | "close" | "reopen" }
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
    const prNumber = body.prNumber != null ? String(body.prNumber).trim() : "";
    const action = typeof body.action === "string" ? body.action.trim().toLowerCase() : "";

    if (!owner || !repoName || !prNumber) {
      return NextResponse.json(
        { error: "Missing owner, repoName, or prNumber" },
        { status: 400 }
      );
    }

    const validActions = ["merge", "close", "reopen"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be merge, close, or reopen" },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    let response: Response;

    if (action === "merge") {
      // POST /repos/{owner}/{repo}/pulls/{pull_number}/merge
      response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/pulls/${encodeURIComponent(prNumber)}/merge`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            commit_title: body.commitTitle ?? undefined,
            commit_message: body.commitMessage ?? undefined,
            merge_method: body.mergeMethod ?? undefined,
          }),
        }
      );
    } else {
      // PATCH /repos/{owner}/{repo}/issues/{issue_number} - for close/reopen (PRs are issues)
      const newState = action === "close" ? "closed" : "open";
      response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/issues/${encodeURIComponent(prNumber)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ state: newState }),
        }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      let errJson: { message?: string } = {};
      try {
        errJson = JSON.parse(errText);
      } catch {
        /* ignore */
      }
      return NextResponse.json(
        {
          error: "GitHub API error",
          message: errJson.message ?? errText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to perform PR action",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
