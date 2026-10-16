const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { validCredentials, hashPassword, verifyPassword, needsPasswordRehash } = require('./passwords');
const { cleanNotebook, rateLimit, MAX_NOTEBOOK_BYTES } = require('./security');
const app = express();
const production = process.env.NODE_ENV === 'production';
const SECRET_KEY = process.env.JWT_SECRET || (production ? '' : crypto.randomBytes(32).toString('hex'));
if (production && SECRET_KEY.length < 32) throw new Error('Üretimde en az 32 karakterlik JWT_SECRET zorunludur.');
const ORIGIN = process.env.PUBLIC_ORIGIN || '';
const allowedOrigins = [ORIGIN, process.env.PREVIEW_ORIGIN].filter(Boolean);
if (production && (!ORIGIN.startsWith('https://') || new URL(ORIGIN).origin !== ORIGIN)) throw new Error('Üretimde HTTPS PUBLIC_ORIGIN zorunludur.');
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'unix' ? true : process.env.TRUST_PROXY === 'loopback' ? 'loopback' : false);
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" });
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store');
    if (req.get('Sec-Fetch-Site') === 'cross-site' || (req.get('Origin') && ORIGIN && !allowedOrigins.includes(req.get('Origin')))) return res.status(403).json({ error: 'Bu kaynaktan istek kabul edilmiyor.' });
  }
  next();
});
app.get('/api/health', (req, res) => db.get('SELECT 1', err => res.status(err ? 503 : 200).json({ ok: !err })));
app.use('/api', rateLimit({ limit: 240, windowMs: 60000 }));
app.use(express.json({ limit: MAX_NOTEBOOK_BYTES + 16384 }));
const db = new sqlite3.Database(process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite'));
db.configure('busyTimeout', 5000);
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL'); db.run('PRAGMA foreign_keys = ON');
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, fruit_name TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)');
  db.run('CREATE TABLE IF NOT EXISTS notebooks (user_id INTEGER PRIMARY KEY, data_json TEXT, FOREIGN KEY(user_id) REFERENCES users(id))');
});
const get = (sql, args = []) => new Promise((resolve, reject) => db.get(sql, args, (err,row) => err ? reject(err) : resolve(row)));
const run = (sql, args = []) => new Promise((resolve, reject) => db.run(sql, args, function(err) { err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes }); }));
const fruits = ['Elma','Armut','Çilek','Kavun','Karpuz','Muz','Kiraz','İncir','Ananas','Mango','Kivi','Nar','Portakal','Limon','Üzüm'];
app.get('/api/fruits', (req, res) => res.json({ available: fruits, registered: [] }));
const authLimit = rateLimit({ limit: Number(process.env.AUTH_RATE_LIMIT || 20), windowMs: 15 * 60000 });
const registerLimit = rateLimit({ limit: Number(process.env.REGISTER_RATE_LIMIT || 5), windowMs: 3600000 });
let activeAuth = 0;
function authCapacity(req,res,next) {
  if(activeAuth >= 2) return res.status(503).set('Retry-After','5').json({error:'Giriş servisi meşgul. Biraz sonra tekrar deneyin.'});
  activeAuth++;let released=false;
  const release=()=>{if(!released){activeAuth--;released=true;}};
  res.once('finish',release);res.once('close',release);next();
}
const COOKIE = 'notebook_session';
function issueSession(res, user) {
  const token = jwt.sign({ id: user.id, fruit_name: user.fruit_name }, SECRET_KEY, { expiresIn: '7d', issuer: 'noteflow', audience: 'notebook' });
  res.cookie(COOKIE, token, { httpOnly: true, secure: production, sameSite: 'strict', maxAge: 7 * 86400000, path: '/' });
  return { token, fruit_name: user.fruit_name, user_id: user.id };
}
app.post('/api/register', authLimit, registerLimit, authCapacity, async (req, res) => {
  if (!validCredentials(req.body) || req.body.password.length < 8) return res.status(400).json({ error: 'Takma ad ve en az 8 karakterli şifre kullanın.' });
  const fruit_name = req.body.fruit_name.trim();
  try {
    const password_hash = await hashPassword(req.body.password);
    const result = await run('INSERT INTO users (fruit_name, password_hash) SELECT ?, ? WHERE (SELECT COUNT(*) FROM users) < ?', [fruit_name, password_hash, Number(process.env.MAX_ACCOUNTS || 5000)]);
    if (!result.changes) return res.status(503).json({ error: 'Yeni hesap kapasitesi dolu. Misafir olarak kullanabilirsiniz.' });
    res.json({ ...issueSession(res, { id: result.lastID, fruit_name }), message: 'Hesap oluşturuldu.' });
  } catch (err) {
    res.status(err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE') ? 400 : 500).json({ error: err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE') ? 'Bu takma ad kullanılıyor.' : 'Kayıt tamamlanamadı.' });
  }
});
app.post('/api/login', authLimit, authCapacity, async (req,res) => {
  if (!validCredentials(req.body)) return res.status(400).json({ error: 'Geçersiz giriş bilgisi.' });
  try {
    const row = await get('SELECT * FROM users WHERE fruit_name = ?', [req.body.fruit_name.trim()]);
    if (!row || !await verifyPassword(req.body.password, row.password_hash)) return res.status(401).json({ error: 'Takma ad veya şifre yanlış.' });
    if (needsPasswordRehash(row.password_hash)) await run('UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?', [await hashPassword(req.body.password), row.id, row.password_hash]);
    res.json({ ...issueSession(res,row), message: 'Giriş yapıldı.' });
  } catch (err) { res.status(500).json({ error: 'Giriş tamamlanamadı.' }); }
});
async function authenticate(req,res,next) {
  const bearer = /^Bearer (.+)$/.exec(req.get('Authorization') || '')?.[1];
  const cookie = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!bearer && !cookie) return res.status(401).json({ error: 'Oturum açın.' });
  try {
    const user = jwt.verify(bearer || cookie, SECRET_KEY, { algorithms: ['HS256'], issuer: ['noteflow', 'sihirli-not-defteri'], audience: 'notebook' });
    if (!await get('SELECT id FROM users WHERE id = ?', [user.id])) return res.status(401).json({ error: 'Oturum sona erdi.' });
    req.user = user; next();
  } catch (err) { res.status(401).json({ error: 'Oturum sona erdi. Yeniden giriş yapın.' }); }
}
app.get('/api/me', authenticate, (req,res) => res.json({ user_id: req.user.id, fruit_name: req.user.fruit_name }));
app.post('/api/logout', (req,res) => { res.clearCookie(COOKIE, { httpOnly: true, secure: production, sameSite: 'strict', path: '/' }); res.json({ success: true }); });
app.post('/api/sync', authenticate, async (req,res) => {
  const data = cleanNotebook(req.body);
  if (!data) return res.status(400).json({ error: 'Defter en fazla 120 sayfa ve 1 MB olabilir. Not yapısını kontrol edin.' });
  try { await run('INSERT INTO notebooks (user_id,data_json) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json', [req.user.id,JSON.stringify(data)]); res.json({ success:true }); }
  catch (err) { res.status(500).json({ error: 'Notlar kaydedilemedi.' }); }
});
app.get('/api/load', authenticate, async (req,res) => {
  try { const row = await get('SELECT data_json FROM notebooks WHERE user_id = ?', [req.user.id]); const data = row ? cleanNotebook(JSON.parse(row.data_json)) : null; res.json(data); }
  catch (err) { res.status(500).json({ error: 'Notlar yüklenemedi.' }); }
});
app.delete('/api/account', authenticate, async (req,res) => {
  try { await run('DELETE FROM notebooks WHERE user_id = ?', [req.user.id]); await run('DELETE FROM users WHERE id = ?', [req.user.id]); res.clearCookie(COOKIE, { httpOnly:true, secure:production, sameSite:'strict', path:'/' }); res.json({ success:true }); }
  catch (err) { res.status(500).json({ error:'Hesap silinemedi.' }); }
});
app.get('/', (req,res) => res.sendFile(path.join(__dirname,'index.html')));
for (const file of ['app.js','style.css','notebook-data.js']) app.get('/'+file, (req,res) => res.sendFile(path.join(__dirname,file)));
app.use('/vendor', express.static(path.join(__dirname,'vendor'), { dotfiles:'deny', fallthrough:false }));
app.use((err,req,res,next) => res.status(err.type === 'entity.too.large' ? 413 : err instanceof SyntaxError ? 400 : err.status || 500).json({ error: err.type === 'entity.too.large' ? 'Defter boyutu sınırını aştınız.' : 'İstek tamamlanamadı.' }));
if (require.main === module) {
  const target = process.env.SOCKET_PATH || Number(process.env.PORT || 3005);
  if (process.env.SOCKET_PATH && fs.existsSync(target)) fs.unlinkSync(target);
  const server = process.env.SOCKET_PATH ? app.listen(target, () => fs.chmodSync(target,0o660)) : app.listen(target, process.env.HOST || '127.0.0.1');
  server.requestTimeout = 15000; server.headersTimeout = 10000; server.maxHeadersCount = 50;
  process.on('SIGTERM', () => server.close(() => db.close(() => process.exit(0))));
}
module.exports = { app, db };
