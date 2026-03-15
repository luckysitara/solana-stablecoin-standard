# SSS-3 Documentation Updates

## Overview
This document summarizes all documentation and configuration file updates made to integrate SSS-3 (Privacy Module) throughout the project. All files now reference SSS-3 features alongside SSS-1 and SSS-2.

---

## Configuration Files Updated

### 1. `Anchor.toml`
- Added SSS-3 program ID for devnet and localnet: `PrivacyStakdnr5m7CqxLtmtQwsBi34hchvjbXi3ZmC`
- Updated test script to include `sss3-privacy.test.ts`

**Status:** ✓ Complete

### 2. `Cargo.toml` (Root)
- Added `programs/sss-3` to workspace members
- Ensures SSS-3 builds alongside SSS-1 and SSS-2

**Status:** ✓ Complete

---

## Documentation Files Updated

### Core Specifications

#### `docs/SPEC.md`
- Added SSS-3 account types: PrivacyConfig, AllowlistEntry, ConfidentialState
- Added 5 new SSS-3 instructions: initialize_privacy_config, add_to_allowlist, remove_from_allowlist, confidential_mint, confidential_transfer
- Added SSS-3 user flow for privacy operations
- Cross-references with SSS-1 and SSS-2

**Status:** ✓ Complete

#### `docs/ARCHITECTURE.md`
- Updated to four-layer model (was three-layer)
- Added Layer 3 Privacy module details
- Updated feature matrix to include SSS-1 vs SSS-2 vs SSS-3 comparison
- Added SSS-3 program ID in Program IDs section

**Status:** ✓ Complete

### API & Operations

#### `docs/API.md`
- Updated `/status/:mint` response to include `preset: "SSS-1" | "SSS-2" | "SSS-3"` and `privacyEnabled` flag
- Added 5 new privacy endpoints under "Privacy Operations (SSS-3, protected)":
  - POST /operations/privacy/initialize
  - POST /operations/privacy/add-allowlist
  - POST /operations/privacy/remove-allowlist
  - POST /operations/privacy/confidential-mint
  - POST /operations/privacy/confidential-transfer

**Status:** ✓ Complete

#### `docs/CLI.md`
- Updated init preset option to include SSS-3
- Added SSS-3 example: `pnpm cli init -p sss-3 -n "Private USD" -s pUSD --uri "https://example.com" --decimals 6`
- Added 5 new CLI commands for privacy operations:
  - privacy-init
  - privacy-allow
  - privacy-deny
  - privacy-mint
  - privacy-transfer

**Status:** ✓ Complete

### SDK & Integration

#### `docs/SDK.md`
- Updated Blessed Examples section to reference 4 examples (added SSS-3 example)
- Updated Presets section to include `Presets.SSS_3`
- Added privacy example code to main SDK example
- Updated state/view methods to include `isSSS3()`
- Added complete Privacy section with 5 new privacy methods
- Added PDA helpers for privacy: findPrivacyConfigPDA, findAllowlistEntryPDA, findConfidentialStatePDA

**Status:** ✓ Complete

#### `docs/INTEGRATION.md`
- Updated preset example to show "SSS_3" as option
- Added SSS-3 code example with privacy operations
- Updated CLI examples to include SSS-3 init command

**Status:** ✓ Complete

### Deployment & DevNet

#### `docs/DEPLOY_PROGRAM.md`
- Updated program keypair section to mention sss-3 keypair creation
- Updated script instructions to reference `./scripts/upgrade-program-id.sh sss-3`
- Updated the script description to include sss-3

**Status:** ✓ Complete

#### `docs/DEVNET.md`
- Added SSS-3 program ID row to Program IDs table
- Added complete SSS-3 devnet walkthrough (privacy-init, privacy-allow, privacy-mint)
- Updated example transactions section to reference SSS-3
- Updated "Proof of deployment" to include SSS-3 operations
- Added 3 new proof transaction rows (pending devnet deployment markers)

**Status:** ✓ Complete

---

## Feature Coverage by Document

### SSS-1 (Minimal) Features
- ✓ All docs reference and support SSS-1
- ✓ Initialization with SSS_1 preset
- ✓ Core operations: mint, burn, freeze, thaw, pause, unpause

### SSS-2 (Compliant) Features
- ✓ All docs reference and support SSS-2
- ✓ Initialization with SSS_2 preset
- ✓ Blacklist management
- ✓ Seize operations

### SSS-3 (Private) Features
- ✓ Initialization with SSS_3 preset
- ✓ Privacy config initialization
- ✓ Allowlist management (add/remove with optional expiry)
- ✓ Confidential mint operations
- ✓ Confidential transfer operations
- ✓ Time-bound allowlist support

---

## SDK Enhancements

The following new types and methods are now documented:

### New Types
- `PrivacyConfig` — Privacy settings for a stablecoin
- `AllowlistEntry` — Scoped allowlist entry with optional expiry
- `ConfidentialState` — User's confidential state account

### New SDK Methods
- `SolanaStablecoin.isSSS3()` — Check if privacy is enabled
- `privacy.initializeConfig(signer)` — Initialize privacy
- `privacy.addToAllowlist(signer, address, expiryTimestamp)`
- `privacy.removeFromAllowlist(signer, address)`
- `privacy.confidentialMint(signer, recipient, encryptedAmount)`
- `privacy.confidentialTransfer(signer, recipient, encryptedAmount)`

### New PDA Helpers
- `findPrivacyConfigPDA(stablecoin [, privacyProgramId])`
- `findAllowlistEntryPDA(stablecoin, address [, privacyProgramId])`
- `findConfidentialStatePDA(stablecoin, owner [, privacyProgramId])`

---

## API Endpoints

### New Endpoints (Protected)
- `POST /operations/privacy/initialize` — Enable privacy for stablecoin
- `POST /operations/privacy/add-allowlist` — Add allowlisted address
- `POST /operations/privacy/remove-allowlist` — Remove allowlisted address
- `POST /operations/privacy/confidential-mint` — Encrypted mint
- `POST /operations/privacy/confidential-transfer` — Encrypted transfer

---

## CLI Commands

### New Commands
- `privacy-init` — Initialize privacy config
- `privacy-allow <ADDRESS> [--expiry <timestamp>]` — Add to allowlist
- `privacy-deny <ADDRESS>` — Remove from allowlist
- `privacy-mint <RECIPIENT> <ENCRYPTED_AMOUNT>` — Confidential mint
- `privacy-transfer <RECIPIENT> <ENCRYPTED_AMOUNT>` — Confidential transfer

---

## Files Changed Summary

| File | Changes | Status |
|------|---------|--------|
| Anchor.toml | +2 lines (SSS-3 program ID) | ✓ |
| Cargo.toml | +1 line (workspace member) | ✓ |
| docs/SPEC.md | +15 lines (SSS-3 accounts, instructions, flows) | ✓ |
| docs/ARCHITECTURE.md | +12 lines (4-layer model, feature matrix) | ✓ |
| docs/API.md | +17 lines (privacy endpoints) | ✓ |
| docs/CLI.md | +54 lines (privacy commands) | ✓ |
| docs/SDK.md | +21 lines (privacy methods, PDA helpers) | ✓ |
| docs/INTEGRATION.md | +3 lines (SSS-3 examples) | ✓ |
| docs/DEPLOY_PROGRAM.md | +5 lines (SSS-3 deployment) | ✓ |
| docs/DEVNET.md | +14 lines (SSS-3 program ID, walkthrough) | ✓ |

**Total Lines Added:** 141 lines across all documentation

---

## Consistency Checks

### Naming Conventions
- ✓ All references to SSS-3 use consistent naming
- ✓ Privacy features use "privacy_" or "confidential_" prefixes consistently
- ✓ Allowlist terminology consistent throughout

### Feature Parity
- ✓ SDK, CLI, and API all expose the same SSS-3 capabilities
- ✓ PDA derivation functions documented consistently
- ✓ Error handling documented (PrivacyNotEnabledError)

### Examples
- ✓ Examples exist for all SSS-3 operations
- ✓ DevNet walkthrough covers basic SSS-3 flow
- ✓ Integration guide shows real-world usage

---

## Next Steps

1. Update `backend/src/` to implement privacy endpoints
2. Update `packages/cli/src/` to implement privacy commands
3. Create test file `tests/sss3-privacy.test.ts`
4. Deploy SSS-3 program to devnet and update proof links in DEVNET.md
5. Update example implementations with working code

All documentation is now ready for SSS-3 integration!
