const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const LEGACY_HASH = /^[a-f0-9]{64}$/i;
const SCRYPT_HASH = /^([a-f0-9]{32}):([a-f0-9]{128})$/i;

function validCredentials(body) {
    return Boolean(body && typeof body.fruit_name === 'string' &&
        body.fruit_name.trim().length > 0 && body.fruit_name.length <= 64 &&
        typeof body.password === 'string' && body.password.length > 0 &&
        Buffer.byteLength(body.password, 'utf8') <= 1024);
}

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await scrypt(password, salt, 64);
    return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    if (typeof password !== 'string' || !password ||
        Buffer.byteLength(password, 'utf8') > 1024 || typeof storedHash !== 'string') {
        return false;
    }
    if (LEGACY_HASH.test(storedHash)) {
        const actual = crypto.createHash('sha256').update(password).digest();
        return crypto.timingSafeEqual(actual, Buffer.from(storedHash, 'hex'));
    }
    const match = SCRYPT_HASH.exec(storedHash);
    if (!match) return false;
    const actual = await scrypt(password, match[1], 64);
    return crypto.timingSafeEqual(actual, Buffer.from(match[2], 'hex'));
}

function needsPasswordRehash(storedHash) {
    return typeof storedHash === 'string' && LEGACY_HASH.test(storedHash);
}

module.exports = { validCredentials, hashPassword, verifyPassword, needsPasswordRehash };
