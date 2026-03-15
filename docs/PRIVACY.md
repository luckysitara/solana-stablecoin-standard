# Privacy Integration Guide

## Overview

The Solana Stablecoin Standard now includes **SSS-3**, a privacy extension that adds scoped allowlists and confidential transfer capabilities to any SSS stablecoin.

## Quick Start

### 1. Deploy SSS-3 Program

```bash
# Build the program
cd programs/sss-3
cargo build-sbf

# Deploy to devnet
solana program deploy --program-id ./target/deploy/sss_3-keypair.json \
  ./target/deploy/sss_3.so
```

### 2. Initialize Privacy for Your Stablecoin

```typescript
import { PublicKey, Connection } from "@solana/web3.js";
import { findPrivacyConfigPDA, PrivacyPresets } from "@solana-stablecoin-standard/sdk";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import IDL from "../programs/sss-3/target/idl/sss_3.json";

// Setup
const connection = new Connection("https://api.devnet.solana.com");
const wallet = new Wallet(/* your keypair */);
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(IDL, provider);

// Get privacy config PDA
const stablecoinMint = new PublicKey("...");
const [privacyConfig, bump] = findPrivacyConfigPDA(stablecoinMint);

// Initialize privacy
const tx = await program.methods
  .initializePrivacyConfig(
    true,  // enable privacy
    PrivacyPresets.BASIC.minAllowlistSize
  )
  .accounts({
    authority: wallet.publicKey,
    stablecoin: stablecoinMint,
    privacyConfig,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("Privacy initialized:", tx);
```

### 3. Manage Allowlist

```typescript
import { findAllowlistEntryPDA } from "@solana-stablecoin-standard/sdk";

// Add address to allowlist (permanent)
const addressToAdd = new PublicKey("...");
const [allowlistEntry] = findAllowlistEntryPDA(stablecoinMint, addressToAdd);

const addTx = await program.methods
  .addToAllowlist(null)  // no expiry
  .accounts({
    authority: wallet.publicKey,
    privacyConfig,
    stablecoin: stablecoinMint,
    addressToAdd,
    allowlistEntry,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// Add address with 30-day expiry
const currentSlot = await connection.getSlot();
const thirtyDaysInSlots = BigInt(30 * 24 * 60 * 60 / 0.4); // ~2.59M slots
const expirySlot = BigInt(currentSlot) + thirtyDaysInSlots;

const addWithExpiryTx = await program.methods
  .addToAllowlist(expirySlot)
  .accounts({...})
  .rpc();

// Remove address from allowlist
const removeFromAllowlistTx = await program.methods
  .removeFromAllowlist()
  .accounts({
    authority: wallet.publicKey,
    privacyConfig,
    stablecoin: stablecoinMint,
    allowlistEntry,
  })
  .rpc();
```

### 4. Perform Confidential Transfers

```typescript
import { findConfidentialStatePDA } from "@solana-stablecoin-standard/sdk";
import { BN } from "@coral-xyz/anchor";

// Confidential mint (minter → recipient)
const [confidentialState] = findConfidentialStatePDA(stablecoinMint, recipientAddress);

const mintTx = await program.methods
  .confidentialMint(new BN(1000000)) // 1 token with 6 decimals
  .accounts({
    minter: minterKeypair.publicKey,
    privacyConfig,
    stablecoin: stablecoinMint,
    allowlistEntry: minterAllowlistEntry,
    recipient: recipientAddress,
    confidentialState,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
  })
  .signers([minterKeypair])
  .rpc();

// Confidential transfer (sender → recipient)
const [senderAllowlist] = findAllowlistEntryPDA(stablecoinMint, senderAddress);
const [recipientAllowlist] = findAllowlistEntryPDA(stablecoinMint, recipientAddress);

const transferTx = await program.methods
  .confidentialTransfer(new BN(500000), recipientAddress)
  .accounts({
    sender: senderKeypair.publicKey,
    privacyConfig,
    stablecoin: stablecoinMint,
    senderAllowlist,
    recipientAllowlist,
    recipientPubkey: recipientAddress,
    confidentialState,
    systemProgram: SystemProgram.programId,
  })
  .signers([senderKeypair])
  .rpc();
```

## State Queries

```typescript
// Fetch privacy config
const privacyConfigAccount = await program.account.privacyConfig.fetch(privacyConfig);
console.log("Privacy enabled:", privacyConfigAccount.privacyEnabled);
console.log("Active allowlist entries:", privacyConfigAccount.activeAllowlistEntries);
console.log("Total confidential mints:", privacyConfigAccount.totalConfidentialMints.toString());

// Fetch allowlist entry
const [allowlistEntry] = findAllowlistEntryPDA(stablecoinMint, address);
const entry = await program.account.allowlistEntry.fetch(allowlistEntry);
console.log("Status:", entry.status);
console.log("Transfer count:", entry.transferCount);
console.log("Total transferred:", entry.totalAmountTransferred.toString());

// Fetch confidential state (audit record)
const [confState] = findConfidentialStatePDA(stablecoinMint, recipient);
const state = await program.account.confidentialState.fetch(confState);
console.log("Total received:", state.totalReceived.toString());
console.log("Operation count:", state.operationCount);
```

## Event Monitoring

SSS-3 emits structured events for compliance and monitoring:

```typescript
// Listen for allowlist changes
program.addEventListener("AllowlistEntryAdded", (event) => {
  console.log("Address added to allowlist:", event.address);
  console.log("Added by:", event.addedBy);
  console.log("Expiry:", event.expirySlot);
});

// Listen for confidential transfers
program.addEventListener("ConfidentialTransferred", (event) => {
  console.log("Confidential transfer:");
  console.log("  From:", event.sender);
  console.log("  To:", event.recipient);
  console.log("  Amount:", event.amount.toString());
});

// Remove listeners when done
program.removeAllListeners();
```

## Frontend Integration

### React Component Example

```tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ConfidentialTransferComponent({ 
  stablecoinMint, 
  program 
}: { 
  stablecoinMint: PublicKey;
  program: any;
}) {
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!publicKey || !recipient || !amount) {
      toast.error('Fill all fields');
      return;
    }

    setLoading(true);
    try {
      const recipientPubkey = new PublicKey(recipient);
      const amountBN = BigInt(parseFloat(amount) * 1e6); // 6 decimals

      // Build transaction (simplified)
      const tx = new Transaction();
      // Add confidential transfer instruction
      
      const sig = await sendTransaction(tx, connection);
      toast.success(`Transfer complete: ${sig}`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <Input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleTransfer} disabled={loading}>
        {loading ? 'Transferring...' : 'Transfer'}
      </Button>
    </div>
  );
}
```

## Compliance Workflows

### Audit Trail

```typescript
// Get all events for a stablecoin
async function getAuditTrail(stablecoinMint: PublicKey) {
  const events = await program.getEventAnchor()
    .filter(e => e.stablecoin.equals(stablecoinMint))
    .sort((a, b) => b.timestamp - a.timestamp);

  return events;
}

// Export audit log as JSON
const auditLog = await getAuditTrail(stablecoinMint);
const json = JSON.stringify(auditLog, null, 2);
fs.writeFileSync('audit.json', json);
```

### Allowlist Validation

```typescript
// Verify all parties in a transaction are allowlisted
async function validatePrivacyTransaction(
  stablecoinMint: PublicKey,
  sender: PublicKey,
  recipient: PublicKey
) {
  const [senderEntry] = findAllowlistEntryPDA(stablecoinMint, sender);
  const [recipientEntry] = findAllowlistEntryPDA(stablecoinMint, recipient);

  const senderData = await program.account.allowlistEntry.fetch(senderEntry);
  const recipientData = await program.account.allowlistEntry.fetch(recipientEntry);

  const isValid = 
    senderData.status === 0 && // Active
    recipientData.status === 0 && // Active
    (!senderData.expirySlot || senderData.expirySlot > currentSlot) &&
    (!recipientData.expirySlot || recipientData.expirySlot > currentSlot);

  return isValid;
}
```

## Error Handling

```typescript
import { PrivacyError } from "@solana-stablecoin-standard/sdk";

try {
  await program.methods
    .confidentialTransfer(amount, recipient)
    .accounts({...})
    .rpc();
} catch (error) {
  if (error.code === PrivacyError.NotOnAllowlist) {
    console.error("Address is not on allowlist");
  } else if (error.code === PrivacyError.AllowlistExpired) {
    console.error("Allowlist entry has expired");
  } else if (error.code === PrivacyError.PrivacyNotEnabled) {
    console.error("Privacy not enabled for this stablecoin");
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Testing SSS-3

```bash
# Run SSS-3 program tests
cd programs/sss-3
cargo test

# Run integration tests
cd sdk/core
npm test -- tests/privacy.test.ts

# Run fuzz tests (for production validation)
cargo fuzz run fuzz_privacy
```

## Best Practices

1. **Always verify allowlist before transfers**
   - Check entry status, expiry, and authority permissions
   - Use `fetchAllowlistEntry()` to get current state

2. **Monitor events for compliance**
   - Subscribe to `ConfidentialTransferred` events
   - Archive events for regulatory requirements
   - Alert on anomalies (high volumes, unusual recipients)

3. **Plan allowlist expiries carefully**
   - Use permanent allowlist (no expiry) for ongoing relationships
   - Use time-limited allowlist for trial periods
   - Set reminders to refresh expiring entries

4. **Separate authorities**
   - Use different authority for privacy vs. stablecoin operations
   - Enables compliance team independence

5. **Disaster recovery**
   - Back up authority keypair securely (hardware wallet)
   - Have contingency authority ready
   - Test recovery procedures regularly

## Mainnet Considerations

When deploying SSS-3 to mainnet:

- Use hardware wallet for authority (no hot keys)
- Thoroughly test allowlist logic before enforcement
- Start with permissive settings, tighten gradually
- Monitor gas costs for your transaction volume
- Have 24/7 monitoring of privacy events
- Implement emergency pause mechanism

## Support

For questions or issues:
- GitHub Issues: https://github.com/superteamfun/sss/issues
- Documentation: https://sss.superteam.fun
- Discord: https://discord.gg/superteam
