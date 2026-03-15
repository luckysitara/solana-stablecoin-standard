import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { MintParams, BurnParams, UpdateRolesParams, UpdateMinterParams } from "./types";
import { type CreateStablecoinParams } from "./types";
type SSSProgram = Program;
export interface StablecoinState {
    authority: PublicKey;
    mint: PublicKey;
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    enable_permanent_delegate: boolean;
    enable_transfer_hook: boolean;
    default_account_frozen: boolean;
    paused: boolean;
    total_minted: BN;
    total_burned: BN;
    bump: number;
}
export declare function toStablecoinState(raw: unknown): StablecoinState;
export declare class SolanaStablecoin {
    readonly program: SSSProgram;
    readonly provider: AnchorProvider;
    readonly mintAddress: PublicKey;
    readonly stablecoin: PublicKey;
    readonly stablecoinBump: number;
    private _state;
    private constructor();
    static load(program: SSSProgram, mint: PublicKey): Promise<SolanaStablecoin>;
    /**
     * Load a stablecoin by mint using only a connection. Builds a provider from the given signer
     * or from KEYPAIR_PATH env (if set). Use when you do not already have a Program instance.
     */
    static loadFromConnection(connection: Connection, mint: PublicKey, signer?: Keypair): Promise<SolanaStablecoin>;
    static create(programOrConnection: SSSProgram | Connection, params: CreateStablecoinParams, signer?: Keypair): Promise<SolanaStablecoin>;
    refresh(): Promise<StablecoinState>;
    getState(): Promise<StablecoinState>;
    isSSS2(): boolean;
    getTotalSupply(): Promise<BN>;
    getRecipientTokenAccount(owner: PublicKey): PublicKey;
    mint(signer: PublicKey | Keypair, params: MintParams): Promise<string>;
    burn(signer: PublicKey | Keypair, params: BurnParams): Promise<string>;
    freezeAccount(signer: PublicKey, targetTokenAccount: PublicKey): Promise<string>;
    thawAccount(signer: PublicKey, targetTokenAccount: PublicKey): Promise<string>;
    pause(signer: PublicKey): Promise<string>;
    unpause(signer: PublicKey): Promise<string>;
    updateRoles(signer: PublicKey, params: UpdateRolesParams): Promise<string>;
    updateMinter(signer: PublicKey, params: UpdateMinterParams): Promise<string>;
    updateSupplyCap(signer: PublicKey, cap: bigint): Promise<string>;
    getSupplyCap(): Promise<bigint | null>;
    transferAuthority(signer: PublicKey, newAuthority: PublicKey): Promise<string>;
    readonly compliance: {
        blacklistAdd: (signer: PublicKey, address: PublicKey, reason: string) => Promise<string>;
        blacklistRemove: (signer: PublicKey, address: PublicKey) => Promise<string>;
        seize: (signer: PublicKey, sourceTokenAccount: PublicKey, destinationTokenAccount: PublicKey) => Promise<string>;
    };
    readonly privacy: {
        initializePrivacyConfig: (signer: PublicKey, privacyEnabled: boolean, minAllowlistSize: number) => Promise<string>;
        addToAllowlist: (signer: PublicKey, addressToAdd: PublicKey, expirySlot?: bigint | null) => Promise<string>;
        confidentialMint: (signer: PublicKey, recipient: PublicKey, amount: bigint) => Promise<string>;
    };
}
export declare function getProgram(provider: AnchorProvider): Program;
export {};
//# sourceMappingURL=stablecoin.d.ts.map