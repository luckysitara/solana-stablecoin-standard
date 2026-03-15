use anchor_lang::prelude::*;

/// Emitted when privacy configuration is initialized
#[event]
pub struct PrivacyConfigInitialized {
    pub stablecoin: Pubkey,
    pub authority: Pubkey,
    pub privacy_enabled: bool,
    pub min_allowlist_size: u32,
    pub timestamp: i64,
}

/// Emitted when address is added to allowlist
#[event]
pub struct AllowlistEntryAdded {
    pub stablecoin: Pubkey,
    pub address: Pubkey,
    pub added_by: Pubkey,
    pub expiry_slot: Option<u64>,
    pub timestamp: i64,
}

/// Emitted when address is removed from allowlist
#[event]
pub struct AllowlistEntryRemoved {
    pub stablecoin: Pubkey,
    pub address: Pubkey,
    pub removed_by: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

/// Emitted when confidential mint is performed
#[event]
pub struct ConfidentialMinted {
    pub stablecoin: Pubkey,
    pub minter: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
    pub timestamp: i64,
}

/// Emitted when confidential transfer is performed
#[event]
pub struct ConfidentialTransferred {
    pub stablecoin: Pubkey,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

/// Emitted when privacy config is updated
#[event]
pub struct PrivacyConfigUpdated {
    pub stablecoin: Pubkey,
    pub updated_by: Pubkey,
    pub privacy_enabled: bool,
    pub new_min_allowlist_size: u32,
    pub timestamp: i64,
}
