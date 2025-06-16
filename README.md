# auto-merge-pr

> Automatically merge GitHub Pull Requests that have been open for more than N days and have a specific label.

---

## Features

- Merge PRs automatically after N days
- Only merge PRs with a specific label (optional)
- Supports `squash`, `merge`, and `rebase`
- Uses GitHub Personal Access Token
- Automatically sets up GitHub Actions workflow (`npx auto-merge-pr setup`)

---

## Installation

Install globally:

```bash
npm install -g auto-merge-pr
```

Or run directly with `npx`:

```bash
npx auto-merge-pr --help
```

---

## Usage (CLI)

```bash
auto-merge-pr \
  --token YOUR_GITHUB_TOKEN \
  --owner your-org \
  --repo your-repo \
  --threshold 3 \
  --label auto-merge \
  --merge-method squash
```

### 🔧 Options

| Option           | Description                           | Required | Default  |
| ---------------- | ------------------------------------- | -------- | -------- |
| `--token`        | GitHub personal access token          | ✅       | -        |
| `--owner`        | GitHub repository owner (user or org) | ✅       | -        |
| `--repo`         | Repository name                       | ✅       | -        |
| `--threshold`    | Days after PR opened to trigger merge | ✅       | -        |
| `--label`        | PR must have this label to be merged  | ❌       | (none)   |
| `--merge-method` | `merge`, `squash`, or `rebase`        | ❌       | `squash` |

---

## 🧪 Setup GitHub Actions (Recommended)

Automatically create `.github/workflows/auto-merge.yml` for scheduled merges:

```bash
npx auto-merge-pr setup
```

This will:

- Generate a GitHub Actions workflow file
- You can edit `owner`, `repo`, `threshold`, `label`, etc.
- You must add `AUTO_MERGE_TOKEN` as a GitHub secret manually

---

## 🔐 Token Scopes

Your GitHub token must have these scopes:

- `repo` (for private repos)
- `public_repo` (for public repos)
