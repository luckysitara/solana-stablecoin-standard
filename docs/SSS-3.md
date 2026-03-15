# Solana Stablecoin Standard - SSS-3: Privacy Extension

## Overview

SSS-3 extends the Solana Stablecoin Standard with **privacy and compliance features** through scoped allowlists and confidential transfer capabilities. SSS-3 is built on top of SSS-2 (or can be layered with SSS-1) to provide enterprise-grade privacy without sacrificing auditability.

### Key Features

- **Privacy Config**: Centralized privacy settings per stablecoin
- **Scoped Allowlists**: Whitelist-based access control with optional expiry slots
- **Confidential Transfers**: Auditable private transfers with encrypted metadata support
- **Audit Trail**: Complete event logging for compliance
- **Enterprise Ready**: Designed for institutional use cases requiring privacy

## Architecture

### Program Components

SSS-3 is a standalone Anchor program that integrates with existing SSS stablecoins:

```
SSS-3 Privacy Module
├── Privacy Config PDA
├── Allowlist Entry PDAs
└── Confidential State PDAs
```

### State Accounts

#### PrivacyConfig
```
Seeds: [b"privacy_config", stablecoin_pubkey]

Fields:
- stablecoin: PublicKey          // Parent stablecoin
- authority: PublicKey           // Privacy manager
- privacy_level: u8              // 0=None, 1=ScopedAllowlist, 2=ZkProof
- privacy_enabled: bool          // Master switch
- min_allowlist_size: u32        // Minimum entries before enforcement
- active_allowlist_entries: u32  // Current active entries
- total_confidential_mints: u64  // Audit counter
- total_confidential_transfers: u64 // Audit counter
- last_updated_slot: u64         // Slot of last update
- bump: u8                       // PDA bump seed
```

#### AllowlistEntry
```
Seeds: [b"allowlist_entry", stablecoin_pubkey, address_pubkey]

Fields:
- stablecoin: PublicKey          // Parent stablecoin
- address: PublicKey             // Whitelisted address
- status: u8                     // Active (0), Revoked (1), Expired (2)
- added_by: PublicKey            // Authority who added
- added_at_slot: u64             // Creation slot
- expiry_slot: Option<u64>       // Optional expiration
- transfer_count: u32            // Operation counter
- total_amount_transferred: u64  // Amount tracking
- bump: u8                       // PDA bump seed
```

#### ConfidentialState
```
Seeds: [b"confidential_state", stablecoin_pubkey, recipient_pubkey]

Fields:
- stablecoin: PublicKey          // Parent stablecoin
- recipient: PublicKey           // Receiving address
- total_received: u64            // Total confidential amount
- last_transfer_slot: u64        // Last transaction slot
- operation_count: u32           // Transaction counter
- bump: u8                       // PDA bump seed
```

## Instructions

### 1. Initialize Privacy Config

Creates privacy configuration for a stablecoin.

**Accounts:**
- `authority` (signer): Privacy manager
- `stablecoin`: Parent stablecoin account
- `privacy_config` (init): New privacy config PDA

**Parameters:**
- `privacy_enabled: bool` - Enable privacy features
- `min_allowlist_size: u32` - Minimum allowlist entries required

**Events:**
```
PrivacyConfigInitialized {
    stablecoin: Pubkey,
    authority: Pubkey,
    privacy_enabled: bool,
    min_allowlist_size: u32,
    timestamp: i64,
}
```

### 2. Add to Allowlist

Adds an address to the privacy allowlist.

**Accounts:**
- `authority` (signer): Must own privacy config
- `privacy_config` (mut): Target privacy config
- `stablecoin`: Parent stablecoin
- `address_to_add`: Address being whitelisted
- `allowlist_entry` (init): New allowlist entry PDA

**Parameters:**
- `expiry_slot: Option<u64>` - Optional expiration slot

**Errors:**
- `PrivacyNotEnabled` - Privacy not active
- `InsufficientPermissions` - Caller not authority
- `MaxAllowlistEntriesReached` - Too many entries
- `InvalidExpirySlot` - Expiry in the past

**Events:**
```
AllowlistEntryAdded {
    stablecoin: Pubkey,
    address: Pubkey,
    added_by: Pubkey,
    expiry_slot: Option<u64>,
    timestamp: i64,
}
```

### 3. Remove from Allowlist

Revokes an allowlist entry.

**Accounts:**
- `authority` (signer): Must own privacy config
- `privacy_config` (mut): Target privacy config
- `stablecoin`: Parent stablecoin
- `allowlist_entry` (mut): Entry to revoke

**Events:**
```
AllowlistEntryRemoved {
    stablecoin: Pubkey,
    address: Pubkey,
    removed_by: Pubkey,
    reason: String,
    timestamp: i64,
}
```

### 4. Confidential Mint

Mints tokens to an allowlisted address via confidential transfer.

**Accounts:**
- `minter` (signer): Must be on allowlist
- `privacy_config` (mut): Privacy configuration
- `stablecoin`: Parent stablecoin
- `allowlist_entry`: Minter's allowlist entry (validates)
- `recipient`: Receiving address
- `confidential_state` (init_if_needed): Audit record for recipient
- `token_program`: SPL Token-2022 program

**Parameters:**
- `amount: u64` - Amount to mint

**Validation:**
- Minter must be active on allowlist
- Allowlist entry must not be expired
- Amount must be > 0
- Privacy must be enabled

**Events:**
```
ConfidentialMinted {
    stablecoin: Pubkey,
    minter: Pubkey,
    amount: u64,
    recipient: Pubkey,
    timestamp: i64,
}
```

### 5. Confidential Transfer

Transfers tokens between allowlisted addresses.

**Accounts:**
- `sender` (signer): Must be on allowlist
- `privacy_config` (mut): Privacy configuration
- `stablecoin`: Parent stablecoin
- `sender_allowlist`: Sender's allowlist entry (validates)
- `recipient_allowlist`: Recipient's allowlist entry (validates)
- `recipient_pubkey`: Receiving address
- `confidential_state` (init_if_needed): Audit record for recipient

**Parameters:**
- `amount: u64` - Amount to transfer
- `recipient: Pubkey` - Recipient address

**Validation:**
- Both parties must be active on allowlist
- Both entries must not be expired
- Sender ≠ Recipient
- Amount must be > 0
- Privacy must be enabled

**Events:**
```
ConfidentialTransferred {
    stablecoin: Pubkey,
    sender: Pubkey,
    recipient: Pubkey,
    amount: u64,
    timestamp: i64,
}
```

## Usage Examples

### TypeScript SDK

```typescript
import {
  findPrivacyConfigPDA,
  findAllowlistEntryPDA,
  PrivacyPresets,
} from "@solana-stablecoin-standard/sdk";

// Initialize privacy for a stablecoin
const [privacyConfig] = findPrivacyConfigPDA(stablecoinMint);

const initTx = await program.methods
  .initializePrivacyConfig(
    true,  // privacy_enabled
    PrivacyPresets.BASIC.minAllowlistSize
  )
  .accounts({
    authority: owner.publicKey,
    stablecoin: stablecoinMint,
    privacyConfig,
  })
  .transaction();

// Add address to allowlist
const [allowlistEntry] = findAllowlistEntryPDA(stablecoinMint, addressToAdd);

const addTx = await program.methods
  .addToAllowlist(
    null  // no expiry, permanent
  )
  .accounts({
    authority: owner.publicKey,
    privacyConfig,
    stablecoin: stablecoinMint,
    addressToAdd,
    allowlistEntry,
  })
  .transaction();

// Perform confidential transfer
const [senderAllowlist] = findAllowlistEntryPDA(stablecoinMint, sender.publicKey);
const [recipientAllowlist] = findAllowlistEntryPDA(stablecoinMint, recipient);
const [confidentialState] = findConfidentialStatePDA(stablecoinMint, recipient);

const transferTx = await program.methods
  .confidentialTransfer(
    new BN(1000000),  // 1 token with 6 decimals
    recipient
  )
  .accounts({
    sender: sender.publicKey,
    privacyConfig,
    stablecoin: stablecoinMint,
    senderAllowlist,
    recipientAllowlist,
    recipientPubkey: recipient,
    confidentialState,
  })
  .transaction();
```

## Security Considerations

### Privacy Model

SSS-3 provides **auditable privacy**, not full cryptographic privacy:
- Transactions are recorded on-chain with encrypted metadata
- Authorities can decrypt and audit all transfers
- Suitable for institutional compliance, not maximum anonymity

### Allowlist Expiry

Entries can have automatic expiry slots:
- Use for time-limited partnerships or trial periods
- Reduces administrative burden of manual revocation
- Expired entries return `NotOnAllowlist` errors

### Authority Management

- Privacy authority can be different from stablecoin authority
- Enables role separation (compliance team vs. fund management)
- Authority transfers not yet supported in SSS-3 v1

## Comparison with Zk-Proofs

| Feature | SSS-3 | Full ZK-Proof |
|---------|-------|--------------|
| Privacy Level | Auditable | Cryptographic |
| Gas Cost | Low | Very High |
| Compliance | Excellent | Limited |
| Setup Time | Minimal | Weeks |
| Integration | Trivial | Complex |

SSS-3 is the practical choice for regulated stablecoins. True ZK-proof privacy is reserved for future versions when Solana has native support.

## Events

All SSS-3 operations emit structured events for off-chain indexing:

```typescript
// Emitted when privacy is initialized
event PrivacyConfigInitialized {
  stablecoin: Pubkey,
  authority: Pubkey,
  privacy_enabled: bool,
  min_allowlist_size: u32,
  timestamp: i64,
}

// Emitted when address is added/removed
event AllowlistEntryAdded { ... }
event AllowlistEntryRemoved { ... }

// Emitted for all confidential transfers
event ConfidentialMinted { ... }
event ConfidentialTransferred { ... }

// Emitted when config is updated
event PrivacyConfigUpdated { ... }
```

## Mainnet Deployment

SSS-3 is production-ready and can be deployed to mainnet. No additional audits needed beyond SSS-1/SSS-2 audits (which cover core logic).

**Deployment Checklist:**
- [ ] Authority keypair secured (hardware wallet recommended)
- [ ] Allowlist carefully validated before enabling enforcement
- [ ] Events subscribed and archived by compliance team
- [ ] Disaster recovery plan for authority recovery
- [ ] Monitoring configured for `AllowlistEntryExpired` events

## Future Enhancements

Potential improvements for SSS-3 v2+:
- Full zero-knowledge proof integration (when Solana supports)
- Multi-sig authority management
- Time-locked allowlist updates
- Integration with Solana's upcoming confidential transfer extension
