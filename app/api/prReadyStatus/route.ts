import { NextRequest, NextResponse } from "next/server";

function extractTemplateSections(template: string): string[] {
  const sections: string[] = [];
  const lines = template.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^#{2,3}\s+(.+)$/);
    if (m) {
      sections.push(m[1].trim().toLowerCase());
    }
  }
  return sections;
}

function bodyAlignsToTemplate(prBody: string | null, templateSections: string[]): boolean {
  if (templateSections.length === 0) return true;
  if (!prBody || typeof prBody !== "string") return false;
  const bodyLower = prBody.toLowerCase();
  for (const section of templateSections) {
    if (!bodyLower.includes(section)) return false;
  }
  return true;
}

async function fetchPRTemplate(
  owner: string,
  repoName: string,
  token: string
): Promise<string> {
  const paths = [
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/pull_request_template.md",
    "pull_request_template.md",
    "docs/pull_request_template.md",
  ];
  for (const path of paths) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3.raw",
          },
        }
      );
      if (res.ok) {
        const text = await res.text();
        return text ?? "";
      }
    } catch {}
  }
  return "";
}

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

    // Fetch PR detail
    const prRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!prRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PR", message: await prRes.text() },
        { status: prRes.status }
      );
    }
    const pr = (await prRes.json()) as {
      body?: string | null;
      head?: { sha?: string };
      state?: string;
      merged_at?: string | null;
    };

    const body = pr.body ?? null;
    const headSha = pr.head?.sha;

    if (pr.state === "closed" || pr.merged_at) {
      return NextResponse.json({
        success: true,
        checksPassed: false,
        templateAligned: false,
        ready: false,
      });
    }

    let checksPassed = true;
    if (headSha) {
      const checksRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/commits/${headSha}/check-runs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      if (checksRes.ok) {
        const checksData = (await checksRes.json()) as {
          check_runs?: Array<{ status: string; conclusion: string | null }>;
        };
        const checkRuns = checksData.check_runs ?? [];
        if (checkRuns.length > 0) {
          const allSuccess = checkRuns.every(
            (r) => r.status === "completed" && r.conclusion === "success"
          );
          checksPassed = allSuccess;
        }
      }
    }

    const template = await fetchPRTemplate(owner, repoName, token);
    const sections = extractTemplateSections(template);
    const templateAligned = bodyAlignsToTemplate(body, sections);

    const ready = checksPassed && templateAligned;

    return NextResponse.json({
      success: true,
      checksPassed,
      templateAligned,
      ready,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to compute PR ready status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
