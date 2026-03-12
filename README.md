# Solana Stablecoin Standard (SSS)

This repository implements the Solana Stablecoin Standard (SSS), a collection of production-ready Anchor programs that leverage Token-2022 extensions to provide diverse stablecoin models. SSS covers everything from transparent, fiat-backed tokens to private, interest-bearing, and collateralized vaults.

## Stablecoin Variants

### [SSS-1: Fiat-Backed (Transparent)](./programs/sss-1/)
- **Model:** Direct mint/burn by an authorized entity.
- **Extensions:** Metadata, Permanent Delegate, Transfer Hook, **Transfer Fee**.
- **Admin Features:** Fee configuration, emergency pause, transfer hook management.

### [SSS-2: Collateral-Backed (Interest-Bearing)](./programs/sss-2/)
- **Model:** Share-based vault where share price is derived from `total_assets / total_supply`.
- **Extensions:** Metadata, Permanent Delegate, Transfer Hook, Transfer Fee, **Interest-Bearing**.
- **Admin Features:** `sync()` yield recognition, interest rate updates, fee configuration.

### [SSS-3: Confidential Fiat-Backed](./programs/sss-3/)
- **Model:** Transparent issuance but with **Confidential Transfers** for transaction privacy.
- **Extensions:** Confidential Transfer (ZK-proofs), Metadata, Permanent Delegate, Transfer Hook.
- **Privacy:** Hide transaction amounts and account balances using ElGamal encryption.

### [SSS-4: Confidential Collateral-Backed](./programs/sss-4/)
- **Model:** The most advanced variant, combining vault-style share accounting with ZK-privacy.
- **Extensions:** Confidential Transfer, Metadata, Permanent Delegate, Transfer Hook.
- **Use Case:** Private, yield-bearing stablecoins.

## Key Components

### [SSS-Transfer-Hook](./programs/sss-transfer-hook/)
A modular program implementing the `spl-transfer-hook-interface`. It provides a reference implementation for a global blacklist, ensuring compliance and security for all SSS tokens.

### [Admin CLI](./admin-cli/)
A comprehensive TypeScript CLI for managing the entire stablecoin lifecycle:
- Deploying and initializing all SSS programs.
- Minting, burning, depositing, and redeeming tokens.
- Updating transfer fees, interest rates, and compliance hooks.
- Managing the global blacklist.

### [Proofs Backend](./proofs-backend/)
A Rust-based Axum service that facilitates the generation of Zero-Knowledge proofs required for SSS-3 and SSS-4 confidential transfers.

### [TypeScript SDK](./sdk/)
A unified developer interface for integrating SSS into web applications, supporting all four variants and administrative functions.

## Project Structure

```
.
├── programs/
│   ├── sss-1/                  # Fiat-backed Stablecoin
│   ├── sss-2/                  # Interest-bearing Stablecoin
│   ├── sss-3/                  # Confidential Stablecoin
│   ├── sss-4/                  # Confidential Vault Stablecoin
│   └── sss-transfer-hook/      # Global Blacklist Compliance Hook
├── admin-cli/                  # Admin Command Line Interface
├── proofs-backend/             # ZK Proof Generation Service (Rust)
├── sdk/                        # Unified TypeScript SDK
└── tests/                      # End-to-end Integration Tests
```

## Quick Start

### Build and Deploy
```bash
# 1. Install dependencies
yarn install

# 2. Build and deploy via Admin CLI
cd admin-cli
ts-node index.ts deploy
```

### Run Tests
```bash
# Ensure a local validator is running
solana-test-validator --reset

# Run the full suite
anchor test
```

### Using the Admin CLI
```bash
# Initialize SSS-1
ts-node index.ts init-sss1 -d 6 -n "My USD" -s "MUSD" -uri "https://..." -f 100 -m 1000000

# Add to Blacklist
ts-node index.ts blacklist-add -b <BLACKLIST_PDA> -a <USER_PUBKEY>
```

## Architecture and Design
For a detailed deep-dive into the technical design, Token-2022 extension usage, and security considerations, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Disclaimer
This software is provided "as is" and has not been audited. Use at your own risk.
