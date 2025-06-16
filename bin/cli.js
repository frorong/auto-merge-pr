#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const merge_js_1 = require("../src/merge.js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const program = new commander_1.Command();
program
    .name("auto-merge-pr")
    .description("Automatically merge GitHub PRs based on age and label")
    .option("-t, --token <token>", "GitHub token")
    .option("-o, --owner <owner>")
    .option("-r, --repo <repo>")
    .option("-d, --threshold <days>", "PR opened days threshold", parseFloat)
    .option("-a, --after <duration>", "Merge PRs after duration (e.g. 3d4h30m)")
    .option("-l, --label <label>")
    .option("-m, --merge-method <method>", "merge | squash | rebase", "squash")
    .action((opts) => __awaiter(void 0, void 0, void 0, function* () {
    if (!opts.token ||
        !opts.owner ||
        !opts.repo ||
        (!opts.threshold && !opts.after)) {
        console.error("❌ Missing required options. Use --help for usage.");
        process.exit(1);
    }
    yield (0, merge_js_1.autoMergePRs)(opts);
}));
program
    .command("setup")
    .description("Generate GitHub Actions workflow file")
    .action(() => {
    const workflowPath = path_1.default.join(process.cwd(), ".github/workflows/auto-merge.yml");
    fs_1.default.mkdirSync(path_1.default.dirname(workflowPath), { recursive: true });
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
    fs_1.default.writeFileSync(workflowPath, content, "utf-8");
    console.log(`✅ GitHub Action workflow created at: ${workflowPath}`);
});
program.parse();
