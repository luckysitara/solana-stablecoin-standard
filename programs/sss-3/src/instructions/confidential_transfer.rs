use anchor_lang::prelude::*;
use crate::error::PrivacyError;
use crate::events::ConfidentialTransferred;
use crate::state::{PrivacyConfig, AllowlistEntry, ConfidentialState};
use crate::constants::{PRIVACY_CONFIG_SEED, ALLOWLIST_ENTRY_SEED, CONFIDENTIAL_STATE_SEED};

#[derive(Accounts)]
pub struct ConfidentialTransfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        seeds = [PRIVACY_CONFIG_SEED, stablecoin.key().as_ref()],
        bump = privacy_config.bump,
    )]
    pub privacy_config: Account<'info, PrivacyConfig>,

    /// CHECK: Validated indirectly through privacy_config
    pub stablecoin: AccountInfo<'info>,

    /// Sender's allowlist entry
    #[account(
        seeds = [ALLOWLIST_ENTRY_SEED, stablecoin.key().as_ref(), sender.key().as_ref()],
        bump = sender_allowlist.bump,
    )]
    pub sender_allowlist: Account<'info, AllowlistEntry>,

    /// Recipient's allowlist entry
    #[account(
        seeds = [ALLOWLIST_ENTRY_SEED, stablecoin.key().as_ref(), recipient_pubkey.key().as_ref()],
        bump = recipient_allowlist.bump,
    )]
    pub recipient_allowlist: Account<'info, AllowlistEntry>,

    /// CHECK: Recipient address
    pub recipient_pubkey: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = sender,
        space = 8 + ConfidentialState::INIT_SPACE,
        seeds = [CONFIDENTIAL_STATE_SEED, stablecoin.key().as_ref(), recipient_pubkey.key().as_ref()],
        bump,
    )]
    pub confidential_state: Account<'info, ConfidentialState>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn confidential_transfer(
    ctx: Context<ConfidentialTransfer>,
    amount: u64,
    _recipient: Pubkey,
) -> Result<()> {
    let privacy_config = &mut ctx.accounts.privacy_config;

    // Verify privacy is enabled
    require!(
        privacy_config.privacy_enabled,
        PrivacyError::PrivacyNotEnabled
    );

    let current_slot = Clock::get()?.slot;

    // Verify sender is on allowlist and valid
    let sender_allowlist = &ctx.accounts.sender_allowlist;
    require!(
        sender_allowlist.is_valid(current_slot),
        PrivacyError::NotOnAllowlist
    );

    // Verify recipient is on allowlist and valid
    let recipient_allowlist = &ctx.accounts.recipient_allowlist;
    require!(
        recipient_allowlist.is_valid(current_slot),
        PrivacyError::NotOnAllowlist
    );

    require!(
        ctx.accounts.recipient_pubkey.key() != ctx.accounts.sender.key(),
        PrivacyError::InvalidRecipient
    );

    require!(amount > 0, PrivacyError::ZeroAmount);

    // Record confidential state for recipient
    let confidential_state = &mut ctx.accounts.confidential_state;
    confidential_state.stablecoin = privacy_config.stablecoin;
    confidential_state.recipient = ctx.accounts.recipient_pubkey.key();
    confidential_state.record_transfer(amount, current_slot);

    privacy_config.total_confidential_transfers += 1;
    privacy_config.last_updated_slot = current_slot;

    emit!(ConfidentialTransferred {
        stablecoin: privacy_config.stablecoin,
        sender: ctx.accounts.sender.key(),
        recipient: ctx.accounts.recipient_pubkey.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
