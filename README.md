# 🚀 CV Başvuru Sistemi - Kurumsal Düzeyde Uygulama

## 📋 Genel Bakış

Modern teknolojiler ve temiz mimari prensipleriyle geliştirilmiş kurumsal düzeyde CV başvuru yönetim sistemi. Bu sistem, şirketlerin iş başvurularını yapay zeka destekli CV eşleştirme, otomatik iş akışları ve kapsamlı başvuru takibi ile verimli bir şekilde yönetmesini sağlar.

## ⚡ Hızlı Başlangıç

```bash
# Depoyu klonlayın
git clone <repository-url>
cd cv-application-system

# Ortam değişkenlerini yapılandırın
cp .env.example .env
# .env dosyasını kimlik bilgilerinizle düzenleyin

# Tüm servisleri başlatın
docker-compose up -d

# Uygulamaya erişin
Frontend: http://localhost:80
Backend API: http://localhost:3000
Admin Paneli: http://localhost:80 (Admin Girişi'ne tıklayın)
RabbitMQ Yönetimi: http://localhost:15672
```

**Varsayılan Admin Kimlik Bilgileri:**
- Email: `admin@company.com`
- Şifre: `Admin123!`

## 🛠️ Teknoloji Stack'i

### Backend
- **Çalışma Ortamı:** Node.js 18 (Saf JavaScript)
- **Framework:** Express.js
- **Veritabanı:** MySQL 8.0.35
- **Önbellek:** Redis 7.2.3
- **Mesaj Kuyruğu:** RabbitMQ 3.12.10
- **Bulut Depolama:** Oracle Cloud Object Storage

### Frontend
- **Framework:** React 18.3.1 (Saf JavaScript)
- **HTTP İstemcisi:** Axios
- **Tasarım:** Saf CSS3 (Tamamen Duyarlı)

### Altyapı
- **Konteynerizasyon:** Docker & Docker Compose
- **Ters Proxy:** Nginx 1.25.3
- **CI/CD:** GitHub Actions
- **Kod Analizi:** CodeQL, Trivy, npm audit

### Harici Servisler
- **AI Eşleştirme:** OpenRouter API
- **Kötü Amaçlı Yazılım Tarama:** VirusTotal API
- **E-posta:** Nodemailer ile SMTP
- **Yedekleme:** Oracle Cloud Object Storage

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Port 80/443)                       │
│              Ters Proxy & Yük Dengeleyici                    │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
        ┌────────▼────────┐         ┌────────▼────────┐
        │   Frontend       │         │   Backend API    │
        │   React 18       │         │   Express.js     │
        │   (Port 3001)    │         │   (Port 3000)    │
        └──────────────────┘         └────────┬─────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                  ┌─────▼─────┐        ┌─────▼─────┐        ┌─────▼─────┐
                  │   MySQL    │        │   Redis   │        │ RabbitMQ  │
                  │ Veritabanı │        │  Önbellek │        │   Kuyruk  │
                  │  (3306)    │        │  (6379)   │        │  (5672)   │
                  └────────────┘        └───────────┘        └─────┬─────┘
                                                                    │
                                                        ┌───────────┴───────────┐
                                                        │                       │
                                                  ┌─────▼─────┐         ┌─────▼─────┐
                                                  │   Email   │         │  Yedek    │
                                                  │  Worker   │         │  Worker   │
                                                  └─────┬─────┘         └─────┬─────┘
                                                        │                     │
                                                  ┌─────▼─────┐         ┌─────▼──────┐
                                                  │Nodemailer │         │   Oracle   │
                                                  │   SMTP    │         │   Cloud    │
                                                  └───────────┘         └────────────┘
```

## 📁 Proje Yapısı

```
cv-application-system/
├── backend/
│   ├── server.js                         # Uygulama giriş noktası
│   ├── config/
│   │   ├── database.js                   # MySQL bağlantı havuzu
│   │   ├── redis.js                      # Redis istemcisi
│   │   └── rabbitmq.js                   # RabbitMQ servisi
│   ├── middleware/
│   │   ├── auth.js                       # JWT kimlik doğrulama
│   │   ├── security.js                   # XSS, injection önleme
│   │   ├── validator.js                  # Girdi doğrulama
│   │   ├── errorHandler.js               # Hata yönetimi
│   │   └── fileUpload.js                 # Multer yapılandırması
│   ├── routes/
│   │   ├── auth.js                       # Kimlik doğrulama endpoint'leri
│   │   ├── application.js                # CV gönderimi
│   │   ├── admin.js                      # Admin işlemleri
│   │   └── user.js                       # Kullanıcı işlemleri
│   ├── services/
│   │   ├── emailService.js               # E-posta gönderimi
│   │   ├── openRouterService.js          # AI CV eşleştirme
│   │   ├── virusScanService.js           # VirusTotal kötü amaçlı yazılım tarama
│   │   └── oracleCloudService.js         # Bulut yedekleme
│   ├── workers/
│   │   ├── emailWorker.js                # Arka plan e-posta işleyici
│   │   └── backupWorker.js               # Arka plan yedekleme işleyici
│   ├── utils/
│   │   └── logger.js                     # Winston loglama
│   ├── database/
│   │   └── init.sql                      # Veritabanı şeması
│   └── __tests__/
│       └── security.test.js              # Testler
├── frontend/
│   ├── src/
│   │   ├── App.js                        # Ana uygulama
│   │   └── components/
│   │       ├── ApplicationForm.js        # CV gönderim formu
│   │       ├── AdminLogin.js             # OTP ile admin girişi
│   │       ├── AdminDashboard.js         # Admin paneli
│   │       ├── UserLogin.js              # Kullanıcı girişi
│   │       └── UserRegister.js           # Kullanıcı kaydı
│   └── public/
│       └── index.html                    # HTML şablonu
├── nginx/
│   └── nginx.conf                        # Ters proxy yapılandırması
├── scripts/
│   ├── setup.sh                          # Otomatik kurulum
│   ├── test-security.js                  # Testler
│   └── encode-oci-key.js                 # Oracle anahtar kodlayıcı
├── .github/workflows/
│   └── security-scan.yml                 # CI/CD pipeline
├── docker-compose.yml                    # Docker orkestrasyon
└── README.md                             # Bu dosya
```

## 🎯 Temel Özellikler

### 1. CV Başvuru Yönetimi
- PDF yükleme ile genel CV gönderimi
- OpenRouter ile gerçek zamanlı AI destekli CV analizi
- İş gereksinimleri karşısında eşleşme puanlama (0-100)
- Otomatik e-posta onayları
- Başvuru durumu takibi
- Güvenli dosya depolama ve doğrulama

### 2. AI Destekli CV Eşleştirme
- OpenRouter AI modelleri entegrasyonu
- Akıllı CV ve iş tanımı eşleştirmesi
- Otomatik puanlama ve öneriler
- Güçlü yönler ve eksiklikler analizi
- Doğal dil işleme
- Prompt injection koruması

### 3. Admin Kontrol Paneli
- Kapsamlı başvuru inceleme arayüzü
- Durum, pozisyon ve tarihe göre filtreleme
- AI içgörüleri ile detaylı başvuru görünümü
- Otomatik e-postalarla Kabul/Reddet fonksiyonu
- İstatistik panosu (toplam, bekleyen, kabul edilen, reddedilen)
- Ortalama eşleşme puanı analitiği
- Pozisyona göre başvuru dağılımı
- Oracle Cloud'a tek tıkla veritabanı yedekleme
- Admin notları ve denetim kaydı

### 4. Kimlik Doğrulama ve Yetkilendirme
- Yenileme token'ları ile JWT tabanlı kimlik doğrulama
- Adminler için OTP (Tek Kullanımlık Şifre) iki faktörlü kimlik doğrulama
- Rol tabanlı erişim kontrolü (RBAC)
- Çıkışta token kara listeye alma
- Redis ile oturum yönetimi
- Bcrypt şifre hashleme (10 round)
- Güvenli oturum zaman aşımı
- Token süre sonu işleme

### 5. E-posta Sistemi
- Profesyonel HTML e-posta şablonları
- Başvuru gönderiminde otomatik onaylar
- Admin girişi için OTP teslimatı
- Durum güncelleme bildirimleri (Kabul/Red)
- Özel admin mesajları
- RabbitMQ ile kuyruk tabanlı işleme
- Başarısız teslimatlar için yeniden deneme mekanizması
- SMTP ile Nodemailer entegrasyonu

### 6. Dosya Yükleme ve Doğrulama
- Sıkı doğrulama ile yalnızca PDF yüklemeleri
- Magic number doğrulama (sadece uzantı kontrolü değil)
- Kötü amaçlı yazılım tarama için VirusTotal API entegrasyonu
- PDF'lerde JavaScript tespiti
- PDF'lerde otomatik eylem tespiti
- Dosya boyutu sınırları (maksimum 5MB)
- Güvenli geçici dosya işleme
- Otomatik temizleme
- Virüs tarama sonuçları loglama

### 7. Bulut Yedekleme Sistemi
- Oracle Cloud'a otomatik CV yedekleme
- Talep üzerine veritabanı yedekleme
- RabbitMQ aracılığıyla asenkron işleme
- Kimlik doğrulama ile güvenli nesne depolama
- Versiyon kontrolü ve saklama
- Yüksek erişilebilirlik
- Yedekleme doğrulama ve loglama
- Hata işleme ve yeniden deneme mantığı

### 8. Mesaj Kuyruğu İşleme
- **E-posta Kuyruğu**: Asenkron e-posta gönderimi
- **Yedekleme Kuyruğu**: Bulut yükleme işlemleri
- **Virüs Tarama Kuyruğu**: Dosya analiz görevleri
- Hata toleransı ve mesaj kalıcılığı
- Worker ölçeklenebilirliği
- Yük dengeleme
- Dead letter queue işleme

### 9. Önbellekleme Katmanı (Redis)
- 10 dakika TTL ile OTP depolama
- JWT token kara liste
- Hız sınırlama sayaçları
- Oturum önbelleği
- Sorgu sonucu önbellekleme
- Hızlı bellek içi işlemler
- Otomatik süre sonu

### 10. Kullanıcı Yönetimi
- E-posta doğrulama ile kullanıcı kaydı
- JWT ile güvenli giriş
- Şifre gücü doğrulama
- Profil yönetimi
- Başvuru geçmişi takibi
- E-posta bildirimleri
- Hesap yönetimi

## 🔧 Kurulum ve Yapılandırma

### Ön Gereksinimler

- Docker & Docker Compose
- Node.js 18+ (yerel geliştirme için)
- Git
- Oracle Cloud Hesabı (yedekleme özelliği için)
- OpenRouter API Anahtarı
- VirusTotal API Anahtarı
- SMTP Sunucu kimlik bilgileri

### Adım 1: Depoyu Klonlayın

```bash
git clone <repository-url>
cd cv-application-system
```

### Adım 2: Ortam Yapılandırması

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve yapılandırın:

```bash
# Veritabanı
DB_HOST=mysql
DB_PORT=3306
DB_USER=cvapp_user
DB_PASSWORD=<güçlü-şifreniz>
DB_NAME=cv_application_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<güçlü-şifreniz>

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=<güçlü-şifreniz>

# JWT (Şununla oluşturun: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=<64-karakterli-hex-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=<64-karakterli-hex-string>
JWT_REFRESH_EXPIRES_IN=7d

# OpenRouter API
OPENROUTER_API_KEY=<openrouter-api-anahtarınız>
OPENROUTER_API_URL=https://openrouter.ai/api/v1

# Oracle Cloud
OCI_NAMESPACE=<namespace-değeriniz>
OCI_BUCKET_NAME=cv-matching-backups
OCI_REGION=eu-frankfurt-1
OCI_TENANCY_ID=<tenancy-ocid-değeriniz>
OCI_USER_ID=<user-ocid-değeriniz>
OCI_FINGERPRINT=<anahtar-fingerprint-değeriniz>
OCI_PRIVATE_KEY_BASE64=<base64-kodlu-private-key>

# E-posta (Gmail örneği)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<email-adresiniz@gmail.com>
SMTP_PASSWORD=<uygulama-şifreniz>
EMAIL_FROM=noreply@company.com

# VirusTotal
VIRUSTOTAL_API_KEY=<virustotal-api-anahtarınız>

# Uygulama
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000
```

### Adım 3: Oracle Cloud Kurulumu

1. Oracle Cloud hesabı oluşturun: https://cloud.oracle.com
2. Object Storage → Buckets'a gidin
3. `cv-matching-backups` adında bucket oluşturun
4. API anahtarları oluşturun (User Settings → API Keys → Add API Key)
5. Private key'i indirin (.pem dosyası)
6. Private key'i base64'e kodlayın:

```bash
node scripts/encode-oci-key.js /path/to/your-key.pem
```

7. Base64 çıktısını .env dosyasındaki `OCI_PRIVATE_KEY_BASE64`'e kopyalayın
8. Namespace, tenancy ID, user ID, fingerprint değerlerini .env'e kopyalayın

### Adım 4: Servisleri Başlatın

```bash
# Tüm konteynerleri oluşturun ve başlatın
docker-compose up -d

# Servislerin çalıştığını doğrulayın
docker-compose ps

# Logları görüntüleyin
docker-compose logs -f backend
```

Başlatılan servisler:
- MySQL (port 3306)
- Redis (port 6379)
- RabbitMQ (port 5672, 15672)
- Backend (port 3000)
- Frontend (port 3001)
- Nginx (port 80, 443)

### Adım 5: Veritabanını Başlatın

Veritabanı otomatik olarak `backend/database/init.sql` şemasıyla başlatılır

Varsayılan admin:
- Email: admin@company.com
- Şifre: Admin123!

### Adım 6: Uygulamaya Erişin

- **Ana Uygulama**: http://localhost:80
- **Admin Paneli**: http://localhost:80 → "Admin Girişi"ne tıklayın
- **Backend API**: http://localhost:3000/api
- **RabbitMQ Yönetimi**: http://localhost:15672 (admin / RabbitPass123!ChangeMe)
- **Sağlık Kontrolü**: http://localhost:3000/health

## 🚢 Production Dağıtımı

### SSL/TLS Kurulumu

1. SSL sertifikaları edinin (Let's Encrypt önerilir):

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

2. Sertifikaları kopyalayın:

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

3. HTTPS'yi etkinleştirmek için nginx.conf'u güncelleyin
4. Nginx'i yeniden başlatın:

```bash
docker-compose restart nginx
```

### Güvenlik Duvarı Yapılandırması

```bash
# HTTP/HTTPS'ye izin ver
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Servislere doğrudan erişimi engelle
sudo ufw deny 3000/tcp   # Backend
sudo ufw deny 3306/tcp   # MySQL
sudo ufw deny 6379/tcp   # Redis
sudo ufw deny 5672/tcp   # RabbitMQ

sudo ufw enable
```

### Ortam Değişkenleri

```bash
# Production modunu ayarla
NODE_ENV=production

# Güçlü şifreler kullan (32+ karakter)
# Şununla oluştur: openssl rand -hex 32

# Yalnızca HTTPS'yi etkinleştir
# Uygun CORS origin'lerini yapılandır
# Güvenli cookie flag'lerini ayarla
```

### Otomatik Yedeklemeler

Yedekleme scripti oluşturun:

```bash
cat > /opt/cv-application/scripts/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD cv_application_db > /backup/db_$DATE.sql
find /backup -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/cv-application/scripts/backup-db.sh
```

Günlük yedekleme zamanlayın:

```bash
sudo crontab -e
# Ekle: 0 2 * * * /opt/cv-application/scripts/backup-db.sh
```

## 📡 API Dokümantasyonu

### Genel Endpoint'ler

#### CV Başvurusu Gönder

```http
POST /api/applications/submit
Content-Type: multipart/form-data

Parametreler:
- fullName: string (zorunlu, 2-100 karakter)
- email: string (zorunlu, geçerli email)
- phone: string (zorunlu, 10-15 rakam)
- position: string (zorunlu)
- experience: number (zorunlu, 0-50)
- coverLetter: string (opsiyonel, maks 2000 karakter)
- cv: file (zorunlu, PDF, maks 5MB)

Yanıt 201:
{
  "message": "Başvuru başarıyla gönderildi",
  "applicationId": 123,
  "matchScore": 85,
  "recommendation": "ACCEPT"
}
```

#### Başvuru Durumu Sorgula

```http
GET /api/applications/status/:applicationId

Yanıt 200:
{
  "id": 123,
  "full_name": "Ahmet Yılmaz",
  "position": "Yazılım Geliştirici",
  "status": "PENDING",
  "match_score": 85,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Kimlik Doğrulama Endpoint'leri

#### Admin Girişi (Adım 1: OTP Gönder)

```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@company.com",
  "password": "Admin123!"
}

Yanıt 200:
{
  "message": "OTP e-postanıza gönderildi",
  "requiresOTP": true
}
```

#### Admin Girişi (Adım 2: OTP Doğrula)

```http
POST /api/auth/verify-otp
Content-Type: application/json

Body:
{
  "email": "admin@company.com",
  "otp": "123456"
}

Yanıt 200:
{
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

#### Çıkış Yap

```http
POST /api/auth/logout
Authorization: Bearer <token>

Yanıt 200:
{
  "message": "Başarıyla çıkış yapıldı"
}
```

### Admin Endpoint'leri

Tüm admin endpoint'leri Authorization header'ında JWT token gerektirir.

#### Tüm Başvuruları Listele

```http
GET /api/admin/applications?status=PENDING&page=1&limit=20
Authorization: Bearer <token>

Sorgu Parametreleri:
- status: PENDING | ACCEPTED | REJECTED (opsiyonel)
- position: string (opsiyonel)
- page: number (varsayılan: 1)
- limit: number (varsayılan: 20)

Yanıt 200:
{
  "applications": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

#### Başvuru Detayını Getir

```http
GET /api/admin/applications/:id
Authorization: Bearer <token>

Yanıt 200:
{
  "id": 123,
  "full_name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "phone": "5551234567",
  "position": "Yazılım Geliştirici",
  "experience": 5,
  "cover_letter": "...",
  "cv_path": "uploads/cv/123456.pdf",
  "match_score": 85,
  "ai_analysis": "Güçlü teknik beceriler...",
  "recommendation": "ACCEPT",
  "status": "PENDING",
  "admin_note": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Başvuru Durumunu Güncelle

```http
PUT /api/admin/applications/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "ACCEPTED",
  "adminNote": "Harika aday!"
}

Yanıt 200:
{
  "message": "Başvuru durumu başarıyla güncellendi",
  "status": "ACCEPTED"
}
```

#### İstatistikleri Getir

```http
GET /api/admin/statistics
Authorization: Bearer <token>

Yanıt 200:
{
  "overall": {
    "total": 100,
    "pending": 45,
    "accepted": 30,
    "rejected": 25,
    "avg_match_score": 72.5
  },
  "byPosition": [
    {
      "position": "Yazılım Geliştirici",
      "count": 65
    }
  ]
}
```

#### Veritabanı Yedekle

```http
POST /api/admin/backup
Authorization: Bearer <token>

Yanıt 200:
{
  "message": "Veritabanı yedekleme başarıyla tamamlandı",
  "success": true,
  "objectName": "cv-backups/1234567890-db-backup.json",
  "url": "https://objectstorage..."
}
```

#### İş Pozisyonlarını Yönet

```http
GET /api/admin/jobs
Authorization: Bearer <token>

Yanıt 200:
{
  "jobs": [
    {
      "id": 1,
      "title": "Yazılım Geliştirici",
      "description": "...",
      "requirements": "...",
      "active": 1,
      "application_count": 45
    }
  ]
}
```

```http
POST /api/admin/jobs
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Kıdemli Geliştirici",
  "description": "İş tanımı",
  "requirements": "Gerekli beceriler"
}

Yanıt 201:
{
  "message": "İş pozisyonu başarıyla eklendi",
  "jobId": 5
}
```

```http
DELETE /api/admin/jobs/:id
Authorization: Bearer <token>

Yanıt 200:
{
  "message": "İş pozisyonu başarıyla silindi",
  "applicationsAffected": 12
}
```

### Hız Sınırlama

- Genel endpoint'ler: IP başına 15 dakikada 100 istek
- Kimlik doğrulamalı endpoint'ler: JWT kimlik doğrulaması ile korunur

### Hata Yanıtları

```json
// 400 Bad Request
{
  "error": "Doğrulama başarısız",
  "details": [...]
}

// 401 Unauthorized
{
  "error": "Geçersiz veya süresi dolmuş token"
}

// 403 Forbidden
{
  "error": "Admin erişimi gerekli"
}

// 404 Not Found
{
  "error": "Kaynak bulunamadı"
}

// 429 Too Many Requests
{
  "error": "Bu IP'den çok fazla istek"
}

// 500 Internal Server Error
{
  "error": "Sunucu hatası"
}
```

## 🧪 Test ve Kalite Güvencesi

### Testleri Çalıştırma

```bash
# Tüm testler
npm test

# Güvenlik testleri
npm run test:security

# Kapsama raporu
npm run test:coverage

# Kodu lint'le
npm run lint
```

### Güvenlik Açıklarını Kontrol Etme

```bash
# npm audit
npm audit

# Docker imaj taraması
docker scan cv-application-system_backend:latest

# Bağımlılıkları kontrol et
npm outdated
```

### CI/CD Pipeline

GitHub Actions iş akışı otomatik olarak çalıştırır:
- CodeQL güvenlik analizi
- Bağımlılık güvenlik açığı taraması
- Docker imaj güvenlik taraması (Trivy)
- Birim ve entegrasyon testleri
- Build doğrulaması
- Lint kontrolleri

## 📊 İzleme ve Loglama

### Log Dosyaları

```bash
# Backend logları
docker-compose logs -f backend

# Tüm servisler
docker-compose logs -f

# Belirli servis
docker-compose logs -f mysql
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

### Sağlık Kontrolleri

```bash
# API sağlık kontrolü
curl http://localhost:3000/health

# Docker servis durumu
docker-compose ps

# Konteyner istatistikleri
docker stats
```

### Uygulama Metrikleri

- İstek sayısı ve yanıt süreleri
- Hata oranları ve tipleri
- Kuyruk uzunlukları
- Veritabanı bağlantıları
- Önbellek isabet oranları
- Dosya yükleme boyutları

### RabbitMQ İzleme

Yönetim UI'sine erişin: http://localhost:15672

- Kuyruk mesaj sayıları
- Consumer durumu
- Mesaj oranları
- Bağlantı durumu

## 🔒 Temiz Kod ve Mimari

### Tasarım Prensipleri

**Tek Sorumluluk Prensibi**
- Her modül bir endişeyi ele alır
- Servisler belirli iş mantığına odaklanır
- Middleware tek görevler gerçekleştirir
- Route'lar yalnızca HTTP mantığını yönetir

**DRY (Kendini Tekrar Etme)**
- Paylaşılan yardımcı araçlar ve helper'lar
- Yeniden kullanılabilir middleware fonksiyonları
- Servis katmanı soyutlaması
- Ortak doğrulama şemaları

**Endişelerin Ayrılması**
- Net katman sınırları: Routes → Controllers → Services → Data
- Servislerdeki iş mantığı
- Repository'lerdeki veri erişimi
- Middleware'deki doğrulama

**Anlamlı İsimlendirme**
- Açıklayıcı değişken ve fonksiyon isimleri
- Tutarlı isimlendirme kuralları
- Kendi kendini belgeleyen kod
- Gereksiz kısaltmalar yok

### Kod Kalitesi

- Tutarlılık için ESLint yapılandırması
- Kapsamlı hata işleme
- Winston ile yapılandırılmış loglama
- Tüm katmanlarda girdi doğrulama
- XSS önleme için çıktı kodlama
- SQL injection önleme için parametreli sorgular

### Proje Organizasyonu

```
Temiz Mimari Katmanları:

┌─────────────────────────────────┐
│         Sunum Katmanı           │  ← Routes, Controllers
│          (HTTP Katmanı)         │
├─────────────────────────────────┤
│      İş Mantığı                 │  ← Services, Validators
│      (Uygulama Katmanı)         │
├─────────────────────────────────┤
│      Veri Erişimi               │  ← Repositories, Models
│      (Veri Katmanı)             │
├─────────────────────────────────┤
│      Altyapı                    │  ← Database, Cache, Queue
│      (Harici Servisler)         │
└─────────────────────────────────┘
```

## 🔐 Uygulama Yapılandırması

### Ortam Değişkenleri

```bash
# JWT secret'ları oluştur
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Veritabanı bağlantısını test et
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD

# Redis bağlantısını test et
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# RabbitMQ bağlantısını test et
curl -u admin:$RABBITMQ_PASSWORD http://localhost:15672/api/overview
```

### Dosya Yükleme Yapılandırması

```javascript
// Dosya yükleme sınırları
MAX_FILE_SIZE=5242880  // 5MB
ALLOWED_FILE_TYPES=application/pdf

// Yükleme dizinleri
uploads/temp/    // Geçici yüklemeler
uploads/cv/      // Saklanan CV'ler
uploads/backup/  // Yerel yedekler
```

### E-posta Şablonları

HTML e-posta şablonları `backend/services/emailService.js` içinde bulunur:
- Başvuru onayı
- OTP teslimatı
- Durum güncelleme (Kabul)
- Durum güncelleme (Red)

### Veritabanı Şeması

```sql
-- Adminler tablosu
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İş pozisyonları tablosu
CREATE TABLE job_positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Başvurular tablosu
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  position VARCHAR(255) NOT NULL,
  experience INT,
  cover_letter TEXT,
  cv_path VARCHAR(500) NOT NULL,
  match_score INT,
  ai_analysis TEXT,
  recommendation VARCHAR(50),
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Kullanıcılar tablosu
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performans için indeksler
CREATE INDEX idx_email ON applications(email);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_position ON applications(position);
CREATE INDEX idx_created ON applications(created_at);
```

## 🚀 Performance Optimization

- **Connection Pooling**: MySQL connection pool (max 10 connections)
- **Caching**: Redis for OTP, sessions, and rate limiting
- **Compression**: Gzip compression via Nginx
- **Static Assets**: Cached by Nginx
- **Database Indexes**: Strategic indexing for common queries
- **Lazy Loading**: Components load on demand
- **Pagination**: API responses paginated (20 items/page)
- **Queue Processing**: Asynchronous email and backup via RabbitMQ

## 📦 Dependencies

### Backend

```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.5",
  "redis": "^4.6.11",
  "amqplib": "^0.10.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.1.5",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^6.9.7",
  "axios": "^1.6.2",
  "winston": "^3.11.0",
  "sanitize-html": "^2.11.0",
  "express-validator": "^7.0.1",
  "pdf-parse": "^1.1.1"
}
```

### Frontend

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-scripts": "5.0.1",
  "axios": "^1.6.2"
}
```

## 🐳 Docker Configuration

### Services

```yaml
services:
  mysql:
    image: mysql:8.0.35
    ports: ["3307:3306"]
    volumes: [mysql_data:/var/lib/mysql]
    
  redis:
    image: redis:7.2.3-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]
    
  rabbitmq:
    image: rabbitmq:3.12.10-management-alpine
    ports: ["5672:5672", "15672:15672"]
    volumes: [rabbitmq_data:/var/lib/rabbitmq]
    
  backend:
    build: ./backend
    ports: ["3000:3000"]
    depends_on: [mysql, redis, rabbitmq]
    
  frontend:
    build: ./frontend
    ports: ["3001:80"]
    
  nginx:
    image: nginx:1.25.3-alpine
    ports: ["80:80", "443:443"]
    depends_on: [backend, frontend]
```

### Health Checks

All services include health checks:
- MySQL: mysqladmin ping
- Redis: redis-cli ping
- RabbitMQ: rabbitmq-diagnostics ping
- Backend: HTTP GET /health
- Frontend: HTTP GET /

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Wait for MySQL to be ready (30 seconds after start)
docker-compose logs mysql

# Test connection
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT 1"
```

**Redis Connection Error**
```bash
# Check Redis status
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Should return: PONG
```

**Email Not Sending**
```bash
# For Gmail: Enable 2FA and create App Password
# Check logs
docker-compose logs backend | grep email

# Test SMTP manually
node backend/services/emailService.js
```

**File Upload Fails**
```bash
# Check permissions
ls -la uploads/

# Create directories if missing
mkdir -p uploads/temp uploads/cv uploads/backup
chmod 777 uploads/temp uploads/cv uploads/backup
```

**Oracle Cloud Upload Error**
```bash
# Verify credentials in .env
# Test connection
node -e "const svc = require('./backend/services/oracleCloudService'); console.log('Config:', svc.namespace, svc.bucketName, svc.region);"

# Check logs
docker-compose logs backend | grep Oracle
```

## 📈 Scalability

### Horizontal Scaling

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Update Nginx upstream
# Add load balancing configuration
upstream backend {
    server backend:3000;
    server backend:3000;
    server backend:3000;
}
```

### Vertical Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_email ON applications(email);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_created ON applications(created_at);

-- Analyze tables
ANALYZE TABLE applications;
ANALYZE TABLE admins;

-- Optimize tables
OPTIMIZE TABLE applications;
```


