import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PER_PAGE = 100;

export async function GET() {
  try {
    const session = await auth();
    const token = session?.accessToken;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${PER_PAGE}&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch repos", message: err },
        { status: res.status }
      );
    }
    const repos = await res.json();
    return NextResponse.json({
      success: true,
      data: repos.map((r: { id: number; name: string; full_name: string; owner: { login: string } }) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        owner: r.owner?.login ?? "",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch repos",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
