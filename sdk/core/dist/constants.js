"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSS_PRIVACY_PROGRAM_ID = exports.TOKEN_2022_PROGRAM_ID = exports.SSS_HOOK_PROGRAM_ID = exports.SSS_TOKEN_PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.SSS_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey(process.env.SSS_TOKEN_PROGRAM_ID ?? "47TNsKC1iJvLTKYRMbfYjrod4a56YE1f4qv73hZkdWUZ");
exports.SSS_HOOK_PROGRAM_ID = new web3_js_1.PublicKey("8DMsf39fGWfcrWVjfyEq8fqZf5YcTvVPGgdJr8s2S8Nc");
exports.TOKEN_2022_PROGRAM_ID = new web3_js_1.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
exports.SSS_PRIVACY_PROGRAM_ID = new web3_js_1.PublicKey(process.env.SSS_PRIVACY_PROGRAM_ID ?? "XSwLYVBfmBKaWKYF6fTcCng9DSRREArLQE1Cts32NkM");
