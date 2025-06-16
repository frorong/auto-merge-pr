"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDuration = parseDuration;
// src/utils/parseDuration.ts
function parseDuration(input) {
    const regex = /(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?/;
    const match = input.match(regex);
    if (!match)
        throw new Error(`Invalid duration format: ${input}`);
    const [, days, hours, minutes] = match.map(Number);
    const ms = (days || 0) * 86400000 + (hours || 0) * 3600000 + (minutes || 0) * 60000;
    if (ms === 0)
        throw new Error(`Duration must be greater than 0: ${input}`);
    return ms;
}
