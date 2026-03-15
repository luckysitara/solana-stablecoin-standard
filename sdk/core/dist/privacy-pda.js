"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPrivacyConfigPDA = findPrivacyConfigPDA;
exports.findAllowlistEntryPDA = findAllowlistEntryPDA;
exports.findConfidentialStatePDA = findConfidentialStatePDA;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const PRIVACY_CONFIG_SEED = Buffer.from("privacy_config");
const ALLOWLIST_ENTRY_SEED = Buffer.from("allowlist_entry");
const CONFIDENTIAL_STATE_SEED = Buffer.from("confidential_state");
/**
 * Derive the Privacy Config PDA for a stablecoin
 * Seeds: [b"privacy_config", stablecoin_pda]
 */
function findPrivacyConfigPDA(stablecoinPDA) {
    return web3_js_1.PublicKey.findProgramAddressSync([PRIVACY_CONFIG_SEED, stablecoinPDA.toBuffer()], constants_1.SSS_PRIVACY_PROGRAM_ID);
}
/**
 * Derive an Allowlist Entry PDA
 * Seeds: [b"allowlist_entry", stablecoin_pda, address]
 */
function findAllowlistEntryPDA(stablecoinPDA, address) {
    return web3_js_1.PublicKey.findProgramAddressSync([ALLOWLIST_ENTRY_SEED, stablecoinPDA.toBuffer(), address.toBuffer()], constants_1.SSS_PRIVACY_PROGRAM_ID);
}
/**
 * Derive a Confidential State PDA
 * Seeds: [b"confidential_state", stablecoin_pda, recipient]
 */
function findConfidentialStatePDA(stablecoinPDA, recipient) {
    return web3_js_1.PublicKey.findProgramAddressSync([CONFIDENTIAL_STATE_SEED, stablecoinPDA.toBuffer(), recipient.toBuffer()], constants_1.SSS_PRIVACY_PROGRAM_ID);
}
