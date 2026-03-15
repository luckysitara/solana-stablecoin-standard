"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceNotEnabledError = exports.StablecoinErrorCode = void 0;
exports.getUserFacingMessage = getUserFacingMessage;
exports.parseProgramError = parseProgramError;
exports.parseProgramErrorFromError = parseProgramErrorFromError;
exports.getErrorMessage = getErrorMessage;
exports.validateMintAmount = validateMintAmount;
exports.validateBurnAmount = validateBurnAmount;
exports.parseAnchorErrorCode = parseAnchorErrorCode;
exports.StablecoinErrorCode = {
    Unauthorized: 6000,
    Paused: 6001,
    ComplianceNotEnabled: 6002,
    AlreadyBlacklisted: 6003,
    NotBlacklisted: 6004,
    QuotaExceeded: 6005,
    ZeroAmount: 6006,
    NameTooLong: 6007,
    SymbolTooLong: 6008,
    UriTooLong: 6009,
    ReasonTooLong: 6010,
    Blacklisted: 6011,
    MathOverflow: 6012,
    InvalidRoleConfig: 6013,
    SupplyCapExceeded: 6014,
};
/** Human-readable messages for program error codes (from tests + error.rs). */
function getUserFacingMessage(code) {
    const map = {
        [exports.StablecoinErrorCode.Unauthorized]: "Unauthorized: caller lacks required role",
        [exports.StablecoinErrorCode.Paused]: "Stablecoin is paused",
        [exports.StablecoinErrorCode.ComplianceNotEnabled]: "Compliance module not enabled (SSS-2 required)",
        [exports.StablecoinErrorCode.AlreadyBlacklisted]: "Address is already blacklisted",
        [exports.StablecoinErrorCode.NotBlacklisted]: "Address is not blacklisted",
        [exports.StablecoinErrorCode.QuotaExceeded]: "Minter quota exceeded",
        [exports.StablecoinErrorCode.ZeroAmount]: "Amount must be greater than zero",
        [exports.StablecoinErrorCode.NameTooLong]: "Name too long (max 32 characters)",
        [exports.StablecoinErrorCode.SymbolTooLong]: "Symbol too long (max 10 characters)",
        [exports.StablecoinErrorCode.UriTooLong]: "URI too long (max 200 characters)",
        [exports.StablecoinErrorCode.ReasonTooLong]: "Reason too long (max 100 characters)",
        [exports.StablecoinErrorCode.Blacklisted]: "Address is blacklisted",
        [exports.StablecoinErrorCode.MathOverflow]: "Arithmetic overflow",
        [exports.StablecoinErrorCode.InvalidRoleConfig]: "Invalid role configuration",
        [exports.StablecoinErrorCode.SupplyCapExceeded]: "Supply cap exceeded",
    };
    return map[code] ?? `Program error ${code}`;
}
/** Parse program error from transaction logs and return friendly message. */
function parseProgramError(logs) {
    const code = parseAnchorErrorCode(logs);
    if (code == null)
        return null;
    return getUserFacingMessage(code);
}
/**
 * Extract program error message from an Error (Anchor embeds logs in message).
 * Returns the friendly message if a known program error is found, else null.
 */
function parseProgramErrorFromError(err) {
    const msg = err.message;
    const lines = msg.split(/\r?\n/);
    const parsed = parseProgramError(lines);
    if (parsed)
        return parsed;
    const match = msg.match(/Error Code: (\d+)/);
    if (match)
        return getUserFacingMessage(parseInt(match[1], 10));
    return null;
}
/**
 * Get a user-facing error message from an Error, preferring program error mapping.
 */
function getErrorMessage(err) {
    if (!(err instanceof Error))
        return String(err);
    const msg = err.message;
    // Anchor 3003 + "role" → signer has no role account (must use authority or be granted role)
    if (msg.includes("Error Code: 3003") || msg.includes("Error Number: 3003")) {
        if (msg.toLowerCase().includes("role")) {
            return ("Your wallet does not have a role for this stablecoin. " +
                "Use the authority keypair (who created the stablecoin), or have the authority grant you " +
                "the burner/minter role via the Roles tab (update_roles) first.");
        }
    }
    const program = parseProgramErrorFromError(err);
    if (program)
        return program;
    return msg;
}
/**
 * Validate mint amount before sending. Matches tests (zero amount rejected).
 */
function validateMintAmount(amount) {
    const n = typeof amount === "bigint" ? amount : BigInt(String(amount));
    if (n <= 0n)
        return "Amount must be greater than zero";
    return null;
}
/**
 * Validate burn amount before sending. Matches tests (zero amount rejected).
 */
function validateBurnAmount(amount) {
    const n = typeof amount === "bigint" ? amount : BigInt(String(amount));
    if (n <= 0n)
        return "Amount must be greater than zero";
    return null;
}
class ComplianceNotEnabledError extends Error {
    constructor() {
        super("Compliance module is not enabled for this stablecoin (SSS-2 required).");
        this.name = "ComplianceNotEnabledError";
    }
}
exports.ComplianceNotEnabledError = ComplianceNotEnabledError;
function parseAnchorErrorCode(logs) {
    const withCode = logs.find((l) => l.includes("Error Code: "));
    if (!withCode)
        return null;
    const match = withCode.match(/Error Code: (\d+)/);
    return match ? parseInt(match[1], 10) : null;
}
