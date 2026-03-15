#![allow(ambiguous_glob_reexports)]
pub mod constants;
pub mod enums;
pub mod error;
pub mod events;
pub mod state;
pub mod instructions;

use anchor_lang::prelude::*;

pub use constants::*;
pub use enums::*;
pub use events::*;
pub use state::*;
pub use instructions::*;

declare_id!("XSwLYVBfmBKaWKYF6fTcCng9DSRREArLQE1Cts32NkM");

#[program]
pub mod sss_3 {
    use super::*;

    pub fn initialize_privacy_config(
        ctx: Context<InitializePrivacyConfig>,
        privacy_enabled: bool,
        min_allowlist_size: u32,
    ) -> Result<()> {
        ctx.accounts.initialize_privacy_config(privacy_enabled, min_allowlist_size, &ctx.bumps)
    }

    pub fn add_to_allowlist(
        ctx: Context<AddToAllowlist>,
        expiry_slot: Option<u64>,
    ) -> Result<()> {
        ctx.accounts.add_to_allowlist(expiry_slot, &ctx.bumps)
    }

    pub fn remove_from_allowlist(ctx: Context<RemoveFromAllowlist>) -> Result<()> {
        ctx.accounts.remove_from_allowlist()
    }

    pub fn confidential_mint(
        ctx: Context<ConfidentialMint>,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.confidential_mint(amount, &ctx.bumps)
    }

    pub fn confidential_transfer(
        ctx: Context<ConfidentialTransfer>,
        amount: u64,
        recipient: Pubkey,
    ) -> Result<()> {
        ctx.accounts.confidential_transfer(amount, recipient, &ctx.bumps)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn constants_and_seeds() {
        assert_eq!(PRIVACY_CONFIG_SEED, b"privacy_config");
        assert_eq!(ALLOWLIST_ENTRY_SEED, b"allowlist_entry");
        assert_eq!(CONFIDENTIAL_STATE_SEED, b"confidential_state");
        assert_eq!(MAX_ALLOWLIST_ENTRIES, 1000);
    }
}
