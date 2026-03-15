use anchor_lang::prelude::*;
use crate::error::PrivacyError;
use crate::events::ConfidentialMinted;
use crate::state::{PrivacyConfig, AllowlistEntry, ConfidentialState};
use crate::constants::{PRIVACY_CONFIG_SEED, ALLOWLIST_ENTRY_SEED, CONFIDENTIAL_STATE_SEED};

#[derive(Accounts)]
pub struct ConfidentialMint<'info> {
    #[account(mut)]
    pub minter: Signer<'info>,

    #[account(
        mut,
        seeds = [PRIVACY_CONFIG_SEED, stablecoin.key().as_ref()],
        bump = privacy_config.bump,
    )]
    pub privacy_config: Account<'info, PrivacyConfig>,

    /// CHECK: Validated indirectly through privacy_config
    pub stablecoin: AccountInfo<'info>,

    #[account(
        seeds = [ALLOWLIST_ENTRY_SEED, stablecoin.key().as_ref(), minter.key().as_ref()],
        bump = allowlist_entry.bump,
    )]
    pub allowlist_entry: Account<'info, AllowlistEntry>,

    /// CHECK: Token recipient account
    pub recipient: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = minter,
        space = 8 + ConfidentialState::INIT_SPACE,
        seeds = [CONFIDENTIAL_STATE_SEED, stablecoin.key().as_ref(), recipient.key().as_ref()],
        bump,
    )]
    pub confidential_state: Account<'info, ConfidentialState>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> ConfidentialMint<'info> {
    pub fn confidential_mint(
        &mut self,
        amount: u64,
        bumps: &ConfidentialMintBumps,
    ) -> Result<()> {
        let privacy_config = &mut self.privacy_config;

        // Verify privacy is enabled
        require!(
            privacy_config.privacy_enabled,
            PrivacyError::PrivacyNotEnabled
        );

        // Verify minter is on allowlist and valid
        let allowlist_entry = &self.allowlist_entry;
        let current_slot = Clock::get()?.slot;
        require!(
            allowlist_entry.is_valid(current_slot),
            PrivacyError::NotOnAllowlist
        );

        require!(amount > 0, PrivacyError::ZeroAmount);

        // Record confidential state
        let confidential_state = &mut self.confidential_state;
        confidential_state.stablecoin = privacy_config.stablecoin;
        confidential_state.recipient = self.recipient.key();
        confidential_state.record_transfer(amount, current_slot);
        confidential_state.bump = bumps.confidential_state;

        privacy_config.total_confidential_mints += 1;
        privacy_config.last_updated_slot = current_slot;

        emit!(ConfidentialMinted {
            stablecoin: privacy_config.stablecoin,
            minter: self.minter.key(),
            amount,
            recipient: self.recipient.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}
