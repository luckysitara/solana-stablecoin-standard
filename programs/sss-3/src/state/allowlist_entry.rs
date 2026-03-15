use anchor_lang::prelude::*;
use crate::enums::AllowlistStatus;

/// Allowlist entry for privacy-enabled transfers
/// Seeds: [b"allowlist_entry", stablecoin.key().as_ref(), address.key().as_ref()]
#[account]
#[derive(InitSpace)]
pub struct AllowlistEntry {
    /// Parent stablecoin
    pub stablecoin: Pubkey,
    
    /// Address on the allowlist
    pub address: Pubkey,
    
    /// Current status (Active/Revoked/Expired)
    pub status: AllowlistStatus,
    
    /// Address that added this entry
    pub added_by: Pubkey,
    
    /// Slot when this entry was added
    pub added_at_slot: u64,
    
    /// Optional expiry slot (None means permanent)
    pub expiry_slot: Option<u64>,
    
    /// Number of transfers by this address
    pub transfer_count: u32,
    
    /// Total amount transferred by this address
    pub total_amount_transferred: u64,
    
    /// PDA bump
    pub bump: u8,
}

impl AllowlistEntry {
    pub fn is_valid(&self, current_slot: u64) -> bool {
        match self.status {
            AllowlistStatus::Active => {
                // Check if expired
                if let Some(expiry) = self.expiry_slot {
                    current_slot < expiry
                } else {
                    true
                }
            }
            _ => false,
        }
    }
}
