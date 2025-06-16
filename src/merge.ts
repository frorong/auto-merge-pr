import axios from "axios";
import { parseDuration } from "./utils/parseDuration.js"; // 새로 추가할 유틸

interface MergeOptions {
  token: string;
  owner: string;
  repo: string;
  threshold?: number; // 일 단위
  after?: string; // "3d4h30m" 형식
  label?: string;
  mergeMethod?: "merge" | "squash" | "rebase";
}

export async function autoMergePRs(options: MergeOptions): Promise<void> {
  const {
    token,
    owner,
    repo,
    threshold,
    after,
    label,
    mergeMethod = "squash",
  } = options;

  const headers = {
    Authorization: `token ${token}`,
    "User-Agent": "auto-merge-script",
    Accept: "application/vnd.github+json",
  };

  // 기준 시간 계산 (ms)
  const thresholdMs = after
    ? parseDuration(after)
    : threshold !== undefined
    ? threshold * 86400_000
    : undefined;

  if (!thresholdMs) {
    throw new Error("Must provide either 'threshold' or 'after' option.");
  }

  const now = Date.now();
  const prsRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`,
    { headers }
  );

  for (const pr of prsRes.data) {
    const createdAt = new Date(pr.created_at).getTime();
    const prLabels = pr.labels.map((l: any) => l.name);

    if (now - createdAt < thresholdMs) continue;
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
