const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');

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

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

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

// Güvenli tuzlu (salted) scrypt parola hashleme
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

// Zamanlama saldırılarına karşı korumalı (timingSafeEqual) parola doğrulama
function verifyPassword(password, storedHash) {
    if (!storedHash) return false;
    // Geriye dönük uyumluluk (eski tuzsuz SHA-256 hash'ler için)
    if (!storedHash.includes(':')) {
        const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
        return legacyHash === storedHash;
    }
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// Get fruits for dropdowns
app.get('/api/fruits', (req, res) => {
    db.all(`SELECT fruit_name FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Sunucu hatası" });
        const registered = rows.map(r => r.fruit_name);
        const available = ALL_FRUITS.filter(f => !registered.includes(f));
        res.json({ available, registered });
    });
});

app.post('/api/register', (req, res) => {
    const { fruit_name, password } = req.body;
    if (!fruit_name || !password) return res.status(400).json({ error: "Eksik bilgi!" });

    const password_hash = hashPassword(password);
    
    db.run(`INSERT INTO users (fruit_name, password_hash) VALUES (?, ?)`, [fruit_name, password_hash], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Bu meyve zaten alınmış!" });
            }
            return res.status(500).json({ error: "Kayıt hatası." });
        }
        const token = jwt.sign({ id: this.lastID, fruit_name }, SECRET_KEY);
        res.json({ token, fruit_name, message: "Hesap oluşturuldu!" });
    });
});

app.post('/api/login', (req, res) => {
    const { fruit_name, password } = req.body;
    if (!fruit_name || !password) return res.status(400).json({ error: "Eksik bilgi!" });

    db.get(`SELECT id, fruit_name, password_hash FROM users WHERE fruit_name = ?`, [fruit_name], (err, row) => {
        if (err) return res.status(500).json({ error: "Giriş hatası." });
        if (!row || !verifyPassword(password, row.password_hash)) {
            return res.status(401).json({ error: "Yanlış şifre!" });
        }

        const token = jwt.sign({ id: row.id, fruit_name: row.fruit_name }, SECRET_KEY);
        res.json({ token, fruit_name: row.fruit_name, message: "Giriş yapıldı!" });
    });
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

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
