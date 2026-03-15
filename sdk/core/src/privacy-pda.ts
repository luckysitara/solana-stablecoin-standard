import { PublicKey } from "@solana/web3.js";
import { SSS_PRIVACY_PROGRAM_ID } from "./constants";

const PRIVACY_CONFIG_SEED = Buffer.from("privacy_config");
const ALLOWLIST_ENTRY_SEED = Buffer.from("allowlist_entry");
const CONFIDENTIAL_STATE_SEED = Buffer.from("confidential_state");

/**
 * Derive the Privacy Config PDA for a stablecoin
 * Seeds: [b"privacy_config", stablecoin_pda]
 */
export function findPrivacyConfigPDA(
  stablecoinPDA: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [PRIVACY_CONFIG_SEED, stablecoinPDA.toBuffer()],
    SSS_PRIVACY_PROGRAM_ID
  );
}

/**
 * Derive an Allowlist Entry PDA
 * Seeds: [b"allowlist_entry", stablecoin_pda, address]
 */
export function findAllowlistEntryPDA(
  stablecoinPDA: PublicKey,
  address: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [ALLOWLIST_ENTRY_SEED, stablecoinPDA.toBuffer(), address.toBuffer()],
    SSS_PRIVACY_PROGRAM_ID
  );
}

/**
 * Derive a Confidential State PDA
 * Seeds: [b"confidential_state", stablecoin_pda, recipient]
 */
export function findConfidentialStatePDA(
  stablecoinPDA: PublicKey,
  recipient: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [CONFIDENTIAL_STATE_SEED, stablecoinPDA.toBuffer(), recipient.toBuffer()],
    SSS_PRIVACY_PROGRAM_ID
  );
}
