
export async function getGitHubLogin(token: string): Promise<string | null> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 300 },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { login?: string };
 
  return data.login ?? null;
}
