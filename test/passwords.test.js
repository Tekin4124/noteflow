const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { validCredentials, hashPassword, verifyPassword, needsPasswordRehash } = require('../passwords');

test('scrypt verifies passwords and produces independent salts', async () => {
    const hash = await hashPassword('synthetic-password');
    assert.equal(await verifyPassword('synthetic-password', hash), true);
    assert.equal(await verifyPassword('wrong-password', hash), false);
    assert.notEqual(await hashPassword('synthetic-password'), hash);
    assert.equal(needsPasswordRehash(hash), false);
});

test('legacy hashes are verified safely and identified for upgrade', async () => {
    const hash = crypto.createHash('sha256').update('old-password').digest('hex');
    assert.equal(await verifyPassword('old-password', hash), true);
    assert.equal(await verifyPassword('wrong-password', hash), false);
    assert.equal(needsPasswordRehash(hash), true);
});

test('invalid credential types and excessive lengths are rejected', () => {
    for (const password of [[], {}, 42, true, null, '', 'a'.repeat(1025), '💡'.repeat(257)]) {
        assert.equal(validCredentials({ fruit_name: 'Elma', password }), false);
    }
    for (const fruit_name of [[], {}, null, '', ' ', 'a'.repeat(65)]) {
        assert.equal(validCredentials({ fruit_name, password: 'password' }), false);
    }
    assert.equal(validCredentials(null), false);
    assert.equal(validCredentials({ fruit_name: 'Elma', password: 'password' }), true);
});

test('malformed stored hashes and invalid passwords return false without throwing', async () => {
    for (const hash of [null, {}, '', 'salt:00', 'a'.repeat(32) + ':' + 'z'.repeat(128), 'a'.repeat(64) + ':']) {
        assert.equal(await verifyPassword('password', hash), false);
    }
    const hash = await hashPassword('password');
    for (const password of [[], {}, 42, null, 'a'.repeat(1025)]) {
        assert.equal(await verifyPassword(password, hash), false);
    }
});
