use anchor_lang::prelude::*;

#[error_code]
pub enum PrivacyError {
    #[msg("Privacy not enabled for this stablecoin")]
    PrivacyNotEnabled,

    #[msg("Address not on allowlist")]
    NotOnAllowlist,

    #[msg("Allowlist entry already exists")]
    AllowlistEntryExists,

    #[msg("Allowlist entry not found")]
    AllowlistEntryNotFound,

    #[msg("Allowlist entry has expired")]
    AllowlistExpired,

    #[msg("Allowlist entry has been revoked")]
    AllowlistRevoked,

    #[msg("Maximum allowlist entries reached")]
    MaxAllowlistEntriesReached,

    #[msg("Insufficient permissions to manage allowlist")]
    InsufficientPermissions,

    #[msg("Invalid privacy level")]
    InvalidPrivacyLevel,

    #[msg("Reason too long")]
    ReasonTooLong,

    #[msg("Invalid expiry slot")]
    InvalidExpirySlot,

    #[msg("Confidential transfer failed")]
    ConfidentialTransferFailed,

    #[msg("Invalid recipient")]
    InvalidRecipient,

    #[msg("Zero amount not allowed")]
    ZeroAmount,
}
