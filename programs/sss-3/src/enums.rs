use anchor_lang::prelude::*;

use std::fmt;

/// Privacy level for confidential transfers
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum PrivacyLevel {
    /// No privacy enforcement
    None,
    /// Scoped allowlist - only whitelisted addresses can participate
    ScopedAllowlist,
    /// Future: full zero-knowledge proof privacy
    ZkProof,
}

impl fmt::Display for PrivacyLevel {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PrivacyLevel::None => write!(f, "None"),
            PrivacyLevel::ScopedAllowlist => write!(f, "ScopedAllowlist"),
            PrivacyLevel::ZkProof => write!(f, "ZkProof"),
        }
    }
}

/// Allowlist entry status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum AllowlistStatus {
    Active,
    Revoked,
    Expired,
}

impl fmt::Display for AllowlistStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AllowlistStatus::Active => write!(f, "Active"),
            AllowlistStatus::Revoked => write!(f, "Revoked"),
            AllowlistStatus::Expired => write!(f, "Expired"),
        }
    }
}

/// Audit event type for confidential operations
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum ConfidentialEventType {
    MintInitiated,
    TransferInitiated,
    AllowlistUpdated,
    PrivacyConfigUpdated,
}

impl fmt::Display for ConfidentialEventType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfidentialEventType::MintInitiated => write!(f, "MintInitiated"),
            ConfidentialEventType::TransferInitiated => write!(f, "TransferInitiated"),
            ConfidentialEventType::AllowlistUpdated => write!(f, "AllowlistUpdated"),
            ConfidentialEventType::PrivacyConfigUpdated => write!(f, "PrivacyConfigUpdated"),
        }
    }
}
