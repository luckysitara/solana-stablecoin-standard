export declare const StablecoinErrorCode: {
    readonly Unauthorized: 6000;
    readonly Paused: 6001;
    readonly ComplianceNotEnabled: 6002;
    readonly AlreadyBlacklisted: 6003;
    readonly NotBlacklisted: 6004;
    readonly QuotaExceeded: 6005;
    readonly ZeroAmount: 6006;
    readonly NameTooLong: 6007;
    readonly SymbolTooLong: 6008;
    readonly UriTooLong: 6009;
    readonly ReasonTooLong: 6010;
    readonly Blacklisted: 6011;
    readonly MathOverflow: 6012;
    readonly InvalidRoleConfig: 6013;
    readonly SupplyCapExceeded: 6014;
};
/** Human-readable messages for program error codes (from tests + error.rs). */
export declare function getUserFacingMessage(code: number): string;
/** Parse program error from transaction logs and return friendly message. */
export declare function parseProgramError(logs: string[]): string | null;
/**
 * Extract program error message from an Error (Anchor embeds logs in message).
 * Returns the friendly message if a known program error is found, else null.
 */
export declare function parseProgramErrorFromError(err: Error): string | null;
/**
 * Get a user-facing error message from an Error, preferring program error mapping.
 */
export declare function getErrorMessage(err: unknown): string;
/**
 * Validate mint amount before sending. Matches tests (zero amount rejected).
 */
export declare function validateMintAmount(amount: bigint | string | number): string | null;
/**
 * Validate burn amount before sending. Matches tests (zero amount rejected).
 */
export declare function validateBurnAmount(amount: bigint | string | number): string | null;
export declare class ComplianceNotEnabledError extends Error {
    constructor();
}
export declare function parseAnchorErrorCode(logs: string[]): number | null;
//# sourceMappingURL=errors.d.ts.map