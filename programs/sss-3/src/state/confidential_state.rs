use anchor_lang::prelude::*;

/// Confidential transfer state for auditing
/// Seeds: [b"confidential_state", stablecoin.key().as_ref(), recipient.key().as_ref()]
#[account]
#[derive(InitSpace)]
pub struct ConfidentialState {
    /// Parent stablecoin
    pub stablecoin: Pubkey,
    
    /// Recipient of confidential transfers
    pub recipient: Pubkey,
    
    /// Total confidential amount received
    pub total_received: u64,
    
    /// Last confidential transfer slot
    pub last_transfer_slot: u64,
    
    /// Number of confidential operations
    pub operation_count: u32,
    
    /// PDA bump
    pub bump: u8,
}

impl ConfidentialState {
    pub fn record_transfer(&mut self, amount: u64, current_slot: u64) {
        self.total_received = self.total_received.saturating_add(amount);
        self.operation_count = self.operation_count.saturating_add(1);
        self.last_transfer_slot = current_slot;
    }
}
