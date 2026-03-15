import { PublicKey } from '@solana/web3.js';

export enum PrivacyLevel {
  None = 0,
  ScopedAllowlist = 1,
  ZkProof = 2,
}

export enum AllowlistStatus {
  Active = 0,
  Revoked = 1,
  Expired = 2,
}

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

export interface ConfidentialState {
  stablecoin: PublicKey;
  recipient: PublicKey;
  totalReceived: bigint;
  lastTransferSlot: bigint;
  operationCount: number;
  bump: number;
}

export type StablecoinPreset = 'sss1' | 'sss2' | 'sss3';

export interface StablecoinInfo {
  mint: PublicKey;
  name: string;
  symbol: string;
  decimals: number;
  authority: PublicKey;
  preset: StablecoinPreset;
  privacyEnabled?: boolean;
  totalMinted?: bigint;
  totalBurned?: bigint;
}
