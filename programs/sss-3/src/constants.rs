/// Privacy configuration PDA seed
pub const PRIVACY_CONFIG_SEED: &[u8] = b"privacy_config";

/// Allowlist entry PDA seed
pub const ALLOWLIST_ENTRY_SEED: &[u8] = b"allowlist_entry";

/// Confidential state PDA seed
pub const CONFIDENTIAL_STATE_SEED: &[u8] = b"confidential_state";

/// Maximum allowlist entries per stablecoin
pub const MAX_ALLOWLIST_ENTRIES: u32 = 1000;

/// Maximum reason length for audit logging
pub const MAX_REASON_LEN: usize = 100;

/// Maximum recipient addresses per transaction (for batch transfers)
pub const MAX_RECIPIENTS_PER_TX: usize = 10;
