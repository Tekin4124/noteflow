const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'notebook-auth-test-'));
process.env.DATABASE_PATH = path.join(directory, 'test.sqlite');
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
const { app, db } = require('../server');
let server;
let baseUrl;
const run = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, err => err ? reject(err) : resolve()));
const get = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
const post = (route, body) => fetch(baseUrl + route, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
});

before(async () => {
    await get('SELECT COUNT(*) FROM users');
    await new Promise(resolve => {
        server = app.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    await new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));
    fs.rmSync(directory, { recursive: true, force: true });
});

test('register and login work; malformed bodies do not terminate the server', async () => {
    const credentials = { fruit_name: 'Elma', password: 'test-password' };
    assert.equal((await post('/api/register', credentials)).status, 200);
    for (const route of ['/api/register', '/api/login']) {
        for (const password of [[], {}, true, 42, 'a'.repeat(1025)]) {
            assert.equal((await post(route, { fruit_name: 'Elma', password })).status, 400);
        }
        assert.equal((await post(route, {})).status, 400);
    }
    assert.equal((await post('/api/login', credentials)).status, 200);
    assert.equal((await post('/api/login', { ...credentials, password: 'wrong' })).status, 401);
    assert.equal((await post('/api/register', credentials)).status, 400);
});

test('successful legacy login upgrades hash without changing notebook contents', async () => {
    const oldHash = crypto.createHash('sha256').update('old-password').digest('hex');
    await run('INSERT INTO users (fruit_name, password_hash) VALUES (?, ?)', ['Armut', oldHash]);
    const user = await get('SELECT id FROM users WHERE fruit_name = ?', ['Armut']);
    const notebook = JSON.stringify({ pages: [{ content: 'Synthetic test note' }] });
    await run('INSERT INTO notebooks (user_id, data_json) VALUES (?, ?)', [user.id, notebook]);
    assert.equal((await post('/api/login', { fruit_name: 'Armut', password: 'wrong' })).status, 401);
    assert.equal((await get('SELECT password_hash FROM users WHERE id = ?', [user.id])).password_hash, oldHash);
    const response = await post('/api/login', { fruit_name: 'Armut', password: 'old-password' });
    assert.equal(response.status, 200);
    const { token } = await response.json();
    const upgraded = await get('SELECT password_hash FROM users WHERE id = ?', [user.id]);
    assert.match(upgraded.password_hash, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
    assert.notEqual(upgraded.password_hash, oldHash);
    assert.equal((await post('/api/login', { fruit_name: 'Armut', password: 'old-password' })).status, 200);
    const loaded = await fetch(baseUrl + '/api/load', { headers: { Authorization: 'Bearer ' + token } });
    assert.deepEqual(await loaded.json(), JSON.parse(notebook));
});

test('malformed stored password rejects login; database errors return 500', async () => {
    await run('INSERT INTO users (fruit_name, password_hash) VALUES (?, ?)', ['Muz', 'salt:00']);
    assert.equal((await post('/api/login', { fruit_name: 'Muz', password: 'password' })).status, 401);
    await run('CREATE TRIGGER reject_test_insert BEFORE INSERT ON users BEGIN SELECT RAISE(ABORT, "test failure"); END');
    try {
        assert.equal((await post('/api/register', { fruit_name: 'Kiraz', password: 'password' })).status, 500);
    } finally {
        await run('DROP TRIGGER reject_test_insert');
    }
    assert.equal((await post('/api/login', { fruit_name: 'Elma', password: 'test-password' })).status, 200);
});

test('failed legacy migration returns an error without issuing a token or altering the hash', async () => {
    const oldHash = crypto.createHash('sha256').update('old-password').digest('hex');
    await run('INSERT INTO users (fruit_name, password_hash) VALUES (?, ?)', ['Kivi', oldHash]);
    await run('CREATE TRIGGER reject_test_update BEFORE UPDATE ON users BEGIN SELECT RAISE(ABORT, "test failure"); END');
    try {
        const response = await post('/api/login', { fruit_name: 'Kivi', password: 'old-password' });
        assert.equal(response.status, 500);
        assert.equal((await response.json()).token, undefined);
        assert.equal((await get('SELECT password_hash FROM users WHERE fruit_name = ?', ['Kivi'])).password_hash, oldHash);
    } finally {
        await run('DROP TRIGGER reject_test_update');
    }
    assert.equal((await post('/api/login', { fruit_name: 'Kivi', password: 'old-password' })).status, 200);
});
