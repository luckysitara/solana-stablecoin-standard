import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";
import { SolanaStablecoin, PrivacyPresets } from "../sdk/core/src";
import { getProvider, fundKeypairs } from "./testSetup";

describe("SSS-3 Privacy Module", () => {
  const provider = getProvider();
  const authority = (provider.wallet as anchor.Wallet).payer as Keypair;
  
  let stable: SolanaStablecoin;
  let user = Keypair.generate();
  let mintKeypair = Keypair.generate();

  before(async () => {
    console.log("  Creating fresh SSS-3 Stablecoin for test...");
    stable = await SolanaStablecoin.create(provider.connection, {
      name: "Privacy USD",
      symbol: "PUSD",
      uri: "",
      decimals: 6,
      enablePermanentDelegate: true,
      enableTransferHook: true,
      defaultAccountFrozen: false,
      mintKeypair,
    }, authority);
    
    await fundKeypairs(provider, [user]);
  });

  it("initializes privacy config", async () => {
    console.log("  Initializing Privacy Config...");
    const { privacyEnabled, minAllowlistSize } = PrivacyPresets.BASIC;
    const sig = await stable.privacy.initializePrivacyConfig(
      authority.publicKey,
      privacyEnabled,
      minAllowlistSize
    );
    expect(sig).to.be.a("string");
    
    const config = await stable.privacy.getPrivacyConfig();
    expect(config.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(config.privacyEnabled).to.equal(privacyEnabled);
  });

  it("adds user to allowlist", async () => {
    console.log("  Adding user to allowlist...");
    const sig = await stable.privacy.addToAllowlist(
      authority.publicKey,
      user.publicKey,
      null // expirySlot
    );
    expect(sig).to.be.a("string");
    
    const entry = await stable.privacy.getAllowlistEntry(user.publicKey);
    // Anchor converts enum Active to { active: {} }
    expect(entry.status.active).to.not.be.undefined;
  });
});
