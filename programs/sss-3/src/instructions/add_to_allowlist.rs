use anchor_lang::prelude::*;
use crate::error::PrivacyError;
use crate::events::AllowlistEntryAdded;
use crate::state::{PrivacyConfig, AllowlistEntry};
use crate::enums::AllowlistStatus;
use crate::constants::{PRIVACY_CONFIG_SEED, ALLOWLIST_ENTRY_SEED, MAX_ALLOWLIST_ENTRIES};

#[derive(Accounts)]
pub struct AddToAllowlist<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PRIVACY_CONFIG_SEED, stablecoin.key().as_ref()],
        bump = privacy_config.bump,
    )]
    pub privacy_config: Account<'info, PrivacyConfig>,

    /// CHECK: Validated indirectly through privacy_config
    pub stablecoin: AccountInfo<'info>,

    /// Address to be added to allowlist
    /// CHECK: Any address can be allowlisted
    pub address_to_add: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + AllowlistEntry::INIT_SPACE,
        seeds = [ALLOWLIST_ENTRY_SEED, stablecoin.key().as_ref(), address_to_add.key().as_ref()],
        bump,
    )]
    pub allowlist_entry: Account<'info, AllowlistEntry>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> AddToAllowlist<'info> {
    pub fn add_to_allowlist(
        &mut self,
        expiry_slot: Option<u64>,
        bumps: &AddToAllowlistBumps,
    ) -> Result<()> {
        let privacy_config = &mut self.privacy_config;

        require_eq!(
            privacy_config.authority,
            self.authority.key(),
            PrivacyError::InsufficientPermissions
        );

        require!(
            privacy_config.active_allowlist_entries < MAX_ALLOWLIST_ENTRIES,
            PrivacyError::MaxAllowlistEntriesReached
        );

        // Validate expiry slot if provided
        if let Some(expiry) = expiry_slot {
            let current_slot = Clock::get()?.slot;
            require!(expiry > current_slot, PrivacyError::InvalidExpirySlot);
        }

        let entry = &mut self.allowlist_entry;
        entry.stablecoin = privacy_config.stablecoin;
        entry.address = self.address_to_add.key();
        entry.status = AllowlistStatus::Active;
        entry.added_by = self.authority.key();
        entry.added_at_slot = Clock::get()?.slot;
        entry.expiry_slot = expiry_slot;
        entry.transfer_count = 0;
        entry.total_amount_transferred = 0;
        entry.bump = bumps.allowlist_entry;

        privacy_config.active_allowlist_entries += 1;
        privacy_config.last_updated_slot = Clock::get()?.slot;

        emit!(AllowlistEntryAdded {
            stablecoin: privacy_config.stablecoin,
            address: entry.address,
            added_by: self.authority.key(),
            expiry_slot,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}
