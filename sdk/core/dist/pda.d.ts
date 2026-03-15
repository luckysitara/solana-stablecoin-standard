import { PublicKey } from "@solana/web3.js";
export declare const STABLECOIN_SEED: Buffer<ArrayBuffer>;
export declare const ROLE_SEED: Buffer<ArrayBuffer>;
export declare const MINTER_SEED: Buffer<ArrayBuffer>;
export declare const BLACKLIST_SEED: Buffer<ArrayBuffer>;
export declare const SUPPLY_CAP_SEED: Buffer<ArrayBuffer>;
export declare const EXTRA_ACCOUNT_METAS_SEED: Buffer<ArrayBuffer>;
export declare function findStablecoinPDA(mint: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findRolePDA(stablecoin: PublicKey, holder: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findMinterPDA(stablecoin: PublicKey, minter: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findBlacklistPDA(stablecoin: PublicKey, address: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findSupplyCapPDA(stablecoin: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findExtraAccountMetasPDA(mint: PublicKey, hookProgramId: PublicKey): [PublicKey, number];
//# sourceMappingURL=pda.d.ts.map