"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTRA_ACCOUNT_METAS_SEED = exports.SUPPLY_CAP_SEED = exports.BLACKLIST_SEED = exports.MINTER_SEED = exports.ROLE_SEED = exports.STABLECOIN_SEED = void 0;
exports.findStablecoinPDA = findStablecoinPDA;
exports.findRolePDA = findRolePDA;
exports.findMinterPDA = findMinterPDA;
exports.findBlacklistPDA = findBlacklistPDA;
exports.findSupplyCapPDA = findSupplyCapPDA;
exports.findExtraAccountMetasPDA = findExtraAccountMetasPDA;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
exports.STABLECOIN_SEED = Buffer.from("stablecoin");
exports.ROLE_SEED = Buffer.from("role");
exports.MINTER_SEED = Buffer.from("minter");
exports.BLACKLIST_SEED = Buffer.from("blacklist");
exports.SUPPLY_CAP_SEED = Buffer.from("supply_cap");
exports.EXTRA_ACCOUNT_METAS_SEED = Buffer.from("extra-account-metas");
function findStablecoinPDA(mint, programId = constants_1.SSS_TOKEN_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.STABLECOIN_SEED, mint.toBuffer()], programId);
}
function findRolePDA(stablecoin, holder, programId = constants_1.SSS_TOKEN_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.ROLE_SEED, stablecoin.toBuffer(), holder.toBuffer()], programId);
}
function findMinterPDA(stablecoin, minter, programId = constants_1.SSS_TOKEN_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.MINTER_SEED, stablecoin.toBuffer(), minter.toBuffer()], programId);
}
function findBlacklistPDA(stablecoin, address, programId = constants_1.SSS_TOKEN_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.BLACKLIST_SEED, stablecoin.toBuffer(), address.toBuffer()], programId);
}
function findSupplyCapPDA(stablecoin, programId = constants_1.SSS_TOKEN_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.SUPPLY_CAP_SEED, stablecoin.toBuffer()], programId);
}
function findExtraAccountMetasPDA(mint, hookProgramId) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.EXTRA_ACCOUNT_METAS_SEED, mint.toBuffer()], hookProgramId);
}
