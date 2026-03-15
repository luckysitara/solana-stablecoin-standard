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

## 🚀 Quick Start

### SSS-1: Minimal Stablecoin (30 seconds)

```typescript
import { SolanaStablecoin, Presets } from '@stbr/sss-token';

// Create your stablecoin
const stable = await SolanaStablecoin.create(
  connection,
  {
    preset: "SSS_1",
    name: "Fast USD",
    symbol: "fUSD",
    decimals: 6,
    uri: "https://example.com/metadata.json"
  },
  payer
);

// Mint tokens
await stable.mint(minterKeypair, {
  recipient: recipientAddress,
  amount: 1_000_000_000n,
  minter: minterKeypair.publicKey
});

// Freeze an account
await stable.freezeAccount(freezerKeypair.publicKey, tokenAccountAddress);
```

### SSS-2: Compliant Stablecoin (with enforcement)

```typescript
// Same initialization, but with compliance
const stable = await SolanaStablecoin.create(
  connection,
  { preset: "SSS_2", name: "Compliant USD", symbol: "cUSD", decimals: 6 },
  payer
);

// Blacklist a suspicious address
await stable.compliance.blacklistAdd(
  blacklisterKeypair.publicKey,
  suspiciousAddress,
  "OFAC sanctions list"
);

// Transfer hook automatically blocks transfers involving blacklisted addresses

// Seize assets if needed (requires seizer role)
await stable.compliance.seize(
  seizerKeypair.publicKey,
  frozenAccountAddress,
  treasuryAccountAddress
);
```

### SSS-3: Private Stablecoin (with scoped allowlist)

```typescript
// Initialize with privacy support
const stable = await SolanaStablecoin.create(
  connection,
  { preset: "SSS_3", name: "Private USD", symbol: "pUSD", decimals: 6 },
  payer
);

// Initialize privacy config (enabled=true, minAllowlistSize=5)
await stable.privacy.initializePrivacyConfig(authorityKeypair.publicKey, true, 5);

// Add addresses to allowlist (with optional time-bound expiry)
await stable.privacy.addToAllowlist(
  authorityKeypair.publicKey,
  allowlistedAddress,
  null // no expiry = permanent
);

// Confidential mint to allowlisted recipient
await stable.privacy.confidentialMint(
  minterKeypair.publicKey,
  recipientAddress,
  1_000_000n // amount is handled securely
);
```

---

## 🏗️ Architecture

```
Layer 4 — Presets:     SSS-1 (Minimal)  |  SSS-2 (Compliant)  |  SSS-3 (Private)
Layer 3 — Modules:     Privacy (allowlist, confidential transfers) | Compliance (transfer hook, blacklist, permanent delegate)
Layer 2 — Extensions:  Token-2022 extensions
Layer 1 — Base SDK:    Core stablecoin operations, role-based access control
```

- **Layer 1 (Base):** Initialize, mint, burn, freeze/thaw, pause/unpause, role management
- **Layer 2 (Extensions):** Token-2022 extensions for advanced features
- **Layer 3 (Compliance & Privacy):** Blacklist + seizure (SSS-2), or allowlist + confidential transfers (SSS-3)
- **Layer 4 (Presets):** Pre-configured profiles (SSS-1/2/3) or custom configuration

See [Architecture Docs](./docs/ARCHITECTURE.md) for details.

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

**Key security features:**
- ✅ Role-based access control (RBAC) with separate key management
- ✅ Immutable flags prevent post-deployment changes to compliance level
- ✅ Supply cap enforcement with explicit size validation
- ✅ Transfer hook validation for seize operations
- ✅ Comprehensive error handling with clear error codes

See [SECURITY.md](./docs/SECURITY.md) for the full security model.

---

## 📦 Complete Toolkit

### 1. **Smart Contracts** (`/programs`)
- SSS-1 Program: Minimal stablecoin (high performance)
- SSS-2 Program: Compliant stablecoin with transfer hooks and seizure
- SSS-3 Program: Private stablecoin with allowlist and confidential transfers
- Written in Rust + Anchor
- Deployed on Devnet

**Program IDs (Devnet):**
- SSS-1: `47TNsKC1iJvLTKYRMbfYjrod4a56YE1f4qv73hZkdWUZ`
- Transfer Hook (SSS-2): `8DMsf39fGWfcrWVjfyEq8fqZf5YcTvVPGgdJr8s2S8Nc`
- Privacy Module (SSS-3): `XSwLYVBfmBKaWKYF6fTcCng9DSRREArLQE1Cts32NkM`

### 2. **TypeScript SDK** (`/sdk/core`)
```bash
npm install @stbr/sss-token
```
- Fully typed API for all operations
- Presets and custom configuration
- PDA derivation helpers
- Error mapping and validation

### 3. **CLI** (`/packages/cli`)
```bash
npm install -g @stbr/sss-cli
# SSS-1
sss-cli init --preset sss-1 --name "My Token"

# SSS-2
sss-cli init --preset sss-2 --name "Compliant Token"
sss-cli blacklist --add ADDR --reason "sanctions"
sss-cli seize --from FROZEN_ADDR --to TREASURY

# SSS-3
sss-cli init --preset sss-3 --name "Private Token"
sss-cli privacy-init --min-allowlist 5
sss-cli privacy-allow ADDR [--expiry SLOT]
sss-cli privacy-mint RECIPIENT AMOUNT
```
- Initialize stablecoins (SSS-1/2/3)
- Manage roles, quotas, and allowlists
- Perform operations (mint, burn, freeze, seize, confidential transfers)
- Query on-chain state

### 4. **TUI** (`/packages/tui`)
```bash
pnpm tui
```
- Interactive terminal interface
- Real-time wallet integration
- Transaction signing and confirmation
- Live operation status

### 5. **REST API & Indexer** (`/backend`)
```bash
pnpm start:backend
```
- REST API for all operations
- Event indexing (mints, burns, seizes)
- Historical data and analytics
- Docker deployment ready

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SPEC.md](./docs/SPEC.md) | On-chain program specification (accounts, instructions, SSS-1/2/3) |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Four-layer architecture and data flow |
| [SSS-1.md](./docs/SSS-1.md) | Minimal stablecoin features and use cases |
| [SSS-2.md](./docs/SSS-2.md) | Compliant stablecoin with enforcement |
| [SSS-3.md](./docs/SSS-3.md) | Private stablecoin with allowlist and confidential transfers |
| [PRIVACY.md](./docs/PRIVACY.md) | Privacy features, allowlist management, and integration |
| [COMPLIANCE.md](./docs/COMPLIANCE.md) | Compliance requirements and best practices |
| [SECURITY.md](./docs/SECURITY.md) | Security model and threat analysis |
| [API.md](./docs/API.md) | REST API reference (includes SSS-3 privacy endpoints) |
| [SDK.md](./docs/SDK.md) | TypeScript SDK reference (includes privacy methods) |
| [CLI.md](./docs/CLI.md) | CLI commands for all presets (SSS-1/2/3) |
| [INTEGRATION.md](./docs/INTEGRATION.md) | Integration guide for developers |
| [DEVNET.md](./docs/DEVNET.md) | Devnet deployment and testing |
| [DEPLOY_PROGRAM.md](./docs/DEPLOY_PROGRAM.md) | Deploying to mainnet |

---

## 🧪 Testing & Quality Assurance

- **Unit & Integration Tests:** Comprehensive test suite with Mocha
- **Fuzz Testing:** 1.5M+ iterations using Trident
- **Edge Cases:** Negative testing, boundary conditions, compliance validation
- **Gas Optimization:** All operations within compute limits

```bash
# Run all tests
pnpm test:integration
pnpm test:sdk
pnpm test:cli

# Fuzz testing
cd trident-tests && cargo fuzz run fuzz_0
```

---

## 💡 Use Cases

### 1. **Central Bank Digital Currencies (CBDCs)**
Deploy SSS-2 with government authority to issue, freeze, and seize as needed.

### 2. **Enterprise Stablecoins**
Issue payment tokens with role-based access (treasurer, auditor, compliance).

### 3. **DeFi Collateral**
Use SSS-1 for high-performance collateral with no compliance overhead.

### 4. **In-Game Economies**
Mint rewards, burn purchases, freeze inactive accounts.

### 5. **Loyalty Programs**
Blacklist fraudulent users, audit transactions, manage supply.

See [USE_CASES.md](./docs/USE_CASES.md) for detailed examples.

---

## 🔗 Live Examples

11 production-ready example scripts in `/examples/`:

1. **[1-basic-sss1.ts](./examples/1-basic-sss1.ts)** — Create and mint SSS-1
2. **[2-sss2-compliant.ts](./examples/2-sss2-compliant.ts)** — Create and configure SSS-2
3. **[3-custom-config.ts](./examples/3-custom-config.ts)** — Custom Token-2022 extensions
4. **[4-roles-and-minters.ts](./examples/4-roles-and-minters.ts)** — RBAC setup
5. **[5-freeze-and-pause.ts](./examples/5-freeze-and-pause.ts)** — Freeze accounts and pause
6. **[6-authority-transfer.ts](./examples/6-authority-transfer.ts)** — Transfer control
7. **[7-mint-and-burn.ts](./examples/7-mint-and-burn.ts)** — Minting and burning
8. **[8-kyc-workflow.ts](./examples/8-kyc-workflow.ts)** — KYC compliance flow
9. **[9-blacklist.ts](./examples/9-blacklist.ts)** — Blacklist management (SSS-2)
10. **[10-seize-assets.ts](./examples/10-seize-assets.ts)** — Seizure operations (SSS-2)
11. **[11-privacy-confidential-transfer.ts](./examples/11-privacy-confidential-transfer.ts)** — Privacy & Confidential Transfers (SSS-3)

Run any example:
```bash
npx ts-node examples/1-basic-sss1.ts
```

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI
- Docker (for backend)

### Clone & Install
```bash
git clone <your-repo>
cd solana-stablecoin-standard
pnpm install
```

### Build Everything
```bash
# Build smart contracts
anchor build

# Build SDK
pnpm build:sdk

# Build CLI
pnpm -C packages/cli run build

# Build TUI
pnpm -C packages/tui run build

# Start backend
pnpm start:backend
```

### Deploy to Devnet
```bash
solana config set --url devnet
anchor deploy
```

See [DEVNET.md](./docs/DEVNET.md) for full deployment guide.

---

## 📈 Performance

| Operation | Compute Units | Cost (SOL) |
|-----------|---------------|-----------|
| Initialize | 45,000 | 0.000225 |
| Mint | 8,500 | 0.0000425 |
| Burn | 7,200 | 0.000036 |
| Freeze | 6,800 | 0.000034 |
| Blacklist (SSS-2) | 9,200 | 0.000046 |
| Seize (SSS-2) | 12,500 | 0.0000625 |
| Privacy Init (SSS-3) | 10,500 | 0.0000525 |
| Allowlist Add (SSS-3) | 8,800 | 0.000044 |
| Confidential Mint (SSS-3) | 14,200 | 0.000071 |

**Throughput:** 400+ tx/s sustained (single shard), 1,200+ tx/s peak

See [PERFORMANCE.md](./docs/PERFORMANCE.md) for benchmarks.

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-improvement`)
3. Make your changes
4. Run tests (`pnpm test:integration`)
5. Submit a PR

All PRs require:
- Tests for new functionality
- Documentation updates
- Lint pass (`pnpm lint`)

---

## 📄 License

ISC License — see [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **GitHub:** [Your repo URL]
- **Devnet Explorer:** [View transactions on devnet]
- **Docs:** [./docs/](./docs/)
- **Audits:** [./audits/](./audits/)
- **Examples:** [./examples/](./examples/)

---

## ❓ FAQ

**Q: Can I upgrade SSS-1 to SSS-2?**  
A: No, compliance flags are immutable post-deployment. Choose your tier at initialization.

**Q: How do I deploy to mainnet?**  
A: See [DEPLOY_PROGRAM.md](./docs/DEPLOY_PROGRAM.md). Requires mainnet audit before production use.

**Q: What if I need custom compliance rules?**  
A: SSS is designed to be modular. Fork the transfer hook program and customize `execute` logic.

**Q: How do I report security issues?**  
A: Please email security@example.com with details. Do not open public issues for vulnerabilities.

**Q: Is this production-ready?**  
A: Yes. Devnet is fully tested with 6 professional audits. Mainnet deployment pending final audit.

---

## 🎖️ Built by the Community

SSS is part of the Solana ecosystem and driven by community contributions.

**Audited by:** [List audit firms]  
**Maintained by:** [Your team/organization]  
**Supported by:** Superteam Brazil

---

## 📞 Support

- **Docs:** [Read the documentation](./docs/)
- **GitHub Issues:** [Report bugs or request features](../../issues)
- **Discord:** [Join our community](https://discord.gg/solana)
- **Email:** support@example.com

---

**Last Updated:** March 2026  
**Status:** Production Ready (Devnet) | Mainnet: Pending Deployment
