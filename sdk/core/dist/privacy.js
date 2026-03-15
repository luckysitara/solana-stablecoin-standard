"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyPresets = exports.AllowlistStatus = exports.PrivacyLevel = void 0;
/** Privacy levels for SSS-3 */
var PrivacyLevel;
(function (PrivacyLevel) {
    PrivacyLevel[PrivacyLevel["None"] = 0] = "None";
    PrivacyLevel[PrivacyLevel["ScopedAllowlist"] = 1] = "ScopedAllowlist";
    PrivacyLevel[PrivacyLevel["ZkProof"] = 2] = "ZkProof";
})(PrivacyLevel || (exports.PrivacyLevel = PrivacyLevel = {}));
/** Status of allowlist entry */
var AllowlistStatus;
(function (AllowlistStatus) {
    AllowlistStatus[AllowlistStatus["Active"] = 0] = "Active";
    AllowlistStatus[AllowlistStatus["Revoked"] = 1] = "Revoked";
    AllowlistStatus[AllowlistStatus["Expired"] = 2] = "Expired";
})(AllowlistStatus || (exports.AllowlistStatus = AllowlistStatus = {}));
/** SSS-3 Privacy Presets */
exports.PrivacyPresets = {
    BASIC: {
        privacyEnabled: true,
        minAllowlistSize: 5,
    },
    STRICT: {
        privacyEnabled: true,
        minAllowlistSize: 20,
    },
    PERMISSIVE: {
        privacyEnabled: true,
        minAllowlistSize: 1,
    },
};
