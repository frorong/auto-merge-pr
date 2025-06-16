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
exports.autoMergePRs = autoMergePRs;
const axios_1 = __importDefault(require("axios"));
const parseDuration_js_1 = require("./utils/parseDuration.js"); // 새로 추가할 유틸
function autoMergePRs(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { token, owner, repo, threshold, after, label, mergeMethod = "squash", } = options;
        const headers = {
            Authorization: `token ${token}`,
            "User-Agent": "auto-merge-script",
            Accept: "application/vnd.github+json",
        };
        // 기준 시간 계산 (ms)
        const thresholdMs = after
            ? (0, parseDuration_js_1.parseDuration)(after)
            : threshold !== undefined
                ? threshold * 86400000
                : undefined;
        if (!thresholdMs) {
            throw new Error("Must provide either 'threshold' or 'after' option.");
        }
        const now = Date.now();
        const prsRes = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`, { headers });
        for (const pr of prsRes.data) {
            const createdAt = new Date(pr.created_at).getTime();
            const prLabels = pr.labels.map((l) => l.name);
            if (now - createdAt < thresholdMs)
                continue;
            if (label && !prLabels.includes(label))
                continue;
            const mergeableRes = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}`, { headers });
            const mergeable = mergeableRes.data.mergeable;
            if (mergeable === false)
                continue;
            try {
                yield axios_1.default.put(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/merge`, { merge_method: mergeMethod }, { headers });
                console.log(`✅ Merged PR #${pr.number} (${pr.title})`);
            }
            catch (err) {
                console.error(`❌ Failed to merge PR #${pr.number}:`, ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || err.message);
            }
        }
    });
}
