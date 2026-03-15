use anchor_lang::prelude::*;
use crate::enums::PrivacyLevel;

/// Privacy configuration for a stablecoin
/// Seeds: [b"privacy_config", stablecoin.key().as_ref()]
#[account]
#[derive(InitSpace)]
pub struct PrivacyConfig {
    /// Parent stablecoin (SSS-1 or SSS-2)
    pub stablecoin: Pubkey,
    
    /// Authority managing privacy settings
    pub authority: Pubkey,
    
    /// Privacy level enforcement
    pub privacy_level: PrivacyLevel,
    
    /// Is privacy feature active for this stablecoin
    pub privacy_enabled: bool,
    
    /// Minimum number of allowlist entries before privacy can be enforced
    pub min_allowlist_size: u32,
    
    /// Current number of active allowlist entries
    pub active_allowlist_entries: u32,
    
    /// Total mints via confidential transfer
    pub total_confidential_mints: u64,
    
    /// Total transfers via confidential transfer
    pub total_confidential_transfers: u64,
    
    /// Last updated slot
    pub last_updated_slot: u64,
    
    /// PDA bump
    pub bump: u8,
}

impl PrivacyConfig {
    pub fn is_privacy_active(&self) -> bool {
        self.privacy_enabled && self.active_allowlist_entries >= self.min_allowlist_size
    }
}
