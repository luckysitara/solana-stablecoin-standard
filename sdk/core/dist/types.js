"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESET_CONFIGS = exports.Presets = void 0;
exports.toStablecoinAmount = toStablecoinAmount;
exports.normalizeInitializeParams = normalizeInitializeParams;
/** Coerce a bigint to StablecoinAmount (for explicit amount typing at API boundaries). */
function toStablecoinAmount(n) {
    return n;
}
exports.Presets = {
    SSS_1: {
        enablePermanentDelegate: false,
        enableTransferHook: false,
        defaultAccountFrozen: false,
    },
    SSS_2: {
        enablePermanentDelegate: true,
        enableTransferHook: true,
        defaultAccountFrozen: true,
    },
    SSS_3: {
        enablePermanentDelegate: true,
        enableTransferHook: true,
        defaultAccountFrozen: true,
    },
};
exports.PRESET_CONFIGS = {
    SSS_1: { name: "SSS_1", extensions: exports.Presets.SSS_1 },
    SSS_2: { name: "SSS_2", extensions: exports.Presets.SSS_2 },
    SSS_3: { name: "SSS_3", extensions: exports.Presets.SSS_3 },
};
function normalizeInitializeParams(params) {
    let ext;
    if (params.preset === "SSS_1" || params.preset === "SSS_2" || params.preset === "SSS_3") {
        ext = exports.Presets[params.preset];
    }
    else if (params.extensions) {
        ext = {
            enablePermanentDelegate: params.extensions.enablePermanentDelegate ?? false,
            enableTransferHook: params.extensions.enableTransferHook ?? false,
            defaultAccountFrozen: params.extensions.defaultAccountFrozen ?? false,
        };
    }
    else {
        ext = exports.Presets.SSS_1;
    }
    return {
        name: params.name,
        symbol: params.symbol,
        uri: params.uri,
        decimals: params.decimals,
        enable_permanent_delegate: ext.enablePermanentDelegate,
        enable_transfer_hook: ext.enableTransferHook,
        default_account_frozen: ext.defaultAccountFrozen,
    };
}
