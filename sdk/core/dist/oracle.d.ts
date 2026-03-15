/**
 * Pyth oracle helpers for stablecoin price conversions.
 * Uses Hermes REST API: https://hermes.pyth.network
 */
export interface PythPrice {
    /** Raw price (e.g. 6140993501000 for BTC/USD) */
    price: string;
    /** Exponent (e.g. -8). Actual price = price * 10^expo */
    expo: number;
    /** Confidence interval (optional) */
    conf?: string;
    /** Publish timestamp (optional) */
    publish_time?: number;
}
/**
 * Fetch latest Pyth price for a feed.
 * @param feedId - Pyth price feed ID (hex, e.g. 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43)
 * @param endpoint - Hermes endpoint (default: https://hermes.pyth.network)
 * @returns Parsed price or null if not found
 */
export declare function fetchPythPrice(feedId: string, endpoint?: string): Promise<PythPrice | null>;
/**
 * Get the numeric price from Pyth format: price * 10^expo
 */
export declare function pythPriceToNumber(p: PythPrice): number;
/**
 * Convert USD amount to token base units using a Pyth price.
 * For a stablecoin priced at ~1 USD (e.g. USDC/USD), token base = usdAmount * 10^decimals.
 * For other feeds (e.g. BTC/USD), token base = (usdAmount / price) * 10^decimals.
 *
 * @param usdAmount - Amount in USD
 * @param price - Pyth price (e.g. from fetchPythPrice)
 * @param decimals - Token decimals (e.g. 6)
 * @returns Token amount in base units (bigint)
 */
export declare function usdToTokenAmount(usdAmount: number, price: PythPrice, decimals: number): bigint;
/**
 * Convert token base units to USD using a Pyth price.
 *
 * @param tokenAmount - Token amount in base units (bigint)
 * @param price - Pyth price (e.g. from fetchPythPrice)
 * @param decimals - Token decimals (e.g. 6)
 * @returns USD value (number)
 */
export declare function tokenAmountToUsd(tokenAmount: bigint, price: PythPrice, decimals: number): number;
//# sourceMappingURL=oracle.d.ts.map