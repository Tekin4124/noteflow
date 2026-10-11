# Sihirli Not Defteri

Kullanıcıların meyve adlarıyla kayıt olup giriş yapabildiği, interaktif dijital not defteri uygulaması.

## 🌟 Özellikler
- **Ahşap Masa & Defter Arayüzü:** Gerçekçi sayfa geçişleri, font stilleri ve temalar.
- **Meyveli Giriş/Kayıt Sistemi:** Kullanıcılar takma ad olarak meyve isimleri ("Elma", "Çilek", "Ananas" vb.) seçer.
- **Güvenli Backend:** Node.js, Express, SQLite3 ve JWT token doğrulaması.
- **Kişisel Not Depolama:** Her kullanıcının notları ve defter verileri veritabanında ayrı saklanır.

## 🚀 Çalıştırma

### 1. Bağımlılıkları Kurun
```bash
npm ci
```

### 2. Sunucuyu Başlatın
```bash
npm start
```
Sunucu varsayılan olarak `http://localhost:3005` üzerinde çalışır.

Üretimde `NODE_ENV=production` ve kalıcı, rastgele bir `JWT_SECRET` tanımlayın. Anahtarı Git'e eklemeyin. Geliştirmede anahtar verilmezse geçici bir anahtar üretilir; yeniden başlatma mevcut oturumları geçersiz kılar.

Yeni parolalar tuzlu scrypt ile saklanır. Eski SHA-256 kayıtları başarılı girişte otomatik yükseltilir; notlar korunur. Parola işlemleri asenkron çalışır. Giriş/kayıt istekleri metin alanları bekler; kullanıcı adı en fazla 64 karakter, parola en fazla 1024 UTF-8 bayt olabilir.

Testler (Node.js 18 veya üzeri): `npm test`. API testleri geçici bir SQLite dosyası kullanır; uygulamanın `database.sqlite` verisine dokunmaz. İstenirse `DATABASE_PATH` ile veritabanı yolu değiştirilebilir.

### 3. Arayüzü Açın
`index.html` dosyasını tarayıcınızda açın veya Caddy / Nginx gibi bir web sunucusunda barındırın.
Örnek Caddy yapılandırması `Caddyfile` içinde mevcuttur.
