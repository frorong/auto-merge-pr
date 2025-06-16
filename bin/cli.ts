#!/usr/bin/env node
import { Command } from "commander";
import { autoMergePRs } from "../src/merge.js";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .requiredOption("-t, --token <token>", "GitHub token")
  .requiredOption("-o, --owner <owner>", "GitHub owner")
  .requiredOption("-r, --repo <repo>", "GitHub repo")
  .requiredOption(
    "-d, --threshold <days>",
    "PR opened days threshold",
    parseFloat
  )
  .option("-l, --label <label>", "Label that must exist for auto merge")
  .option(
    "-m, --merge-method <method>",
    "Merge method: merge, squash, rebase",
    "squash"
  )
  .parse();

autoMergePRs(program.opts());

program
  .command("setup")
  .description("Generate GitHub Actions workflow file")
  .action(() => {
    const workflowPath = path.join(
      process.cwd(),
      ".github/workflows/auto-merge.yml"
    );
    fs.mkdirSync(path.dirname(workflowPath), { recursive: true });

    const content = `name: Auto Merge PRs
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install auto-merge-pr
        run: npm install -g auto-merge-pr
      - name: Run Auto Merge
        run: |
          auto-merge-pr \\
            --token \${{ secrets.AUTO_MERGE_TOKEN }} \\
            --owner your-org \\
            --repo your-repo \\
            --threshold 3 \\
            --label auto-merge
`;

    fs.writeFileSync(workflowPath, content, "utf-8");
    console.log(`✅ GitHub Action workflow created at: ${workflowPath}`);
  });
