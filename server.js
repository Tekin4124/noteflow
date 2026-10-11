const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const { validCredentials, hashPassword, verifyPassword, needsPasswordRehash } = require('./passwords');

const app = express();
const PORT = process.env.PORT || 3005; 
const SECRET_KEY = process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: Production ortamında JWT_SECRET ortam değişkeni zorunludur!');
        process.exit(1);
    }
    console.warn('⚠️ Geliştirme Uyarısı: JWT_SECRET tanımlanmadı, oturum güvenliği için rastgele anahtar üretildi.');
    return crypto.randomBytes(32).toString('hex');
})();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const db = new sqlite3.Database(process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite'));

function dbGet(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });
}

function dbRun(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fruit_name TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS notebooks (
        user_id INTEGER PRIMARY KEY,
        data_json TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

const ALL_FRUITS = [
    "Elma", "Armut", "Çilek", "Kavun", "Karpuz", "Muz", "Kiraz", "İncir", "Vişne", 
    "Ananas", "Mango", "Kivi", "Erik", "Şeftali", "Kayısı", "Nar", "Mandalina", 
    "Portakal", "Limon", "Greyfurt", "Ayva", "Böğürtlen", "Ahududu", "Yaban Mersini", 
    "Kızılcık", "Dut", "Hurma", "Avokado", "Hindistan Cevizi", "Papaya", 
    "Ejder Meyvesi", "Kumkuat", "Üzüm", "Kestane"
];

// Get fruits for dropdowns
app.get('/api/fruits', (req, res) => {
    db.all(`SELECT fruit_name FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Sunucu hatası" });
        const registered = rows.map(r => r.fruit_name);
        const available = ALL_FRUITS.filter(f => !registered.includes(f));
        res.json({ available, registered });
    });
});

app.post('/api/register', async (req, res) => {
    if (!validCredentials(req.body)) return res.status(400).json({ error: "Geçersiz giriş bilgisi!" });
    const { fruit_name, password } = req.body;
    try {
        const password_hash = await hashPassword(password);
        const result = await dbRun(`INSERT INTO users (fruit_name, password_hash) VALUES (?, ?)`, [fruit_name, password_hash]);
        const token = jwt.sign({ id: result.lastID, fruit_name }, SECRET_KEY);
        res.json({ token, fruit_name, message: "Hesap oluşturuldu!" });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Bu meyve zaten alınmış!" });
        }
        return res.status(500).json({ error: "Kayıt hatası." });
    }
});

app.post('/api/login', async (req, res) => {
    if (!validCredentials(req.body)) return res.status(400).json({ error: "Geçersiz giriş bilgisi!" });
    const { fruit_name, password } = req.body;
    try {
        const row = await dbGet(`SELECT id, fruit_name, password_hash FROM users WHERE fruit_name = ?`, [fruit_name]);
        if (!row || !await verifyPassword(password, row.password_hash)) {
            return res.status(401).json({ error: "Yanlış şifre!" });
        }
        if (needsPasswordRehash(row.password_hash)) {
            const upgradedHash = await hashPassword(password);
            await dbRun(`UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?`,
                [upgradedHash, row.id, row.password_hash]);
        }
        const token = jwt.sign({ id: row.id, fruit_name: row.fruit_name }, SECRET_KEY);
        res.json({ token, fruit_name: row.fruit_name, message: "Giriş yapıldı!" });
    } catch (err) {
        return res.status(500).json({ error: "Giriş hatası." });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/api/sync', authenticateToken, (req, res) => {
    const data_json = JSON.stringify(req.body);
    const user_id = req.user.id;
    db.run(`INSERT INTO notebooks (user_id, data_json) VALUES (?, ?) 
            ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json`, 
            [user_id, data_json], (err) => {
        if (err) return res.status(500).json({ error: "Kayıt başarısız." });
        res.json({ success: true });
    });
});

app.get('/api/load', authenticateToken, (req, res) => {
    db.get(`SELECT data_json FROM notebooks WHERE user_id = ?`, [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: "Yükleme hatası." });
        if (!row) return res.json(null); 
        try { res.json(JSON.parse(row.data_json)); } catch(e) { res.json(null); }
    });
});

if (require.main === module) {
    app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
}

module.exports = { app, db };
