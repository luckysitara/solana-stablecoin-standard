import { PublicKey } from "@solana/web3.js";
/** Branded type for stablecoin token amounts (smallest unit, e.g. 6 decimals). Use for mint/burn/transfer. */
export type StablecoinAmount = bigint;
/** Coerce a bigint to StablecoinAmount (for explicit amount typing at API boundaries). */
export declare function toStablecoinAmount(n: bigint): StablecoinAmount;
/** Role names aligned with program RBAC. */
export type RoleName = "minter" | "burner" | "pauser" | "freezer" | "blacklister" | "seizer";
export interface StablecoinExtensions {
    enablePermanentDelegate: boolean;
    enableTransferHook: boolean;
    defaultAccountFrozen: boolean;
}
export declare const Presets: {
    readonly SSS_1: StablecoinExtensions;
    readonly SSS_2: StablecoinExtensions;
    readonly SSS_3: StablecoinExtensions;
};
export type PresetName = keyof typeof Presets;
/** Preset config: name + extensions. Use for preset vs custom in type system. */
export interface PresetConfig {
    name: PresetName;
    extensions: StablecoinExtensions;
}
export declare const PRESET_CONFIGS: Record<PresetName, PresetConfig>;
export interface CreateStablecoinParams {
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    preset?: PresetName;
    extensions?: Partial<StablecoinExtensions>;
}
export interface InitializeParams {
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    enable_permanent_delegate: boolean;
    enable_transfer_hook: boolean;
    default_account_frozen: boolean;
}
export interface RoleFlags {
    isMinter: boolean;
    isBurner: boolean;
    isPauser: boolean;
    isFreezer: boolean;
    isBlacklister: boolean;
    isSeizer: boolean;
}
export interface StablecoinStateType {
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
    total_minted: bigint;
    total_burned: bigint;
    bump: number;
}
export interface RoleAccount {
    stablecoin: PublicKey;
    holder: PublicKey;
    roles: RoleFlags;
    bump: number;
}
export interface MinterInfo {
    stablecoin: PublicKey;
    minter: PublicKey;
    quota: bigint;
    minted_amount: bigint;
    bump: number;
}
export interface MintParams {
    recipient: PublicKey;
    amount: StablecoinAmount;
    minter: PublicKey;
}
export interface BurnParams {
    amount: StablecoinAmount;
}
export interface UpdateRolesParams {
    holder: PublicKey;
    roles: RoleFlags;
}
export interface UpdateMinterParams {
    minter: PublicKey;
    quota: bigint;
}
export declare function normalizeInitializeParams(params: CreateStablecoinParams): InitializeParams;
//# sourceMappingURL=types.d.ts.map