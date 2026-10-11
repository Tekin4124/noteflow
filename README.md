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
npm install
```

### 2. Sunucuyu Başlatın
```bash
npm start
```
Sunucu varsayılan olarak `http://localhost:3005` üzerinde çalışır.

### 3. Arayüzü Açın
`index.html` dosyasını tarayıcınızda açın veya Caddy / Nginx gibi bir web sunucusunda barındırın.
Örnek Caddy yapılandırması `Caddyfile` içinde mevcuttur.
