use anchor_lang::prelude::*;
use crate::error::PrivacyError;
use crate::events::AllowlistEntryRemoved;
use crate::state::{PrivacyConfig, AllowlistEntry};
use crate::enums::AllowlistStatus;
use crate::constants::{PRIVACY_CONFIG_SEED, ALLOWLIST_ENTRY_SEED};

#[derive(Accounts)]
pub struct RemoveFromAllowlist<'info> {
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

    #[account(
        mut,
        seeds = [ALLOWLIST_ENTRY_SEED, stablecoin.key().as_ref(), allowlist_entry.address.as_ref()],
        bump = allowlist_entry.bump,
    )]
    pub allowlist_entry: Account<'info, AllowlistEntry>,
}

pub fn remove_from_allowlist(
    ctx: Context<RemoveFromAllowlist>,
) -> Result<()> {
    let privacy_config = &mut ctx.accounts.privacy_config;

    require_eq!(
        privacy_config.authority,
        ctx.accounts.authority.key(),
        PrivacyError::InsufficientPermissions
    );

    let entry = &mut ctx.accounts.allowlist_entry;

    require_eq!(
        entry.status,
        AllowlistStatus::Active,
        PrivacyError::AllowlistEntryNotFound
    );

    entry.status = AllowlistStatus::Revoked;

    if privacy_config.active_allowlist_entries > 0 {
        privacy_config.active_allowlist_entries -= 1;
    }

    privacy_config.last_updated_slot = Clock::get()?.slot;

    emit!(AllowlistEntryRemoved {
        stablecoin: privacy_config.stablecoin,
        address: entry.address,
        removed_by: ctx.accounts.authority.key(),
        reason: "Revoked by authority".to_string(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
