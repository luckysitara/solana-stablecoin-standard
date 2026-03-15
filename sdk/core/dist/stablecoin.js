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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaStablecoin = void 0;
exports.toStablecoinState = toStablecoinState;
exports.getProgram = getProgram;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const solana_stablecoin_standard_json_1 = __importDefault(require("./idl/solana_stablecoin_standard.json"));
const sss_transfer_hook_json_1 = __importDefault(require("./idl/sss_transfer_hook.json"));
const sss_privacy_json_1 = __importDefault(require("./idl/sss_privacy.json"));
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const privacy_pda_1 = require("./privacy-pda");
const types_1 = require("./types");
const errors_1 = require("./errors");
const ASSOCIATED_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const SYSTEM_PROGRAM_ID = new web3_js_1.PublicKey("11111111111111111111111111111111");
function toStablecoinState(raw) {
    const r = raw;
    const toBN = (v) => {
        if (v == null)
            return new anchor_1.BN(0);
        if (anchor_1.BN.isBN(v))
            return v;
        if (typeof v === "bigint")
            return new anchor_1.BN(v.toString());
        if (typeof v === "number")
            return new anchor_1.BN(v);
        return new anchor_1.BN(String(v));
    };
    const totalMinted = r.total_minted ?? r.totalMinted;
    const totalBurned = r.total_burned ?? r.totalBurned;
    return {
        authority: new web3_js_1.PublicKey(r.authority),
        mint: new web3_js_1.PublicKey(r.mint),
        name: r.name ?? "",
        symbol: r.symbol ?? "",
        uri: r.uri ?? "",
        decimals: r.decimals ?? 0,
        enable_permanent_delegate: (r.enable_permanent_delegate ?? r.enablePermanentDelegate),
        enable_transfer_hook: (r.enable_transfer_hook ?? r.enableTransferHook),
        default_account_frozen: (r.default_account_frozen ?? r.defaultAccountFrozen),
        paused: r.paused ?? false,
        total_minted: toBN(totalMinted),
        total_burned: toBN(totalBurned),
        bump: r.bump ?? 0,
    };
}
class SolanaStablecoin {
    constructor(program, provider, mintAddress, stablecoin, stablecoinBump) {
        this._state = null;
        this.compliance = {
            blacklistAdd: async (signer, address, reason) => {
                const state = await this.getState();
                if (!state.enable_transfer_hook || !state.enable_permanent_delegate) {
                    throw new errors_1.ComplianceNotEnabledError();
                }
                const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
                const [blacklistPda] = (0, pda_1.findBlacklistPDA)(this.stablecoin, address, this.program.programId);
                return this.program.methods
                    .addToBlacklist(reason)
                    .accountsStrict({
                    blacklister: signer,
                    stablecoin: this.stablecoin,
                    role: rolePda,
                    blacklistEntry: blacklistPda,
                    address,
                    systemProgram: SYSTEM_PROGRAM_ID,
                })
                    .rpc();
            },
            blacklistRemove: async (signer, address) => {
                const state = await this.getState();
                if (!state.enable_transfer_hook || !state.enable_permanent_delegate) {
                    throw new errors_1.ComplianceNotEnabledError();
                }
                const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
                const [blacklistPda] = (0, pda_1.findBlacklistPDA)(this.stablecoin, address, this.program.programId);
                return this.program.methods
                    .removeFromBlacklist()
                    .accountsStrict({
                    blacklister: signer,
                    stablecoin: this.stablecoin,
                    role: rolePda,
                    blacklistEntry: blacklistPda,
                    address,
                })
                    .rpc();
            },
            seize: async (signer, sourceTokenAccount, destinationTokenAccount) => {
                const state = await this.getState();
                if (!state.enable_permanent_delegate ||
                    !state.enable_transfer_hook) {
                    throw new errors_1.ComplianceNotEnabledError();
                }
                const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
                const [extraMetasPda] = (0, pda_1.findExtraAccountMetasPDA)(this.mintAddress, constants_1.SSS_HOOK_PROGRAM_ID);
                const sourceAccount = await (0, spl_token_1.getAccount)(this.provider.connection, sourceTokenAccount, "confirmed", constants_1.TOKEN_2022_PROGRAM_ID);
                const destAccount = await (0, spl_token_1.getAccount)(this.provider.connection, destinationTokenAccount, "confirmed", constants_1.TOKEN_2022_PROGRAM_ID);
                const sourceOwner = sourceAccount.owner;
                const destOwner = destAccount.owner;
                const [sourceBlacklistPda] = (0, pda_1.findBlacklistPDA)(this.stablecoin, sourceOwner, this.program.programId);
                const [destBlacklistPda] = (0, pda_1.findBlacklistPDA)(this.stablecoin, destOwner, this.program.programId);
                return this.program.methods
                    .seize()
                    .accountsStrict({
                    seizer: signer,
                    stablecoin: this.stablecoin,
                    role: rolePda,
                    mint: this.mintAddress,
                    sourceTokenAccount,
                    destinationTokenAccount,
                    transferHookProgram: constants_1.SSS_HOOK_PROGRAM_ID,
                    extraAccountMetas: extraMetasPda,
                    sssTokenProgram: constants_1.SSS_TOKEN_PROGRAM_ID,
                    sourceBlacklist: sourceBlacklistPda,
                    destBlacklist: destBlacklistPda,
                    tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
                })
                    .rpc();
            },
        };
        this.privacy = {
            initializePrivacyConfig: async (signer, privacyEnabled, minAllowlistSize) => {
                const [privacyConfig] = (0, privacy_pda_1.findPrivacyConfigPDA)(this.stablecoin);
                const { Program: AnchorProgram } = await Promise.resolve().then(() => __importStar(require("@coral-xyz/anchor")));
                const privacyProgram = new AnchorProgram(sss_privacy_json_1.default, this.provider);
                return privacyProgram.methods
                    .initializePrivacyConfig(privacyEnabled, minAllowlistSize)
                    .accounts({
                    authority: signer,
                    stablecoin: this.stablecoin,
                    privacyConfig,
                    systemProgram: SYSTEM_PROGRAM_ID,
                    rent: new web3_js_1.PublicKey("SysvarRent111111111111111111111111111111111"),
                })
                    .rpc();
            },
            addToAllowlist: async (signer, addressToAdd, expirySlot = null) => {
                const [privacyConfig] = (0, privacy_pda_1.findPrivacyConfigPDA)(this.stablecoin);
                const [allowlistEntry] = (0, privacy_pda_1.findAllowlistEntryPDA)(this.stablecoin, addressToAdd);
                const { Program: AnchorProgram } = await Promise.resolve().then(() => __importStar(require("@coral-xyz/anchor")));
                const privacyProgram = new AnchorProgram(sss_privacy_json_1.default, this.provider);
                return privacyProgram.methods
                    .addToAllowlist(expirySlot === null ? null : new anchor_1.BN(expirySlot.toString()))
                    .accounts({
                    authority: signer,
                    privacyConfig,
                    stablecoin: this.stablecoin,
                    addressToAdd,
                    allowlistEntry,
                    systemProgram: SYSTEM_PROGRAM_ID,
                    rent: new web3_js_1.PublicKey("SysvarRent111111111111111111111111111111111"),
                })
                    .rpc();
            },
            confidentialMint: async (signer, recipient, amount) => {
                const [privacyConfig] = (0, privacy_pda_1.findPrivacyConfigPDA)(this.stablecoin);
                const [allowlistEntry] = (0, privacy_pda_1.findAllowlistEntryPDA)(this.stablecoin, recipient);
                const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, constants_1.SSS_TOKEN_PROGRAM_ID);
                const [minterInfoPda] = (0, pda_1.findMinterPDA)(this.stablecoin, signer, constants_1.SSS_TOKEN_PROGRAM_ID);
                const [supplyCapPda] = (0, pda_1.findSupplyCapPDA)(this.stablecoin, constants_1.SSS_TOKEN_PROGRAM_ID);
                const recipientAta = this.getRecipientTokenAccount(recipient);
                const { Program: AnchorProgram } = await Promise.resolve().then(() => __importStar(require("@coral-xyz/anchor")));
                const privacyProgram = new AnchorProgram(sss_privacy_json_1.default, this.provider);
                return privacyProgram.methods
                    .confidentialMint(new anchor_1.BN(amount.toString()))
                    .accounts({
                    minter: signer,
                    stablecoin: this.stablecoin,
                    privacyConfig,
                    recipient,
                    recipientAllowlist: allowlistEntry,
                    recipientTokenAccount: recipientAta,
                    sssTokenProgram: constants_1.SSS_TOKEN_PROGRAM_ID,
                    mint: this.mintAddress,
                    role: rolePda,
                    minterInfo: minterInfoPda,
                    supplyCap: supplyCapPda,
                    tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
                })
                    .rpc();
            }
        };
        this.program = program;
        this.provider = provider;
        this.mintAddress = mintAddress;
        this.stablecoin = stablecoin;
        this.stablecoinBump = stablecoinBump;
    }
    static async load(program, mint) {
        const [stablecoin, bump] = (0, pda_1.findStablecoinPDA)(mint, program.programId);
        const instance = new SolanaStablecoin(program, program.provider, mint, stablecoin, bump);
        await instance.refresh();
        return instance;
    }
    /**
     * Load a stablecoin by mint using only a connection. Builds a provider from the given signer
     * or from KEYPAIR_PATH env (if set). Use when you do not already have a Program instance.
     */
    static async loadFromConnection(connection, mint, signer) {
        let keypair;
        if (signer) {
            keypair = signer;
        }
        else {
            const keypairPath = process.env.KEYPAIR_PATH ||
                `${process.env.HOME ?? process.env.USERPROFILE ?? ""}/.config/solana/id.json`;
            const { readFileSync } = await Promise.resolve().then(() => __importStar(require("fs")));
            const secret = JSON.parse(readFileSync(keypairPath, "utf-8"));
            keypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secret));
        }
        const { AnchorProvider, Wallet } = await Promise.resolve().then(() => __importStar(require("@coral-xyz/anchor")));
        const provider = new AnchorProvider(connection, new Wallet(keypair), {});
        const program = new anchor_1.Program(solana_stablecoin_standard_json_1.default, provider);
        return SolanaStablecoin.load(program, mint);
    }
    static async create(programOrConnection, params, signer) {
        let program;
        let provider;
        let authority;
        if ("provider" in programOrConnection) {
            program = programOrConnection;
            provider = program.provider;
            authority = provider.wallet.publicKey;
        }
        else {
            if (!signer) {
                throw new Error("SolanaStablecoin.create with Connection requires a signer (authority) keypair.");
            }
            const { AnchorProvider, Wallet } = await Promise.resolve().then(() => __importStar(require("@coral-xyz/anchor")));
            provider = new AnchorProvider(programOrConnection, new Wallet(signer), {});
            program = new anchor_1.Program(solana_stablecoin_standard_json_1.default, provider);
            authority = signer.publicKey;
        }
        const initParams = (0, types_1.normalizeInitializeParams)(params);
        const mintKeypair = web3_js_1.Keypair.generate();
        const mintPk = mintKeypair.publicKey;
        const [stablecoinPda] = (0, pda_1.findStablecoinPDA)(mintPk, program.programId);
        const [authorityRolePda] = (0, pda_1.findRolePDA)(stablecoinPda, authority, program.programId);
        const initArgs = {
            name: initParams.name,
            symbol: initParams.symbol,
            uri: initParams.uri,
            decimals: initParams.decimals,
            enablePermanentDelegate: initParams.enable_permanent_delegate,
            enableTransferHook: initParams.enable_transfer_hook,
            defaultAccountFrozen: initParams.default_account_frozen,
        };
        const connection = provider.connection;
        let initSig;
        try {
            initSig = await program.methods
                .initializeStablecoin(initArgs)
                .accountsStrict({
                authority,
                stablecoin: stablecoinPda,
                mint: mintPk,
                authorityRole: authorityRolePda,
                transferHookProgram: constants_1.SSS_HOOK_PROGRAM_ID,
                tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
                systemProgram: SYSTEM_PROGRAM_ID,
            })
                .signers([mintKeypair])
                .rpc();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new Error(`Initialize stablecoin failed: ${msg}. Check RPC cluster (devnet/mainnet), program deployment, and signer balance.`);
        }
        const commitment = "confirmed";
        for (let i = 0; i < 25; i++) {
            const info = await connection.getAccountInfo(stablecoinPda, { commitment });
            if (info?.data)
                break;
            if (i === 24) {
                throw new Error(`Stablecoin PDA not found after init (tx: ${initSig}). Init may have failed on-chain or RPC is lagging. Check explorer for tx.`);
            }
            await new Promise((r) => setTimeout(r, 1200));
        }
        const isSSS2 = initParams.enable_permanent_delegate && initParams.enable_transfer_hook;
        if (isSSS2) {
            const [extraMetasPda] = (0, pda_1.findExtraAccountMetasPDA)(mintPk, constants_1.SSS_HOOK_PROGRAM_ID);
            const { Program: AnchorProgram } = await Promise.resolve().then(() => __importStar(require("@coral-xyz/anchor")));
            const hookProgram = new AnchorProgram(sss_transfer_hook_json_1.default, provider);
            await hookProgram.methods
                .initializeExtraAccountMetaList(program.programId)
                .accountsStrict({
                authority,
                extraAccountMetaList: extraMetasPda,
                mint: mintPk,
                systemProgram: SYSTEM_PROGRAM_ID,
            })
                .rpc();
        }
        return SolanaStablecoin.load(program, mintPk);
    }
    async refresh() {
        const accountNs = this.program.account;
        const fetchAccount = () => accountNs["stablecoinState"]?.fetch(this.stablecoin) ??
            accountNs["StablecoinState"]?.fetch(this.stablecoin);
        let raw = null;
        for (let i = 0; i < 15; i++) {
            try {
                raw = await fetchAccount();
                if (raw)
                    break;
            }
            catch {
                if (i === 14)
                    throw new Error("Stablecoin state account not found");
            }
            await new Promise((r) => setTimeout(r, 2000));
        }
        if (!raw)
            throw new Error("Stablecoin state account not found");
        const state = toStablecoinState(raw);
        this._state = state;
        return state;
    }
    async getState() {
        if (!this._state)
            await this.refresh();
        return this._state;
    }
    isSSS2() {
        if (!this._state)
            return false;
        return (this._state.enable_permanent_delegate &&
            this._state.enable_transfer_hook);
    }
    async getTotalSupply() {
        await this.refresh();
        const state = this._state;
        return state.total_minted.sub(state.total_burned);
    }
    getRecipientTokenAccount(owner) {
        return (0, spl_token_1.getAssociatedTokenAddressSync)(this.mintAddress, owner, false, constants_1.TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    }
    async mint(signer, params) {
        const signerPubkey = signer instanceof web3_js_1.Keypair ? signer.publicKey : new web3_js_1.PublicKey(signer);
        const signerKeypair = signer instanceof web3_js_1.Keypair ? signer : null;
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, params.minter, this.program.programId);
        const [minterInfoPda] = (0, pda_1.findMinterPDA)(this.stablecoin, params.minter, this.program.programId);
        const recipientAta = this.getRecipientTokenAccount(params.recipient);
        const connection = this.provider.connection;
        const needsAta = !(await connection.getAccountInfo(recipientAta));
        const [supplyCapPda] = (0, pda_1.findSupplyCapPDA)(this.stablecoin, this.program.programId);
        const supplyCapInfo = await connection.getAccountInfo(supplyCapPda);
        const supplyCapAccount = supplyCapInfo ? supplyCapPda : this.program.programId;
        const mintAccounts = {
            minter: params.minter,
            stablecoin: this.stablecoin,
            role: rolePda,
            minterInfo: minterInfoPda,
            mint: this.mintAddress,
            recipientTokenAccount: recipientAta,
            tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
            supplyCap: supplyCapAccount,
        };
        const mintIxBuilder = this.program.methods
            .mintTokens(new anchor_1.BN(params.amount.toString()))
            .accountsStrict(mintAccounts);
        const mintIx = await mintIxBuilder.instruction();
        if (needsAta) {
            const createAtaIx = (0, spl_token_1.createAssociatedTokenAccountInstruction)(signerPubkey, recipientAta, params.recipient, this.mintAddress, constants_1.TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            const { blockhash } = await connection.getLatestBlockhash();
            const tx = new web3_js_1.Transaction().add(createAtaIx, mintIx);
            tx.recentBlockhash = blockhash;
            tx.feePayer = signerPubkey;
            const extraSigners = signerKeypair ? [signerKeypair] : [];
            return this.provider.sendAndConfirm(tx, extraSigners);
        }
        if (signerKeypair) {
            const { blockhash } = await connection.getLatestBlockhash();
            const tx = new web3_js_1.Transaction().add(mintIx);
            tx.recentBlockhash = blockhash;
            tx.feePayer = this.provider.wallet.publicKey;
            return this.provider.sendAndConfirm(tx, [signerKeypair]);
        }
        return mintIxBuilder.rpc();
    }
    async burn(signer, params) {
        const signerPubkey = signer instanceof web3_js_1.Keypair ? signer.publicKey : new web3_js_1.PublicKey(signer);
        const signerKeypair = signer instanceof web3_js_1.Keypair ? signer : null;
        const burnerAta = this.getRecipientTokenAccount(signerPubkey);
        const amount = BigInt(params.amount.toString());
        // Pre-check: burner's token account must exist and have sufficient balance
        try {
            const account = await (0, spl_token_1.getAccount)(this.provider.connection, burnerAta, "confirmed", constants_1.TOKEN_2022_PROGRAM_ID);
            const balance = account.amount;
            if (balance < amount) {
                throw new Error(`Insufficient balance: signer has ${balance.toString()} tokens, tried to burn ${amount.toString()}. ` +
                    "Burn burns from the signer's token account. Mint to the signer first, or burn less.");
            }
        }
        catch (e) {
            if (e instanceof Error) {
                if (e.message.includes("Insufficient balance"))
                    throw e;
                const isNotFound = e.name === "TokenAccountNotFoundError" ||
                    e.message.includes("could not find account") ||
                    e.message.includes("Account does not exist");
                if (isNotFound) {
                    throw new Error(`Burner's token account does not exist. ` +
                        `The signer (${signerPubkey.toBase58()}) must hold tokens before burning. ` +
                        "Mint tokens to the signer first.");
                }
            }
            throw e;
        }
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signerPubkey, this.program.programId);
        const burnIxBuilder = this.program.methods
            .burnTokens(new anchor_1.BN(params.amount.toString()))
            .accountsStrict({
            burner: signerPubkey,
            stablecoin: this.stablecoin,
            role: rolePda,
            mint: this.mintAddress,
            burnerTokenAccount: burnerAta,
            tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
        });
        if (signerKeypair) {
            const burnIx = await burnIxBuilder.instruction();
            const connection = this.provider.connection;
            const { blockhash } = await connection.getLatestBlockhash();
            const tx = new web3_js_1.Transaction().add(burnIx);
            tx.recentBlockhash = blockhash;
            tx.feePayer = this.provider.wallet.publicKey;
            return this.provider.sendAndConfirm(tx, [signerKeypair]);
        }
        return burnIxBuilder.rpc();
    }
    async freezeAccount(signer, targetTokenAccount) {
        // Pre-check: target token account must exist
        try {
            await (0, spl_token_1.getAccount)(this.provider.connection, targetTokenAccount, "confirmed", constants_1.TOKEN_2022_PROGRAM_ID);
        }
        catch (e) {
            const isNotFound = e instanceof Error &&
                (e.name === "TokenAccountNotFoundError" ||
                    e.message.includes("could not find account") ||
                    e.message.includes("Account does not exist"));
            if (isNotFound) {
                throw new Error(`Token account does not exist: ${targetTokenAccount.toBase58()}. ` +
                    "The owner must have a token account for this mint. Mint to that owner first.");
            }
            throw e;
        }
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
        return this.program.methods
            .freezeAccount()
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            role: rolePda,
            mint: this.mintAddress,
            targetTokenAccount,
            tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
        })
            .rpc();
    }
    async thawAccount(signer, targetTokenAccount) {
        // Pre-check: target token account must exist
        try {
            await (0, spl_token_1.getAccount)(this.provider.connection, targetTokenAccount, "confirmed", constants_1.TOKEN_2022_PROGRAM_ID);
        }
        catch (e) {
            const isNotFound = e instanceof Error &&
                (e.name === "TokenAccountNotFoundError" ||
                    e.message.includes("could not find account") ||
                    e.message.includes("Account does not exist"));
            if (isNotFound) {
                throw new Error(`Token account does not exist: ${targetTokenAccount.toBase58()}. ` +
                    "The owner must have a token account for this mint. Mint to that owner first.");
            }
            throw e;
        }
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
        return this.program.methods
            .thawAccount()
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            role: rolePda,
            mint: this.mintAddress,
            targetTokenAccount,
            tokenProgram: constants_1.TOKEN_2022_PROGRAM_ID,
        })
            .rpc();
    }
    async pause(signer) {
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
        return this.program.methods
            .pause()
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            role: rolePda,
        })
            .rpc();
    }
    async unpause(signer) {
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, signer, this.program.programId);
        return this.program.methods
            .unpause()
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            role: rolePda,
        })
            .rpc();
    }
    async updateRoles(signer, params) {
        const [rolePda] = (0, pda_1.findRolePDA)(this.stablecoin, params.holder, this.program.programId);
        const roles = {
            isMinter: params.roles.isMinter,
            isBurner: params.roles.isBurner,
            isPauser: params.roles.isPauser,
            isFreezer: params.roles.isFreezer,
            isBlacklister: params.roles.isBlacklister,
            isSeizer: params.roles.isSeizer,
        };
        return this.program.methods
            .updateRoles(roles)
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            role: rolePda,
            holder: params.holder,
            systemProgram: SYSTEM_PROGRAM_ID,
        })
            .rpc();
    }
    async updateMinter(signer, params) {
        const [minterInfoPda] = (0, pda_1.findMinterPDA)(this.stablecoin, params.minter, this.program.programId);
        return this.program.methods
            .updateMinter(new anchor_1.BN(params.quota.toString()))
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            minterInfo: minterInfoPda,
            minter: params.minter,
            systemProgram: SYSTEM_PROGRAM_ID,
        })
            .rpc();
    }
    async updateSupplyCap(signer, cap) {
        const [supplyCapPda] = (0, pda_1.findSupplyCapPDA)(this.stablecoin, this.program.programId);
        return this.program.methods
            .updateSupplyCap(new anchor_1.BN(cap.toString()))
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            supplyCap: supplyCapPda,
            systemProgram: SYSTEM_PROGRAM_ID,
        })
            .rpc();
    }
    async getSupplyCap() {
        const [supplyCapPda] = (0, pda_1.findSupplyCapPDA)(this.stablecoin, this.program.programId);
        const info = await this.provider.connection.getAccountInfo(supplyCapPda);
        if (!info?.data || info.data.length < 16)
            return null;
        const cap = info.data.readBigUInt64LE(8);
        return cap === BigInt("18446744073709551615") ? null : cap; // u64::MAX = no cap
    }
    async transferAuthority(signer, newAuthority) {
        return this.program.methods
            .transferAuthority()
            .accountsStrict({
            authority: signer,
            stablecoin: this.stablecoin,
            newAuthority,
        })
            .rpc();
    }
}
exports.SolanaStablecoin = SolanaStablecoin;
function getProgram(provider) {
    return new anchor_1.Program(solana_stablecoin_standard_json_1.default, provider);
}
