import { PublicKey } from "@solana/web3.js";
/**
 * Derive the Privacy Config PDA for a stablecoin
 * Seeds: [b"privacy_config", stablecoin_pda]
 */
export declare function findPrivacyConfigPDA(stablecoinPDA: PublicKey): [PublicKey, number];
/**
 * Derive an Allowlist Entry PDA
 * Seeds: [b"allowlist_entry", stablecoin_pda, address]
 */
export declare function findAllowlistEntryPDA(stablecoinPDA: PublicKey, address: PublicKey): [PublicKey, number];
/**
 * Derive a Confidential State PDA
 * Seeds: [b"confidential_state", stablecoin_pda, recipient]
 */
export declare function findConfidentialStatePDA(stablecoinPDA: PublicKey, recipient: PublicKey): [PublicKey, number];
//# sourceMappingURL=privacy-pda.d.ts.map