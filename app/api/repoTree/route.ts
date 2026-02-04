import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    let token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      const session = await auth();
      token = session?.accessToken ?? undefined;
    }
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

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/commits/HEAD`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!commitRes.ok) {
      const err = await commitRes.text();
      return NextResponse.json(
        { error: "GitHub API error", message: err },
        { status: commitRes.status }
      );
    }
    const commitData = await commitRes.json();
    const treeSha =
      commitData?.commit?.tree?.sha ?? commitData?.tree?.sha;
    if (!treeSha) {
      return NextResponse.json(
        { error: "Could not get tree SHA" },
        { status: 502 }
      );
    }

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees/${treeSha}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!treeRes.ok) {
      const err = await treeRes.text();
      return NextResponse.json(
        { error: "GitHub API error", message: err },
        { status: treeRes.status }
      );
    }
    const treeData = await treeRes.json();
    const tree = Array.isArray(treeData?.tree) ? treeData.tree : [];
    const files = tree
      .filter((n: { type: string }) => n.type === "blob")
      .map((n: { path: string }) => n.path);

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch tree",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
