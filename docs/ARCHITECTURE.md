# Architecture

## Four-Layer Model

```
Layer 4 — Presets:     SSS-1 (Minimal)  |  SSS-2 (Compliant)  |  SSS-3 (Private)
Layer 3 — Modules:     Privacy (allowlist, confidential transfers) | Compliance (transfer hook, blacklist, permanent delegate)
Layer 2 — Extensions:  Token-2022 (PermanentDelegate, TransferHook, DefaultAccountFrozen)
Layer 1 — Base SDK:    Token creation, mint/freeze authority, metadata, role PDAs
```

- **Layer 1 (Base):** PDA derivation (stablecoin, role, minter, blacklist, extra-account-metas), core instructions: initialize, mint, burn, freeze, thaw, pause, unpause, update_roles, update_minter, transfer_authority.
- **Layer 2 (Extensions):** Token-2022 extensions for compliance and privacy flows.
- **Layer 3 (Compliance):** SSS-2-only: transfer hook (extra-account-metas), blacklist add/remove, seize via permanent delegate. Gated by `enable_transfer_hook` and `enable_permanent_delegate`; instructions fail with a clear error if compliance was not enabled at init. **Privacy (SSS-3):** Allowlist management, confidential mint/transfer with optional time-bound access. Gated by privacy config initialization.
- **Layer 4 (Presets):** Config objects `Presets.SSS_1`, `Presets.SSS_2`, and `Presets.SSS_3`; custom config via `extensions: { permanentDelegate, transferHook, defaultAccountFrozen }`.

### SSS-1 vs SSS-2 vs SSS-3 Feature Matrix

| Feature | SSS-1 | SSS-2 | SSS-3 |
|---------|-------|-------|-------|
| Initialize, mint, burn, freeze, thaw | ✓ | ✓ | ✓ |
| Pause / unpause | ✓ | ✓ | ✓ |
| Supply cap, minter quota, update roles | ✓ | ✓ | ✓ |
| Transfer hook (block transfers) | — | ✓ | — |
| Blacklist (add/remove) | — | ✓ | — |
| Seize (permanent delegate) | — | ✓ | — |
| Allowlist (scoped, time-bound) | — | — | ✓ |
| Confidential mint/transfer | — | — | ✓ |
| DefaultAccountFrozen at init | optional | required for seize | optional |

**SSS-2** compliance features are gated by `enable_transfer_hook` and `enable_permanent_delegate`. Calls to blacklist or seize instructions fail with a clear error if compliance was not enabled. **SSS-3** privacy features are initialized separately; allowlist and confidential transfer instructions fail with a clear error if privacy config was not enabled.

## Data Flow

### Initialize

1. Authority creates mint keypair and calls `initialize_stablecoin` with preset or custom extensions.
2. Program creates Token-2022 mint (with optional PermanentDelegate, TransferHook, DefaultAccountState), StablecoinState PDA, and authority RoleAccount.
3. If SSS-2, client then calls the transfer-hook program to initialize the ExtraAccountMetaList PDA for the mint.

### Mint / Burn

- Mint: minter signs; program checks role and minter quota, then CPI to Token-2022 mint.
- Burn: burner signs; program checks role, then CPI to Token-2022 burn.

### Freeze / Thaw

- Authority with pauser or freezer capability calls freeze_account or thaw_account; program CPIs to Token-2022 (freeze authority = stablecoin PDA).

### SSS-2: Blacklist and Seize

- **Blacklist:** Blacklister adds/removes addresses; transfer hook checks every transfer against the blacklist PDA and denies if listed.
- **Seize:** Seizer calls seize; program uses permanent-delegate authority to transfer from a token account to a treasury account via Token-2022 transfer_checked (with hook accounts).

## Security

- **Role-based access:** Master authority, minter (with per-minter quotas), burner, pauser, freezer, blacklister (SSS-2), seizer (SSS-2). No single key controls everything.
- **Seize validation:** Seize instruction validates `transfer_hook_program` and `extra_account_metas` match the expected SSS-2 hook (Audit 3).
- **Supply cap:** Mint validates supply cap before CPI (fail-fast); manual deserialization documented (Audit 3).
- **Feature gating:** SSS-2 instructions (add_to_blacklist, remove_from_blacklist, seize) check `enable_permanent_delegate` and `enable_transfer_hook` and return a clear error if compliance was not enabled.
- **Immutable flags:** `enable_permanent_delegate`, `enable_transfer_hook`, `default_account_frozen` are set once at init and cannot be changed.

## Program IDs

Program IDs are deployment-specific. See [DEVNET.md](DEVNET.md) for devnet values.

- **SSS Token (sss-1):** `47TNsKC1iJvLTKYRMbfYjrod4a56YE1f4qv73hZkdWUZ` (devnet)
- **Transfer Hook (sss-2):** `8DMsf39fGWfcrWVjfyEq8fqZf5YcTvVPGgdJr8s2S8Nc` (devnet)
- **Privacy Module (sss-3):** `PrivacyStakdnr5m7CqxLtmtQwsBi34hchvjbXi3ZmC` (devnet)

Changing the transfer hook or privacy program requires recompiling the main SSS-1 program with the new constant and redeploying.
