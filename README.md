<p align="center">
  <img src="https://img.shields.io/badge/PACS-DCM4CHEE_5-blue?style=for-the-badge" alt="DCM4CHEE 5" />
  <img src="https://img.shields.io/badge/Backend-Bun_+_ElysiaJS-f7df1e?style=for-the-badge" alt="Bun + Elysia" />
  <img src="https://img.shields.io/badge/Frontend-Vue_3_+_Tailwind-42b883?style=for-the-badge" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Viewer-OHIF-00b4d8?style=for-the-badge" alt="OHIF" />
  <img src="https://img.shields.io/badge/Deploy-Docker_Compose-2496ed?style=for-the-badge" alt="Docker" />
</p>

# 🏥 SmartRIS V3

**Sistem Informasi Radiologi** modern berbasis **DCM4CHEE Arc Light 5** — dirancang untuk rumah sakit yang membutuhkan solusi PACS enterprise-grade dengan workflow radiologi terintegrasi.

> Migrasi dari SmartRIS V2 (Orthanc) → V3 (DCM4CHEE) untuk mendapatkan fitur MWL built-in, HL7 support, dan DICOMWeb standar.

---

## 📐 Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Network                              │
│                                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────────────────┐│
│  │ Frontend  │   │   Backend    │   │     DCM4CHEE Arc Light 5    ││
│  │ Vue 3     │──▶│ Bun/ElysiaJS │──▶│   ┌──────┐  ┌───────────┐  ││
│  │ Tailwind  │   │ Drizzle ORM  │   │   │ DICOM│  │ DICOMWeb  │  ││
│  │ :8080     │   │ :3000        │   │   │:11112│  │ REST API  │  ││
│  └──────────┘   └──────┬───────┘   │   └──────┘  └───────────┘  ││
│                         │           │         :8082               ││
│                         ▼           └────────────┬───────────────┘│
│                  ┌──────────┐                     │                │
│                  │  MySQL   │            ┌────────┴──────┐        │
│                  │ 8.0      │            │  PostgreSQL   │        │
│                  │ (RIS DB) │            │  17 (PACS DB) │        │
│                  │ :33060   │            │  :15432       │        │
│                  └──────────┘            └───────────────┘        │
│                                                                    │
│  ┌──────────┐   ┌──────────┐                                      │
│  │   OHIF   │   │ OpenLDAP │                                      │
│  │  Viewer  │   │ (Config) │                                      │
│  │  :3001   │   │ :389     │                                      │
│  └──────────┘   └──────────┘                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Teknologi | Deskripsi |
|---|---|---|
| **Frontend** | Vue 3 + Vite 8 + Tailwind CSS 4 | SPA dengan Lucide icons & Chart.js |
| **Backend** | Bun + ElysiaJS + Drizzle ORM | REST API ultra-cepat dengan JWT auth |
| **Database RIS** | MySQL 8.0 | Data user, pasien, order, expertise |
| **PACS Server** | DCM4CHEE Arc Light 5.34.2 | Enterprise DICOM archive (MWL, HL7, DICOMWeb) |
| **Database PACS** | PostgreSQL 17 | Metadata DICOM & study index |
| **DICOM Config** | OpenLDAP (slapd-dcm4chee) | AE titles, connection pools, modality config |
| **DICOM Viewer** | OHIF Viewer | Cornerstone-based web viewer |
| **Deployment** | Docker Compose | Single-command production deploy |

---

## 🗂 Struktur Project

```
SmartRIS_V3/
├── backend/                  # Bun + ElysiaJS API Server
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── db/               # Drizzle schema, migrations, seed
│   │   ├── middleware/        # JWT auth, etc.
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic & DCM4CHEE integration
│   │   ├── utils/            # Helper functions
│   │   └── index.ts          # App entrypoint
│   ├── drizzle/              # Generated migrations
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Vue 3 + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable Vue components
│   │   ├── views/            # Page-level views
│   │   ├── router/           # Vue Router config
│   │   ├── config/           # App configuration
│   │   └── main.ts           # App entrypoint
│   ├── Dockerfile
│   ├── nginx.conf            # Production Nginx config
│   └── package.json
├── ohif-viewer/              # Pre-built OHIF Viewer static bundle
│   ├── app-config.js         # DICOMWeb connection config
│   ├── nginx.conf
│   └── Dockerfile
├── init-db/                  # MySQL init scripts (auto-run on first start)
│   └── 01-schema.sql
├── docker-compose.yml        # Development (MySQL only)
├── docker-compose.prod.yml   # Production (full 7-service stack)
├── deploy.sh                 # One-command deploy script
├── .env.production.example   # Template environment variables
└── dokumentasi.md            # Dokumentasi arsitektur (Bahasa Indonesia)
```

---

## 🚀 Quick Start (Development)

### Prasyarat

| Tool | Versi Minimum |
|---|---|
| **Bun** | 1.x+ |
| **Node.js** | 20+ |
| **Docker** | 24+ |

### 1. Clone & Setup

```bash
git clone https://github.com/rspawdevelopment-a11y/smart-ris-v3.git
cd smart-ris-v3
```

### 2. Jalankan MySQL (dev)

```bash
docker compose up -d
```

### 3. Setup Backend

```bash
cd backend
bun install

# Buat file .env
cat > .env << 'EOF'
DATABASE_URL="mysql://root:root@localhost:3306/ris_v3"
JWT_SECRET="smartris-v3-dev-secret"
PORT=3000
DCM4CHEE_API_URL="http://127.0.0.1:8082"
DCM4CHEE_AET="DCM4CHEE"
EOF

# Migrasi & Seed database
bun run db:generate
bun run src/db/migrate.ts
bun run src/db/seed.ts

# Jalankan backend
bun run dev
```

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Akses Aplikasi

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

**Login default:** `superadmin` / `password123`

---

## 🖥️ Deployment ke Proxmox

### Overview

Deployment ke Proxmox menggunakan **LXC Container** (recommended) atau **VM** dengan Docker Compose. Semua 7 services berjalan dalam satu host.

### Resource Requirements

| Resource | Staging / Dev | Production |
|---|---|---|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8 GB |
| **Swap** | 1 GB | 2 GB |
| **Disk** | 20 GB | 50-100 GB |
| **Network** | Static IP | Static IP |

> 💡 DCM4CHEE (Java/Wildfly) adalah service terberat (~1.5 GB RAM). Staging 4 GB sudah cukup nyaman.

---

### Step 1: Siapkan VM/LXC di Proxmox

#### Opsi A: LXC Container (Ringan, Recommended)

1. **Buat CT** di Proxmox Web UI (`Create CT`)

   | Tab | Field | Staging | Production |
   |---|---|---|---|
   | **General** | Hostname | `smartris-v3` | `smartris-v3` |
   | | Unprivileged | ❌ **Uncheck** | ❌ **Uncheck** |
   | **Template** | OS | Ubuntu 22.04 | Ubuntu 22.04 |
   | **Disks** | Size | **20 GB** | **50-100 GB** |
   | **CPU** | Cores | **2** | **4** |
   | **Memory** | RAM | **4096 MB** | **8192 MB** |
   | | Swap | **1024 MB** | **2048 MB** |
   | **Network** | Bridge | `vmbr0` | `vmbr0` |
   | | IPv4 | `192.168.102.70/24` | `<IP-PROD>/24` |
   | | Gateway | `192.168.102.1` | `<GW-PROD>` |

2. **Enable Nesting** (WAJIB untuk Docker):
   - Klik CT → **Options** → **Features** → Edit
   - ☑️ Centang **Nesting** dan **FUSE**

3. **Start CT** dan masuk via console/SSH

#### Opsi B: VM (Full Isolation)

1. **Buat VM** di Proxmox Web UI
   - ISO: **Ubuntu 22.04 Server** atau **Debian 12**
   - CPU: **2 cores** (staging) / **4 cores** (prod)
   - RAM: **4 GB** (staging) / **8 GB** (prod)
   - Disk: **20 GB** (staging) / **50-100 GB** (prod)
   - Network: **Bridge (vmbr0)**, IP statis `192.168.102.70`

2. Install OS, lalu SSH ke server

---

### Step 2: Install Docker di Server

```bash
# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y ca-certificates curl gnupg git

# Install Docker (official script)
curl -fsSL https://get.docker.com | sh

# Tambahkan user ke group docker (opsional, jika bukan root)
usermod -aG docker $USER

# Verifikasi
docker --version
docker compose version
```

---

### Step 3: Clone Project & Konfigurasi

```bash
# Clone repository
git clone https://github.com/rspawdevelopment-a11y/smart-ris-v3.git /opt/SmartRIS_V3
cd /opt/SmartRIS_V3

# Copy & edit environment file
cp .env.production.example .env.production
nano .env.production
```

**⚠️ Yang WAJIB diubah di `.env.production`:**

```env
# Sesuaikan IP server Proxmox
VITE_API_BASE_URL=http://192.168.102.70:3000

# Ganti password default untuk production!
MYSQL_ROOT_PASSWORD=<password-kuat-anda>
MYSQL_PASSWORD=<password-kuat-anda>
JWT_SECRET=<random-string-panjang>
DCM4CHEE_DB_PASSWORD=<password-kuat-anda>
```

> 💡 Untuk staging, password default di `.env.production.example` bisa langsung dipakai.

---

### Step 4: Deploy!

```bash
chmod +x deploy.sh
./deploy.sh
```

Script ini akan otomatis:
1. ✅ Pull code terbaru dari Git
2. ✅ Build semua Docker images
3. ✅ Start 7 services
4. ✅ Menampilkan status & URL akses

---

### Step 5: Verifikasi

Setelah deploy selesai (~1-2 menit), akses dari browser:

| Service | URL | Keterangan |
|---|---|---|
| **Frontend** | `http://192.168.102.70:8080` | Dashboard SmartRIS |
| **Backend API** | `http://192.168.102.70:3000` | REST API |
| **DCM4CHEE UI** | `http://192.168.102.70:8082/dcm4chee-arc/ui2` | Admin PACS |
| **OHIF Viewer** | `http://192.168.102.70:3001` | DICOM Image Viewer |
| **DICOM Port** | `192.168.102.70:11112` | Koneksi modality (AET: `DCM4CHEE`) |
| **HL7 Port** | `192.168.102.70:2575` | HL7 Message Receiver |

---

### Step 6: Setup Firewall (Opsional tapi Recommended)

```bash
# Install UFW
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow SmartRIS services
ufw allow 8080/tcp    # Frontend
ufw allow 3000/tcp    # Backend API
ufw allow 8082/tcp    # DCM4CHEE Web UI
ufw allow 11112/tcp   # DICOM
ufw allow 2575/tcp    # HL7
ufw allow 3001/tcp    # OHIF Viewer

# Enable firewall
ufw enable
ufw status
```

---

## 🔧 Operations

### Perintah Umum

```bash
cd /opt/SmartRIS_V3

# Lihat status semua services
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Lihat logs (follow mode)
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Lihat log service tertentu
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f arc
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f smartris-backend

# Restart semua
docker compose -f docker-compose.prod.yml --env-file .env.production restart

# Stop semua
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Update & redeploy
./deploy.sh
```

### Backup Data

```bash
# Backup MySQL (RIS data)
docker exec smartris-db mysqldump -u root -p<PASSWORD> ris_v3 > backup_ris_$(date +%Y%m%d).sql

# Backup PostgreSQL (PACS metadata)
docker exec dcm4chee-db pg_dump -U pacs pacsdb > backup_pacs_$(date +%Y%m%d).sql

# Backup DICOM storage volume
docker run --rm -v dcm4chee-storage:/data -v $(pwd):/backup alpine \
  tar czf /backup/backup_dicom_$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data

```bash
# Restore MySQL
docker exec -i smartris-db mysql -u root -p<PASSWORD> ris_v3 < backup_ris_YYYYMMDD.sql

# Restore PostgreSQL
docker exec -i dcm4chee-db psql -U pacs pacsdb < backup_pacs_YYYYMMDD.sql
```

---

## 🔌 Port Reference

| Port | Service | Protocol |
|---|---|---|
| `8080` | SmartRIS Frontend (Vue 3) | HTTP |
| `3000` | SmartRIS Backend API | HTTP |
| `8082` | DCM4CHEE Web UI & REST API | HTTP |
| `8443` | DCM4CHEE HTTPS | HTTPS |
| `11112` | DCM4CHEE DICOM | DICOM |
| `2762` | DCM4CHEE DICOM TLS | DICOM |
| `2575` | DCM4CHEE HL7 | HL7 |
| `12575` | DCM4CHEE HL7 TLS | HL7 |
| `3001` | OHIF Viewer | HTTP |
| `33060` | MySQL (RIS) | MySQL |
| `15432` | PostgreSQL (PACS) | PostgreSQL |
| `389` | OpenLDAP | LDAP |
| `9990` | Wildfly Admin Console | HTTP |

---

## 📄 License

Private — RSPaw Development

---

<p align="center">
  <sub>SmartRIS V3 — Built with ❤️ for Indonesian Healthcare</sub>
</p>
