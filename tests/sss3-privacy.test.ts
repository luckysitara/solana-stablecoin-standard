import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";
import { SolanaStablecoin, PrivacyPresets } from "../sdk/core/src";
import { getProvider, fundKeypairs } from "./testSetup";

describe("SSS-3 Privacy Module", () => {
  const provider = getProvider();
  const authority = (provider.wallet as anchor.Wallet).payer;
  
  let stable: SolanaStablecoin;
  let user = Keypair.generate();

  before(async () => {
    // Use existing mint if on devnet to save SOL
    const existingMint = new PublicKey("AF4onahTCzYT8PTgAZP48kD7sZNZfAxT4xSSni5exeBJ");
    console.log("  Loading existing SSS-3 Stablecoin:", existingMint.toBase58());
    stable = await SolanaStablecoin.loadFromConnection(
      provider.connection,
      existingMint,
      authority
    );
    
    // await fundKeypairs(provider, [user]);
  });

  it("initializes privacy config", async () => {
    console.log("  Initializing Privacy Config...");
    const { privacyEnabled, minAllowlistSize } = PrivacyPresets.BASIC;
    const sig = await stable.privacy.initializePrivacyConfig(
      authority.publicKey,
      privacyEnabled,
      minAllowlistSize
    );
    console.log("  Privacy Init tx:", sig);
    expect(sig).to.not.be.null;
  });

  it("adds user to allowlist", async () => {
    console.log("  Adding user to allowlist...");
    const sig = await stable.privacy.addToAllowlist(
      authority.publicKey,
      user.publicKey,
      null // permanent
    );
    console.log("  Allowlist add tx:", sig);
    expect(sig).to.not.be.null;
  });

  it("performs a confidential mint", async () => {
    console.log("  Performing confidential mint...");
    const amount = 1000_000000n;
    const sig = await stable.privacy.confidentialMint(
      authority.publicKey,
      user.publicKey,
      amount
    );
    console.log("  Confidential mint tx:", sig);
    expect(sig).to.not.be.null;
  });
});
