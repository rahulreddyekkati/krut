(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/6bd82_3f3e23e9._.js",
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "concat",
    ()=>concat,
    "decoder",
    ()=>decoder,
    "encode",
    ()=>encode,
    "encoder",
    ()=>encoder,
    "uint32be",
    ()=>uint32be,
    "uint64be",
    ()=>uint64be
]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const MAX_INT32 = 2 ** 32;
function concat(...buffers) {
    const size = buffers.reduce((acc, { length })=>acc + length, 0);
    const buf = new Uint8Array(size);
    let i = 0;
    for (const buffer of buffers){
        buf.set(buffer, i);
        i += buffer.length;
    }
    return buf;
}
function writeUInt32BE(buf, value, offset) {
    if (value < 0 || value >= MAX_INT32) {
        throw new RangeError(`value must be >= 0 and <= ${MAX_INT32 - 1}. Received ${value}`);
    }
    buf.set([
        value >>> 24,
        value >>> 16,
        value >>> 8,
        value & 0xff
    ], offset);
}
function uint64be(value) {
    const high = Math.floor(value / MAX_INT32);
    const low = value % MAX_INT32;
    const buf = new Uint8Array(8);
    writeUInt32BE(buf, high, 0);
    writeUInt32BE(buf, low, 4);
    return buf;
}
function uint32be(value) {
    const buf = new Uint8Array(4);
    writeUInt32BE(buf, value);
    return buf;
}
function encode(string) {
    const bytes = new Uint8Array(string.length);
    for(let i = 0; i < string.length; i++){
        const code = string.charCodeAt(i);
        if (code > 127) {
            throw new TypeError('non-ASCII string encountered in encode()');
        }
        bytes[i] = code;
    }
    return bytes;
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/base64.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeBase64",
    ()=>decodeBase64,
    "encodeBase64",
    ()=>encodeBase64
]);
function encodeBase64(input) {
    if (Uint8Array.prototype.toBase64) {
        return input.toBase64();
    }
    const CHUNK_SIZE = 0x8000;
    const arr = [];
    for(let i = 0; i < input.length; i += CHUNK_SIZE){
        arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(''));
}
function decodeBase64(encoded) {
    if (Uint8Array.fromBase64) {
        return Uint8Array.fromBase64(encoded);
    }
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decode",
    ()=>decode,
    "encode",
    ()=>encode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/base64.js [middleware-edge] (ecmascript)");
;
;
function decode(input) {
    if (Uint8Array.fromBase64) {
        return Uint8Array.fromBase64(typeof input === 'string' ? input : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(input), {
            alphabet: 'base64url'
        });
    }
    let encoded = input;
    if (encoded instanceof Uint8Array) {
        encoded = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(encoded);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64"])(encoded);
    } catch  {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
}
function encode(input) {
    let unencoded = input;
    if (typeof unencoded === 'string') {
        unencoded = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encoder"].encode(unencoded);
    }
    if (Uint8Array.prototype.toBase64) {
        return unencoded.toBase64({
            alphabet: 'base64url',
            omitPadding: true
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBase64"])(unencoded).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JOSEAlgNotAllowed",
    ()=>JOSEAlgNotAllowed,
    "JOSEError",
    ()=>JOSEError,
    "JOSENotSupported",
    ()=>JOSENotSupported,
    "JWEDecryptionFailed",
    ()=>JWEDecryptionFailed,
    "JWEInvalid",
    ()=>JWEInvalid,
    "JWKInvalid",
    ()=>JWKInvalid,
    "JWKSInvalid",
    ()=>JWKSInvalid,
    "JWKSMultipleMatchingKeys",
    ()=>JWKSMultipleMatchingKeys,
    "JWKSNoMatchingKey",
    ()=>JWKSNoMatchingKey,
    "JWKSTimeout",
    ()=>JWKSTimeout,
    "JWSInvalid",
    ()=>JWSInvalid,
    "JWSSignatureVerificationFailed",
    ()=>JWSSignatureVerificationFailed,
    "JWTClaimValidationFailed",
    ()=>JWTClaimValidationFailed,
    "JWTExpired",
    ()=>JWTExpired,
    "JWTInvalid",
    ()=>JWTInvalid
]);
class JOSEError extends Error {
    static code = 'ERR_JOSE_GENERIC';
    code = 'ERR_JOSE_GENERIC';
    constructor(message, options){
        super(message, options);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
class JWTClaimValidationFailed extends JOSEError {
    static code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    claim;
    reason;
    payload;
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified'){
        super(message, {
            cause: {
                claim,
                reason,
                payload
            }
        });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
class JWTExpired extends JOSEError {
    static code = 'ERR_JWT_EXPIRED';
    code = 'ERR_JWT_EXPIRED';
    claim;
    reason;
    payload;
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified'){
        super(message, {
            cause: {
                claim,
                reason,
                payload
            }
        });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
class JOSEAlgNotAllowed extends JOSEError {
    static code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    code = 'ERR_JOSE_ALG_NOT_ALLOWED';
}
class JOSENotSupported extends JOSEError {
    static code = 'ERR_JOSE_NOT_SUPPORTED';
    code = 'ERR_JOSE_NOT_SUPPORTED';
}
class JWEDecryptionFailed extends JOSEError {
    static code = 'ERR_JWE_DECRYPTION_FAILED';
    code = 'ERR_JWE_DECRYPTION_FAILED';
    constructor(message = 'decryption operation failed', options){
        super(message, options);
    }
}
class JWEInvalid extends JOSEError {
    static code = 'ERR_JWE_INVALID';
    code = 'ERR_JWE_INVALID';
}
class JWSInvalid extends JOSEError {
    static code = 'ERR_JWS_INVALID';
    code = 'ERR_JWS_INVALID';
}
class JWTInvalid extends JOSEError {
    static code = 'ERR_JWT_INVALID';
    code = 'ERR_JWT_INVALID';
}
class JWKInvalid extends JOSEError {
    static code = 'ERR_JWK_INVALID';
    code = 'ERR_JWK_INVALID';
}
class JWKSInvalid extends JOSEError {
    static code = 'ERR_JWKS_INVALID';
    code = 'ERR_JWKS_INVALID';
}
class JWKSNoMatchingKey extends JOSEError {
    static code = 'ERR_JWKS_NO_MATCHING_KEY';
    code = 'ERR_JWKS_NO_MATCHING_KEY';
    constructor(message = 'no applicable key found in the JSON Web Key Set', options){
        super(message, options);
    }
}
class JWKSMultipleMatchingKeys extends JOSEError {
    [Symbol.asyncIterator];
    static code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    constructor(message = 'multiple matching keys found in the JSON Web Key Set', options){
        super(message, options);
    }
}
class JWKSTimeout extends JOSEError {
    static code = 'ERR_JWKS_TIMEOUT';
    code = 'ERR_JWKS_TIMEOUT';
    constructor(message = 'request timed out', options){
        super(message, options);
    }
}
class JWSSignatureVerificationFailed extends JOSEError {
    static code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    constructor(message = 'signature verification failed', options){
        super(message, options);
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/crypto_key.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkEncCryptoKey",
    ()=>checkEncCryptoKey,
    "checkSigCryptoKey",
    ()=>checkSigCryptoKey
]);
const unusable = (name, prop = 'algorithm.name')=>new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
const isAlgorithm = (algorithm, name)=>algorithm.name === name;
function getHashLength(hash) {
    return parseInt(hash.name.slice(4), 10);
}
function checkHashLength(algorithm, expected) {
    const actual = getHashLength(algorithm.hash);
    if (actual !== expected) throw unusable(`SHA-${expected}`, 'algorithm.hash');
}
function getNamedCurve(alg) {
    switch(alg){
        case 'ES256':
            return 'P-256';
        case 'ES384':
            return 'P-384';
        case 'ES512':
            return 'P-521';
        default:
            throw new Error('unreachable');
    }
}
function checkUsage(key, usage) {
    if (usage && !key.usages.includes(usage)) {
        throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
    }
}
function checkSigCryptoKey(key, alg, usage) {
    switch(alg){
        case 'HS256':
        case 'HS384':
        case 'HS512':
            {
                if (!isAlgorithm(key.algorithm, 'HMAC')) throw unusable('HMAC');
                checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
                break;
            }
        case 'RS256':
        case 'RS384':
        case 'RS512':
            {
                if (!isAlgorithm(key.algorithm, 'RSASSA-PKCS1-v1_5')) throw unusable('RSASSA-PKCS1-v1_5');
                checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
                break;
            }
        case 'PS256':
        case 'PS384':
        case 'PS512':
            {
                if (!isAlgorithm(key.algorithm, 'RSA-PSS')) throw unusable('RSA-PSS');
                checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
                break;
            }
        case 'Ed25519':
        case 'EdDSA':
            {
                if (!isAlgorithm(key.algorithm, 'Ed25519')) throw unusable('Ed25519');
                break;
            }
        case 'ML-DSA-44':
        case 'ML-DSA-65':
        case 'ML-DSA-87':
            {
                if (!isAlgorithm(key.algorithm, alg)) throw unusable(alg);
                break;
            }
        case 'ES256':
        case 'ES384':
        case 'ES512':
            {
                if (!isAlgorithm(key.algorithm, 'ECDSA')) throw unusable('ECDSA');
                const expected = getNamedCurve(alg);
                const actual = key.algorithm.namedCurve;
                if (actual !== expected) throw unusable(expected, 'algorithm.namedCurve');
                break;
            }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usage);
}
function checkEncCryptoKey(key, alg, usage) {
    switch(alg){
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            {
                if (!isAlgorithm(key.algorithm, 'AES-GCM')) throw unusable('AES-GCM');
                const expected = parseInt(alg.slice(1, 4), 10);
                const actual = key.algorithm.length;
                if (actual !== expected) throw unusable(expected, 'algorithm.length');
                break;
            }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            {
                if (!isAlgorithm(key.algorithm, 'AES-KW')) throw unusable('AES-KW');
                const expected = parseInt(alg.slice(1, 4), 10);
                const actual = key.algorithm.length;
                if (actual !== expected) throw unusable(expected, 'algorithm.length');
                break;
            }
        case 'ECDH':
            {
                switch(key.algorithm.name){
                    case 'ECDH':
                    case 'X25519':
                        break;
                    default:
                        throw unusable('ECDH or X25519');
                }
                break;
            }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            if (!isAlgorithm(key.algorithm, 'PBKDF2')) throw unusable('PBKDF2');
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            {
                if (!isAlgorithm(key.algorithm, 'RSA-OAEP')) throw unusable('RSA-OAEP');
                checkHashLength(key.algorithm, parseInt(alg.slice(9), 10) || 1);
                break;
            }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usage);
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invalidKeyInput",
    ()=>invalidKeyInput,
    "withAlg",
    ()=>withAlg
]);
function message(msg, actual, ...types) {
    types = types.filter(Boolean);
    if (types.length > 2) {
        const last = types.pop();
        msg += `one of type ${types.join(', ')}, or ${last}.`;
    } else if (types.length === 2) {
        msg += `one of type ${types[0]} or ${types[1]}.`;
    } else {
        msg += `of type ${types[0]}.`;
    }
    if (actual == null) {
        msg += ` Received ${actual}`;
    } else if (typeof actual === 'function' && actual.name) {
        msg += ` Received function ${actual.name}`;
    } else if (typeof actual === 'object' && actual != null) {
        if (actual.constructor?.name) {
            msg += ` Received an instance of ${actual.constructor.name}`;
        }
    }
    return msg;
}
const invalidKeyInput = (actual, ...types)=>message('Key must be ', actual, ...types);
const withAlg = (alg, actual, ...types)=>message(`Key for the ${alg} algorithm must be `, actual, ...types);
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/signing.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkKeyLength",
    ()=>checkKeyLength,
    "sign",
    ()=>sign,
    "verify",
    ()=>verify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/crypto_key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
;
;
;
function checkKeyLength(alg, key) {
    if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== 'number' || modulusLength < 2048) {
            throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
    }
}
function subtleAlgorithm(alg, algorithm) {
    const hash = `SHA-${alg.slice(-3)}`;
    switch(alg){
        case 'HS256':
        case 'HS384':
        case 'HS512':
            return {
                hash,
                name: 'HMAC'
            };
        case 'PS256':
        case 'PS384':
        case 'PS512':
            return {
                hash,
                name: 'RSA-PSS',
                saltLength: parseInt(alg.slice(-3), 10) >> 3
            };
        case 'RS256':
        case 'RS384':
        case 'RS512':
            return {
                hash,
                name: 'RSASSA-PKCS1-v1_5'
            };
        case 'ES256':
        case 'ES384':
        case 'ES512':
            return {
                hash,
                name: 'ECDSA',
                namedCurve: algorithm.namedCurve
            };
        case 'Ed25519':
        case 'EdDSA':
            return {
                name: 'Ed25519'
            };
        case 'ML-DSA-44':
        case 'ML-DSA-65':
        case 'ML-DSA-87':
            return {
                name: alg
            };
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
}
async function getSigKey(alg, key, usage) {
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(key, 'CryptoKey', 'KeyObject', 'JSON Web Key'));
        }
        return crypto.subtle.importKey('raw', key, {
            hash: `SHA-${alg.slice(-3)}`,
            name: 'HMAC'
        }, false, [
            usage
        ]);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkSigCryptoKey"])(key, alg, usage);
    return key;
}
async function sign(alg, key, data) {
    const cryptoKey = await getSigKey(alg, key, 'sign');
    checkKeyLength(alg, cryptoKey);
    const signature = await crypto.subtle.sign(subtleAlgorithm(alg, cryptoKey.algorithm), cryptoKey, data);
    return new Uint8Array(signature);
}
async function verify(alg, key, signature, data) {
    const cryptoKey = await getSigKey(alg, key, 'verify');
    checkKeyLength(alg, cryptoKey);
    const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
    try {
        return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
    } catch  {
        return false;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isDisjoint",
    ()=>isDisjoint,
    "isJWK",
    ()=>isJWK,
    "isObject",
    ()=>isObject,
    "isPrivateJWK",
    ()=>isPrivateJWK,
    "isPublicJWK",
    ()=>isPublicJWK,
    "isSecretJWK",
    ()=>isSecretJWK
]);
const isObjectLike = (value)=>typeof value === 'object' && value !== null;
function isObject(input) {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(input) === null) {
        return true;
    }
    let proto = input;
    while(Object.getPrototypeOf(proto) !== null){
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(input) === proto;
}
function isDisjoint(...headers) {
    const sources = headers.filter(Boolean);
    if (sources.length === 0 || sources.length === 1) {
        return true;
    }
    let acc;
    for (const header of sources){
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
            acc = new Set(parameters);
            continue;
        }
        for (const parameter of parameters){
            if (acc.has(parameter)) {
                return false;
            }
            acc.add(parameter);
        }
    }
    return true;
}
const isJWK = (key)=>isObject(key) && typeof key.kty === 'string';
const isPrivateJWK = (key)=>key.kty !== 'oct' && (key.kty === 'AKP' && typeof key.priv === 'string' || typeof key.d === 'string');
const isPublicJWK = (key)=>key.kty !== 'oct' && key.d === undefined && key.priv === undefined;
const isSecretJWK = (key)=>key.kty === 'oct' && typeof key.k === 'string';
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertCryptoKey",
    ()=>assertCryptoKey,
    "isCryptoKey",
    ()=>isCryptoKey,
    "isKeyLike",
    ()=>isKeyLike,
    "isKeyObject",
    ()=>isKeyObject
]);
function assertCryptoKey(key) {
    if (!isCryptoKey(key)) {
        throw new Error('CryptoKey instance expected');
    }
}
const isCryptoKey = (key)=>{
    if (key?.[Symbol.toStringTag] === 'CryptoKey') return true;
    try {
        return key instanceof CryptoKey;
    } catch  {
        return false;
    }
};
const isKeyObject = (key)=>key?.[Symbol.toStringTag] === 'KeyObject';
const isKeyLike = (key)=>isCryptoKey(key) || isKeyObject(key);
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/check_key_type.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkKeyType",
    ()=>checkKeyType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
;
;
;
const tag = (key)=>key?.[Symbol.toStringTag];
const jwkMatchesOp = (alg, key, usage)=>{
    if (key.use !== undefined) {
        let expected;
        switch(usage){
            case 'sign':
            case 'verify':
                expected = 'sig';
                break;
            case 'encrypt':
            case 'decrypt':
                expected = 'enc';
                break;
        }
        if (key.use !== expected) {
            throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
        }
    }
    if (key.alg !== undefined && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
    }
    if (Array.isArray(key.key_ops)) {
        let expectedKeyOp;
        switch(true){
            case usage === 'sign' || usage === 'verify':
            case alg === 'dir':
            case alg.includes('CBC-HS'):
                expectedKeyOp = usage;
                break;
            case alg.startsWith('PBES2'):
                expectedKeyOp = 'deriveBits';
                break;
            case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
                if (!alg.includes('GCM') && alg.endsWith('KW')) {
                    expectedKeyOp = usage === 'encrypt' ? 'wrapKey' : 'unwrapKey';
                } else {
                    expectedKeyOp = usage;
                }
                break;
            case usage === 'encrypt' && alg.startsWith('RSA'):
                expectedKeyOp = 'wrapKey';
                break;
            case usage === 'decrypt':
                expectedKeyOp = alg.startsWith('RSA') ? 'unwrapKey' : 'deriveBits';
                break;
        }
        if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
            throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
        }
    }
    return true;
};
const symmetricTypeCheck = (alg, key, usage)=>{
    if (key instanceof Uint8Array) return;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isJWK"](key)) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isSecretJWK"](key) && jwkMatchesOp(alg, key, usage)) return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyLike"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withAlg"])(alg, key, 'CryptoKey', 'KeyObject', 'JSON Web Key', 'Uint8Array'));
    }
    if (key.type !== 'secret') {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
    }
};
const asymmetricTypeCheck = (alg, key, usage)=>{
    if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isJWK"](key)) {
        switch(usage){
            case 'decrypt':
            case 'sign':
                if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isPrivateJWK"](key) && jwkMatchesOp(alg, key, usage)) return;
                throw new TypeError(`JSON Web Key for this operation must be a private JWK`);
            case 'encrypt':
            case 'verify':
                if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isPublicJWK"](key) && jwkMatchesOp(alg, key, usage)) return;
                throw new TypeError(`JSON Web Key for this operation must be a public JWK`);
        }
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyLike"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withAlg"])(alg, key, 'CryptoKey', 'KeyObject', 'JSON Web Key'));
    }
    if (key.type === 'secret') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
    }
    if (key.type === 'public') {
        switch(usage){
            case 'sign':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
            case 'decrypt':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
    }
    if (key.type === 'private') {
        switch(usage){
            case 'verify':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
            case 'encrypt':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
    }
};
function checkKeyType(alg, key, usage) {
    switch(alg.substring(0, 2)){
        case 'A1':
        case 'A2':
        case 'di':
        case 'HS':
        case 'PB':
            symmetricTypeCheck(alg, key, usage);
            break;
        default:
            asymmetricTypeCheck(alg, key, usage);
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/validate_crit.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateCrit",
    ()=>validateCrit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
    if (joseHeader.crit !== undefined && protectedHeader?.crit === undefined) {
        throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === undefined) {
        return new Set();
    }
    if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input)=>typeof input !== 'string' || input.length === 0)) {
        throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== undefined) {
        recognized = new Map([
            ...Object.entries(recognizedOption),
            ...recognizedDefault.entries()
        ]);
    } else {
        recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit){
        if (!recognized.has(parameter)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`Extension Header Parameter "${parameter}" is not recognized`);
        }
        if (joseHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" is missing`);
        }
        if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
        }
    }
    return new Set(protectedHeader.crit);
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/jwk_to_key.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwkToKey",
    ()=>jwkToKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
const unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
function subtleMapping(jwk) {
    let algorithm;
    let keyUsages;
    switch(jwk.kty){
        case 'AKP':
            {
                switch(jwk.alg){
                    case 'ML-DSA-44':
                    case 'ML-DSA-65':
                    case 'ML-DSA-87':
                        algorithm = {
                            name: jwk.alg
                        };
                        keyUsages = jwk.priv ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlg);
                }
                break;
            }
        case 'RSA':
            {
                switch(jwk.alg){
                    case 'PS256':
                    case 'PS384':
                    case 'PS512':
                        algorithm = {
                            name: 'RSA-PSS',
                            hash: `SHA-${jwk.alg.slice(-3)}`
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'RS256':
                    case 'RS384':
                    case 'RS512':
                        algorithm = {
                            name: 'RSASSA-PKCS1-v1_5',
                            hash: `SHA-${jwk.alg.slice(-3)}`
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'RSA-OAEP':
                    case 'RSA-OAEP-256':
                    case 'RSA-OAEP-384':
                    case 'RSA-OAEP-512':
                        algorithm = {
                            name: 'RSA-OAEP',
                            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
                        };
                        keyUsages = jwk.d ? [
                            'decrypt',
                            'unwrapKey'
                        ] : [
                            'encrypt',
                            'wrapKey'
                        ];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlg);
                }
                break;
            }
        case 'EC':
            {
                switch(jwk.alg){
                    case 'ES256':
                    case 'ES384':
                    case 'ES512':
                        algorithm = {
                            name: 'ECDSA',
                            namedCurve: ({
                                ES256: 'P-256',
                                ES384: 'P-384',
                                ES512: 'P-521'
                            })[jwk.alg]
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'ECDH-ES':
                    case 'ECDH-ES+A128KW':
                    case 'ECDH-ES+A192KW':
                    case 'ECDH-ES+A256KW':
                        algorithm = {
                            name: 'ECDH',
                            namedCurve: jwk.crv
                        };
                        keyUsages = jwk.d ? [
                            'deriveBits'
                        ] : [];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlg);
                }
                break;
            }
        case 'OKP':
            {
                switch(jwk.alg){
                    case 'Ed25519':
                    case 'EdDSA':
                        algorithm = {
                            name: 'Ed25519'
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'ECDH-ES':
                    case 'ECDH-ES+A128KW':
                    case 'ECDH-ES+A192KW':
                    case 'ECDH-ES+A256KW':
                        algorithm = {
                            name: jwk.crv
                        };
                        keyUsages = jwk.d ? [
                            'deriveBits'
                        ] : [];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlg);
                }
                break;
            }
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
    }
    return {
        algorithm,
        keyUsages
    };
}
async function jwkToKey(jwk) {
    if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
    }
    const { algorithm, keyUsages } = subtleMapping(jwk);
    const keyData = {
        ...jwk
    };
    if (keyData.kty !== 'AKP') {
        delete keyData.alg;
    }
    delete keyData.use;
    return crypto.subtle.importKey('jwk', keyData, algorithm, jwk.ext ?? (jwk.d || jwk.priv ? false : true), jwk.key_ops ?? keyUsages);
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/normalize_key.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeKey",
    ()=>normalizeKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwk_to_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/jwk_to_key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
;
;
;
;
const unusableForAlg = 'given KeyObject instance cannot be used for this algorithm';
let cache;
const handleJWK = async (key, jwk, alg, freeze = false)=>{
    cache ||= new WeakMap();
    let cached = cache.get(key);
    if (cached?.[alg]) {
        return cached[alg];
    }
    const cryptoKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwk_to_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwkToKey"])({
        ...jwk,
        alg
    });
    if (freeze) Object.freeze(key);
    if (!cached) {
        cache.set(key, {
            [alg]: cryptoKey
        });
    } else {
        cached[alg] = cryptoKey;
    }
    return cryptoKey;
};
const handleKeyObject = (keyObject, alg)=>{
    cache ||= new WeakMap();
    let cached = cache.get(keyObject);
    if (cached?.[alg]) {
        return cached[alg];
    }
    const isPublic = keyObject.type === 'public';
    const extractable = isPublic ? true : false;
    let cryptoKey;
    if (keyObject.asymmetricKeyType === 'x25519') {
        switch(alg){
            case 'ECDH-ES':
            case 'ECDH-ES+A128KW':
            case 'ECDH-ES+A192KW':
            case 'ECDH-ES+A256KW':
                break;
            default:
                throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : [
            'deriveBits'
        ]);
    }
    if (keyObject.asymmetricKeyType === 'ed25519') {
        if (alg !== 'EdDSA' && alg !== 'Ed25519') {
            throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
            isPublic ? 'verify' : 'sign'
        ]);
    }
    switch(keyObject.asymmetricKeyType){
        case 'ml-dsa-44':
        case 'ml-dsa-65':
        case 'ml-dsa-87':
            {
                if (alg !== keyObject.asymmetricKeyType.toUpperCase()) {
                    throw new TypeError(unusableForAlg);
                }
                cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
                    isPublic ? 'verify' : 'sign'
                ]);
            }
    }
    if (keyObject.asymmetricKeyType === 'rsa') {
        let hash;
        switch(alg){
            case 'RSA-OAEP':
                hash = 'SHA-1';
                break;
            case 'RS256':
            case 'PS256':
            case 'RSA-OAEP-256':
                hash = 'SHA-256';
                break;
            case 'RS384':
            case 'PS384':
            case 'RSA-OAEP-384':
                hash = 'SHA-384';
                break;
            case 'RS512':
            case 'PS512':
            case 'RSA-OAEP-512':
                hash = 'SHA-512';
                break;
            default:
                throw new TypeError(unusableForAlg);
        }
        if (alg.startsWith('RSA-OAEP')) {
            return keyObject.toCryptoKey({
                name: 'RSA-OAEP',
                hash
            }, extractable, isPublic ? [
                'encrypt'
            ] : [
                'decrypt'
            ]);
        }
        cryptoKey = keyObject.toCryptoKey({
            name: alg.startsWith('PS') ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
            hash
        }, extractable, [
            isPublic ? 'verify' : 'sign'
        ]);
    }
    if (keyObject.asymmetricKeyType === 'ec') {
        const nist = new Map([
            [
                'prime256v1',
                'P-256'
            ],
            [
                'secp384r1',
                'P-384'
            ],
            [
                'secp521r1',
                'P-521'
            ]
        ]);
        const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
        if (!namedCurve) {
            throw new TypeError(unusableForAlg);
        }
        const expectedCurve = {
            ES256: 'P-256',
            ES384: 'P-384',
            ES512: 'P-521'
        };
        if (expectedCurve[alg] && namedCurve === expectedCurve[alg]) {
            cryptoKey = keyObject.toCryptoKey({
                name: 'ECDSA',
                namedCurve
            }, extractable, [
                isPublic ? 'verify' : 'sign'
            ]);
        }
        if (alg.startsWith('ECDH-ES')) {
            cryptoKey = keyObject.toCryptoKey({
                name: 'ECDH',
                namedCurve
            }, extractable, isPublic ? [] : [
                'deriveBits'
            ]);
        }
    }
    if (!cryptoKey) {
        throw new TypeError(unusableForAlg);
    }
    if (!cached) {
        cache.set(keyObject, {
            [alg]: cryptoKey
        });
    } else {
        cached[alg] = cryptoKey;
    }
    return cryptoKey;
};
async function normalizeKey(key, alg) {
    if (key instanceof Uint8Array) {
        return key;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        return key;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyObject"])(key)) {
        if (key.type === 'secret') {
            return key.export();
        }
        if ('toCryptoKey' in key && typeof key.toCryptoKey === 'function') {
            try {
                return handleKeyObject(key, alg);
            } catch (err) {
                if (err instanceof TypeError) {
                    throw err;
                }
            }
        }
        let jwk = key.export({
            format: 'jwk'
        });
        return handleJWK(key, jwk, alg);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isJWK"])(key)) {
        if (key.k) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(key.k);
        }
        return handleJWK(key, key, alg, true);
    }
    throw new Error('unreachable');
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertNotSet",
    ()=>assertNotSet,
    "decodeBase64url",
    ()=>decodeBase64url,
    "digest",
    ()=>digest,
    "unprotected",
    ()=>unprotected
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
;
const unprotected = Symbol();
function assertNotSet(value, name) {
    if (value) {
        throw new TypeError(`${name} can only be called once`);
    }
}
function decodeBase64url(value, label, ErrorClass) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(value);
    } catch  {
        throw new ErrorClass(`Failed to base64url decode the ${label}`);
    }
}
async function digest(algorithm, data) {
    const subtleDigest = `SHA-${algorithm.slice(-3)}`;
    return new Uint8Array(await crypto.subtle.digest(subtleDigest, data));
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/flattened/sign.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlattenedSign",
    ()=>FlattenedSign
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/signing.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$check_key_type$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/check_key_type.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$validate_crit$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/validate_crit.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$normalize_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/normalize_key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
class FlattenedSign {
    #payload;
    #protectedHeader;
    #unprotectedHeader;
    constructor(payload){
        if (!(payload instanceof Uint8Array)) {
            throw new TypeError('payload must be an instance of Uint8Array');
        }
        this.#payload = payload;
    }
    setProtectedHeader(protectedHeader) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#protectedHeader, 'setProtectedHeader');
        this.#protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#unprotectedHeader, 'setUnprotectedHeader');
        this.#unprotectedHeader = unprotectedHeader;
        return this;
    }
    async sign(key, options) {
        if (!this.#protectedHeader && !this.#unprotectedHeader) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('either setProtectedHeader or setUnprotectedHeader must be called before #sign()');
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isDisjoint"])(this.#protectedHeader, this.#unprotectedHeader)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this.#protectedHeader,
            ...this.#unprotectedHeader
        };
        const extensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$validate_crit$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateCrit"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"], new Map([
            [
                'b64',
                true
            ]
        ]), options?.crit, this.#protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has('b64')) {
            b64 = this.#protectedHeader.b64;
            if (typeof b64 !== 'boolean') {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
            }
        }
        const { alg } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$check_key_type$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkKeyType"])(alg, key, 'sign');
        let payloadS;
        let payloadB;
        if (b64) {
            payloadS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(this.#payload);
            payloadB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(payloadS);
        } else {
            payloadB = this.#payload;
            payloadS = '';
        }
        let protectedHeaderString;
        let protectedHeaderBytes;
        if (this.#protectedHeader) {
            protectedHeaderString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(JSON.stringify(this.#protectedHeader));
            protectedHeaderBytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(protectedHeaderString);
        } else {
            protectedHeaderString = '';
            protectedHeaderBytes = new Uint8Array();
        }
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(protectedHeaderBytes, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])('.'), payloadB);
        const k = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$normalize_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["normalizeKey"])(key, alg);
        const signature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["sign"])(alg, k, data);
        const jws = {
            signature: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(signature),
            payload: payloadS
        };
        if (this.#unprotectedHeader) {
            jws.header = this.#unprotectedHeader;
        }
        if (this.#protectedHeader) {
            jws.protected = protectedHeaderString;
        }
        return jws;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/compact/sign.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompactSign",
    ()=>CompactSign
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$flattened$2f$sign$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/flattened/sign.js [middleware-edge] (ecmascript)");
;
class CompactSign {
    #flattened;
    constructor(payload){
        this.#flattened = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$flattened$2f$sign$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["FlattenedSign"](payload);
    }
    setProtectedHeader(protectedHeader) {
        this.#flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    async sign(key, options) {
        const jws = await this.#flattened.sign(key, options);
        if (jws.payload === undefined) {
            throw new TypeError('use the flattened module for creating JWS with b64: false');
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/jwt_claims_set.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JWTClaimsBuilder",
    ()=>JWTClaimsBuilder,
    "secs",
    ()=>secs,
    "validateClaimsSet",
    ()=>validateClaimsSet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
;
;
;
const epoch = (date)=>Math.floor(date.getTime() / 1000);
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
function secs(str) {
    const matched = REGEX.exec(str);
    if (!matched || matched[4] && matched[1]) {
        throw new TypeError('Invalid time period format');
    }
    const value = parseFloat(matched[2]);
    const unit = matched[3].toLowerCase();
    let numericDate;
    switch(unit){
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
        case 's':
            numericDate = Math.round(value);
            break;
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
            numericDate = Math.round(value * minute);
            break;
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
            numericDate = Math.round(value * hour);
            break;
        case 'day':
        case 'days':
        case 'd':
            numericDate = Math.round(value * day);
            break;
        case 'week':
        case 'weeks':
        case 'w':
            numericDate = Math.round(value * week);
            break;
        default:
            numericDate = Math.round(value * year);
            break;
    }
    if (matched[1] === '-' || matched[4] === 'ago') {
        return -numericDate;
    }
    return numericDate;
}
function validateInput(label, input) {
    if (!Number.isFinite(input)) {
        throw new TypeError(`Invalid ${label} input`);
    }
    return input;
}
const normalizeTyp = (value)=>{
    if (value.includes('/')) {
        return value.toLowerCase();
    }
    return `application/${value.toLowerCase()}`;
};
const checkAudiencePresence = (audPayload, audOption)=>{
    if (typeof audPayload === 'string') {
        return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
};
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
    let payload;
    try {
        payload = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(encodedPayload));
    } catch  {}
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(payload)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWT Claims Set must be a top-level JSON object');
    }
    const { typ } = options;
    if (typ && (typeof protectedHeader.typ !== 'string' || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "typ" JWT header value', payload, 'typ', 'check_failed');
    }
    const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
    const presenceCheck = [
        ...requiredClaims
    ];
    if (maxTokenAge !== undefined) presenceCheck.push('iat');
    if (audience !== undefined) presenceCheck.push('aud');
    if (subject !== undefined) presenceCheck.push('sub');
    if (issuer !== undefined) presenceCheck.push('iss');
    for (const claim of new Set(presenceCheck.reverse())){
        if (!(claim in payload)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"](`missing required "${claim}" claim`, payload, claim, 'missing');
        }
    }
    if (issuer && !(Array.isArray(issuer) ? issuer : [
        issuer
    ]).includes(payload.iss)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "iss" claim value', payload, 'iss', 'check_failed');
    }
    if (subject && payload.sub !== subject) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "sub" claim value', payload, 'sub', 'check_failed');
    }
    if (audience && !checkAudiencePresence(payload.aud, typeof audience === 'string' ? [
        audience
    ] : audience)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "aud" claim value', payload, 'aud', 'check_failed');
    }
    let tolerance;
    switch(typeof options.clockTolerance){
        case 'string':
            tolerance = secs(options.clockTolerance);
            break;
        case 'number':
            tolerance = options.clockTolerance;
            break;
        case 'undefined':
            tolerance = 0;
            break;
        default:
            throw new TypeError('Invalid clockTolerance option type');
    }
    const { currentDate } = options;
    const now = epoch(currentDate || new Date());
    if ((payload.iat !== undefined || maxTokenAge) && typeof payload.iat !== 'number') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"iat" claim must be a number', payload, 'iat', 'invalid');
    }
    if (payload.nbf !== undefined) {
        if (typeof payload.nbf !== 'number') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"nbf" claim must be a number', payload, 'nbf', 'invalid');
        }
        if (payload.nbf > now + tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"nbf" claim timestamp check failed', payload, 'nbf', 'check_failed');
        }
    }
    if (payload.exp !== undefined) {
        if (typeof payload.exp !== 'number') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"exp" claim must be a number', payload, 'exp', 'invalid');
        }
        if (payload.exp <= now - tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTExpired"]('"exp" claim timestamp check failed', payload, 'exp', 'check_failed');
        }
    }
    if (maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === 'number' ? maxTokenAge : secs(maxTokenAge);
        if (age - tolerance > max) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTExpired"]('"iat" claim timestamp check failed (too far in the past)', payload, 'iat', 'check_failed');
        }
        if (age < 0 - tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"iat" claim timestamp check failed (it should be in the past)', payload, 'iat', 'check_failed');
        }
    }
    return payload;
}
class JWTClaimsBuilder {
    #payload;
    constructor(payload){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(payload)) {
            throw new TypeError('JWT Claims Set MUST be an object');
        }
        this.#payload = structuredClone(payload);
    }
    data() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encoder"].encode(JSON.stringify(this.#payload));
    }
    get iss() {
        return this.#payload.iss;
    }
    set iss(value) {
        this.#payload.iss = value;
    }
    get sub() {
        return this.#payload.sub;
    }
    set sub(value) {
        this.#payload.sub = value;
    }
    get aud() {
        return this.#payload.aud;
    }
    set aud(value) {
        this.#payload.aud = value;
    }
    set jti(value) {
        this.#payload.jti = value;
    }
    set nbf(value) {
        if (typeof value === 'number') {
            this.#payload.nbf = validateInput('setNotBefore', value);
        } else if (value instanceof Date) {
            this.#payload.nbf = validateInput('setNotBefore', epoch(value));
        } else {
            this.#payload.nbf = epoch(new Date()) + secs(value);
        }
    }
    set exp(value) {
        if (typeof value === 'number') {
            this.#payload.exp = validateInput('setExpirationTime', value);
        } else if (value instanceof Date) {
            this.#payload.exp = validateInput('setExpirationTime', epoch(value));
        } else {
            this.#payload.exp = epoch(new Date()) + secs(value);
        }
    }
    set iat(value) {
        if (value === undefined) {
            this.#payload.iat = epoch(new Date());
        } else if (value instanceof Date) {
            this.#payload.iat = validateInput('setIssuedAt', epoch(value));
        } else if (typeof value === 'string') {
            this.#payload.iat = validateInput('setIssuedAt', epoch(new Date()) + secs(value));
        } else {
            this.#payload.iat = validateInput('setIssuedAt', value);
        }
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jwt/sign.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SignJWT",
    ()=>SignJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$compact$2f$sign$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/compact/sign.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/jwt_claims_set.js [middleware-edge] (ecmascript)");
;
;
;
class SignJWT {
    #protectedHeader;
    #jwt;
    constructor(payload = {}){
        this.#jwt = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimsBuilder"](payload);
    }
    setIssuer(issuer) {
        this.#jwt.iss = issuer;
        return this;
    }
    setSubject(subject) {
        this.#jwt.sub = subject;
        return this;
    }
    setAudience(audience) {
        this.#jwt.aud = audience;
        return this;
    }
    setJti(jwtId) {
        this.#jwt.jti = jwtId;
        return this;
    }
    setNotBefore(input) {
        this.#jwt.nbf = input;
        return this;
    }
    setExpirationTime(input) {
        this.#jwt.exp = input;
        return this;
    }
    setIssuedAt(input) {
        this.#jwt.iat = input;
        return this;
    }
    setProtectedHeader(protectedHeader) {
        this.#protectedHeader = protectedHeader;
        return this;
    }
    async sign(key, options) {
        const sig = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$compact$2f$sign$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CompactSign"](this.#jwt.data());
        sig.setProtectedHeader(this.#protectedHeader);
        if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes('b64') && this.#protectedHeader.b64 === false) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs MUST NOT use unencoded payload');
        }
        return sig.sign(key, options);
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/validate_algorithms.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateAlgorithms",
    ()=>validateAlgorithms
]);
function validateAlgorithms(option, algorithms) {
    if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some((s)=>typeof s !== 'string'))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
    }
    if (!algorithms) {
        return undefined;
    }
    return new Set(algorithms);
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/flattened/verify.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "flattenedVerify",
    ()=>flattenedVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/signing.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$check_key_type$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/check_key_type.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$validate_crit$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/validate_crit.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$validate_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/validate_algorithms.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$normalize_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/normalize_key.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
async function flattenedVerify(jws, key, options) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(jws)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('Flattened JWS must be an object');
    }
    if (jws.protected === undefined && jws.header === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== undefined && typeof jws.protected !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected Header incorrect type');
    }
    if (jws.payload === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Payload missing');
    }
    if (typeof jws.signature !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Signature missing or incorrect type');
    }
    if (jws.header !== undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(jws.header)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Unprotected Header incorrect type');
    }
    let parsedProt = {};
    if (jws.protected) {
        try {
            const protectedHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(jws.protected);
            parsedProt = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(protectedHeader));
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected Header is invalid');
        }
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isDisjoint"])(parsedProt, jws.header)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header
    };
    const extensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$validate_crit$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateCrit"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"], new Map([
        [
            'b64',
            true
        ]
    ]), options?.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has('b64')) {
        b64 = parsedProt.b64;
        if (typeof b64 !== 'boolean') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
    }
    const { alg } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$validate_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateAlgorithms"])('algorithms', options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSEAlgNotAllowed"]('"alg" (Algorithm) Header Parameter value not allowed');
    }
    if (b64) {
        if (typeof jws.payload !== 'string') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Payload must be a string');
        }
    } else if (typeof jws.payload !== 'string' && !(jws.payload instanceof Uint8Array)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Payload must be a string or an Uint8Array instance');
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jws);
        resolvedKey = true;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$check_key_type$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkKeyType"])(alg, key, 'verify');
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(jws.protected !== undefined ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(jws.protected) : new Uint8Array(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])('.'), typeof jws.payload === 'string' ? b64 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(jws.payload) : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encoder"].encode(jws.payload) : jws.payload);
    const signature = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jws.signature, 'signature', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]);
    const k = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$normalize_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["normalizeKey"])(key, alg);
    const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["verify"])(alg, k, signature, data);
    if (!verified) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSSignatureVerificationFailed"]();
    }
    let payload;
    if (b64) {
        payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jws.payload, 'payload', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]);
    } else if (typeof jws.payload === 'string') {
        payload = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encoder"].encode(jws.payload);
    } else {
        payload = jws.payload;
    }
    const result = {
        payload
    };
    if (jws.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jws.header !== undefined) {
        result.unprotectedHeader = jws.header;
    }
    if (resolvedKey) {
        return {
            ...result,
            key: k
        };
    }
    return result;
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/compact/verify.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compactVerify",
    ()=>compactVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$flattened$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/flattened/verify.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
;
;
;
async function compactVerify(jws, key, options) {
    if (jws instanceof Uint8Array) {
        jws = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(jws);
    }
    if (typeof jws !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('Compact JWS must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split('.');
    if (length !== 3) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWSInvalid"]('Invalid Compact JWS');
    }
    const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$flattened$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["flattenedVerify"])({
        payload,
        protected: protectedHeader,
        signature
    }, key, options);
    const result = {
        payload: verified.payload,
        protectedHeader: verified.protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: verified.key
        };
    }
    return result;
}
}),
"[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwtVerify",
    ()=>jwtVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$compact$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jws/compact/verify.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/lib/jwt_claims_set.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
;
;
async function jwtVerify(jwt, key, options) {
    const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jws$2f$compact$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["compactVerify"])(jwt, key, options);
    if (verified.protectedHeader.crit?.includes('b64') && verified.protectedHeader.b64 === false) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs MUST NOT use unencoded payload');
    }
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateClaimsSet"])(verified.protectedHeader, verified.payload, options);
    const result = {
        payload,
        protectedHeader: verified.protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: verified.key
        };
    }
    return result;
}
}),
"[project]/Desktop/clock in:out/node_modules/.prisma/client/query_engine_bg.js [middleware-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var q = Object.defineProperty;
var U = Object.getOwnPropertyDescriptor;
var B = Object.getOwnPropertyNames;
var N = Object.prototype.hasOwnProperty;
var C = (n, t)=>{
    for(var e in t)q(n, e, {
        get: t[e],
        enumerable: !0
    });
}, $ = (n, t, e, o)=>{
    if (t && typeof t == "object" || typeof t == "function") for (let c of B(t))!N.call(n, c) && c !== e && q(n, c, {
        get: ()=>t[c],
        enumerable: !(o = U(t, c)) || o.enumerable
    });
    return n;
};
var V = (n)=>$(q({}, "__esModule", {
        value: !0
    }), n);
var Ft = {};
C(Ft, {
    QueryEngine: ()=>Y,
    __wbg_String_88810dfeb4021902: ()=>Bn,
    __wbg_buffer_b7b08af79b0b0974: ()=>Cn,
    __wbg_call_1084a111329e68ce: ()=>Zn,
    __wbg_call_89af060b4e1523f2: ()=>gt,
    __wbg_crypto_58f13aa23ffcb166: ()=>Wn,
    __wbg_done_bfda7aa8f252b39f: ()=>rt,
    __wbg_entries_7a0e06255456ebcd: ()=>It,
    __wbg_getRandomValues_504510b5564925af: ()=>Ln,
    __wbg_getTime_91058879093a1589: ()=>fn,
    __wbg_get_224d16597dbbfd96: ()=>ct,
    __wbg_get_3baa728f9d58d3f6: ()=>nt,
    __wbg_get_94990005bd6ca07c: ()=>Un,
    __wbg_getwithrefkey_5e6d9547403deab8: ()=>Dn,
    __wbg_globalThis_86b222e13bdf32ed: ()=>st,
    __wbg_global_e5a3fe56f8be9485: ()=>ft,
    __wbg_has_4bfbc01db38743f7: ()=>cn,
    __wbg_instanceof_ArrayBuffer_61dfc3198373c902: ()=>Tt,
    __wbg_instanceof_Promise_ae8c7ffdec83f2ae: ()=>wn,
    __wbg_instanceof_Uint8Array_247a91427532499e: ()=>ht,
    __wbg_isArray_8364a5371e9737d8: ()=>bt,
    __wbg_isSafeInteger_7f1ed56200d90674: ()=>lt,
    __wbg_iterator_888179a48810a9fe: ()=>xn,
    __wbg_keys_7840ae453e408eab: ()=>gn,
    __wbg_length_8339fcf5d8ecd12e: ()=>xt,
    __wbg_length_ae22078168b726f5: ()=>ln,
    __wbg_msCrypto_abcb1295e768d1f2: ()=>Kn,
    __wbg_new0_65387337a95cf44d: ()=>sn,
    __wbg_new_525245e2b9901204: ()=>vn,
    __wbg_new_8608a2b51a5f6737: ()=>kn,
    __wbg_new_a220cf903aa02ca2: ()=>On,
    __wbg_new_b85e72ed1bfd57f9: ()=>nn,
    __wbg_new_ea1883e1e5e86686: ()=>Vn,
    __wbg_newnoargs_76313bd6ff35d0f2: ()=>at,
    __wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9: ()=>$n,
    __wbg_newwithlength_ec548f448387c968: ()=>Xn,
    __wbg_next_de3e9db4440638b2: ()=>ot,
    __wbg_next_f9cb570345655b9a: ()=>et,
    __wbg_node_523d7bd03ef69fba: ()=>Hn,
    __wbg_now_28a6b413aca4a96a: ()=>mt,
    __wbg_now_8ed1a4454e40ecd1: ()=>an,
    __wbg_now_b7a162010a9e75b4: ()=>bn,
    __wbg_parse_52202f117ec9ecfa: ()=>un,
    __wbg_process_5b786e71d465a513: ()=>Jn,
    __wbg_push_37c89022f34c01ca: ()=>Mn,
    __wbg_randomFillSync_a0d98aa11c81fe89: ()=>Pn,
    __wbg_require_2784e593a4674877: ()=>Gn,
    __wbg_resolve_570458cb99d56a43: ()=>vt,
    __wbg_self_3093d5d1f7bcb682: ()=>it,
    __wbg_setTimeout_631fe61f31fa2fad: ()=>tn,
    __wbg_set_49185437f0ab06f8: ()=>En,
    __wbg_set_673dda6c73d19609: ()=>qn,
    __wbg_set_841ac57cff3d672b: ()=>Rn,
    __wbg_set_d1e79e2388520f18: ()=>pt,
    __wbg_set_eacc7d73fefaafdf: ()=>dt,
    __wbg_set_wasm: ()=>z,
    __wbg_stringify_bbf45426c92a6bf5: ()=>wt,
    __wbg_subarray_7c2e3576afe181d1: ()=>zn,
    __wbg_then_876bb3c633745cc6: ()=>kt,
    __wbg_then_95e6edc0f89b73b1: ()=>qt,
    __wbg_valueOf_c759749a331da0c0: ()=>tt,
    __wbg_value_6d39332ab4788d86: ()=>_t,
    __wbg_versions_c2ab80650590b6a2: ()=>Qn,
    __wbg_window_3bcfc4d31bc012f8: ()=>ut,
    __wbindgen_bigint_from_i64: ()=>Tn,
    __wbindgen_bigint_from_u64: ()=>Sn,
    __wbindgen_bigint_get_as_i64: ()=>jt,
    __wbindgen_boolean_get: ()=>mn,
    __wbindgen_cb_drop: ()=>Ot,
    __wbindgen_closure_wrapper6982: ()=>Et,
    __wbindgen_debug_string: ()=>At,
    __wbindgen_error_new: ()=>rn,
    __wbindgen_in: ()=>In,
    __wbindgen_is_bigint: ()=>yn,
    __wbindgen_is_function: ()=>Yn,
    __wbindgen_is_object: ()=>pn,
    __wbindgen_is_string: ()=>Fn,
    __wbindgen_is_undefined: ()=>on,
    __wbindgen_jsval_eq: ()=>jn,
    __wbindgen_jsval_loose_eq: ()=>yt,
    __wbindgen_memory: ()=>Nn,
    __wbindgen_number_get: ()=>hn,
    __wbindgen_number_new: ()=>An,
    __wbindgen_object_clone_ref: ()=>_n,
    __wbindgen_object_drop_ref: ()=>dn,
    __wbindgen_string_get: ()=>Z,
    __wbindgen_string_new: ()=>en,
    __wbindgen_throw: ()=>St,
    debug_panic: ()=>K,
    getBuildTimeInfo: ()=>G
});
module.exports = V(Ft);
var S = ()=>{};
S.prototype = S;
let _;
function z(n) {
    _ = n;
}
const p = new Array(128).fill(void 0);
p.push(void 0, null, !0, !1);
function r(n) {
    return p[n];
}
let a = 0, j = null;
function A() {
    return (j === null || j.byteLength === 0) && (j = new Uint8Array(_.memory.buffer)), j;
}
const L = typeof TextEncoder > "u" ? (0, module.require)("util").TextEncoder : TextEncoder;
let O = new L("utf-8");
const P = typeof O.encodeInto == "function" ? function(n, t) {
    return O.encodeInto(n, t);
} : function(n, t) {
    const e = O.encode(n);
    return t.set(e), {
        read: n.length,
        written: e.length
    };
};
function b(n, t, e) {
    if (e === void 0) {
        const s = O.encode(n), w = t(s.length, 1) >>> 0;
        return A().subarray(w, w + s.length).set(s), a = s.length, w;
    }
    let o = n.length, c = t(o, 1) >>> 0;
    const f = A();
    let u = 0;
    for(; u < o; u++){
        const s = n.charCodeAt(u);
        if (s > 127) break;
        f[c + u] = s;
    }
    if (u !== o) {
        u !== 0 && (n = n.slice(u)), c = e(c, o, o = u + n.length * 3, 1) >>> 0;
        const s = A().subarray(c + u, c + o), w = P(n, s);
        u += w.written, c = e(c, o, u, 1) >>> 0;
    }
    return a = u, c;
}
function y(n) {
    return n == null;
}
let h = null;
function d() {
    return (h === null || h.buffer.detached === !0 || h.buffer.detached === void 0 && h.buffer !== _.memory.buffer) && (h = new DataView(_.memory.buffer)), h;
}
const W = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
let v = new W("utf-8", {
    ignoreBOM: !0,
    fatal: !0
});
v.decode();
function T(n, t) {
    return n = n >>> 0, v.decode(A().subarray(n, n + t));
}
let I = p.length;
function i(n) {
    I === p.length && p.push(p.length + 1);
    const t = I;
    return I = p[t], p[t] = n, t;
}
function J(n) {
    n < 132 || (p[n] = I, I = n);
}
function g(n) {
    const t = r(n);
    return J(n), t;
}
function k(n) {
    const t = typeof n;
    if (t == "number" || t == "boolean" || n == null) return `${n}`;
    if (t == "string") return `"${n}"`;
    if (t == "symbol") {
        const c = n.description;
        return c == null ? "Symbol" : `Symbol(${c})`;
    }
    if (t == "function") {
        const c = n.name;
        return typeof c == "string" && c.length > 0 ? `Function(${c})` : "Function";
    }
    if (Array.isArray(n)) {
        const c = n.length;
        let f = "[";
        c > 0 && (f += k(n[0]));
        for(let u = 1; u < c; u++)f += ", " + k(n[u]);
        return f += "]", f;
    }
    const e = /\[object ([^\]]+)\]/.exec(toString.call(n));
    let o;
    if (e.length > 1) o = e[1];
    else return toString.call(n);
    if (o == "Object") try {
        return "Object(" + JSON.stringify(n) + ")";
    } catch  {
        return "Object";
    }
    return n instanceof Error ? `${n.name}: ${n.message}
${n.stack}` : o;
}
const E = typeof FinalizationRegistry > "u" ? {
    register: ()=>{},
    unregister: ()=>{}
} : new FinalizationRegistry((n)=>{
    _.__wbindgen_export_2.get(n.dtor)(n.a, n.b);
});
function Q(n, t, e, o) {
    const c = {
        a: n,
        b: t,
        cnt: 1,
        dtor: e
    }, f = (...u)=>{
        c.cnt++;
        const s = c.a;
        c.a = 0;
        try {
            return o(s, c.b, ...u);
        } finally{
            --c.cnt === 0 ? (_.__wbindgen_export_2.get(c.dtor)(s, c.b), E.unregister(c)) : c.a = s;
        }
    };
    return f.original = c, E.register(f, c, c), f;
}
function H(n, t, e) {
    _._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h92ff5ab9e3740637(n, t, i(e));
}
function G() {
    const n = _.getBuildTimeInfo();
    return g(n);
}
function K(n) {
    try {
        const f = _.__wbindgen_add_to_stack_pointer(-16);
        var t = y(n) ? 0 : b(n, _.__wbindgen_malloc, _.__wbindgen_realloc), e = a;
        _.debug_panic(f, t, e);
        var o = d().getInt32(f + 4 * 0, !0), c = d().getInt32(f + 4 * 1, !0);
        if (c) throw g(o);
    } finally{
        _.__wbindgen_add_to_stack_pointer(16);
    }
}
function l(n, t) {
    try {
        return n.apply(this, t);
    } catch (e) {
        _.__wbindgen_exn_store(i(e));
    }
}
function X(n, t, e, o) {
    _.wasm_bindgen__convert__closures__invoke2_mut__h2dd59201d446cc9a(n, t, i(e), i(o));
}
const F = typeof FinalizationRegistry > "u" ? {
    register: ()=>{},
    unregister: ()=>{}
} : new FinalizationRegistry((n)=>_.__wbg_queryengine_free(n >>> 0, 1));
class Y {
    __destroy_into_raw() {
        const t = this.__wbg_ptr;
        return this.__wbg_ptr = 0, F.unregister(this), t;
    }
    free() {
        const t = this.__destroy_into_raw();
        _.__wbg_queryengine_free(t, 0);
    }
    constructor(t, e, o){
        try {
            const s = _.__wbindgen_add_to_stack_pointer(-16);
            _.queryengine_new(s, i(t), i(e), i(o));
            var c = d().getInt32(s + 4 * 0, !0), f = d().getInt32(s + 4 * 1, !0), u = d().getInt32(s + 4 * 2, !0);
            if (u) throw g(f);
            return this.__wbg_ptr = c >>> 0, F.register(this, this.__wbg_ptr, this), this;
        } finally{
            _.__wbindgen_add_to_stack_pointer(16);
        }
    }
    connect(t, e) {
        const o = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), c = a, f = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), u = a, s = _.queryengine_connect(this.__wbg_ptr, o, c, f, u);
        return g(s);
    }
    disconnect(t, e) {
        const o = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), c = a, f = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), u = a, s = _.queryengine_disconnect(this.__wbg_ptr, o, c, f, u);
        return g(s);
    }
    query(t, e, o, c) {
        const f = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), u = a, s = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), w = a;
        var x = y(o) ? 0 : b(o, _.__wbindgen_malloc, _.__wbindgen_realloc), m = a;
        const R = b(c, _.__wbindgen_malloc, _.__wbindgen_realloc), D = a, M = _.queryengine_query(this.__wbg_ptr, f, u, s, w, x, m, R, D);
        return g(M);
    }
    startTransaction(t, e, o) {
        const c = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), f = a, u = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), s = a, w = b(o, _.__wbindgen_malloc, _.__wbindgen_realloc), x = a, m = _.queryengine_startTransaction(this.__wbg_ptr, c, f, u, s, w, x);
        return g(m);
    }
    commitTransaction(t, e, o) {
        const c = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), f = a, u = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), s = a, w = b(o, _.__wbindgen_malloc, _.__wbindgen_realloc), x = a, m = _.queryengine_commitTransaction(this.__wbg_ptr, c, f, u, s, w, x);
        return g(m);
    }
    rollbackTransaction(t, e, o) {
        const c = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), f = a, u = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), s = a, w = b(o, _.__wbindgen_malloc, _.__wbindgen_realloc), x = a, m = _.queryengine_rollbackTransaction(this.__wbg_ptr, c, f, u, s, w, x);
        return g(m);
    }
    metrics(t) {
        const e = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), o = a, c = _.queryengine_metrics(this.__wbg_ptr, e, o);
        return g(c);
    }
    trace(t) {
        const e = b(t, _.__wbindgen_malloc, _.__wbindgen_realloc), o = a, c = _.queryengine_trace(this.__wbg_ptr, e, o);
        return g(c);
    }
}
function Z(n, t) {
    const e = r(t), o = typeof e == "string" ? e : void 0;
    var c = y(o) ? 0 : b(o, _.__wbindgen_malloc, _.__wbindgen_realloc), f = a;
    d().setInt32(n + 4 * 1, f, !0), d().setInt32(n + 4 * 0, c, !0);
}
function nn(n, t) {
    try {
        var e = {
            a: n,
            b: t
        }, o = (f, u)=>{
            const s = e.a;
            e.a = 0;
            try {
                return X(s, e.b, f, u);
            } finally{
                e.a = s;
            }
        };
        const c = new Promise(o);
        return i(c);
    } finally{
        e.a = e.b = 0;
    }
}
function tn(n, t) {
    return setTimeout(r(n), t >>> 0);
}
function en(n, t) {
    const e = T(n, t);
    return i(e);
}
function rn(n, t) {
    const e = new Error(T(n, t));
    return i(e);
}
function _n(n) {
    const t = r(n);
    return i(t);
}
function on(n) {
    return r(n) === void 0;
}
function cn() {
    return l(function(n, t) {
        return Reflect.has(r(n), r(t));
    }, arguments);
}
function un() {
    return l(function(n, t) {
        const e = JSON.parse(T(n, t));
        return i(e);
    }, arguments);
}
function sn() {
    return i(new Date);
}
function fn(n) {
    return r(n).getTime();
}
function an(n) {
    return r(n).now();
}
function bn() {
    return Date.now();
}
function gn(n) {
    const t = Object.keys(r(n));
    return i(t);
}
function ln(n) {
    return r(n).length;
}
function dn(n) {
    g(n);
}
function wn(n) {
    let t;
    try {
        t = r(n) instanceof Promise;
    } catch  {
        t = !1;
    }
    return t;
}
function pn(n) {
    const t = r(n);
    return typeof t == "object" && t !== null;
}
function xn() {
    return i(Symbol.iterator);
}
function mn(n) {
    const t = r(n);
    return typeof t == "boolean" ? t ? 1 : 0 : 2;
}
function yn(n) {
    return typeof r(n) == "bigint";
}
function hn(n, t) {
    const e = r(t), o = typeof e == "number" ? e : void 0;
    d().setFloat64(n + 8 * 1, y(o) ? 0 : o, !0), d().setInt32(n + 4 * 0, !y(o), !0);
}
function Tn(n) {
    return i(n);
}
function In(n, t) {
    return r(n) in r(t);
}
function Sn(n) {
    const t = BigInt.asUintN(64, n);
    return i(t);
}
function jn(n, t) {
    return r(n) === r(t);
}
function An(n) {
    return i(n);
}
function On() {
    const n = new Array;
    return i(n);
}
function qn(n, t, e) {
    r(n)[t >>> 0] = g(e);
}
function kn() {
    return i(new Map);
}
function vn() {
    const n = new Object;
    return i(n);
}
function En(n, t, e) {
    const o = r(n).set(r(t), r(e));
    return i(o);
}
function Fn(n) {
    return typeof r(n) == "string";
}
function Rn(n, t, e) {
    r(n)[g(t)] = g(e);
}
function Dn(n, t) {
    const e = r(n)[r(t)];
    return i(e);
}
function Mn(n, t) {
    return r(n).push(r(t));
}
function Un() {
    return l(function(n, t) {
        const e = r(n)[g(t)];
        return i(e);
    }, arguments);
}
function Bn(n, t) {
    const e = String(r(t)), o = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), c = a;
    d().setInt32(n + 4 * 1, c, !0), d().setInt32(n + 4 * 0, o, !0);
}
function Nn() {
    const n = _.memory;
    return i(n);
}
function Cn(n) {
    const t = r(n).buffer;
    return i(t);
}
function $n(n, t, e) {
    const o = new Uint8Array(r(n), t >>> 0, e >>> 0);
    return i(o);
}
function Vn(n) {
    const t = new Uint8Array(r(n));
    return i(t);
}
function zn(n, t, e) {
    const o = r(n).subarray(t >>> 0, e >>> 0);
    return i(o);
}
function Ln() {
    return l(function(n, t) {
        r(n).getRandomValues(r(t));
    }, arguments);
}
function Pn() {
    return l(function(n, t) {
        r(n).randomFillSync(g(t));
    }, arguments);
}
function Wn(n) {
    const t = r(n).crypto;
    return i(t);
}
function Jn(n) {
    const t = r(n).process;
    return i(t);
}
function Qn(n) {
    const t = r(n).versions;
    return i(t);
}
function Hn(n) {
    const t = r(n).node;
    return i(t);
}
function Gn() {
    return l(function() {
        const n = module.require;
        return i(n);
    }, arguments);
}
function Kn(n) {
    const t = r(n).msCrypto;
    return i(t);
}
function Xn(n) {
    const t = new Uint8Array(n >>> 0);
    return i(t);
}
function Yn(n) {
    return typeof r(n) == "function";
}
function Zn() {
    return l(function(n, t) {
        const e = r(n).call(r(t));
        return i(e);
    }, arguments);
}
function nt(n, t) {
    const e = r(n)[t >>> 0];
    return i(e);
}
function tt(n) {
    return r(n).valueOf();
}
function et() {
    return l(function(n) {
        const t = r(n).next();
        return i(t);
    }, arguments);
}
function rt(n) {
    return r(n).done;
}
function _t(n) {
    const t = r(n).value;
    return i(t);
}
function ot(n) {
    const t = r(n).next;
    return i(t);
}
function ct() {
    return l(function(n, t) {
        const e = Reflect.get(r(n), r(t));
        return i(e);
    }, arguments);
}
function it() {
    return l(function() {
        const n = self.self;
        return i(n);
    }, arguments);
}
function ut() {
    return l(function() {
        const n = window.window;
        return i(n);
    }, arguments);
}
function st() {
    return l(function() {
        const n = globalThis.globalThis;
        return i(n);
    }, arguments);
}
function ft() {
    return l(function() {
        const n = /*TURBOPACK member replacement*/ __turbopack_context__.g.global;
        return i(n);
    }, arguments);
}
function at(n, t) {
    const e = new S(T(n, t));
    return i(e);
}
function bt(n) {
    return Array.isArray(r(n));
}
function gt() {
    return l(function(n, t, e) {
        const o = r(n).call(r(t), r(e));
        return i(o);
    }, arguments);
}
function lt(n) {
    return Number.isSafeInteger(r(n));
}
function dt() {
    return l(function(n, t, e) {
        return Reflect.set(r(n), r(t), r(e));
    }, arguments);
}
function wt() {
    return l(function(n) {
        const t = JSON.stringify(r(n));
        return i(t);
    }, arguments);
}
function pt(n, t, e) {
    r(n).set(r(t), e >>> 0);
}
function xt(n) {
    return r(n).length;
}
function mt() {
    return l(function() {
        return Date.now();
    }, arguments);
}
function yt(n, t) {
    return r(n) == r(t);
}
function ht(n) {
    let t;
    try {
        t = r(n) instanceof Uint8Array;
    } catch  {
        t = !1;
    }
    return t;
}
function Tt(n) {
    let t;
    try {
        t = r(n) instanceof ArrayBuffer;
    } catch  {
        t = !1;
    }
    return t;
}
function It(n) {
    const t = Object.entries(r(n));
    return i(t);
}
function St(n, t) {
    throw new Error(T(n, t));
}
function jt(n, t) {
    const e = r(t), o = typeof e == "bigint" ? e : void 0;
    d().setBigInt64(n + 8 * 1, y(o) ? BigInt(0) : o, !0), d().setInt32(n + 4 * 0, !y(o), !0);
}
function At(n, t) {
    const e = k(r(t)), o = b(e, _.__wbindgen_malloc, _.__wbindgen_realloc), c = a;
    d().setInt32(n + 4 * 1, c, !0), d().setInt32(n + 4 * 0, o, !0);
}
function Ot(n) {
    const t = g(n).original;
    return t.cnt-- == 1 ? (t.a = 0, !0) : !1;
}
function qt(n, t) {
    const e = r(n).then(r(t));
    return i(e);
}
function kt(n, t, e) {
    const o = r(n).then(r(t), r(e));
    return i(o);
}
function vt(n) {
    const t = Promise.resolve(r(n));
    return i(t);
}
function Et(n, t, e) {
    const o = Q(n, t, 540, H);
    return i(o);
}
0 && (module.exports = {
    QueryEngine,
    __wbg_String_88810dfeb4021902,
    __wbg_buffer_b7b08af79b0b0974,
    __wbg_call_1084a111329e68ce,
    __wbg_call_89af060b4e1523f2,
    __wbg_crypto_58f13aa23ffcb166,
    __wbg_done_bfda7aa8f252b39f,
    __wbg_entries_7a0e06255456ebcd,
    __wbg_getRandomValues_504510b5564925af,
    __wbg_getTime_91058879093a1589,
    __wbg_get_224d16597dbbfd96,
    __wbg_get_3baa728f9d58d3f6,
    __wbg_get_94990005bd6ca07c,
    __wbg_getwithrefkey_5e6d9547403deab8,
    __wbg_globalThis_86b222e13bdf32ed,
    __wbg_global_e5a3fe56f8be9485,
    __wbg_has_4bfbc01db38743f7,
    __wbg_instanceof_ArrayBuffer_61dfc3198373c902,
    __wbg_instanceof_Promise_ae8c7ffdec83f2ae,
    __wbg_instanceof_Uint8Array_247a91427532499e,
    __wbg_isArray_8364a5371e9737d8,
    __wbg_isSafeInteger_7f1ed56200d90674,
    __wbg_iterator_888179a48810a9fe,
    __wbg_keys_7840ae453e408eab,
    __wbg_length_8339fcf5d8ecd12e,
    __wbg_length_ae22078168b726f5,
    __wbg_msCrypto_abcb1295e768d1f2,
    __wbg_new0_65387337a95cf44d,
    __wbg_new_525245e2b9901204,
    __wbg_new_8608a2b51a5f6737,
    __wbg_new_a220cf903aa02ca2,
    __wbg_new_b85e72ed1bfd57f9,
    __wbg_new_ea1883e1e5e86686,
    __wbg_newnoargs_76313bd6ff35d0f2,
    __wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9,
    __wbg_newwithlength_ec548f448387c968,
    __wbg_next_de3e9db4440638b2,
    __wbg_next_f9cb570345655b9a,
    __wbg_node_523d7bd03ef69fba,
    __wbg_now_28a6b413aca4a96a,
    __wbg_now_8ed1a4454e40ecd1,
    __wbg_now_b7a162010a9e75b4,
    __wbg_parse_52202f117ec9ecfa,
    __wbg_process_5b786e71d465a513,
    __wbg_push_37c89022f34c01ca,
    __wbg_randomFillSync_a0d98aa11c81fe89,
    __wbg_require_2784e593a4674877,
    __wbg_resolve_570458cb99d56a43,
    __wbg_self_3093d5d1f7bcb682,
    __wbg_setTimeout_631fe61f31fa2fad,
    __wbg_set_49185437f0ab06f8,
    __wbg_set_673dda6c73d19609,
    __wbg_set_841ac57cff3d672b,
    __wbg_set_d1e79e2388520f18,
    __wbg_set_eacc7d73fefaafdf,
    __wbg_set_wasm,
    __wbg_stringify_bbf45426c92a6bf5,
    __wbg_subarray_7c2e3576afe181d1,
    __wbg_then_876bb3c633745cc6,
    __wbg_then_95e6edc0f89b73b1,
    __wbg_valueOf_c759749a331da0c0,
    __wbg_value_6d39332ab4788d86,
    __wbg_versions_c2ab80650590b6a2,
    __wbg_window_3bcfc4d31bc012f8,
    __wbindgen_bigint_from_i64,
    __wbindgen_bigint_from_u64,
    __wbindgen_bigint_get_as_i64,
    __wbindgen_boolean_get,
    __wbindgen_cb_drop,
    __wbindgen_closure_wrapper6982,
    __wbindgen_debug_string,
    __wbindgen_error_new,
    __wbindgen_in,
    __wbindgen_is_bigint,
    __wbindgen_is_function,
    __wbindgen_is_object,
    __wbindgen_is_string,
    __wbindgen_is_undefined,
    __wbindgen_jsval_eq,
    __wbindgen_jsval_loose_eq,
    __wbindgen_memory,
    __wbindgen_number_get,
    __wbindgen_number_new,
    __wbindgen_object_clone_ref,
    __wbindgen_object_drop_ref,
    __wbindgen_string_get,
    __wbindgen_string_new,
    __wbindgen_throw,
    debug_panic,
    getBuildTimeInfo
});
}),
"[project]/Desktop/clock in:out/node_modules/.prisma/client/query_engine_bg.wasm?module [middleware-edge] (wasm raw)", ((__turbopack_context__) => {

__turbopack_context__.v("chunks/6bd82__prisma_client_query_engine_bg_23ace1ce.wasm");}),
"[project]/Desktop/clock in:out/node_modules/.prisma/client/query_engine_bg.wasm?module [middleware-edge] (wasm module)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f2e$prisma$2f$client$2f$query_engine_bg$2e$wasm$3f$module__$5b$middleware$2d$edge$5d$__$28$wasm__raw$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/.prisma/client/query_engine_bg.wasm?module [middleware-edge] (wasm raw)");
;
const mod = await /*TURBOPACK member replacement*/ __turbopack_context__.u(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f2e$prisma$2f$client$2f$query_engine_bg$2e$wasm$3f$module__$5b$middleware$2d$edge$5d$__$28$wasm__raw$29$__["default"], ()=>wasm_d889534b10a70a29);
const __TURBOPACK__default__export__ = mod;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/Desktop/clock in:out/node_modules/.prisma/client/wasm-edge-light-loader.mjs [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = Promise.resolve().then(()=>__turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/.prisma/client/query_engine_bg.wasm?module [middleware-edge] (wasm module)"));
}),
"[project]/Desktop/clock in:out/node_modules/.prisma/client/wasm.js [middleware-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {

Object.defineProperty(exports, "__esModule", {
    value: true
});
const { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientRustPanicError, PrismaClientInitializationError, PrismaClientValidationError, getPrismaClient, sqltag, empty, join, raw, skip, Decimal, Debug, objectEnumValues, makeStrictEnum, Extensions, warnOnce, defineDmmfProperty, Public, getRuntime, createParam } = __turbopack_context__.r("[project]/Desktop/clock in:out/node_modules/@prisma/client/runtime/wasm.js [middleware-edge] (ecmascript)");
const Prisma = {};
exports.Prisma = Prisma;
exports.$Enums = {};
/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */ Prisma.prismaVersion = {
    client: "6.4.1",
    engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
};
Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError;
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError;
Prisma.PrismaClientInitializationError = PrismaClientInitializationError;
Prisma.PrismaClientValidationError = PrismaClientValidationError;
Prisma.Decimal = Decimal;
/**
 * Re-export of sql-template-tag
 */ Prisma.sql = sqltag;
Prisma.empty = empty;
Prisma.join = join;
Prisma.raw = raw;
Prisma.validator = Public.validator;
/**
* Extensions
*/ Prisma.getExtensionContext = Extensions.getExtensionContext;
Prisma.defineExtension = Extensions.defineExtension;
/**
 * Shorthand utilities for JSON filtering
 */ Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;
Prisma.NullTypes = {
    DbNull: objectEnumValues.classes.DbNull,
    JsonNull: objectEnumValues.classes.JsonNull,
    AnyNull: objectEnumValues.classes.AnyNull
};
/**
 * Enums
 */ exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
    Serializable: 'Serializable'
});
exports.Prisma.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    role: 'role',
    status: 'status',
    hourlyWage: 'hourlyWage',
    manualWorkedHours: 'manualWorkedHours',
    marketId: 'marketId',
    managedMarketId: 'managedMarketId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.MarketScalarFieldEnum = {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt'
};
exports.Prisma.StoreScalarFieldEnum = {
    id: 'id',
    name: 'name',
    address: 'address',
    latitude: 'latitude',
    longitude: 'longitude',
    radius: 'radius',
    marketId: 'marketId',
    createdAt: 'createdAt'
};
exports.Prisma.JobScalarFieldEnum = {
    id: 'id',
    title: 'title',
    startTimeStr: 'startTimeStr',
    endTimeStr: 'endTimeStr',
    date: 'date',
    bonus: 'bonus',
    status: 'status',
    sourceReleaseId: 'sourceReleaseId',
    storeId: 'storeId',
    marketId: 'marketId',
    creatorId: 'creatorId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.JobAssignmentScalarFieldEnum = {
    id: 'id',
    jobId: 'jobId',
    workerId: 'workerId',
    date: 'date',
    dayOfWeek: 'dayOfWeek',
    isRecurring: 'isRecurring',
    clockIn: 'clockIn',
    clockOut: 'clockOut',
    breakTimeMinutes: 'breakTimeMinutes',
    workedHours: 'workedHours',
    status: 'status',
    customStartTimeStr: 'customStartTimeStr',
    customEndTimeStr: 'customEndTimeStr',
    createdAt: 'createdAt'
};
exports.Prisma.BreakScalarFieldEnum = {
    id: 'id',
    assignmentId: 'assignmentId',
    startTime: 'startTime',
    endTime: 'endTime',
    durationMins: 'durationMins'
};
exports.Prisma.ReleaseRequestScalarFieldEnum = {
    id: 'id',
    jobId: 'jobId',
    workerId: 'workerId',
    date: 'date',
    dayOfWeek: 'dayOfWeek',
    isRecurring: 'isRecurring',
    status: 'status',
    reason: 'reason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.ShiftRequestScalarFieldEnum = {
    id: 'id',
    jobId: 'jobId',
    workerId: 'workerId',
    date: 'date',
    dayOfWeek: 'dayOfWeek',
    isRecurring: 'isRecurring',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.RecapScalarFieldEnum = {
    id: 'id',
    jobId: 'jobId',
    assignmentId: 'assignmentId',
    consumersAttended: 'consumersAttended',
    consumersSampled: 'consumersSampled',
    reimbursement: 'reimbursement',
    receiptTotal: 'receiptTotal',
    receiptUrl: 'receiptUrl',
    comments: 'comments',
    rushLevel: 'rushLevel',
    customerFeedback: 'customerFeedback',
    managerSignature: 'managerSignature',
    storeManagerName: 'storeManagerName',
    managerReview: 'managerReview',
    status: 'status',
    createdAt: 'createdAt'
};
exports.Prisma.OvertimeRequestScalarFieldEnum = {
    id: 'id',
    recapId: 'recapId',
    minutes: 'minutes',
    reason: 'reason',
    status: 'status',
    createdAt: 'createdAt'
};
exports.Prisma.RecapSKUScalarFieldEnum = {
    id: 'id',
    recapId: 'recapId',
    skuName: 'skuName',
    beginningInventory: 'beginningInventory',
    purchased: 'purchased',
    bottlesSold: 'bottlesSold',
    storePrice: 'storePrice'
};
exports.Prisma.TrainingDocumentScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    url: 'url',
    category: 'category',
    createdAt: 'createdAt'
};
exports.Prisma.ChatThreadScalarFieldEnum = {
    id: 'id',
    type: 'type',
    createdAt: 'createdAt'
};
exports.Prisma.MessageScalarFieldEnum = {
    id: 'id',
    threadId: 'threadId',
    senderId: 'senderId',
    content: 'content',
    createdAt: 'createdAt'
};
exports.Prisma.NotificationScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    title: 'title',
    message: 'message',
    read: 'read',
    createdAt: 'createdAt'
};
exports.Prisma.InviteScalarFieldEnum = {
    id: 'id',
    email: 'email',
    token: 'token',
    role: 'role',
    hourlyWage: 'hourlyWage',
    marketId: 'marketId',
    storeId: 'storeId',
    senderId: 'senderId',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
};
exports.Prisma.InventoryItemScalarFieldEnum = {
    id: 'id',
    name: 'name',
    category: 'category',
    volume: 'volume',
    unit: 'unit',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.AuditLogScalarFieldEnum = {
    id: 'id',
    actorId: 'actorId',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    oldValue: 'oldValue',
    newValue: 'newValue',
    createdAt: 'createdAt'
};
exports.Prisma.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.Prisma.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.Prisma.ModelName = {
    User: 'User',
    Market: 'Market',
    Store: 'Store',
    Job: 'Job',
    JobAssignment: 'JobAssignment',
    Break: 'Break',
    ReleaseRequest: 'ReleaseRequest',
    ShiftRequest: 'ShiftRequest',
    Recap: 'Recap',
    OvertimeRequest: 'OvertimeRequest',
    RecapSKU: 'RecapSKU',
    TrainingDocument: 'TrainingDocument',
    ChatThread: 'ChatThread',
    Message: 'Message',
    Notification: 'Notification',
    Invite: 'Invite',
    InventoryItem: 'InventoryItem',
    AuditLog: 'AuditLog'
};
/**
 * Create the Client
 */ const config = {
    "generator": {
        "name": "client",
        "provider": {
            "fromEnvVar": null,
            "value": "prisma-client-js"
        },
        "output": {
            "value": "/Users/rahulreddyekkati/Desktop/clock in:out/node_modules/@prisma/client",
            "fromEnvVar": null
        },
        "config": {
            "engineType": "library"
        },
        "binaryTargets": [
            {
                "fromEnvVar": null,
                "value": "darwin-arm64",
                "native": true
            }
        ],
        "previewFeatures": [
            "driverAdapters"
        ],
        "sourceFilePath": "/Users/rahulreddyekkati/Desktop/clock in:out/prisma/schema.prisma"
    },
    "relativeEnvPaths": {
        "rootEnvPath": null,
        "schemaEnvPath": "../../../.env"
    },
    "relativePath": "../../../prisma",
    "clientVersion": "6.4.1",
    "engineVersion": "a9055b89e58b4b5bfb59600785423b1db3d0e75d",
    "datasourceNames": [
        "db"
    ],
    "activeProvider": "sqlite",
    "postinstall": false,
    "inlineDatasources": {
        "db": {
            "url": {
                "fromEnvVar": "DATABASE_URL",
                "value": null
            }
        }
    },
    "inlineSchema": "datasource db {\n  provider = \"sqlite\"\n  url      = env(\"DATABASE_URL\")\n}\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\nmodel User {\n  id                String @id @default(cuid())\n  email             String @unique\n  password          String\n  name              String\n  role              String // ADMIN, MARKET_MANAGER, WORKER\n  status            String @default(\"INVITED\") // INVITED, ACTIVE, SUSPENDED, DEACTIVATED\n  hourlyWage        Float?\n  manualWorkedHours Float?\n\n  // Market membership (non-admin users belong to one market)\n  // onDelete: SetNull — user stays in DB if market is deleted; requires manual reassignment\n  market   Market? @relation(\"UserMarket\", fields: [marketId], references: [id], onDelete: SetNull)\n  marketId String?\n\n  // Market Manager scope\n  // onDelete: SetNull — manager stays if their market is deleted\n  managedMarket   Market? @relation(\"ManagedMarket\", fields: [managedMarketId], references: [id], onDelete: SetNull)\n  managedMarketId String?\n\n  // onDelete: Restrict — do not silently delete work history; require explicit cleanup first\n  jobs        JobAssignment[]\n  createdJobs Job[]           @relation(\"JobCreator\")\n\n  // onDelete: Restrict — preserve request audit trail\n  releaseRequests ReleaseRequest[]\n  shiftRequests   ShiftRequest[]\n\n  // onDelete: Cascade — messages/notifications are owned by the user\n  sentMessages  Message[]      @relation(\"SentMessages\")\n  notifications Notification[]\n  sentInvites   Invite[]       @relation(\"InviteSender\")\n  chatThreads   ChatThread[]\n\n  // Audit trail of admin actions affecting payroll\n  auditLogs AuditLog[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Market {\n  id        String   @id @default(cuid())\n  name      String   @unique\n  // onDelete: Restrict — can't delete store if it still has jobs; require cleanup first\n  stores    Store[]\n  users     User[]   @relation(\"UserMarket\")\n  managers  User[]   @relation(\"ManagedMarket\")\n  jobs      Job[]\n  createdAt DateTime @default(now())\n}\n\nmodel Store {\n  id        String @id @default(cuid())\n  name      String\n  address   String\n  latitude  Float\n  longitude Float\n  radius    Float  @default(100)\n\n  // onDelete: Restrict — don't silently delete a store that belongs to a market with active jobs\n  market   Market @relation(fields: [marketId], references: [id], onDelete: Restrict)\n  marketId String\n\n  // onDelete: Restrict — jobs must be explicitly cleaned up before store deletion\n  jobs      Job[]\n  createdAt DateTime @default(now())\n}\n\nmodel Job {\n  id           String    @id @default(cuid())\n  title        String    @unique\n  startTimeStr String // HH:MM — e.g. \"09:00\"\n  endTimeStr   String // HH:MM — e.g. \"17:00\"\n  date         DateTime?\n  bonus        Float     @default(0)\n  status       String    @default(\"OPEN\") // OPEN, ASSIGNED, ACCEPTED, IN_PROGRESS, RECAP_PENDING, COMPLETED, NO_SHOW\n\n  // Links a released-shift open job back to its source ReleaseRequest\n  // Replaces fragile title-suffix matching used previously\n  sourceReleaseId String?\n\n  // onDelete: Restrict — job must not be deleted if it has active assignments (preserve work history)\n  store    Store  @relation(fields: [storeId], references: [id], onDelete: Restrict)\n  storeId  String\n  market   Market @relation(fields: [marketId], references: [id], onDelete: Restrict)\n  marketId String\n\n  // onDelete: Restrict — preserve audit trail of who created the job\n  createdBy User   @relation(\"JobCreator\", fields: [creatorId], references: [id], onDelete: Restrict)\n  creatorId String\n\n  // onDelete: Cascade — assignments, recaps, requests have no meaning without the parent job\n  assignments     JobAssignment[]\n  recaps          Recap[]\n  releaseRequests ReleaseRequest[]\n  shiftRequests   ShiftRequest[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel JobAssignment {\n  id       String @id @default(cuid())\n  // onDelete: Cascade — assignment has no meaning if the job is deleted\n  job      Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)\n  jobId    String\n  // onDelete: Restrict — don't silently delete work history if worker is deleted\n  worker   User   @relation(fields: [workerId], references: [id], onDelete: Restrict)\n  workerId String\n\n  date        DateTime?\n  dayOfWeek   Int? // 0: Sunday, 1: Monday, etc.\n  isRecurring Boolean   @default(false)\n\n  clockIn          DateTime?\n  clockOut         DateTime?\n  breakTimeMinutes Int       @default(0)\n  workedHours      Float?\n  status           String    @default(\"ASSIGNED\") // ASSIGNED, IN_PROGRESS, RECAP_PENDING, COMPLETED\n\n  // Admin-overridable time bounds for this specific assignment\n  // When set, these override job.startTimeStr / job.endTimeStr for this worker only\n  customStartTimeStr String?\n  customEndTimeStr   String?\n\n  // Break records for this assignment (multiple breaks per shift supported)\n  breaks Break[]\n\n  // onDelete: Cascade — recap is tied to assignment; if assignment deleted, recap is moot\n  recap Recap?\n\n  createdAt DateTime @default(now())\n}\n\n// Records each break interval within a shift.\n// breakTimeMinutes on JobAssignment is the denormalized sum of all completed Break.durationMins.\nmodel Break {\n  id           String        @id @default(cuid())\n  assignment   JobAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)\n  assignmentId String\n  startTime    DateTime\n  endTime      DateTime? // null = break is currently active\n  durationMins Float? // computed when endTime is set\n}\n\nmodel ReleaseRequest {\n  id       String @id @default(cuid())\n  // onDelete: Cascade — release request has no meaning without the job\n  job      Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)\n  jobId    String\n  // onDelete: Restrict — preserve audit trail\n  worker   User   @relation(fields: [workerId], references: [id], onDelete: Restrict)\n  workerId String\n\n  date        DateTime?\n  dayOfWeek   Int?\n  isRecurring Boolean   @default(false)\n\n  status    String   @default(\"PENDING\") // PENDING, APPROVED, DENIED\n  reason    String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel ShiftRequest {\n  id       String @id @default(cuid())\n  // onDelete: Cascade — request has no meaning without the job\n  job      Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)\n  jobId    String\n  // onDelete: Restrict — preserve audit trail\n  worker   User   @relation(fields: [workerId], references: [id], onDelete: Restrict)\n  workerId String\n\n  date        DateTime?\n  dayOfWeek   Int?\n  isRecurring Boolean   @default(false)\n\n  status    String   @default(\"PENDING\") // PENDING, APPROVED, DENIED\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Recap {\n  id           String        @id @default(cuid())\n  // onDelete: Cascade — recap has no meaning without the job\n  job          Job           @relation(fields: [jobId], references: [id], onDelete: Cascade)\n  jobId        String\n  // onDelete: Cascade — recap is entirely owned by the assignment\n  assignment   JobAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)\n  assignmentId String        @unique\n\n  consumersAttended Int\n  consumersSampled  Int\n  reimbursement     Float   @default(0)\n  receiptTotal      Float   @default(0)\n  receiptUrl        String?\n  comments          String?\n  rushLevel         String?\n  customerFeedback  String?\n  managerSignature  String? // Base64 drawn signature from store manager at the event\n  storeManagerName  String? // Typed name of the store manager who signed off at the event\n  managerReview     String? // Back-office admin notes written during recap approval\n  status            String  @default(\"PENDING\") // PENDING, APPROVED, REJECTED\n\n  // onDelete: Cascade — overtime request tied to recap\n  overtimeRequest OvertimeRequest?\n\n  // onDelete: Cascade — SKU rows tied to recap\n  skus RecapSKU[]\n\n  createdAt DateTime @default(now())\n}\n\nmodel OvertimeRequest {\n  id        String   @id @default(cuid())\n  // onDelete: Cascade — overtime request tied to recap\n  recap     Recap    @relation(fields: [recapId], references: [id], onDelete: Cascade)\n  recapId   String   @unique\n  minutes   Int\n  reason    String\n  status    String   @default(\"PENDING\") // PENDING, APPROVED, DENIED\n  createdAt DateTime @default(now())\n}\n\nmodel RecapSKU {\n  id                 String @id @default(cuid())\n  // onDelete: Cascade — SKU rows have no meaning without the recap\n  recap              Recap  @relation(fields: [recapId], references: [id], onDelete: Cascade)\n  recapId            String\n  skuName            String\n  beginningInventory Int    @default(0)\n  purchased          Int    @default(0)\n  bottlesSold        Int    @default(0)\n  storePrice         Float  @default(0)\n}\n\nmodel TrainingDocument {\n  id          String   @id @default(cuid())\n  title       String\n  description String?\n  url         String\n  category    String // PRODUCTS, POLICIES, PROCEDURES\n  createdAt   DateTime @default(now())\n}\n\nmodel ChatThread {\n  id           String    @id @default(cuid())\n  type         String    @default(\"DIRECT\") // MARKET_MANAGER, ADMIN, DIRECT\n  participants User[]\n  // onDelete: Cascade — messages owned by the thread\n  messages     Message[]\n  createdAt    DateTime  @default(now())\n}\n\nmodel Message {\n  id        String     @id @default(cuid())\n  // onDelete: Cascade — message has no meaning without the thread\n  thread    ChatThread @relation(fields: [threadId], references: [id], onDelete: Cascade)\n  threadId  String\n  // onDelete: Restrict — preserve message history even if sender is deleted\n  sender    User       @relation(\"SentMessages\", fields: [senderId], references: [id], onDelete: Restrict)\n  senderId  String\n  content   String\n  createdAt DateTime   @default(now())\n}\n\nmodel Notification {\n  id        String   @id @default(cuid())\n  // onDelete: Cascade — notifications are owned by the user\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  userId    String\n  title     String\n  message   String\n  read      Boolean  @default(false)\n  createdAt DateTime @default(now())\n}\n\nmodel Invite {\n  id         String   @id @default(cuid())\n  email      String   @unique\n  token      String   @unique\n  role       String\n  hourlyWage Float?\n  marketId   String?\n  storeId    String?\n  // onDelete: Restrict — preserve audit of who sent the invite\n  sender     User     @relation(\"InviteSender\", fields: [senderId], references: [id], onDelete: Restrict)\n  senderId   String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n}\n\nmodel InventoryItem {\n  id        String   @id @default(cuid())\n  name      String\n  category  String? // e.g. \"white\", \"red\"\n  volume    String? // e.g. \"350\"\n  unit      String? // e.g. \"ml\"\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\n// Immutable log of admin actions that affect payroll calculations.\n// Written inside the same $transaction as the mutation — never outside.\nmodel AuditLog {\n  id         String   @id @default(cuid())\n  actor      User     @relation(fields: [actorId], references: [id])\n  actorId    String\n  action     String // SHIFT_TIME_EDIT, BREAK_MINUTES_OVERRIDE, RECAP_APPROVED, RECAP_REJECTED\n  entityType String // JobAssignment, Recap, Break\n  entityId   String\n  oldValue   String? // JSON serialized (SQLite has no Json type)\n  newValue   String? // JSON serialized\n  createdAt  DateTime @default(now())\n}\n",
    "inlineSchemaHash": "db82ac607e54fdcb74a5bb7627b1ee9caf3a59d6889eb1275d02bb30f7ab9e54",
    "copyEngine": true
};
config.dirname = '/';
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"hourlyWage\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"manualWorkedHours\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"market\",\"kind\":\"object\",\"type\":\"Market\",\"relationName\":\"UserMarket\"},{\"name\":\"marketId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"managedMarket\",\"kind\":\"object\",\"type\":\"Market\",\"relationName\":\"ManagedMarket\"},{\"name\":\"managedMarketId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"jobs\",\"kind\":\"object\",\"type\":\"JobAssignment\",\"relationName\":\"JobAssignmentToUser\"},{\"name\":\"createdJobs\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobCreator\"},{\"name\":\"releaseRequests\",\"kind\":\"object\",\"type\":\"ReleaseRequest\",\"relationName\":\"ReleaseRequestToUser\"},{\"name\":\"shiftRequests\",\"kind\":\"object\",\"type\":\"ShiftRequest\",\"relationName\":\"ShiftRequestToUser\"},{\"name\":\"sentMessages\",\"kind\":\"object\",\"type\":\"Message\",\"relationName\":\"SentMessages\"},{\"name\":\"notifications\",\"kind\":\"object\",\"type\":\"Notification\",\"relationName\":\"NotificationToUser\"},{\"name\":\"sentInvites\",\"kind\":\"object\",\"type\":\"Invite\",\"relationName\":\"InviteSender\"},{\"name\":\"chatThreads\",\"kind\":\"object\",\"type\":\"ChatThread\",\"relationName\":\"ChatThreadToUser\"},{\"name\":\"auditLogs\",\"kind\":\"object\",\"type\":\"AuditLog\",\"relationName\":\"AuditLogToUser\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Market\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stores\",\"kind\":\"object\",\"type\":\"Store\",\"relationName\":\"MarketToStore\"},{\"name\":\"users\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UserMarket\"},{\"name\":\"managers\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ManagedMarket\"},{\"name\":\"jobs\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobToMarket\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Store\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"address\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"latitude\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"longitude\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"radius\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"market\",\"kind\":\"object\",\"type\":\"Market\",\"relationName\":\"MarketToStore\"},{\"name\":\"marketId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"jobs\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobToStore\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Job\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startTimeStr\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"endTimeStr\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"bonus\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sourceReleaseId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"store\",\"kind\":\"object\",\"type\":\"Store\",\"relationName\":\"JobToStore\"},{\"name\":\"storeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"market\",\"kind\":\"object\",\"type\":\"Market\",\"relationName\":\"JobToMarket\"},{\"name\":\"marketId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdBy\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"JobCreator\"},{\"name\":\"creatorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignments\",\"kind\":\"object\",\"type\":\"JobAssignment\",\"relationName\":\"JobToJobAssignment\"},{\"name\":\"recaps\",\"kind\":\"object\",\"type\":\"Recap\",\"relationName\":\"JobToRecap\"},{\"name\":\"releaseRequests\",\"kind\":\"object\",\"type\":\"ReleaseRequest\",\"relationName\":\"JobToReleaseRequest\"},{\"name\":\"shiftRequests\",\"kind\":\"object\",\"type\":\"ShiftRequest\",\"relationName\":\"JobToShiftRequest\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"JobAssignment\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"job\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobToJobAssignment\"},{\"name\":\"jobId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"worker\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"JobAssignmentToUser\"},{\"name\":\"workerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dayOfWeek\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"isRecurring\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"clockIn\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"clockOut\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"breakTimeMinutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"workedHours\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"customStartTimeStr\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"customEndTimeStr\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"breaks\",\"kind\":\"object\",\"type\":\"Break\",\"relationName\":\"BreakToJobAssignment\"},{\"name\":\"recap\",\"kind\":\"object\",\"type\":\"Recap\",\"relationName\":\"JobAssignmentToRecap\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Break\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignment\",\"kind\":\"object\",\"type\":\"JobAssignment\",\"relationName\":\"BreakToJobAssignment\"},{\"name\":\"assignmentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startTime\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endTime\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"durationMins\",\"kind\":\"scalar\",\"type\":\"Float\"}],\"dbName\":null},\"ReleaseRequest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"job\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobToReleaseRequest\"},{\"name\":\"jobId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"worker\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ReleaseRequestToUser\"},{\"name\":\"workerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dayOfWeek\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"isRecurring\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"ShiftRequest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"job\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobToShiftRequest\"},{\"name\":\"jobId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"worker\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ShiftRequestToUser\"},{\"name\":\"workerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dayOfWeek\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"isRecurring\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Recap\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"job\",\"kind\":\"object\",\"type\":\"Job\",\"relationName\":\"JobToRecap\"},{\"name\":\"jobId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assignment\",\"kind\":\"object\",\"type\":\"JobAssignment\",\"relationName\":\"JobAssignmentToRecap\"},{\"name\":\"assignmentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"consumersAttended\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"consumersSampled\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"reimbursement\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"receiptTotal\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"receiptUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"comments\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rushLevel\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"customerFeedback\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"managerSignature\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"storeManagerName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"managerReview\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"overtimeRequest\",\"kind\":\"object\",\"type\":\"OvertimeRequest\",\"relationName\":\"OvertimeRequestToRecap\"},{\"name\":\"skus\",\"kind\":\"object\",\"type\":\"RecapSKU\",\"relationName\":\"RecapToRecapSKU\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"OvertimeRequest\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"recap\",\"kind\":\"object\",\"type\":\"Recap\",\"relationName\":\"OvertimeRequestToRecap\"},{\"name\":\"recapId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"minutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"RecapSKU\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"recap\",\"kind\":\"object\",\"type\":\"Recap\",\"relationName\":\"RecapToRecapSKU\"},{\"name\":\"recapId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"skuName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"beginningInventory\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"purchased\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"bottlesSold\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"storePrice\",\"kind\":\"scalar\",\"type\":\"Float\"}],\"dbName\":null},\"TrainingDocument\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"url\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"ChatThread\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"participants\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ChatThreadToUser\"},{\"name\":\"messages\",\"kind\":\"object\",\"type\":\"Message\",\"relationName\":\"ChatThreadToMessage\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Message\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"thread\",\"kind\":\"object\",\"type\":\"ChatThread\",\"relationName\":\"ChatThreadToMessage\"},{\"name\":\"threadId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sender\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SentMessages\"},{\"name\":\"senderId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Notification\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"NotificationToUser\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"message\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"read\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Invite\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"hourlyWage\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"marketId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"storeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sender\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"InviteSender\"},{\"name\":\"senderId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"InventoryItem\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"volume\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"unit\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"AuditLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"actor\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AuditLogToUser\"},{\"name\":\"actorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"entityType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"entityId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"oldValue\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"newValue\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
defineDmmfProperty(exports.Prisma, config.runtimeDataModel);
config.engineWasm = {
    getRuntime: ()=>__turbopack_context__.r("[project]/Desktop/clock in:out/node_modules/.prisma/client/query_engine_bg.js [middleware-edge] (ecmascript)"),
    getQueryEngineWasmModule: async ()=>{
        const loader = (await Promise.resolve().then(()=>__turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/.prisma/client/wasm-edge-light-loader.mjs [middleware-edge] (ecmascript)"))).default;
        const engine = (await loader).default;
        return engine;
    }
};
config.compilerWasm = undefined;
config.injectableEdgeEnv = ()=>({
        parsed: {
            DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
        }
    });
if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
    Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined);
}
const PrismaClient = getPrismaClient(config);
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);
}),
"[project]/Desktop/clock in:out/node_modules/.prisma/client/default.js [middleware-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    ...__turbopack_context__.r("[project]/Desktop/clock in:out/node_modules/.prisma/client/wasm.js [middleware-edge] (ecmascript)")
};
}),
"[project]/Desktop/clock in:out/node_modules/@prisma/debug/dist/index.mjs [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Debug",
    ()=>Debug,
    "clearLogs",
    ()=>clearLogs,
    "default",
    ()=>index_default,
    "getLogs",
    ()=>getLogs
]);
var __defProp = Object.defineProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
// ../../node_modules/.pnpm/kleur@4.1.5/node_modules/kleur/colors.mjs
var colors_exports = {};
__export(colors_exports, {
    $: ()=>$,
    bgBlack: ()=>bgBlack,
    bgBlue: ()=>bgBlue,
    bgCyan: ()=>bgCyan,
    bgGreen: ()=>bgGreen,
    bgMagenta: ()=>bgMagenta,
    bgRed: ()=>bgRed,
    bgWhite: ()=>bgWhite,
    bgYellow: ()=>bgYellow,
    black: ()=>black,
    blue: ()=>blue,
    bold: ()=>bold,
    cyan: ()=>cyan,
    dim: ()=>dim,
    gray: ()=>gray,
    green: ()=>green,
    grey: ()=>grey,
    hidden: ()=>hidden,
    inverse: ()=>inverse,
    italic: ()=>italic,
    magenta: ()=>magenta,
    red: ()=>red,
    reset: ()=>reset,
    strikethrough: ()=>strikethrough,
    underline: ()=>underline,
    white: ()=>white,
    yellow: ()=>yellow
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
    let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
    let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
    return function(txt) {
        if (!$.enabled || txt == null) return txt;
        return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
    };
}
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
// src/index.ts
var MAX_ARGS_HISTORY = 100;
var COLORS = [
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "red"
];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
    enable (namespace) {
        if (typeof namespace === "string") {
            globalThis.DEBUG = namespace;
        }
    },
    disable () {
        const prev = globalThis.DEBUG;
        globalThis.DEBUG = "";
        return prev;
    },
    // this is the core logic to check if logging should happen or not
    enabled (namespace) {
        const listenedNamespaces = globalThis.DEBUG.split(",").map((s)=>{
            return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
        });
        const isListened = listenedNamespaces.some((listenedNamespace)=>{
            if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
            return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
        });
        const isExcluded = listenedNamespaces.some((listenedNamespace)=>{
            if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
            return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
        });
        return isListened && !isExcluded;
    },
    log: (...args)=>{
        const [namespace, format, ...rest] = args;
        const logWithFormatting = console.warn ?? console.log;
        logWithFormatting(`${namespace} ${format}`, ...rest);
    },
    formatters: {}
};
function debugCreate(namespace) {
    const instanceProps = {
        color: COLORS[lastColor++ % COLORS.length],
        enabled: topProps.enabled(namespace),
        namespace,
        log: topProps.log,
        extend: ()=>{}
    };
    const debugCall = (...args)=>{
        const { enabled, namespace: namespace2, color, log } = instanceProps;
        if (args.length !== 0) {
            argsHistory.push([
                namespace2,
                ...args
            ]);
        }
        if (argsHistory.length > MAX_ARGS_HISTORY) {
            argsHistory.shift();
        }
        if (topProps.enabled(namespace2) || enabled) {
            const stringArgs = args.map((arg)=>{
                if (typeof arg === "string") {
                    return arg;
                }
                return safeStringify(arg);
            });
            const ms = `+${Date.now() - lastTimestamp}ms`;
            lastTimestamp = Date.now();
            if (globalThis.DEBUG_COLORS) {
                log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
            } else {
                log(namespace2, ...stringArgs, ms);
            }
        }
    };
    return new Proxy(debugCall, {
        get: (_, prop)=>instanceProps[prop],
        set: (_, prop, value)=>instanceProps[prop] = value
    });
}
var Debug = new Proxy(debugCreate, {
    get: (_, prop)=>topProps[prop],
    set: (_, prop, value)=>topProps[prop] = value
});
function safeStringify(value, indent = 2) {
    const cache = /* @__PURE__ */ new Set();
    return JSON.stringify(value, (key, value2)=>{
        if (typeof value2 === "object" && value2 !== null) {
            if (cache.has(value2)) {
                return `[Circular *]`;
            }
            cache.add(value2);
        } else if (typeof value2 === "bigint") {
            return value2.toString();
        }
        return value2;
    }, indent);
}
function getLogs(numChars = 7500) {
    const logs = argsHistory.map(([namespace, ...args])=>{
        return `${namespace} ${args.map((arg)=>{
            if (typeof arg === "string") {
                return arg;
            } else {
                return JSON.stringify(arg);
            }
        }).join(" ")}`;
    }).join("\n");
    if (logs.length < numChars) {
        return logs;
    }
    return logs.slice(-numChars);
}
function clearLogs() {
    argsHistory.length = 0;
}
var index_default = Debug;
;
}),
"[project]/Desktop/clock in:out/node_modules/@prisma/driver-adapter-utils/dist/index.mjs [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ColumnTypeEnum",
    ()=>ColumnTypeEnum,
    "bindAdapter",
    ()=>bindAdapter,
    "err",
    ()=>err,
    "ok",
    ()=>ok
]);
// src/debug.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@prisma/debug/dist/index.mjs [middleware-edge] (ecmascript)");
// src/result.ts
function ok(value) {
    return {
        ok: true,
        value,
        map (fn) {
            return ok(fn(value));
        },
        flatMap (fn) {
            return fn(value);
        }
    };
}
function err(error) {
    return {
        ok: false,
        error,
        map () {
            return err(error);
        },
        flatMap () {
            return err(error);
        }
    };
}
// src/binder.ts
var ErrorRegistryInternal = class {
    constructor(){
        this.registeredErrors = [];
    }
    consumeError(id) {
        return this.registeredErrors[id];
    }
    registerNewError(error) {
        let i = 0;
        while(this.registeredErrors[i] !== void 0){
            i++;
        }
        this.registeredErrors[i] = {
            error
        };
        return i;
    }
};
var bindAdapter = (adapter)=>{
    const errorRegistry = new ErrorRegistryInternal();
    const createTransactionContext = wrapAsync(errorRegistry, adapter.transactionContext.bind(adapter));
    const boundAdapter = {
        adapterName: adapter.adapterName,
        errorRegistry,
        queryRaw: wrapAsync(errorRegistry, adapter.queryRaw.bind(adapter)),
        executeRaw: wrapAsync(errorRegistry, adapter.executeRaw.bind(adapter)),
        provider: adapter.provider,
        transactionContext: async (...args)=>{
            const ctx = await createTransactionContext(...args);
            return ctx.map((tx)=>bindTransactionContext(errorRegistry, tx));
        }
    };
    if (adapter.getConnectionInfo) {
        boundAdapter.getConnectionInfo = wrapSync(errorRegistry, adapter.getConnectionInfo.bind(adapter));
    }
    return boundAdapter;
};
var bindTransactionContext = (errorRegistry, ctx)=>{
    const startTransaction = wrapAsync(errorRegistry, ctx.startTransaction.bind(ctx));
    return {
        adapterName: ctx.adapterName,
        provider: ctx.provider,
        queryRaw: wrapAsync(errorRegistry, ctx.queryRaw.bind(ctx)),
        executeRaw: wrapAsync(errorRegistry, ctx.executeRaw.bind(ctx)),
        startTransaction: async (...args)=>{
            const result = await startTransaction(...args);
            return result.map((tx)=>bindTransaction(errorRegistry, tx));
        }
    };
};
var bindTransaction = (errorRegistry, transaction)=>{
    return {
        adapterName: transaction.adapterName,
        provider: transaction.provider,
        options: transaction.options,
        queryRaw: wrapAsync(errorRegistry, transaction.queryRaw.bind(transaction)),
        executeRaw: wrapAsync(errorRegistry, transaction.executeRaw.bind(transaction)),
        commit: wrapAsync(errorRegistry, transaction.commit.bind(transaction)),
        rollback: wrapAsync(errorRegistry, transaction.rollback.bind(transaction))
    };
};
function wrapAsync(registry, fn) {
    return async (...args)=>{
        try {
            return await fn(...args);
        } catch (error) {
            const id = registry.registerNewError(error);
            return err({
                kind: "GenericJs",
                id
            });
        }
    };
}
function wrapSync(registry, fn) {
    return (...args)=>{
        try {
            return fn(...args);
        } catch (error) {
            const id = registry.registerNewError(error);
            return err({
                kind: "GenericJs",
                id
            });
        }
    };
}
// src/const.ts
var ColumnTypeEnum = {
    // Scalars
    Int32: 0,
    Int64: 1,
    Float: 2,
    Double: 3,
    Numeric: 4,
    Boolean: 5,
    Character: 6,
    Text: 7,
    Date: 8,
    Time: 9,
    DateTime: 10,
    Json: 11,
    Enum: 12,
    Bytes: 13,
    Set: 14,
    Uuid: 15,
    // Arrays
    Int32Array: 64,
    Int64Array: 65,
    FloatArray: 66,
    DoubleArray: 67,
    NumericArray: 68,
    BooleanArray: 69,
    CharacterArray: 70,
    TextArray: 71,
    DateArray: 72,
    TimeArray: 73,
    DateTimeArray: 74,
    JsonArray: 75,
    EnumArray: 76,
    BytesArray: 77,
    UuidArray: 78,
    // Custom
    UnknownNumber: 128
};
;
;
}),
"[project]/Desktop/clock in:out/node_modules/async-mutex/index.mjs [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "E_ALREADY_LOCKED",
    ()=>E_ALREADY_LOCKED,
    "E_CANCELED",
    ()=>E_CANCELED,
    "E_TIMEOUT",
    ()=>E_TIMEOUT,
    "Mutex",
    ()=>Mutex,
    "Semaphore",
    ()=>Semaphore,
    "tryAcquire",
    ()=>tryAcquire,
    "withTimeout",
    ()=>withTimeout
]);
const E_TIMEOUT = new Error('timeout while waiting for mutex to become available');
const E_ALREADY_LOCKED = new Error('mutex already locked');
const E_CANCELED = new Error('request for lock canceled');
var __awaiter$2 = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Semaphore {
    constructor(_value, _cancelError = E_CANCELED){
        this._value = _value;
        this._cancelError = _cancelError;
        this._queue = [];
        this._weightedWaiters = [];
    }
    acquire(weight = 1, priority = 0) {
        if (weight <= 0) throw new Error(`invalid weight ${weight}: must be positive`);
        return new Promise((resolve, reject)=>{
            const task = {
                resolve,
                reject,
                weight,
                priority
            };
            const i = findIndexFromEnd(this._queue, (other)=>priority <= other.priority);
            if (i === -1 && weight <= this._value) {
                // Needs immediate dispatch, skip the queue
                this._dispatchItem(task);
            } else {
                this._queue.splice(i + 1, 0, task);
            }
        });
    }
    runExclusive(callback_1) {
        return __awaiter$2(this, arguments, void 0, function*(callback, weight = 1, priority = 0) {
            const [value, release] = yield this.acquire(weight, priority);
            try {
                return yield callback(value);
            } finally{
                release();
            }
        });
    }
    waitForUnlock(weight = 1, priority = 0) {
        if (weight <= 0) throw new Error(`invalid weight ${weight}: must be positive`);
        if (this._couldLockImmediately(weight, priority)) {
            return Promise.resolve();
        } else {
            return new Promise((resolve)=>{
                if (!this._weightedWaiters[weight - 1]) this._weightedWaiters[weight - 1] = [];
                insertSorted(this._weightedWaiters[weight - 1], {
                    resolve,
                    priority
                });
            });
        }
    }
    isLocked() {
        return this._value <= 0;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._value = value;
        this._dispatchQueue();
    }
    release(weight = 1) {
        if (weight <= 0) throw new Error(`invalid weight ${weight}: must be positive`);
        this._value += weight;
        this._dispatchQueue();
    }
    cancel() {
        this._queue.forEach((entry)=>entry.reject(this._cancelError));
        this._queue = [];
    }
    _dispatchQueue() {
        this._drainUnlockWaiters();
        while(this._queue.length > 0 && this._queue[0].weight <= this._value){
            this._dispatchItem(this._queue.shift());
            this._drainUnlockWaiters();
        }
    }
    _dispatchItem(item) {
        const previousValue = this._value;
        this._value -= item.weight;
        item.resolve([
            previousValue,
            this._newReleaser(item.weight)
        ]);
    }
    _newReleaser(weight) {
        let called = false;
        return ()=>{
            if (called) return;
            called = true;
            this.release(weight);
        };
    }
    _drainUnlockWaiters() {
        if (this._queue.length === 0) {
            for(let weight = this._value; weight > 0; weight--){
                const waiters = this._weightedWaiters[weight - 1];
                if (!waiters) continue;
                waiters.forEach((waiter)=>waiter.resolve());
                this._weightedWaiters[weight - 1] = [];
            }
        } else {
            const queuedPriority = this._queue[0].priority;
            for(let weight = this._value; weight > 0; weight--){
                const waiters = this._weightedWaiters[weight - 1];
                if (!waiters) continue;
                const i = waiters.findIndex((waiter)=>waiter.priority <= queuedPriority);
                (i === -1 ? waiters : waiters.splice(0, i)).forEach((waiter)=>waiter.resolve());
            }
        }
    }
    _couldLockImmediately(weight, priority) {
        return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
    }
}
function insertSorted(a, v) {
    const i = findIndexFromEnd(a, (other)=>v.priority <= other.priority);
    a.splice(i + 1, 0, v);
}
function findIndexFromEnd(a, predicate) {
    for(let i = a.length - 1; i >= 0; i--){
        if (predicate(a[i])) {
            return i;
        }
    }
    return -1;
}
var __awaiter$1 = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Mutex {
    constructor(cancelError){
        this._semaphore = new Semaphore(1, cancelError);
    }
    acquire() {
        return __awaiter$1(this, arguments, void 0, function*(priority = 0) {
            const [, releaser] = yield this._semaphore.acquire(1, priority);
            return releaser;
        });
    }
    runExclusive(callback, priority = 0) {
        return this._semaphore.runExclusive(()=>callback(), 1, priority);
    }
    isLocked() {
        return this._semaphore.isLocked();
    }
    waitForUnlock(priority = 0) {
        return this._semaphore.waitForUnlock(1, priority);
    }
    release() {
        if (this._semaphore.isLocked()) this._semaphore.release();
    }
    cancel() {
        return this._semaphore.cancel();
    }
}
var __awaiter = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function withTimeout(sync, timeout, timeoutError = E_TIMEOUT) {
    return {
        acquire: (weightOrPriority, priority)=>{
            let weight;
            if (isSemaphore(sync)) {
                weight = weightOrPriority;
            } else {
                weight = undefined;
                priority = weightOrPriority;
            }
            if (weight !== undefined && weight <= 0) {
                throw new Error(`invalid weight ${weight}: must be positive`);
            }
            return new Promise((resolve, reject)=>__awaiter(this, void 0, void 0, function*() {
                    let isTimeout = false;
                    const handle = setTimeout(()=>{
                        isTimeout = true;
                        reject(timeoutError);
                    }, timeout);
                    try {
                        const ticket = yield isSemaphore(sync) ? sync.acquire(weight, priority) : sync.acquire(priority);
                        if (isTimeout) {
                            const release = Array.isArray(ticket) ? ticket[1] : ticket;
                            release();
                        } else {
                            clearTimeout(handle);
                            resolve(ticket);
                        }
                    } catch (e) {
                        if (!isTimeout) {
                            clearTimeout(handle);
                            reject(e);
                        }
                    }
                }));
        },
        runExclusive (callback, weight, priority) {
            return __awaiter(this, void 0, void 0, function*() {
                let release = ()=>undefined;
                try {
                    const ticket = yield this.acquire(weight, priority);
                    if (Array.isArray(ticket)) {
                        release = ticket[1];
                        return yield callback(ticket[0]);
                    } else {
                        release = ticket;
                        return yield callback();
                    }
                } finally{
                    release();
                }
            });
        },
        release (weight) {
            sync.release(weight);
        },
        cancel () {
            return sync.cancel();
        },
        waitForUnlock: (weightOrPriority, priority)=>{
            let weight;
            if (isSemaphore(sync)) {
                weight = weightOrPriority;
            } else {
                weight = undefined;
                priority = weightOrPriority;
            }
            if (weight !== undefined && weight <= 0) {
                throw new Error(`invalid weight ${weight}: must be positive`);
            }
            return new Promise((resolve, reject)=>{
                const handle = setTimeout(()=>reject(timeoutError), timeout);
                (isSemaphore(sync) ? sync.waitForUnlock(weight, priority) : sync.waitForUnlock(priority)).then(()=>{
                    clearTimeout(handle);
                    resolve();
                });
            });
        },
        isLocked: ()=>sync.isLocked(),
        getValue: ()=>sync.getValue(),
        setValue: (value)=>sync.setValue(value)
    };
}
function isSemaphore(sync) {
    return sync.getValue !== undefined;
}
// eslint-disable-next-lisne @typescript-eslint/explicit-module-boundary-types
function tryAcquire(sync, alreadyAcquiredError = E_ALREADY_LOCKED) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return withTimeout(sync, 0, alreadyAcquiredError);
}
;
}),
"[project]/Desktop/clock in:out/node_modules/@prisma/adapter-libsql/dist/index.mjs [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PrismaLibSQL",
    ()=>PrismaLibSQL
]);
// src/libsql.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@prisma/debug/dist/index.mjs [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@prisma/driver-adapter-utils/dist/index.mjs [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$async$2d$mutex$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/async-mutex/index.mjs [middleware-edge] (ecmascript)");
;
;
// package.json
var name = "@prisma/adapter-libsql";
;
var debug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Debug"])("prisma:driver-adapter:libsql:conversion");
function mapDeclType(declType) {
    switch(declType.toUpperCase()){
        case "":
            return null;
        case "DECIMAL":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Numeric;
        case "FLOAT":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Float;
        case "DOUBLE":
        case "DOUBLE PRECISION":
        case "NUMERIC":
        case "REAL":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Double;
        case "TINYINT":
        case "SMALLINT":
        case "MEDIUMINT":
        case "INT":
        case "INTEGER":
        case "SERIAL":
        case "INT2":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32;
        case "BIGINT":
        case "UNSIGNED BIG INT":
        case "INT8":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64;
        case "DATETIME":
        case "TIMESTAMP":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTime;
        case "TIME":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Time;
        case "DATE":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Date;
        case "TEXT":
        case "CLOB":
        case "CHARACTER":
        case "VARCHAR":
        case "VARYING CHARACTER":
        case "NCHAR":
        case "NATIVE CHARACTER":
        case "NVARCHAR":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Text;
        case "BLOB":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Bytes;
        case "BOOLEAN":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Boolean;
        case "JSONB":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Json;
        default:
            debug("unknown decltype:", declType);
            return null;
    }
}
function mapDeclaredColumnTypes(columnTypes) {
    const emptyIndices = /* @__PURE__ */ new Set();
    const result = columnTypes.map((typeName, index)=>{
        const mappedType = mapDeclType(typeName);
        if (mappedType === null) {
            emptyIndices.add(index);
        }
        return mappedType;
    });
    return [
        result,
        emptyIndices
    ];
}
function getColumnTypes(declaredTypes, rows) {
    const [columnTypes, emptyIndices] = mapDeclaredColumnTypes(declaredTypes);
    if (emptyIndices.size === 0) {
        return columnTypes;
    }
    columnLoop: for (const columnIndex of emptyIndices){
        for(let rowIndex = 0; rowIndex < rows.length; rowIndex++){
            const candidateValue = rows[rowIndex][columnIndex];
            if (candidateValue !== null) {
                columnTypes[columnIndex] = inferColumnType(candidateValue);
                continue columnLoop;
            }
        }
        columnTypes[columnIndex] = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32;
    }
    return columnTypes;
}
function inferColumnType(value) {
    switch(typeof value){
        case "string":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Text;
        case "bigint":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64;
        case "boolean":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Boolean;
        case "number":
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].UnknownNumber;
        case "object":
            return inferObjectType(value);
        default:
            throw new UnexpectedTypeError(value);
    }
}
function inferObjectType(value) {
    if (value instanceof ArrayBuffer) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Bytes;
    }
    throw new UnexpectedTypeError(value);
}
var UnexpectedTypeError = class extends Error {
    constructor(value){
        const type = typeof value;
        const repr = type === "object" ? JSON.stringify(value) : String(value);
        super(`unexpected value of type ${type}: ${repr}`);
        this.name = "UnexpectedTypeError";
    }
};
function mapRow(row, columnTypes) {
    const result = Array.from(row);
    for(let i = 0; i < result.length; i++){
        const value = result[i];
        if (value instanceof ArrayBuffer) {
            result[i] = Array.from(new Uint8Array(value));
            continue;
        }
        if (typeof value === "number" && (columnTypes[i] === __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32 || columnTypes[i] === __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64) && !Number.isInteger(value)) {
            result[i] = Math.trunc(value);
            continue;
        }
        if ([
            "number",
            "bigint"
        ].includes(typeof value) && columnTypes[i] === __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTime) {
            result[i] = new Date(Number(value)).toISOString();
            continue;
        }
        if (typeof value === "bigint") {
            result[i] = value.toString();
            continue;
        }
    }
    return result;
}
// src/libsql.ts
var debug2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Debug"])("prisma:driver-adapter:libsql");
var LOCK_TAG = Symbol();
var _a;
_a = LOCK_TAG;
var LibSqlQueryable = class {
    constructor(client){
        this.client = client;
        this.provider = "sqlite";
        this.adapterName = name;
        this[_a] = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$async$2d$mutex$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Mutex"]();
    }
    /**
   * Execute a query given as SQL, interpolating the given parameters.
   */ async queryRaw(query) {
        const tag = "[js::query_raw]";
        debug2(`${tag} %O`, query);
        const ioResult = await this.performIO(query);
        return ioResult.map(({ columns, rows, columnTypes: declaredColumnTypes })=>{
            const columnTypes = getColumnTypes(declaredColumnTypes, rows);
            return {
                columnNames: columns,
                columnTypes,
                rows: rows.map((row)=>mapRow(row, columnTypes))
            };
        });
    }
    /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */ async executeRaw(query) {
        const tag = "[js::execute_raw]";
        debug2(`${tag} %O`, query);
        return (await this.performIO(query)).map(({ rowsAffected })=>rowsAffected ?? 0);
    }
    /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */ async performIO(query) {
        const release = await this[LOCK_TAG].acquire();
        try {
            const result = await this.client.execute(query);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ok"])(result);
        } catch (e) {
            const error = e;
            debug2("Error in performIO: %O", error);
            const rawCode = error["rawCode"] ?? e.cause?.["rawCode"];
            if (typeof rawCode === "number") {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["err"])({
                    kind: "sqlite",
                    extendedCode: rawCode,
                    message: error.message
                });
            }
            throw error;
        } finally{
            release();
        }
    }
};
var LibSqlTransaction = class extends LibSqlQueryable {
    constructor(client, options, unlockParent){
        super(client);
        this.options = options;
        this.unlockParent = unlockParent;
    }
    async commit() {
        debug2(`[js::commit]`);
        try {
            await this.client.commit();
        } finally{
            this.unlockParent();
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ok"])(void 0);
    }
    async rollback() {
        debug2(`[js::rollback]`);
        try {
            await this.client.rollback();
        } catch (error) {
            debug2("error in rollback:", error);
        } finally{
            this.unlockParent();
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ok"])(void 0);
    }
};
var LibSqlTransactionContext = class extends LibSqlQueryable {
    constructor(client, release){
        super(client);
        this.client = client;
        this.release = release;
    }
    async startTransaction() {
        const options = {
            usePhantomQuery: true
        };
        const tag = "[js::startTransaction]";
        debug2("%s options: %O", tag, options);
        try {
            const tx = await this.client.transaction("deferred");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ok"])(new LibSqlTransaction(tx, options, this.release));
        } catch (e) {
            this.release();
            throw e;
        }
    }
};
var PrismaLibSQL = class extends LibSqlQueryable {
    constructor(client){
        super(client);
    }
    async transactionContext() {
        const release = await this[LOCK_TAG].acquire();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ok"])(new LibSqlTransactionContext(this.client, release));
    }
};
;
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Error thrown by the client. */ __turbopack_context__.s([
    "LibsqlError",
    ()=>LibsqlError
]);
class LibsqlError extends Error {
    /** Machine-readable error code. */ code;
    /** Raw numeric error code */ rawCode;
    constructor(message, code, rawCode, cause){
        if (code !== undefined) {
            message = `${code}: ${message}`;
        }
        super(message, {
            cause
        });
        this.code = code;
        this.rawCode = rawCode;
        this.name = "LibsqlError";
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/uri.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encodeBaseUrl",
    ()=>encodeBaseUrl,
    "parseUri",
    ()=>parseUri
]);
// URI parser based on RFC 3986
// We can't use the standard `URL` object, because we want to support relative `file:` URLs like
// `file:relative/path/database.db`, which are not correct according to RFC 8089, which standardizes the
// `file` scheme.
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)");
;
function parseUri(text) {
    const match = URI_RE.exec(text);
    if (match === null) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`The URL '${text}' is not in a valid format`, "URL_INVALID");
    }
    const groups = match.groups;
    const scheme = groups["scheme"];
    const authority = groups["authority"] !== undefined ? parseAuthority(groups["authority"]) : undefined;
    const path = percentDecode(groups["path"]);
    const query = groups["query"] !== undefined ? parseQuery(groups["query"]) : undefined;
    const fragment = groups["fragment"] !== undefined ? percentDecode(groups["fragment"]) : undefined;
    return {
        scheme,
        authority,
        path,
        query,
        fragment
    };
}
const URI_RE = (()=>{
    const SCHEME = "(?<scheme>[A-Za-z][A-Za-z.+-]*)";
    const AUTHORITY = "(?<authority>[^/?#]*)";
    const PATH = "(?<path>[^?#]*)";
    const QUERY = "(?<query>[^#]*)";
    const FRAGMENT = "(?<fragment>.*)";
    return new RegExp(`^${SCHEME}:(//${AUTHORITY})?${PATH}(\\?${QUERY})?(#${FRAGMENT})?$`, "su");
})();
function parseAuthority(text) {
    const match = AUTHORITY_RE.exec(text);
    if (match === null) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("The authority part of the URL is not in a valid format", "URL_INVALID");
    }
    const groups = match.groups;
    const host = percentDecode(groups["host_br"] ?? groups["host"]);
    const port = groups["port"] ? parseInt(groups["port"], 10) : undefined;
    const userinfo = groups["username"] !== undefined ? {
        username: percentDecode(groups["username"]),
        password: groups["password"] !== undefined ? percentDecode(groups["password"]) : undefined
    } : undefined;
    return {
        host,
        port,
        userinfo
    };
}
const AUTHORITY_RE = (()=>{
    return new RegExp(`^((?<username>[^:]*)(:(?<password>.*))?@)?((?<host>[^:\\[\\]]*)|(\\[(?<host_br>[^\\[\\]]*)\\]))(:(?<port>[0-9]*))?$`, "su");
})();
// Query string is parsed as application/x-www-form-urlencoded according to the Web URL standard:
// https://url.spec.whatwg.org/#urlencoded-parsing
function parseQuery(text) {
    const sequences = text.split("&");
    const pairs = [];
    for (const sequence of sequences){
        if (sequence === "") {
            continue;
        }
        let key;
        let value;
        const splitIdx = sequence.indexOf("=");
        if (splitIdx < 0) {
            key = sequence;
            value = "";
        } else {
            key = sequence.substring(0, splitIdx);
            value = sequence.substring(splitIdx + 1);
        }
        pairs.push({
            key: percentDecode(key.replaceAll("+", " ")),
            value: percentDecode(value.replaceAll("+", " "))
        });
    }
    return {
        pairs
    };
}
function percentDecode(text) {
    try {
        return decodeURIComponent(text);
    } catch (e) {
        if (e instanceof URIError) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`URL component has invalid percent encoding: ${e}`, "URL_INVALID", undefined, e);
        }
        throw e;
    }
}
function encodeBaseUrl(scheme, authority, path) {
    if (authority === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`URL with scheme ${JSON.stringify(scheme + ":")} requires authority (the "//" part)`, "URL_INVALID");
    }
    const schemeText = `${scheme}:`;
    const hostText = encodeHost(authority.host);
    const portText = encodePort(authority.port);
    const userinfoText = encodeUserinfo(authority.userinfo);
    const authorityText = `//${userinfoText}${hostText}${portText}`;
    let pathText = path.split("/").map(encodeURIComponent).join("/");
    if (pathText !== "" && !pathText.startsWith("/")) {
        pathText = "/" + pathText;
    }
    return new URL(`${schemeText}${authorityText}${pathText}`);
}
function encodeHost(host) {
    return host.includes(":") ? `[${encodeURI(host)}]` : encodeURI(host);
}
function encodePort(port) {
    return port !== undefined ? `:${port}` : "";
}
function encodeUserinfo(userinfo) {
    if (userinfo === undefined) {
        return "";
    }
    const usernameText = encodeURIComponent(userinfo.username);
    const passwordText = userinfo.password !== undefined ? `:${encodeURIComponent(userinfo.password)}` : "";
    return `${usernameText}${passwordText}@`;
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/util.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ResultSetImpl",
    ()=>ResultSetImpl,
    "supportedUrlLink",
    ()=>supportedUrlLink,
    "transactionModeToBegin",
    ()=>transactionModeToBegin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$js$2d$base64$2f$base64$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/js-base64/base64.mjs [middleware-edge] (ecmascript)");
;
const supportedUrlLink = "https://github.com/libsql/libsql-client-ts#supported-urls";
function transactionModeToBegin(mode) {
    if (mode === "write") {
        return "BEGIN IMMEDIATE";
    } else if (mode === "read") {
        return "BEGIN TRANSACTION READONLY";
    } else if (mode === "deferred") {
        return "BEGIN DEFERRED";
    } else {
        throw RangeError('Unknown transaction mode, supported values are "write", "read" and "deferred"');
    }
}
class ResultSetImpl {
    columns;
    columnTypes;
    rows;
    rowsAffected;
    lastInsertRowid;
    constructor(columns, columnTypes, rows, rowsAffected, lastInsertRowid){
        this.columns = columns;
        this.columnTypes = columnTypes;
        this.rows = rows;
        this.rowsAffected = rowsAffected;
        this.lastInsertRowid = lastInsertRowid;
    }
    toJSON() {
        return {
            columns: this.columns,
            columnTypes: this.columnTypes,
            rows: this.rows.map(rowToJson),
            rowsAffected: this.rowsAffected,
            lastInsertRowid: this.lastInsertRowid !== undefined ? "" + this.lastInsertRowid : null
        };
    }
}
function rowToJson(row) {
    return Array.prototype.map.call(row, valueToJson);
}
function valueToJson(value) {
    if (typeof value === "bigint") {
        return "" + value;
    } else if (value instanceof ArrayBuffer) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$js$2d$base64$2f$base64$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Base64"].fromUint8Array(new Uint8Array(value));
    } else {
        return value;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/config.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "expandConfig",
    ()=>expandConfig,
    "isInMemoryConfig",
    ()=>isInMemoryConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/uri.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/util.js [middleware-edge] (ecmascript)");
;
;
;
const inMemoryMode = ":memory:";
function isInMemoryConfig(config) {
    return config.scheme === "file" && (config.path === ":memory:" || config.path.startsWith(":memory:?"));
}
function expandConfig(config, preferHttp) {
    if (typeof config !== "object") {
        // produce a reasonable error message in the common case where users type
        // `createClient("libsql://...")` instead of `createClient({url: "libsql://..."})`
        throw new TypeError(`Expected client configuration as object, got ${typeof config}`);
    }
    let { url, authToken, tls, intMode, concurrency } = config;
    // fill simple defaults right here
    concurrency = Math.max(0, concurrency || 20);
    intMode ??= "number";
    let connectionQueryParams = []; // recognized query parameters which we sanitize through white list of valid key-value pairs
    // convert plain :memory: url to URI format to make logic more uniform
    if (url === inMemoryMode) {
        url = "file::memory:";
    }
    // parse url parameters first and override config with update values
    const uri = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["parseUri"])(url);
    const originalUriScheme = uri.scheme.toLowerCase();
    const isInMemoryMode = originalUriScheme === "file" && uri.path === inMemoryMode && uri.authority === undefined;
    let queryParamsDef;
    if (isInMemoryMode) {
        queryParamsDef = {
            cache: {
                values: [
                    "shared",
                    "private"
                ],
                update: (key, value)=>connectionQueryParams.push(`${key}=${value}`)
            }
        };
    } else {
        queryParamsDef = {
            tls: {
                values: [
                    "0",
                    "1"
                ],
                update: (_, value)=>tls = value === "1"
            },
            authToken: {
                update: (_, value)=>authToken = value
            }
        };
    }
    for (const { key, value } of uri.query?.pairs ?? []){
        if (!Object.hasOwn(queryParamsDef, key)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`Unsupported URL query parameter ${JSON.stringify(key)}`, "URL_PARAM_NOT_SUPPORTED");
        }
        const queryParamDef = queryParamsDef[key];
        if (queryParamDef.values !== undefined && !queryParamDef.values.includes(value)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`Unknown value for the "${key}" query argument: ${JSON.stringify(value)}. Supported values are: [${queryParamDef.values.map((x)=>'"' + x + '"').join(", ")}]`, "URL_INVALID");
        }
        if (queryParamDef.update !== undefined) {
            queryParamDef?.update(key, value);
        }
    }
    // fill complex defaults & validate config
    const connectionQueryParamsString = connectionQueryParams.length === 0 ? "" : `?${connectionQueryParams.join("&")}`;
    const path = uri.path + connectionQueryParamsString;
    let scheme;
    if (originalUriScheme === "libsql") {
        if (tls === false) {
            if (uri.authority?.port === undefined) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]('A "libsql:" URL with ?tls=0 must specify an explicit port', "URL_INVALID");
            }
            scheme = preferHttp ? "http" : "ws";
        } else {
            scheme = preferHttp ? "https" : "wss";
        }
    } else {
        scheme = originalUriScheme;
    }
    if (scheme === "http" || scheme === "ws") {
        tls ??= false;
    } else {
        tls ??= true;
    }
    if (scheme !== "http" && scheme !== "ws" && scheme !== "https" && scheme !== "wss" && scheme !== "file") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]('The client supports only "libsql:", "wss:", "ws:", "https:", "http:" and "file:" URLs, ' + `got ${JSON.stringify(uri.scheme + ":")}. ` + `For more information, please read ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supportedUrlLink"]}`, "URL_SCHEME_NOT_SUPPORTED");
    }
    if (intMode !== "number" && intMode !== "bigint" && intMode !== "string") {
        throw new TypeError(`Invalid value for intMode, expected "number", "bigint" or "string", got ${JSON.stringify(intMode)}`);
    }
    if (uri.fragment !== undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`URL fragments are not supported: ${JSON.stringify("#" + uri.fragment)}`, "URL_INVALID");
    }
    if (isInMemoryMode) {
        return {
            scheme: "file",
            tls: false,
            path,
            intMode,
            concurrency,
            syncUrl: config.syncUrl,
            syncInterval: config.syncInterval,
            fetch: config.fetch,
            authToken: undefined,
            encryptionKey: undefined,
            authority: undefined
        };
    }
    return {
        scheme,
        tls,
        authority: uri.authority,
        path,
        authToken,
        intMode,
        concurrency,
        encryptionKey: config.encryptionKey,
        syncUrl: config.syncUrl,
        syncInterval: config.syncInterval,
        fetch: config.fetch
    };
}
}),
"[project]/Desktop/clock in:out/node_modules/js-base64/base64.mjs [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Base64",
    ()=>gBase64,
    "VERSION",
    ()=>VERSION,
    "atob",
    ()=>_atob,
    "atobPolyfill",
    ()=>atobPolyfill,
    "btoa",
    ()=>_btoa,
    "btoaPolyfill",
    ()=>btoaPolyfill,
    "btou",
    ()=>btou,
    "decode",
    ()=>decode,
    "encode",
    ()=>encode,
    "encodeURI",
    ()=>encodeURI,
    "encodeURL",
    ()=>encodeURI,
    "extendBuiltins",
    ()=>extendBuiltins,
    "extendString",
    ()=>extendString,
    "extendUint8Array",
    ()=>extendUint8Array,
    "fromBase64",
    ()=>decode,
    "fromUint8Array",
    ()=>fromUint8Array,
    "isValid",
    ()=>isValid,
    "toBase64",
    ()=>encode,
    "toUint8Array",
    ()=>toUint8Array,
    "utob",
    ()=>utob,
    "version",
    ()=>version
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = /*#__PURE__*/ __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
/**
 *  base64.ts
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 *
 * @author Dan Kogai (https://github.com/dankogai)
 */ const version = '3.7.8';
/**
 * @deprecated use lowercase `version`.
 */ const VERSION = version;
const _hasBuffer = typeof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"] === 'function';
const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
const b64tab = ((a)=>{
    let tab = {};
    a.forEach((c, i)=>tab[c] = i);
    return tab;
})(b64chs);
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
const _fromCC = String.fromCharCode.bind(String);
const _U8Afrom = typeof Uint8Array.from === 'function' ? Uint8Array.from.bind(Uint8Array) : (it)=>new Uint8Array(Array.prototype.slice.call(it, 0));
const _mkUriSafe = (src)=>src.replace(/=/g, '').replace(/[+\/]/g, (m0)=>m0 == '+' ? '-' : '_');
const _tidyB64 = (s)=>s.replace(/[^A-Za-z0-9\+\/]/g, '');
/**
 * polyfill version of `btoa`
 */ const btoaPolyfill = (bin)=>{
    // console.log('polyfilled');
    let u32, c0, c1, c2, asc = '';
    const pad = bin.length % 3;
    for(let i = 0; i < bin.length;){
        if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255) throw new TypeError('invalid character found');
        u32 = c0 << 16 | c1 << 8 | c2;
        asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
/**
 * does what `window.btoa` of web browsers do.
 * @param {String} bin binary string
 * @returns {string} Base64-encoded string
 */ const _btoa = typeof btoa === 'function' ? (bin)=>btoa(bin) : _hasBuffer ? (bin)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(bin, 'binary').toString('base64') : btoaPolyfill;
const _fromUint8Array = _hasBuffer ? (u8a)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(u8a).toString('base64') : (u8a)=>{
    // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
    const maxargs = 0x1000;
    let strs = [];
    for(let i = 0, l = u8a.length; i < l; i += maxargs){
        strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
    }
    return _btoa(strs.join(''));
};
/**
 * converts a Uint8Array to a Base64 string.
 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
 * @returns {string} Base64 string
 */ const fromUint8Array = (u8a, urlsafe = false)=>urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const utob = (src: string) => unescape(encodeURIComponent(src));
// reverting good old fationed regexp
const cb_utob = (c)=>{
    if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 0x80 ? c : cc < 0x800 ? _fromCC(0xc0 | cc >>> 6) + _fromCC(0x80 | cc & 0x3f) : _fromCC(0xe0 | cc >>> 12 & 0x0f) + _fromCC(0x80 | cc >>> 6 & 0x3f) + _fromCC(0x80 | cc & 0x3f);
    } else {
        var cc = 0x10000 + (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
        return _fromCC(0xf0 | cc >>> 18 & 0x07) + _fromCC(0x80 | cc >>> 12 & 0x3f) + _fromCC(0x80 | cc >>> 6 & 0x3f) + _fromCC(0x80 | cc & 0x3f);
    }
};
const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-8 string
 * @returns {string} UTF-16 string
 */ const utob = (u)=>u.replace(re_utob, cb_utob);
//
const _encode = _hasBuffer ? (s)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(s, 'utf8').toString('base64') : _TE ? (s)=>_fromUint8Array(_TE.encode(s)) : (s)=>_btoa(utob(s));
/**
 * converts a UTF-8-encoded string to a Base64 string.
 * @param {boolean} [urlsafe] if `true` make the result URL-safe
 * @returns {string} Base64 string
 */ const encode = (src, urlsafe = false)=>urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
/**
 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
 * @returns {string} Base64 string
 */ const encodeURI = (src)=>encode(src, true);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const btou = (src: string) => decodeURIComponent(escape(src));
// reverting good old fationed regexp
const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
const cb_btou = (cccc)=>{
    switch(cccc.length){
        case 4:
            var cp = (0x07 & cccc.charCodeAt(0)) << 18 | (0x3f & cccc.charCodeAt(1)) << 12 | (0x3f & cccc.charCodeAt(2)) << 6 | 0x3f & cccc.charCodeAt(3), offset = cp - 0x10000;
            return _fromCC((offset >>> 10) + 0xD800) + _fromCC((offset & 0x3FF) + 0xDC00);
        case 3:
            return _fromCC((0x0f & cccc.charCodeAt(0)) << 12 | (0x3f & cccc.charCodeAt(1)) << 6 | 0x3f & cccc.charCodeAt(2));
        default:
            return _fromCC((0x1f & cccc.charCodeAt(0)) << 6 | 0x3f & cccc.charCodeAt(1));
    }
};
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-16 string
 * @returns {string} UTF-8 string
 */ const btou = (b)=>b.replace(re_btou, cb_btou);
/**
 * polyfill version of `atob`
 */ const atobPolyfill = (asc)=>{
    // console.log('polyfilled');
    asc = asc.replace(/\s+/g, '');
    if (!b64re.test(asc)) throw new TypeError('malformed base64.');
    asc += '=='.slice(2 - (asc.length & 3));
    let u24, r1, r2;
    let binArray = []; // use array to avoid minor gc in loop
    for(let i = 0; i < asc.length;){
        u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
        if (r1 === 64) {
            binArray.push(_fromCC(u24 >> 16 & 255));
        } else if (r2 === 64) {
            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
        } else {
            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
        }
    }
    return binArray.join('');
};
/**
 * does what `window.atob` of web browsers do.
 * @param {String} asc Base64-encoded string
 * @returns {string} binary string
 */ const _atob = typeof atob === 'function' ? (asc)=>atob(_tidyB64(asc)) : _hasBuffer ? (asc)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(asc, 'base64').toString('binary') : atobPolyfill;
//
const _toUint8Array = _hasBuffer ? (a)=>_U8Afrom(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(a, 'base64')) : (a)=>_U8Afrom(_atob(a).split('').map((c)=>c.charCodeAt(0)));
/**
 * converts a Base64 string to a Uint8Array.
 */ const toUint8Array = (a)=>_toUint8Array(_unURI(a));
//
const _decode = _hasBuffer ? (a)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(a, 'base64').toString('utf8') : _TD ? (a)=>_TD.decode(_toUint8Array(a)) : (a)=>btou(_atob(a));
const _unURI = (a)=>_tidyB64(a.replace(/[-_]/g, (m0)=>m0 == '-' ? '+' : '/'));
/**
 * converts a Base64 string to a UTF-8 string.
 * @param {String} src Base64 string.  Both normal and URL-safe are supported
 * @returns {string} UTF-8 string
 */ const decode = (src)=>_decode(_unURI(src));
/**
 * check if a value is a valid Base64 string
 * @param {String} src a value to check
  */ const isValid = (src)=>{
    if (typeof src !== 'string') return false;
    const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
    return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
//
const _noEnum = (v)=>{
    return {
        value: v,
        enumerable: false,
        writable: true,
        configurable: true
    };
};
/**
 * extend String.prototype with relevant methods
 */ const extendString = function() {
    const _add = (name, body)=>Object.defineProperty(String.prototype, name, _noEnum(body));
    _add('fromBase64', function() {
        return decode(this);
    });
    _add('toBase64', function(urlsafe) {
        return encode(this, urlsafe);
    });
    _add('toBase64URI', function() {
        return encode(this, true);
    });
    _add('toBase64URL', function() {
        return encode(this, true);
    });
    _add('toUint8Array', function() {
        return toUint8Array(this);
    });
};
/**
 * extend Uint8Array.prototype with relevant methods
 */ const extendUint8Array = function() {
    const _add = (name, body)=>Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
    _add('toBase64', function(urlsafe) {
        return fromUint8Array(this, urlsafe);
    });
    _add('toBase64URI', function() {
        return fromUint8Array(this, true);
    });
    _add('toBase64URL', function() {
        return fromUint8Array(this, true);
    });
};
/**
 * extend Builtin prototypes with relevant methods
 */ const extendBuiltins = ()=>{
    extendString();
    extendUint8Array();
};
const gBase64 = {
    version: version,
    VERSION: VERSION,
    atob: _atob,
    atobPolyfill: atobPolyfill,
    btoa: _btoa,
    btoaPolyfill: btoaPolyfill,
    fromBase64: decode,
    toBase64: encode,
    encode: encode,
    encodeURI: encodeURI,
    encodeURL: encodeURI,
    utob: utob,
    btou: btou,
    decode: decode,
    isValid: isValid,
    fromUint8Array: fromUint8Array,
    toUint8Array: toUint8Array,
    extendString: extendString,
    extendUint8Array: extendUint8Array,
    extendBuiltins: extendBuiltins
};
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/isomorphic-ws/web.mjs [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebSocket",
    ()=>_WebSocket
]);
let _WebSocket;
if (typeof WebSocket !== "undefined") {
    _WebSocket = WebSocket;
} else if ("TURBOPACK compile-time truthy", 1) {
    _WebSocket = /*TURBOPACK member replacement*/ __turbopack_context__.g.WebSocket;
} else //TURBOPACK unreachable
;
;
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/isomorphic-fetch/web.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Headers",
    ()=>_Headers,
    "Request",
    ()=>_Request,
    "fetch",
    ()=>_fetch
]);
const _fetch = fetch;
const _Request = Request;
const _Headers = Headers;
;
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/hrana.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HranaTransaction",
    ()=>HranaTransaction,
    "executeHranaBatch",
    ()=>executeHranaBatch,
    "mapHranaError",
    ()=>mapHranaError,
    "resultSetFromHrana",
    ()=>resultSetFromHrana,
    "stmtToHrana",
    ()=>stmtToHrana
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/batch.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$stmt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/stmt.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/util.js [middleware-edge] (ecmascript)");
;
;
;
class HranaTransaction {
    #mode;
    #version;
    // Promise that is resolved when the BEGIN statement completes, or `undefined` if we haven't executed the
    // BEGIN statement yet.
    #started;
    /** @private */ constructor(mode, version){
        this.#mode = mode;
        this.#version = version;
        this.#started = undefined;
    }
    execute(stmt) {
        return this.batch([
            stmt
        ]).then((results)=>results[0]);
    }
    async batch(stmts) {
        const stream = this._getStream();
        if (stream.closed) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
        }
        try {
            const hranaStmts = stmts.map(stmtToHrana);
            let rowsPromises;
            if (this.#started === undefined) {
                // The transaction hasn't started yet, so we need to send the BEGIN statement in a batch with
                // `hranaStmts`.
                this._getSqlCache().apply(hranaStmts);
                const batch = stream.batch(this.#version >= 3);
                const beginStep = batch.step();
                const beginPromise = beginStep.run((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["transactionModeToBegin"])(this.#mode));
                // Execute the `hranaStmts` only if the BEGIN succeeded, to make sure that we don't execute it
                // outside of a transaction.
                let lastStep = beginStep;
                rowsPromises = hranaStmts.map((hranaStmt)=>{
                    const stmtStep = batch.step().condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].ok(lastStep));
                    if (this.#version >= 3) {
                        // If the Hrana version supports it, make sure that we are still in a transaction
                        stmtStep.condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].not(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].isAutocommit(batch)));
                    }
                    const rowsPromise = stmtStep.query(hranaStmt);
                    rowsPromise.catch(()=>undefined); // silence Node warning
                    lastStep = stmtStep;
                    return rowsPromise;
                });
                // `this.#started` is resolved successfully only if the batch and the BEGIN statement inside
                // of the batch are both successful.
                this.#started = batch.execute().then(()=>beginPromise).then(()=>undefined);
                try {
                    await this.#started;
                } catch (e) {
                    // If the BEGIN failed, the transaction is unusable and we must close it. However, if the
                    // BEGIN suceeds and `hranaStmts` fail, the transaction is _not_ closed.
                    this.close();
                    throw e;
                }
            } else {
                if (this.#version < 3) {
                    // The transaction has started, so we must wait until the BEGIN statement completed to make
                    // sure that we don't execute `hranaStmts` outside of a transaction.
                    await this.#started;
                } else {
                // The transaction has started, but we will use `hrana.BatchCond.isAutocommit()` to make
                // sure that we don't execute `hranaStmts` outside of a transaction, so we don't have to
                // wait for `this.#started`
                }
                this._getSqlCache().apply(hranaStmts);
                const batch = stream.batch(this.#version >= 3);
                let lastStep = undefined;
                rowsPromises = hranaStmts.map((hranaStmt)=>{
                    const stmtStep = batch.step();
                    if (lastStep !== undefined) {
                        stmtStep.condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].ok(lastStep));
                    }
                    if (this.#version >= 3) {
                        stmtStep.condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].not(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].isAutocommit(batch)));
                    }
                    const rowsPromise = stmtStep.query(hranaStmt);
                    rowsPromise.catch(()=>undefined); // silence Node warning
                    lastStep = stmtStep;
                    return rowsPromise;
                });
                await batch.execute();
            }
            const resultSets = [];
            for (const rowsPromise of rowsPromises){
                const rows = await rowsPromise;
                if (rows === undefined) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Statement in a transaction was not executed, " + "probably because the transaction has been rolled back", "TRANSACTION_CLOSED");
                }
                resultSets.push(resultSetFromHrana(rows));
            }
            return resultSets;
        } catch (e) {
            throw mapHranaError(e);
        }
    }
    async executeMultiple(sql) {
        const stream = this._getStream();
        if (stream.closed) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
        }
        try {
            if (this.#started === undefined) {
                // If the transaction hasn't started yet, start it now
                this.#started = stream.run((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["transactionModeToBegin"])(this.#mode)).then(()=>undefined);
                try {
                    await this.#started;
                } catch (e) {
                    this.close();
                    throw e;
                }
            } else {
                // Wait until the transaction has started
                await this.#started;
            }
            await stream.sequence(sql);
        } catch (e) {
            throw mapHranaError(e);
        }
    }
    async rollback() {
        try {
            const stream = this._getStream();
            if (stream.closed) {
                return;
            }
            if (this.#started !== undefined) {
            // We don't have to wait for the BEGIN statement to complete. If the BEGIN fails, we will
            // execute a ROLLBACK outside of an active transaction, which should be harmless.
            } else {
                // We did nothing in the transaction, so there is nothing to rollback.
                return;
            }
            // Pipeline the ROLLBACK statement and the stream close.
            const promise = stream.run("ROLLBACK").catch((e)=>{
                throw mapHranaError(e);
            });
            stream.closeGracefully();
            await promise;
        } catch (e) {
            throw mapHranaError(e);
        } finally{
            // `this.close()` may close the `hrana.Client`, which aborts all pending stream requests, so we
            // must call it _after_ we receive the ROLLBACK response.
            // Also note that the current stream should already be closed, but we need to call `this.close()`
            // anyway, because it may need to do more cleanup.
            this.close();
        }
    }
    async commit() {
        // (this method is analogous to `rollback()`)
        try {
            const stream = this._getStream();
            if (stream.closed) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Cannot commit the transaction because it is already closed", "TRANSACTION_CLOSED");
            }
            if (this.#started !== undefined) {
                // Make sure to execute the COMMIT only if the BEGIN was successful.
                await this.#started;
            } else {
                return;
            }
            const promise = stream.run("COMMIT").catch((e)=>{
                throw mapHranaError(e);
            });
            stream.closeGracefully();
            await promise;
        } catch (e) {
            throw mapHranaError(e);
        } finally{
            this.close();
        }
    }
}
async function executeHranaBatch(mode, version, batch, hranaStmts) {
    const beginStep = batch.step();
    const beginPromise = beginStep.run((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["transactionModeToBegin"])(mode));
    let lastStep = beginStep;
    const stmtPromises = hranaStmts.map((hranaStmt)=>{
        const stmtStep = batch.step().condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].ok(lastStep));
        if (version >= 3) {
            stmtStep.condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].not(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].isAutocommit(batch)));
        }
        const stmtPromise = stmtStep.query(hranaStmt);
        lastStep = stmtStep;
        return stmtPromise;
    });
    const commitStep = batch.step().condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].ok(lastStep));
    if (version >= 3) {
        commitStep.condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].not(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].isAutocommit(batch)));
    }
    const commitPromise = commitStep.run("COMMIT");
    const rollbackStep = batch.step().condition(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].not(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$batch$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BatchCond"].ok(commitStep)));
    rollbackStep.run("ROLLBACK").catch((_)=>undefined);
    await batch.execute();
    const resultSets = [];
    await beginPromise;
    for (const stmtPromise of stmtPromises){
        const hranaRows = await stmtPromise;
        if (hranaRows === undefined) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Statement in a batch was not executed, probably because the transaction has been rolled back", "TRANSACTION_CLOSED");
        }
        resultSets.push(resultSetFromHrana(hranaRows));
    }
    await commitPromise;
    return resultSets;
}
function stmtToHrana(stmt) {
    if (typeof stmt === "string") {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$stmt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Stmt"](stmt);
    }
    const hranaStmt = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$stmt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Stmt"](stmt.sql);
    if (Array.isArray(stmt.args)) {
        hranaStmt.bindIndexes(stmt.args);
    } else {
        for (const [key, value] of Object.entries(stmt.args)){
            hranaStmt.bindName(key, value);
        }
    }
    return hranaStmt;
}
function resultSetFromHrana(hranaRows) {
    const columns = hranaRows.columnNames.map((c)=>c ?? "");
    const columnTypes = hranaRows.columnDecltypes.map((c)=>c ?? "");
    const rows = hranaRows.rows;
    const rowsAffected = hranaRows.affectedRowCount;
    const lastInsertRowid = hranaRows.lastInsertRowid !== undefined ? hranaRows.lastInsertRowid : undefined;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ResultSetImpl"](columns, columnTypes, rows, rowsAffected, lastInsertRowid);
}
function mapHranaError(e) {
    if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ClientError"]) {
        const code = mapHranaErrorCode(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](e.message, code, undefined, e);
    }
    return e;
}
function mapHranaErrorCode(e) {
    if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ResponseError"] && e.code !== undefined) {
        return e.code;
    } else if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ProtoError"]) {
        return "HRANA_PROTO_ERROR";
    } else if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ClosedError"]) {
        return e.cause instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ClientError"] ? mapHranaErrorCode(e.cause) : "HRANA_CLOSED_ERROR";
    } else if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["WebSocketError"]) {
        return "HRANA_WEBSOCKET_ERROR";
    } else if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["HttpServerError"]) {
        return "SERVER_ERROR";
    } else if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ProtocolVersionError"]) {
        return "PROTOCOL_VERSION_ERROR";
    } else if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["InternalError"]) {
        return "INTERNAL_ERROR";
    } else {
        return "UNKNOWN";
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/sql_cache.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SqlCache",
    ()=>SqlCache
]);
class SqlCache {
    #owner;
    #sqls;
    capacity;
    constructor(owner, capacity){
        this.#owner = owner;
        this.#sqls = new Lru();
        this.capacity = capacity;
    }
    // Replaces SQL strings with cached `hrana.Sql` objects in the statements in `hranaStmts`. After this
    // function returns, we guarantee that all `hranaStmts` refer to valid (not closed) `hrana.Sql` objects,
    // but _we may invalidate any other `hrana.Sql` objects_ (by closing them, thus removing them from the
    // server).
    //
    // In practice, this means that after calling this function, you can use the statements only up to the
    // first `await`, because concurrent code may also use the cache and invalidate those statements.
    apply(hranaStmts) {
        if (this.capacity <= 0) {
            return;
        }
        const usedSqlObjs = new Set();
        for (const hranaStmt of hranaStmts){
            if (typeof hranaStmt.sql !== "string") {
                continue;
            }
            const sqlText = hranaStmt.sql;
            // Stored SQL cannot exceed 5kb.
            // https://github.com/tursodatabase/libsql/blob/e9d637e051685f92b0da43849507b5ef4232fbeb/libsql-server/src/hrana/http/request.rs#L10
            if (sqlText.length >= 5000) {
                continue;
            }
            let sqlObj = this.#sqls.get(sqlText);
            if (sqlObj === undefined) {
                while(this.#sqls.size + 1 > this.capacity){
                    const [evictSqlText, evictSqlObj] = this.#sqls.peekLru();
                    if (usedSqlObjs.has(evictSqlObj)) {
                        break;
                    }
                    evictSqlObj.close();
                    this.#sqls.delete(evictSqlText);
                }
                if (this.#sqls.size + 1 <= this.capacity) {
                    sqlObj = this.#owner.storeSql(sqlText);
                    this.#sqls.set(sqlText, sqlObj);
                }
            }
            if (sqlObj !== undefined) {
                hranaStmt.sql = sqlObj;
                usedSqlObjs.add(sqlObj);
            }
        }
    }
}
class Lru {
    // This maps keys to the cache values. The entries are ordered by their last use (entires that were used
    // most recently are at the end).
    #cache;
    constructor(){
        this.#cache = new Map();
    }
    get(key) {
        const value = this.#cache.get(key);
        if (value !== undefined) {
            // move the entry to the back of the Map
            this.#cache.delete(key);
            this.#cache.set(key, value);
        }
        return value;
    }
    set(key, value) {
        this.#cache.set(key, value);
    }
    peekLru() {
        for (const entry of this.#cache.entries()){
            return entry;
        }
        return undefined;
    }
    delete(key) {
        this.#cache.delete(key);
    }
    get size() {
        return this.#cache.size;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/ws.js [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WsClient",
    ()=>WsClient,
    "WsTransaction",
    ()=>WsTransaction,
    "_createClient",
    ()=>_createClient,
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$config$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/config.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/hrana.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$sql_cache$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/sql_cache.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/uri.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/util.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$promise$2d$limit$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/promise-limit/index.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
function createClient(config) {
    return _createClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$config$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["expandConfig"])(config, false));
}
function _createClient(config) {
    if (config.scheme !== "wss" && config.scheme !== "ws") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]('The WebSocket client supports only "libsql:", "wss:" and "ws:" URLs, ' + `got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supportedUrlLink"]}`, "URL_SCHEME_NOT_SUPPORTED");
    }
    if (config.encryptionKey !== undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
    }
    if (config.scheme === "ws" && config.tls) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`A "ws:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
    } else if (config.scheme === "wss" && !config.tls) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`A "wss:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
    }
    const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBaseUrl"])(config.scheme, config.authority, config.path);
    let client;
    try {
        client = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openWs"](url, config.authToken);
    } catch (e) {
        if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["WebSocketUnsupportedError"]) {
            const suggestedScheme = config.scheme === "wss" ? "https" : "http";
            const suggestedUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBaseUrl"])(suggestedScheme, config.authority, config.path);
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("This environment does not support WebSockets, please switch to the HTTP client by using " + `a "${suggestedScheme}:" URL (${JSON.stringify(suggestedUrl)}). ` + `For more information, please read ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supportedUrlLink"]}`, "WEBSOCKETS_NOT_SUPPORTED");
        }
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
    }
    return new WsClient(client, url, config.authToken, config.intMode, config.concurrency);
}
const maxConnAgeMillis = 60 * 1000;
const sqlCacheCapacity = 100;
class WsClient {
    #url;
    #authToken;
    #intMode;
    // State of the current connection. The `hrana.WsClient` inside may be closed at any moment due to an
    // asynchronous error.
    #connState;
    // If defined, this is a connection that will be used in the future, once it is ready.
    #futureConnState;
    closed;
    protocol;
    #isSchemaDatabase;
    #promiseLimitFunction;
    /** @private */ constructor(client, url, authToken, intMode, concurrency){
        this.#url = url;
        this.#authToken = authToken;
        this.#intMode = intMode;
        this.#connState = this.#openConn(client);
        this.#futureConnState = undefined;
        this.closed = false;
        this.protocol = "ws";
        this.#promiseLimitFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$promise$2d$limit$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])(concurrency);
    }
    async limit(fn) {
        return this.#promiseLimitFunction(fn);
    }
    async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === 'string') {
            stmt = {
                sql: stmtOrSql,
                args: args || []
            };
        } else {
            stmt = stmtOrSql;
        }
        return this.limit(async ()=>{
            const streamState = await this.#openStream();
            try {
                const hranaStmt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["stmtToHrana"])(stmt);
                // Schedule all operations synchronously, so they will be pipelined and executed in a single
                // network roundtrip.
                streamState.conn.sqlCache.apply([
                    hranaStmt
                ]);
                const hranaRowsPromise = streamState.stream.query(hranaStmt);
                streamState.stream.closeGracefully();
                const hranaRowsResult = await hranaRowsPromise;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["resultSetFromHrana"])(hranaRowsResult);
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            } finally{
                this._closeStream(streamState);
            }
        });
    }
    async batch(stmts, mode = "deferred") {
        return this.limit(async ()=>{
            const streamState = await this.#openStream();
            try {
                const hranaStmts = stmts.map(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["stmtToHrana"]);
                const version = await streamState.conn.client.getVersion();
                // Schedule all operations synchronously, so they will be pipelined and executed in a single
                // network roundtrip.
                streamState.conn.sqlCache.apply(hranaStmts);
                const batch = streamState.stream.batch(version >= 3);
                const resultsPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["executeHranaBatch"])(mode, version, batch, hranaStmts);
                const results = await resultsPromise;
                return results;
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            } finally{
                this._closeStream(streamState);
            }
        });
    }
    async transaction(mode = "write") {
        return this.limit(async ()=>{
            const streamState = await this.#openStream();
            try {
                const version = await streamState.conn.client.getVersion();
                // the BEGIN statement will be batched with the first statement on the transaction to save a
                // network roundtrip
                return new WsTransaction(this, streamState, mode, version);
            } catch (e) {
                this._closeStream(streamState);
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            }
        });
    }
    async executeMultiple(sql) {
        return this.limit(async ()=>{
            const streamState = await this.#openStream();
            try {
                // Schedule all operations synchronously, so they will be pipelined and executed in a single
                // network roundtrip.
                const promise = streamState.stream.sequence(sql);
                streamState.stream.closeGracefully();
                await promise;
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            } finally{
                this._closeStream(streamState);
            }
        });
    }
    sync() {
        return Promise.resolve();
    }
    async #openStream() {
        if (this.closed) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("The client is closed", "CLIENT_CLOSED");
        }
        const now = new Date();
        const ageMillis = now.valueOf() - this.#connState.openTime.valueOf();
        if (ageMillis > maxConnAgeMillis && this.#futureConnState === undefined) {
            // The existing connection is too old, let's open a new one.
            const futureConnState = this.#openConn();
            this.#futureConnState = futureConnState;
            // However, if we used `futureConnState` immediately, we would introduce additional latency,
            // because we would have to wait for the WebSocket handshake to complete, even though we may a
            // have perfectly good existing connection in `this.#connState`!
            //
            // So we wait until the `hrana.Client.getVersion()` operation completes (which happens when the
            // WebSocket hanshake completes), and only then we replace `this.#connState` with
            // `futureConnState`, which is stored in `this.#futureConnState` in the meantime.
            futureConnState.client.getVersion().then((_version)=>{
                if (this.#connState !== futureConnState) {
                    // We need to close `this.#connState` before we replace it. However, it is possible
                    // that `this.#connState` has already been replaced: see the code below.
                    if (this.#connState.streamStates.size === 0) {
                        this.#connState.client.close();
                    } else {
                    // If there are existing streams on the connection, we must not close it, because
                    // these streams would be broken. The last stream to be closed will also close the
                    // connection in `_closeStream()`.
                    }
                }
                this.#connState = futureConnState;
                this.#futureConnState = undefined;
            }, (_e)=>{
                // If the new connection could not be established, let's just ignore the error and keep
                // using the existing connection.
                this.#futureConnState = undefined;
            });
        }
        if (this.#connState.client.closed) {
            // An error happened on this connection and it has been closed. Let's try to seamlessly reconnect.
            try {
                if (this.#futureConnState !== undefined) {
                    // We are already in the process of opening a new connection, so let's just use it
                    // immediately.
                    this.#connState = this.#futureConnState;
                } else {
                    this.#connState = this.#openConn();
                }
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            }
        }
        const connState = this.#connState;
        try {
            // Now we wait for the WebSocket handshake to complete (if it hasn't completed yet). Note that
            // this does not increase latency, because any messages that we would send on the WebSocket before
            // the handshake would be queued until the handshake is completed anyway.
            if (connState.useSqlCache === undefined) {
                connState.useSqlCache = await connState.client.getVersion() >= 2;
                if (connState.useSqlCache) {
                    connState.sqlCache.capacity = sqlCacheCapacity;
                }
            }
            const stream = connState.client.openStream();
            stream.intMode = this.#intMode;
            const streamState = {
                conn: connState,
                stream
            };
            connState.streamStates.add(streamState);
            return streamState;
        } catch (e) {
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
        }
    }
    #openConn(client) {
        try {
            client ??= __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openWs"](this.#url, this.#authToken);
            return {
                client,
                useSqlCache: undefined,
                sqlCache: new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$sql_cache$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SqlCache"](client, 0),
                openTime: new Date(),
                streamStates: new Set()
            };
        } catch (e) {
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
        }
    }
    _closeStream(streamState) {
        streamState.stream.close();
        const connState = streamState.conn;
        connState.streamStates.delete(streamState);
        if (connState.streamStates.size === 0 && connState !== this.#connState) {
            // We are not using this connection anymore and this is the last stream that was using it, so we
            // must close it now.
            connState.client.close();
        }
    }
    close() {
        this.#connState.client.close();
        this.closed = true;
    }
}
class WsTransaction extends __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["HranaTransaction"] {
    #client;
    #streamState;
    /** @private */ constructor(client, state, mode, version){
        super(mode, version);
        this.#client = client;
        this.#streamState = state;
    }
    /** @private */ _getStream() {
        return this.#streamState.stream;
    }
    /** @private */ _getSqlCache() {
        return this.#streamState.conn.sqlCache;
    }
    close() {
        this.#client._closeStream(this.#streamState);
    }
    get closed() {
        return this.#streamState.stream.closed;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/http.js [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HttpClient",
    ()=>HttpClient,
    "HttpTransaction",
    ()=>HttpTransaction,
    "_createClient",
    ()=>_createClient,
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/hrana-client/lib-esm/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$config$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/config.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/hrana.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$sql_cache$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/sql_cache.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/uri.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/util.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$promise$2d$limit$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/promise-limit/index.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
function createClient(config) {
    return _createClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$config$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["expandConfig"])(config, true));
}
function _createClient(config) {
    if (config.scheme !== "https" && config.scheme !== "http") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]('The HTTP client supports only "libsql:", "https:" and "http:" URLs, ' + `got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supportedUrlLink"]}`, "URL_SCHEME_NOT_SUPPORTED");
    }
    if (config.encryptionKey !== undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
    }
    if (config.scheme === "http" && config.tls) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`A "http:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
    } else if (config.scheme === "https" && !config.tls) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"](`A "https:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
    }
    const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$uri$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBaseUrl"])(config.scheme, config.authority, config.path);
    return new HttpClient(url, config.authToken, config.intMode, config.fetch, config.concurrency);
}
const sqlCacheCapacity = 30;
class HttpClient {
    #client;
    protocol;
    #authToken;
    #promiseLimitFunction;
    /** @private */ constructor(url, authToken, intMode, customFetch, concurrency){
        this.#client = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$hrana$2d$client$2f$lib$2d$esm$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openHttp"](url, authToken, customFetch);
        this.#client.intMode = intMode;
        this.protocol = "http";
        this.#authToken = authToken;
        this.#promiseLimitFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$promise$2d$limit$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])(concurrency);
    }
    async limit(fn) {
        return this.#promiseLimitFunction(fn);
    }
    async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === 'string') {
            stmt = {
                sql: stmtOrSql,
                args: args || []
            };
        } else {
            stmt = stmtOrSql;
        }
        return this.limit(async ()=>{
            try {
                const hranaStmt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["stmtToHrana"])(stmt);
                // Pipeline all operations, so `hrana.HttpClient` can open the stream, execute the statement and
                // close the stream in a single HTTP request.
                let rowsPromise;
                const stream = this.#client.openStream();
                try {
                    rowsPromise = stream.query(hranaStmt);
                } finally{
                    stream.closeGracefully();
                }
                const rowsResult = await rowsPromise;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["resultSetFromHrana"])(rowsResult);
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            }
        });
    }
    async batch(stmts, mode = "deferred") {
        return this.limit(async ()=>{
            try {
                const hranaStmts = stmts.map(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["stmtToHrana"]);
                const version = await this.#client.getVersion();
                // Pipeline all operations, so `hrana.HttpClient` can open the stream, execute the batch and
                // close the stream in a single HTTP request.
                let resultsPromise;
                const stream = this.#client.openStream();
                try {
                    // It makes sense to use a SQL cache even for a single batch, because it may contain the same
                    // statement repeated multiple times.
                    const sqlCache = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$sql_cache$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SqlCache"](stream, sqlCacheCapacity);
                    sqlCache.apply(hranaStmts);
                    // TODO: we do not use a cursor here, because it would cause three roundtrips:
                    // 1. pipeline request to store SQL texts
                    // 2. cursor request
                    // 3. pipeline request to close the stream
                    const batch = stream.batch(false);
                    resultsPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["executeHranaBatch"])(mode, version, batch, hranaStmts);
                } finally{
                    stream.closeGracefully();
                }
                const results = await resultsPromise;
                return results;
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            }
        });
    }
    async transaction(mode = "write") {
        return this.limit(async ()=>{
            try {
                const version = await this.#client.getVersion();
                return new HttpTransaction(this.#client.openStream(), mode, version);
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            }
        });
    }
    async executeMultiple(sql) {
        return this.limit(async ()=>{
            try {
                // Pipeline all operations, so `hrana.HttpClient` can open the stream, execute the sequence and
                // close the stream in a single HTTP request.
                let promise;
                const stream = this.#client.openStream();
                try {
                    promise = stream.sequence(sql);
                } finally{
                    stream.closeGracefully();
                }
                await promise;
            } catch (e) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["mapHranaError"])(e);
            }
        });
    }
    sync() {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
    }
    close() {
        this.#client.close();
    }
    get closed() {
        return this.#client.closed;
    }
}
class HttpTransaction extends __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$hrana$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["HranaTransaction"] {
    #stream;
    #sqlCache;
    /** @private */ constructor(stream, mode, version){
        super(mode, version);
        this.#stream = stream;
        this.#sqlCache = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$sql_cache$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SqlCache"](stream, sqlCacheCapacity);
    }
    /** @private */ _getStream() {
        return this.#stream;
    }
    /** @private */ _getSqlCache() {
        return this.#sqlCache;
    }
    close() {
        this.#stream.close();
    }
    get closed() {
        return this.#stream.closed;
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/web.js [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_createClient",
    ()=>_createClient,
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/api.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$config$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/config.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/core/lib-esm/util.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$ws$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/ws.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$http$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@libsql/client/lib-esm/http.js [middleware-edge] (ecmascript) <locals>");
;
;
;
;
;
;
function createClient(config) {
    return _createClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$config$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["expandConfig"])(config, true));
}
function _createClient(config) {
    if (config.scheme === "ws" || config.scheme === "wss") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$ws$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_createClient"])(config);
    } else if (config.scheme === "http" || config.scheme === "https") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$2f$lib$2d$esm$2f$http$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_createClient"])(config);
    } else {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$api$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LibsqlError"]('The client that uses Web standard APIs supports only "libsql:", "wss:", "ws:", "https:" and "http:" URLs, ' + `got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$core$2f$lib$2d$esm$2f$util$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supportedUrlLink"]}`, "URL_SCHEME_NOT_SUPPORTED");
    }
}
}),
"[project]/Desktop/clock in:out/node_modules/promise-limit/index.js [middleware-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {

function limiter(count) {
    var outstanding = 0;
    var jobs = [];
    function remove() {
        outstanding--;
        if (outstanding < count) {
            dequeue();
        }
    }
    function dequeue() {
        var job = jobs.shift();
        semaphore.queue = jobs.length;
        if (job) {
            run(job.fn).then(job.resolve).catch(job.reject);
        }
    }
    function queue(fn) {
        return new Promise(function(resolve, reject) {
            jobs.push({
                fn: fn,
                resolve: resolve,
                reject: reject
            });
            semaphore.queue = jobs.length;
        });
    }
    function run(fn) {
        outstanding++;
        try {
            return Promise.resolve(fn()).then(function(result) {
                remove();
                return result;
            }, function(error) {
                remove();
                throw error;
            });
        } catch (err) {
            remove();
            return Promise.reject(err);
        }
    }
    var semaphore = function(fn) {
        if (outstanding >= count) {
            return queue(fn);
        } else {
            return run(fn);
        }
    };
    return semaphore;
}
function map(items, mapper) {
    var failed = false;
    var limit = this;
    return Promise.all(items.map(function() {
        var args = arguments;
        return limit(function() {
            if (!failed) {
                return mapper.apply(undefined, args).catch(function(e) {
                    failed = true;
                    throw e;
                });
            }
        });
    }));
}
function addExtras(fn) {
    fn.queue = 0;
    fn.map = map;
    return fn;
}
module.exports = function(count) {
    if (count) {
        return addExtras(limiter(count));
    } else {
        return addExtras(function(fn) {
            return fn();
        });
    }
};
}),
]);

//# sourceMappingURL=6bd82_3f3e23e9._.js.map