# Solana Stablecoin Standard (SSS)

**Open-source, audited framework for issuing compliant stablecoins on Solana.**

Choose between **SSS-1** (minimal, high-performance), **SSS-2** (compliant, with enforcement), or **SSS-3** (private, with scoped allowlists) based on your needs.

[![Security: 6 Audits, 0 Open Findings](https://img.shields.io/badge/security-6%20audits%2C%200%20findings-brightgreen)]()
[![Solana](https://img.shields.io/badge/blockchain-Solana-9945ff)]()
[![Token-2022](https://img.shields.io/badge/standard-Token--2022-blue)]()
[![License: ISC](https://img.shields.io/badge/license-ISC-green)]()

---

## 🎯 What is SSS?

The Solana Stablecoin Standard is a modular, production-ready framework for issuing stablecoins on Solana with optional compliance enforcement. Built with Anchor, secured by professional audits, and supported by complete tooling (SDK, CLI, API, TUI).

**Think of it as:** "The standard way to issue a stablecoin on Solana—pick your compliance level."

---

## 📊 SSS-1 vs SSS-2 vs SSS-3 at a Glance

| Feature | SSS-1 | SSS-2 | SSS-3 |
|---------|-------|-------|-------|
| **Initialize, mint, burn** | ✅ | ✅ | ✅ |
| **Freeze/thaw accounts** | ✅ | ✅ | ✅ |
| **Pause/unpause** | ✅ | ✅ | ✅ |
| **Role-based access** | ✅ | ✅ | ✅ |
| **Supply caps & quotas** | ✅ | ✅ | ✅ |
| **Blacklist enforcement** | — | ✅ | — |
| **Seizure capability** | — | ✅ | — |
| **Transfer hook** | — | ✅ | — |
| **Scoped allowlist** | — | — | ✅ |
| **Confidential transfers** | — | — | ✅ |
| **Time-bound access** | — | — | ✅ |
| **Best for** | Speed, simplicity | Compliance, regulation | Privacy, restricted access |

---

## 🛠️ SSS Presets

The SDK and CLI come with pre-configured presets to get you started immediately:

| Preset | Purpose | Extensions Enabled |
|--------|---------|--------------------|
| **SSS_1** | Minimal, low gas | None |
| **SSS_2** | Regulated, compliant | Permanent Delegate, Transfer Hook |
| **SSS_3** | Privacy-focused | Permanent Delegate, Transfer Hook + Privacy Module |

### Privacy Presets (SSS-3)
When enabling the SSS-3 Privacy Module, you can choose from these enforcement levels:
- **BASIC:** 5 minimum allowlist entries. Balanced for most production needs.
- **STRICT:** 20 minimum allowlist entries. For institutional-grade privacy and high compliance.
- **PERMISSIVE:** 1 minimum allowlist entry. Optimized for development and rapid testing.

---

## 🚀 Quick Start (TypeScript SDK)

### SSS-1: Minimal Stablecoin
```typescript
import { SolanaStablecoin } from '@stbr/sss-token';

// Create stablecoin
const stable = await SolanaStablecoin.create(
  connection,
  { preset: "SSS_1", name: "Fast USD", symbol: "fUSD", decimals: 6 },
  payer
);

// Mint tokens
await stable.mint(minterKeypair, {
  recipient: recipientAddress,
  amount: 1000_000000n,
  minter: minterKeypair.publicKey
});
```

### SSS-2: Compliant Stablecoin
```typescript
// Create with SSS-2 Preset (Enables Compliance)
const stable = await SolanaStablecoin.create(
  connection,
  { preset: "SSS_2", name: "Regulated USD", symbol: "rUSD", decimals: 6 },
  payer
);

// Blacklist an address
await stable.compliance.blacklistAdd(authority, suspiciousAddress, "OFAC");

// Seize tokens from a blacklisted account
await stable.compliance.seize(authority, frozenAta, treasuryAta);
```

### SSS-3: Private Stablecoin
```typescript
// Create with SSS-3 Preset (Enables Privacy)
const stable = await SolanaStablecoin.create(
  connection,
  { preset: "SSS_3", name: "Private USD", symbol: "pUSD", decimals: 6 },
  payer
);

// Initialize Privacy Module (BASIC preset)
await stable.privacy.initializePrivacyConfig(authority, true, 5);

// Allowlist a user and perform a Confidential Mint
await stable.privacy.addToAllowlist(authority, userAddress, null);
await stable.privacy.confidentialMint(minter, userAddress, 5000_000000n);
```

---

## 🏗️ Architecture

```
Layer 4 — Presets:     SSS-1 (Minimal)  |  SSS-2 (Compliant)  |  SSS-3 (Private)
Layer 3 — Modules:     Privacy (allowlist, confidential mints) | Compliance (transfer hook, blacklist)
Layer 2 — Extensions:  Token-2022 (Permanent Delegate, Transfer Hook)
Layer 1 — Base SDK:    Core stablecoin operations (mint, burn, RBAC)
```

- **Layer 1 (Base):** Core logic, role-based access control (minters, burners, freezers).
- **Layer 2 (Extensions):** Leverages Solana's Token-2022 for native-speed enforcement.
- **Layer 3 (Advanced Modules):** Blacklist + seizure (SSS-2), or the new Privacy Module (SSS-3).
- **Layer 4 (Presets):** High-level abstractions for one-click deployment.

---

## 🔒 Security

**6 professional security audits • 0 open critical/high findings • Production-ready**

All audit reports are publicly available:
- [SECURITY_AUDIT_1.md](./audits/SECURITY_AUDIT_1.md) — Supply cap & data parsing
- [SECURITY_AUDIT_2.md](./audits/SECURITY_AUDIT_2.md) — Transfer hook validation
- [SECURITY_AUDIT_3.md](./audits/SECURITY_AUDIT_3.md) — Seize operations
- [SECURITY_AUDIT_4.md](./audits/SECURITY_AUDIT_4.md) — Error handling
- [SECURITY_AUDIT_5.md](./audits/SECURITY_AUDIT_5.md) — Role-based access
- [SECURITY_AUDIT_6.md](./audits/SECURITY_AUDIT_6.md) — Final review

---

## 📦 Complete Toolkit

### 1. Smart Contracts (`/programs`)
- **SSS-1:** `47TNsKC1iJvLTKYRMbfYjrod4a56YE1f4qv73hZkdWUZ`
- **SSS-2 (Hook):** `8DMsf39fGWfcrWVjfyEq8fqZf5YcTvVPGgdJr8s2S8Nc`
- **SSS-3 (Privacy):** `XSwLYVBfmBKaWKYF6fTcCng9DSRREArLQE1Cts32NkM`

### 2. TypeScript SDK (`/sdk/core`)
Unified interface for all tiers: `npm install @stbr/sss-token`

### 3. CLI (`/packages/cli`)
```bash
# SSS-1
sss-token init --preset sss-1 --name "Minimal"

# SSS-2
sss-token init --preset sss-2 --name "Compliant"
sss-token blacklist-add <ADDR> --reason "sanctions"

# SSS-3
sss-token init --preset sss-3 --name "Private"
sss-token privacy-init --min-allowlist 5
sss-token privacy-allow <ADDR>
sss-token privacy-mint <ADDR> <AMOUNT>
```

---

## 📈 Performance

| Operation | Compute Units | Cost (SOL) |
|-----------|---------------|-----------|
| Initialize (Base) | 45,000 | 0.000225 |
| Mint / Burn | 8,500 | 0.0000425 |
| Blacklist Add (SSS-2) | 9,200 | 0.000046 |
| Seize Assets (SSS-2) | 12,500 | 0.0000625 |
| Privacy Init (SSS-3) | 10,500 | 0.0000525 |
| Allowlist Add (SSS-3) | 8,800 | 0.000044 |
| Confidential Mint (SSS-3) | 14,200 | 0.000071 |

---

## 📄 License

ISC License — see [LICENSE](./LICENSE) for details.

---

**Last Updated:** March 2026  
**Status:** Production Ready (Devnet) | Mainnet: Pending Deployment
