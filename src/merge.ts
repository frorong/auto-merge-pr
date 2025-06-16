import axios from "axios";

interface MergeOptions {
  token: string;
  owner: string;
  repo: string;
  threshold: number;
  label?: string;
  mergeMethod?: "merge" | "squash" | "rebase";
}

export async function autoMergePRs(options: MergeOptions): Promise<void> {
  const {
    token,
    owner,
    repo,
    threshold,
    label,
    mergeMethod = "squash",
  } = options;
  const headers = {
    Authorization: `token ${token}`,
    "User-Agent": "auto-merge-script",
    Accept: "application/vnd.github+json",
  };

  const now = new Date();
  const prsRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`,
    { headers }
  );

  for (const pr of prsRes.data) {
    const createdAt = new Date(pr.created_at);
    const daysOpen =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    const prLabels = pr.labels.map((l: any) => l.name);
    if (daysOpen < threshold) continue;
    if (label && !prLabels.includes(label)) continue;

    const mergeableRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}`,
      { headers }
    );
    const mergeable = mergeableRes.data.mergeable;
    if (mergeable === false) continue;

    try {
      await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/merge`,
        { merge_method: mergeMethod },
        { headers }
      );
      console.log(`✅ Merged PR #${pr.number} (${pr.title})`);
    } catch (err: any) {
      console.error(
        `❌ Failed to merge PR #${pr.number}:`,
        err.response?.data?.message || err.message
      );
    }
  }
}
