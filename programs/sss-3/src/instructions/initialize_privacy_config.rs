use anchor_lang::prelude::*;
use crate::enums::PrivacyLevel;
use crate::error::PrivacyError;
use crate::events::PrivacyConfigInitialized;
use crate::state::PrivacyConfig;
use crate::constants::{PRIVACY_CONFIG_SEED, MAX_ALLOWLIST_ENTRIES};

#[derive(Accounts)]
pub struct InitializePrivacyConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Stablecoin account (must be initialized first)
    /// CHECK: Validated by being an existing account
    pub stablecoin: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + PrivacyConfig::INIT_SPACE,
        seeds = [PRIVACY_CONFIG_SEED, stablecoin.key().as_ref()],
        bump,
    )]
    pub privacy_config: Account<'info, PrivacyConfig>,

    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_privacy_config(
    ctx: Context<InitializePrivacyConfig>,
    privacy_enabled: bool,
    min_allowlist_size: u32,
) -> Result<()> {
    require!(
        min_allowlist_size <= MAX_ALLOWLIST_ENTRIES,
        PrivacyError::InvalidPrivacyLevel
    );

    let privacy_config = &mut ctx.accounts.privacy_config;
    privacy_config.stablecoin = ctx.accounts.stablecoin.key();
    privacy_config.authority = ctx.accounts.authority.key();
    privacy_config.privacy_level = PrivacyLevel::ScopedAllowlist;
    privacy_config.privacy_enabled = privacy_enabled;
    privacy_config.min_allowlist_size = min_allowlist_size;
    privacy_config.active_allowlist_entries = 0;
    privacy_config.total_confidential_mints = 0;
    privacy_config.total_confidential_transfers = 0;
    privacy_config.last_updated_slot = Clock::get()?.slot;
    privacy_config.bump = ctx.bumps.privacy_config;

    emit!(PrivacyConfigInitialized {
        stablecoin: privacy_config.stablecoin,
        authority: privacy_config.authority,
        privacy_enabled,
        min_allowlist_size,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
