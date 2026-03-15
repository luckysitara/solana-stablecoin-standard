#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const sss_token_1 = require("@stbr/sss-token");
function getConnection(rpcUrl) {
    return new web3_js_1.Connection(rpcUrl || process.env.RPC_URL || (0, web3_js_1.clusterApiUrl)("devnet"));
}
function getKeypair(keypairPath) {
    const kpPath = keypairPath || process.env.KEYPAIR || `${process.env.HOME}/.config/solana/id.json`;
    const data = JSON.parse(fs.readFileSync(kpPath, "utf-8"));
    return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(data));
}
function loadProgram(connection, wallet) {
    const provider = new anchor_1.AnchorProvider(connection, new anchor_1.Wallet(wallet), {});
    return (0, sss_token_1.getProgram)(provider);
}
function parseTomlLike(raw) {
    const out = {};
    for (const line of raw.split("\n")) {
        const m = line.match(/^\s*(\w+)\s*=\s*(.+)$/);
        if (m) {
            let v = m[2].trim().replace(/^["']|["']$/g, "");
            if (v === "true")
                v = true;
            if (v === "false")
                v = false;
            if (typeof v === "string" && /^\d+$/.test(v))
                v = parseInt(v, 10);
            out[m[1]] = v;
        }
    }
    return out;
}
function getExplorerTxUrl(signature, rpcUrl) {
    if (!rpcUrl)
        return "";
    const u = rpcUrl.toLowerCase();
    if (u.includes("devnet"))
        return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    if (u.includes("mainnet") && !u.includes("devnet"))
        return `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`;
    return "";
}
function logTx(sig, label, rpcUrl) {
    console.log(label + ":", sig);
    const url = getExplorerTxUrl(sig, rpcUrl);
    if (url)
        console.log("Explorer:", url);
}
const program = new commander_1.Command();
program
    .name("sss-token")
    .description("Admin CLI for Solana Stablecoin Standard")
    .option("-k, --keypair <path>", "Path to keypair JSON")
    .option("-u, --rpc-url <url>", "RPC URL")
    .option("-m, --mint <address>", "Stablecoin mint address (for non-init commands)")
    .option("--json", "Output JSON for read-only commands (status, supply, minters list, holders, audit-log)");
function getGlobalOpts() {
    return program.opts();
}
program
    .command("init")
    .description("Initialize a new stablecoin")
    .option("-p, --preset <sss-1|sss-2|sss-3>", "Preset: sss-1 (minimal), sss-2 (compliant) or sss-3 (privacy)")
    .option("-c, --custom <file>", "Custom config TOML/JSON file")
    .requiredOption("-n, --name <name>", "Token name")
    .requiredOption("-s, --symbol <symbol>", "Token symbol")
    .option("--uri <uri>", "Metadata URI", "")
    .option("--decimals <n>", "Decimals", "6")
    .action(async (...args) => {
    const opts = args[0];
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const authority = getKeypair(globalOpts.keypair);
    let preset = "SSS_1";
    if (opts.preset === "sss-2")
        preset = "SSS_2";
    if (opts.preset === "sss-3")
        preset = "SSS_3";
    let params = {
        name: opts.name,
        symbol: opts.symbol,
        uri: opts.uri ?? "",
        decimals: parseInt(opts.decimals ?? "6", 10),
        preset,
    };
    if (opts.custom) {
        const raw = fs.readFileSync(opts.custom, "utf-8");
        const config = opts.custom.endsWith(".json")
            ? JSON.parse(raw)
            : parseTomlLike(raw);
        params = { ...params, ...config, preset: undefined };
        if (config.extensions)
            params.extensions = config.extensions;
    }
    const stable = await sss_token_1.SolanaStablecoin.create(connection, params, authority);
    console.log("Stablecoin created. Mint:", stable.mintAddress.toBase58());
    const cluster = (globalOpts.rpcUrl || "").toLowerCase().includes("devnet") ? "devnet" : (globalOpts.rpcUrl || "").toLowerCase().includes("mainnet") ? "mainnet-beta" : null;
    if (cluster)
        console.log("Explorer:", `https://explorer.solana.com/address/${stable.mintAddress.toBase58()}?cluster=${cluster}`);
});
// --- Privacy Commands (SSS-3) ---
program
    .command("privacy-init")
    .description("Initialize privacy configuration (SSS-3)")
    .option("--enabled", "Enable privacy immediately", "true")
    .option("--min-allowlist <n>", "Minimum allowlist size", "5")
    .action(async (opts) => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.privacy.initializePrivacyConfig(keypair.publicKey, opts.enabled === "true", parseInt(opts.minAllowlist, 10));
    logTx(sig, "Privacy init tx", globalOpts.rpcUrl);
});
program
    .command("privacy-allow <address>")
    .description("Add address to privacy allowlist (SSS-3)")
    .option("-e, --expiry <slot>", "Expiry slot (optional)")
    .action(async (address, opts) => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.privacy.addToAllowlist(keypair.publicKey, new web3_js_1.PublicKey(address), opts.expiry ? BigInt(opts.expiry) : null);
    logTx(sig, "Allowlist add tx", globalOpts.rpcUrl);
});
program
    .command("privacy-mint <recipient> <amount>")
    .description("Confidential mint (SSS-3)")
    .action(async (recipient, amount) => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.privacy.confidentialMint(keypair.publicKey, new web3_js_1.PublicKey(recipient), BigInt(amount));
    logTx(sig, "Confidential mint tx", globalOpts.rpcUrl);
});
program
    .command("mint <recipient> <amount>")
    .description("Mint tokens to recipient")
    .action(async (...args) => {
    const [recipient, amount] = args;
    const err = (0, sss_token_1.validateMintAmount)(amount ?? "0");
    if (err) {
        console.error(err);
        process.exit(1);
    }
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    try {
        const mint = new web3_js_1.PublicKey(mintAddr);
        const prog = loadProgram(connection, keypair);
        const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
        const sig = await stable.mint(keypair.publicKey, {
            recipient: new web3_js_1.PublicKey(recipient),
            amount: BigInt(amount),
            minter: keypair.publicKey,
        });
        logTx(sig, "Mint tx", globalOpts.rpcUrl);
    }
    catch (e) {
        console.error((0, sss_token_1.getErrorMessage)(e));
        process.exit(1);
    }
});
program
    .command("burn <amount>")
    .description("Burn tokens from signer")
    .action(async (...args) => {
    const [amount] = args;
    const err = (0, sss_token_1.validateBurnAmount)(amount ?? "0");
    if (err) {
        console.error(err);
        process.exit(1);
    }
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    try {
        const mint = new web3_js_1.PublicKey(mintAddr);
        const prog = loadProgram(connection, keypair);
        const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
        const sig = await stable.burn(keypair.publicKey, { amount: BigInt(amount) });
        logTx(sig, "Burn tx", globalOpts.rpcUrl);
    }
    catch (e) {
        console.error((0, sss_token_1.getErrorMessage)(e));
        process.exit(1);
    }
});
program
    .command("freeze <address>")
    .description("Freeze token account")
    .action(async (...args) => {
    const [address] = args;
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const targetAta = stable.getRecipientTokenAccount(new web3_js_1.PublicKey(address));
    const sig = await stable.freezeAccount(keypair.publicKey, targetAta);
    logTx(sig, "Freeze tx", globalOpts.rpcUrl);
});
program
    .command("thaw <address>")
    .description("Thaw token account")
    .action(async (...args) => {
    const [address] = args;
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const targetAta = stable.getRecipientTokenAccount(new web3_js_1.PublicKey(address));
    const sig = await stable.thawAccount(keypair.publicKey, targetAta);
    logTx(sig, "Thaw tx", globalOpts.rpcUrl);
});
program
    .command("pause")
    .description("Pause stablecoin")
    .action(async () => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.pause(keypair.publicKey);
    logTx(sig, "Pause tx", globalOpts.rpcUrl);
});
program
    .command("unpause")
    .description("Unpause stablecoin")
    .action(async () => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.unpause(keypair.publicKey);
    logTx(sig, "Unpause tx", globalOpts.rpcUrl);
});
program
    .command("status")
    .description("Show stablecoin status")
    .action(async () => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const keypair = getKeypair(globalOpts.keypair);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const state = await stable.getState();
    const supply = await stable.getTotalSupply();
    if (globalOpts.json) {
        console.log(JSON.stringify({
            mint: state.mint.toBase58(),
            name: state.name,
            symbol: state.symbol,
            decimals: state.decimals,
            paused: state.paused,
            totalMinted: state.total_minted.toString(),
            totalBurned: state.total_burned.toString(),
            supply: supply.toString(),
            authority: state.authority?.toBase58?.() ?? null,
            preset: stable.isSSS2() ? "SSS-2" : "SSS-1",
        }));
        return;
    }
    console.log("Mint:", state.mint.toBase58());
    console.log("Name:", state.name);
    console.log("Symbol:", state.symbol);
    console.log("Decimals:", state.decimals);
    console.log("Paused:", state.paused);
    console.log("SSS-2:", stable.isSSS2());
    console.log("Total minted:", state.total_minted.toString());
    console.log("Total burned:", state.total_burned.toString());
});
program
    .command("supply")
    .description("Show total supply")
    .action(async () => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const keypair = getKeypair(globalOpts.keypair);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const supply = await stable.getTotalSupply();
    if (globalOpts.json) {
        console.log(JSON.stringify({ supply: supply.toString() }));
        return;
    }
    console.log(supply.toString());
});
const supplyCap = new commander_1.Command("supply-cap").description("Supply cap (authority only)");
supplyCap
    .command("set <amount>")
    .description("Set supply cap (0 = remove cap)")
    .action(async (...args) => {
    const [amount] = args;
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const cap = BigInt(amount);
    const sig = await stable.updateSupplyCap(keypair.publicKey, cap);
    logTx(sig, "Supply cap tx", globalOpts.rpcUrl);
});
supplyCap
    .command("clear")
    .description("Remove supply cap")
    .action(async () => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.updateSupplyCap(keypair.publicKey, BigInt(0));
    logTx(sig, "Supply cap clear tx", globalOpts.rpcUrl);
});
supplyCap
    .command("get")
    .description("Show current supply cap (null = no cap)")
    .action(async () => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const keypair = getKeypair(globalOpts.keypair);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const cap = await stable.getSupplyCap();
    console.log(cap === null ? "null (no cap)" : cap.toString());
});
program.addCommand(supplyCap);
const blacklist = new commander_1.Command("blacklist").description("Blacklist management (SSS-2)");
blacklist
    .command("add <address>")
    .option("-r, --reason <reason>", "Reason", "CLI")
    .action(async function (...args) {
    const [address] = args;
    const opts = this.opts();
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.compliance.blacklistAdd(keypair.publicKey, new web3_js_1.PublicKey(address), opts.reason ?? "CLI");
    logTx(sig, "Blacklist add tx", globalOpts.rpcUrl);
});
blacklist
    .command("remove <address>")
    .action(async (...args) => {
    const [address] = args;
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.compliance.blacklistRemove(keypair.publicKey, new web3_js_1.PublicKey(address));
    logTx(sig, "Blacklist remove tx", globalOpts.rpcUrl);
});
program.addCommand(blacklist);
program
    .command("blacklist-add <address>")
    .description("(Alias) Add address to blacklist (SSS-2)")
    .option("-r, --reason <reason>", "Reason", "CLI")
    .action(async function (...args) {
    const [address] = args;
    const opts = this.opts();
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.compliance.blacklistAdd(keypair.publicKey, new web3_js_1.PublicKey(address), opts.reason ?? "CLI");
    logTx(sig, "Blacklist add tx", globalOpts.rpcUrl);
});
program
    .command("blacklist-remove <address>")
    .description("(Alias) Remove address from blacklist (SSS-2)")
    .action(async (...args) => {
    const [address] = args;
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.compliance.blacklistRemove(keypair.publicKey, new web3_js_1.PublicKey(address));
    logTx(sig, "Blacklist remove tx", globalOpts.rpcUrl);
});
program
    .command("seize <source-account>")
    .description("Seize tokens to treasury (SSS-2)")
    .requiredOption("-t, --to <treasury-account>", "Destination token account (treasury ATA)")
    .action(async function (...args) {
    const [sourceAccount] = args;
    const opts = this.opts();
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const sig = await stable.compliance.seize(keypair.publicKey, new web3_js_1.PublicKey(sourceAccount), new web3_js_1.PublicKey(opts.to));
    logTx(sig, "Seize tx", globalOpts.rpcUrl);
});
// ── Management: minters, holders, audit-log ─────────────────────────────────
const MINTER_INFO_SIZE = 8 + 32 + 32 + 8 + 8 + 1; // discriminator + stablecoin + minter + quota + minted_amount + bump
const mintersCmd = new commander_1.Command("minters").description("Minter management");
mintersCmd
    .command("list")
    .description("List minters and their quotas for the stablecoin")
    .action(async (..._args) => {
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const [stablecoinPDA] = (0, sss_token_1.findStablecoinPDA)(mint, sss_token_1.SSS_TOKEN_PROGRAM_ID);
    const accounts = await connection.getProgramAccounts(sss_token_1.SSS_TOKEN_PROGRAM_ID, {
        filters: [
            { dataSize: MINTER_INFO_SIZE },
            { memcmp: { offset: 8, bytes: stablecoinPDA.toBase58() } },
        ],
    });
    const list = [];
    for (const { account } of accounts) {
        const data = account.data;
        const minterPubkey = new web3_js_1.PublicKey(data.subarray(8 + 32, 8 + 32 + 32));
        const quota = data.readBigUInt64LE(8 + 32 + 32);
        const minted = data.readBigUInt64LE(8 + 32 + 32 + 8);
        list.push({
            address: minterPubkey.toBase58(),
            quota: quota.toString(),
            minted: minted.toString(),
        });
    }
    if (globalOpts.json) {
        console.log(JSON.stringify(list));
        return;
    }
    console.log("Minter (address)                    | Quota        | Minted");
    console.log("-                                   |--------------|--------------");
    for (const row of list) {
        console.log(`${row.address} | ${row.quota.padStart(12)} | ${row.minted.padStart(12)}`);
    }
});
mintersCmd
    .command("add <address>")
    .description("Grant minter role and set quota")
    .option("-q, --quota <amount>", "Mint quota (max amount this minter can mint)", "0")
    .action(async function (...args) {
    const [address] = args;
    const cmdOpts = this.opts();
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const minterPubkey = new web3_js_1.PublicKey(address);
    const quota = BigInt(cmdOpts.quota ?? "0");
    const sigRoles = await stable.updateRoles(keypair.publicKey, {
        holder: minterPubkey,
        roles: { isMinter: true, isBurner: true, isPauser: true, isFreezer: false, isBlacklister: false, isSeizer: false },
    });
    logTx(sigRoles, "Roles (minter + burner) tx", globalOpts.rpcUrl);
    const sigQuota = await stable.updateMinter(keypair.publicKey, { minter: minterPubkey, quota });
    logTx(sigQuota, "Minter quota tx", globalOpts.rpcUrl);
});
mintersCmd
    .command("remove <address>")
    .description("Revoke minter role")
    .action(async (...args) => {
    const [address] = args;
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const minterPubkey = new web3_js_1.PublicKey(address);
    const sig = await stable.updateRoles(keypair.publicKey, {
        holder: minterPubkey,
        roles: { isMinter: false, isBurner: false, isPauser: false, isFreezer: false, isBlacklister: false, isSeizer: false },
    });
    logTx(sig, "Minters remove tx", globalOpts.rpcUrl);
});
program.addCommand(mintersCmd);
const rolesCmd = new commander_1.Command("roles").description("Grant or update roles (authority only)");
rolesCmd
    .command("grant <address>")
    .description("Grant roles to an address. Pass flags for each role to grant.")
    .option("--minter", "Grant minter role")
    .option("--burner", "Grant burner role")
    .option("--pauser", "Grant pauser role")
    .option("--freezer", "Grant freezer role (freeze/thaw accounts)")
    .option("--blacklister", "Grant blacklister role (SSS-2)")
    .option("--seizer", "Grant seizer role (SSS-2)")
    .action(async function (...args) {
    const [address] = args;
    const opts = this.opts();
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const keypair = getKeypair(globalOpts.keypair);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const prog = loadProgram(connection, keypair);
    const stable = await sss_token_1.SolanaStablecoin.load(prog, mint);
    const holder = new web3_js_1.PublicKey(address);
    const roles = {
        isMinter: !!opts.minter,
        isBurner: !!opts.burner,
        isPauser: !!opts.pauser,
        isFreezer: !!opts.freezer,
        isBlacklister: !!opts.blacklister,
        isSeizer: !!opts.seizer,
    };
    const sig = await stable.updateRoles(keypair.publicKey, { holder, roles });
    logTx(sig, "Roles grant tx", globalOpts.rpcUrl);
});
program.addCommand(rolesCmd);
const TOKEN_ACCOUNT_SIZE = 165;
program
    .command("holders")
    .description("List token holders (by mint)")
    .option("--min-balance <amount>", "Minimum balance to include", "0")
    .action(async function (..._args) {
    const cmdOpts = this.opts();
    const globalOpts = getGlobalOpts();
    const connection = getConnection(globalOpts.rpcUrl);
    const mintAddr = globalOpts.mint;
    if (!mintAddr) {
        console.error("--mint required");
        process.exit(1);
    }
    const mint = new web3_js_1.PublicKey(mintAddr);
    const opts = cmdOpts;
    const minBalance = BigInt(opts.minBalance ?? "0");
    const accounts = await connection.getProgramAccounts(sss_token_1.TOKEN_2022_PROGRAM_ID, {
        filters: [
            { dataSize: TOKEN_ACCOUNT_SIZE },
            { memcmp: { offset: 0, bytes: mint.toBase58() } },
        ],
    });
    const entries = [];
    for (const { account } of accounts) {
        const data = account.data;
        const owner = new web3_js_1.PublicKey(data.subarray(32, 32 + 32));
        const amount = data.readBigUInt64LE(64);
        if (amount >= minBalance)
            entries.push({ owner: owner.toBase58(), amount: amount.toString() });
    }
    entries.sort((a, b) => (BigInt(b.amount) > BigInt(a.amount) ? 1 : -1));
    if (globalOpts.json) {
        console.log(JSON.stringify(entries));
        return;
    }
    if (entries.length === 0) {
        console.log("No holders meeting min-balance.");
        return;
    }
    console.log("Owner (address)                     | Balance");
    console.log("-                                   |--------------");
    for (const { owner, amount } of entries) {
        console.log(`${owner} | ${amount}`);
    }
});
program
    .command("audit-log")
    .description("Fetch audit log from backend (requires BACKEND_URL)")
    .option("-a, --action <type>", "Filter by action: mint, burn, blacklist_add, blacklist_remove, seize", "")
    .action(async function (..._args) {
    const cmdOpts = this.opts();
    const globalOpts = getGlobalOpts();
    const mintAddr = globalOpts.mint;
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        console.error("Set BACKEND_URL to the backend base URL (e.g. http://localhost:3000) to use audit-log.");
        process.exit(1);
    }
    const url = new URL("/compliance/audit-log", backendUrl);
    if (mintAddr)
        url.searchParams.set("mint", mintAddr);
    if (cmdOpts.action)
        url.searchParams.set("action", cmdOpts.action);
    const res = await fetch(url.toString());
    if (!res.ok) {
        console.error("Backend error:", res.status, await res.text());
        process.exit(1);
    }
    const text = await res.text();
    if (globalOpts.json) {
        let data;
        try {
            data = text ? JSON.parse(text) : { entries: [] };
        }
        catch {
            console.error("Backend did not return valid JSON");
            process.exit(1);
        }
        console.log(JSON.stringify(data));
        return;
    }
    console.log(text);
});
// Strip leading "--" from argv (pnpm run cli -- --help passes both)
if (process.argv[2] === "--") {
    process.argv.splice(2, 1);
}
program.parse();
