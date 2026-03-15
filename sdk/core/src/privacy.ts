import { PublicKey } from "@solana/web3.js";

/** Privacy levels for SSS-3 */
export enum PrivacyLevel {
  None = 0,
  ScopedAllowlist = 1,
  ZkProof = 2,
}

/** Status of allowlist entry */
export enum AllowlistStatus {
  Active = 0,
  Revoked = 1,
  Expired = 2,
}

/** Privacy configuration state */
export interface PrivacyConfig {
  stablecoin: PublicKey;
  authority: PublicKey;
  privacyLevel: PrivacyLevel;
  privacyEnabled: boolean;
  minAllowlistSize: number;
  activeAllowlistEntries: number;
  totalConfidentialMints: bigint;
  totalConfidentialTransfers: bigint;
  lastUpdatedSlot: bigint;
  bump: number;
}

/** Allowlist entry for privacy-enabled addresses */
export interface AllowlistEntry {
  stablecoin: PublicKey;
  address: PublicKey;
  status: AllowlistStatus;
  addedBy: PublicKey;
  addedAtSlot: bigint;
  expirySlot: bigint | null;
  transferCount: number;
  totalAmountTransferred: bigint;
  bump: number;
}

/** Confidential transfer state for auditing */
export interface ConfidentialState {
  stablecoin: PublicKey;
  recipient: PublicKey;
  totalReceived: bigint;
  lastTransferSlot: bigint;
  operationCount: number;
  bump: number;
}

/** Parameters for initializing privacy config */
export interface InitializePrivacyParams {
  stablecoin: PublicKey;
  authority: PublicKey;
  privacyEnabled: boolean;
  minAllowlistSize: number;
}

/** Parameters for adding to allowlist */
export interface AddToAllowlistParams {
  stablecoin: PublicKey;
  authority: PublicKey;
  addressToAdd: PublicKey;
  expirySlot?: bigint;
}

/** Parameters for confidential mint */
export interface ConfidentialMintParams {
  stablecoin: PublicKey;
  minter: PublicKey;
  recipient: PublicKey;
  amount: bigint;
}

/** Parameters for confidential transfer */
export interface ConfidentialTransferParams {
  stablecoin: PublicKey;
  sender: PublicKey;
  recipient: PublicKey;
  amount: bigint;
}

/** SSS-3 Privacy Presets */
export const PrivacyPresets = {
  BASIC: {
    privacyEnabled: true,
    minAllowlistSize: 5,
  },
  STRICT: {
    privacyEnabled: true,
    minAllowlistSize: 20,
  },
  PERMISSIVE: {
    privacyEnabled: true,
    minAllowlistSize: 1,
  },
} as const;

export type PrivacyPresetName = keyof typeof PrivacyPresets;
