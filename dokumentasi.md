# Dokumentasi Smart RIS V3 (DCM4CHEE PACS & SATUSEHAT Gateway)

## 1. Visi dan Konsep Utama
Smart RIS V3 dirancang sebagai Sistem Informasi Radiologi modern yang sepenuhnya berjalan dalam environment **Docker**. Tujuan utama adalah untuk mengkombinasikan kecepatan, skalabilitas, dan efisiensi melalui arsitektur decoupled antara Viewer, Data Transaksional, Penyimpanan DICOM, serta Interoperabilitas Kemenkes RI SATUSEHAT.

**Perbedaan dengan SmartRIS V2**: Versi ini menggunakan **DCM4CHEE Arc Light 5** sebagai PACS Server enterprise pengganti Orthanc, memberikan fitur native MWL (Modality Worklist), HL7 ADT/ORM support, dan DICOMWeb standar (QIDO-RS, WADO-RS, STOW-RS).

---

## 2. Arsitektur Teknologi & Pemisahan Beban
1. **Frontend (Vue 3 + Vite + Tailwind CSS)**: 
   - Dashboard responsif untuk Dokter Spesialis Radiologi, Radiografer, dan Administrator IT.
   - Dilengkapi *Viewer Iframe & Deep Link* untuk menampilkan citra radiologi beresolusi tinggi via OHIF Viewer secara berdampingan dengan form input ekspertise dokter.
   - Arsitektur jaringan adaptif (*Host-Agnostic*): frontend berkomunikasi ke backend melalui Nginx Reverse Proxy internal (`/api/`), sehingga bebas dari batasan CORS dan tidak memerlukan penulisan IP berulang-ulang di sisi client.

2. **Backend (Bun + ElysiaJS + Drizzle ORM)**:
   - Berjalan pada runtime *Bun* ultra-cepat dengan overhead memori sangat rendah.
   - Menghubungkan alur kerja klinis, data pasien, penjadwalan antrean, dan audit mutu waktu tunggu pasien (TAT).
   - Menangani integrasi dua arah dengan PACS DCM4CHEE (C-ECHO, C-FIND, C-STORE, DICOMWeb) dan SATUSEHAT FHIR R4.

3. **Database (Pemisahan Beban RIS vs PACS)**:
   - **MySQL 8.0 (Khusus RIS)**: Mencatat autentikasi, registrasi pasien, antrean tindakan, hasil ekspertise, dan audit log. Terisolasi dari beban komputasi penanganan file gambar DICOM.
   - **PostgreSQL 17 (Khusus DCM4CHEE PACS)**: Database khusus internal DCM4CHEE untuk mengindeks metadata citra DICOM, tag header, series, dan instance.

4. **PACS (DCM4CHEE Arc Light 5)**:
   - Enterprise DICOM Archive berbasis Java/Wildfly.
   - Built-in MWL SCP (Modality Worklist) tanpa plugin tambahan.
   - DICOMWeb Standar (WADO-RS, QIDO-RS, STOW-RS).
   - HL7 Message Receiver di port 2575.
   - Web UI Admin: `/dcm4chee-arc/ui2`.

5. **OpenLDAP (Konfigurasi DICOM)**:
   - Menyimpan seluruh konfigurasi archive, Application Entity (AE) Titles, dan modality device pool secara terpusat.
   - Image: `dcm4che/slapd-dcm4chee:2.6.10-34.2`

6. **OHIF Viewer (CornerstoneJS)**:
   - Web DICOM Viewer zero-footprint (tanpa perlu install aplikasi di komputer dokter).
   - Fitur manipulasi citra klinis: Windowing (WW/WL), Zoom, Pan, Pengukuran (Length, Angle), Magnifier, dan Multi-planar Reconstruction (MPR).

---

## 3. Konfigurasi Lingkungan Terpadu (Unified Master `.env`)

Untuk kemudahan operasional dan mencegah kesalahan konfigurasi IP antar-komponen, seluruh konfigurasi stack disatukan dalam **satu file master `.env` di root project**:

### Struktur File `.env`:
```env
# ================================================================
# SmartRIS V3 Enterprise - Unified Master Environment Configuration
# ================================================================

# --- 1. MASTER SERVER IP / HOSTNAME ---
# CUKUP UBAH BARIS INI ke IP server RS (misal: 192.168.1.50) atau Domain RS
SERVER_IP=localhost

# --- 2. FRONTEND (Vue 3 Web App) ---
FRONTEND_PORT=8080
# KOSONGKAN (default) agar otomatis adaptif via reverse proxy Nginx internal (/api/)
VITE_API_BASE_URL=

# --- 3. BACKEND API (Bun / ElysiaJS) ---
BACKEND_PORT=3000
NODE_ENV=production
JWT_SECRET=SmartRIS-V3-SuperSecret-JWT-Key-2026!

# --- 4. DATABASE UTAMA (MySQL 8.0) ---
MYSQL_DATABASE=ris_v3
MYSQL_USER=ris_user
MYSQL_PASSWORD=ris_password_2026!
MYSQL_ROOT_PASSWORD=SmartRIS_Root_2026!
MYSQL_PORT=33060

# --- 5. OHIF MEDICAL DICOM VIEWER ---
OHIF_PORT=3001

# --- 6. DCM4CHEE PACS (Arc Light 5 & PostgreSQL) ---
DCM4CHEE_AET=DCM4CHEE
DCM4CHEE_DB_PASSWORD=pacs_password_2026
DCM4CHEE_PG_PORT=15432
DCM4CHEE_HTTP_PORT=8082
DCM4CHEE_HTTPS_PORT=8443
DICOM_PORT=11112
DICOM_TLS_PORT=2762
HL7_PORT=2575
HL7_TLS_PORT=12575
WILDFLY_ADMIN_PORT=9990

# --- 7. OPENLDAP (Konfigurasi DICOM AET) ---
LDAP_PORT=389
LDAP_ROOTPASS=secret
```

### Keunggulan Konfigurasi Tunggal:
1. **Satu Titik Pengaturan (*Single Point of Configuration*)**: Saat deploy ke server produksi RS, tim IT **cukup mengubah 1 baris (`SERVER_IP=...`)** di file `.env`.
2. **Otomatis Adaptif (*Host-Agnostic*)**:
   - Nginx Frontend otomatis memproksi panggilan API ke backend tanpa memerlukan IP statis.
   - Tombol DICOM Viewer otomatis mendeteksi alamat IP browser dokter (`window.location.hostname:3001`).
   - Halaman Dokumentasi API (`/admin/api-docs`) otomatis menampilkan contoh endpoint sesuai IP server aktif saat dibuka.

---

## 4. Panduan Deployment ke Server Produksi (Proxmox / Ubuntu Server)

### A. Prasyarat Server
- **OS**: Ubuntu 22.04 LTS / Debian 12 (bisa di VM atau Unprivileged LXC Container dengan fitur `Nesting` aktif).
- **RAM**: Minimal 4 GB (disarankan 8 GB untuk beban PACS tinggi).
- **Disk**: Minimal 50–100 GB (untuk penyimpanan file citra DICOM).
- **Docker**: Docker Engine 24+ & Docker Compose v2.

### B. Langkah Instalasi Pertama Kali:
```bash
# 1. Clone repository ke direktori server
git clone -b staging https://github.com/yudapw37/RIS-PACS.git /opt/SmartRIS_V3
cd /opt/SmartRIS_V3

# 2. Salin template master konfigurasi
cp .env.example .env

# 3. Edit file .env (cukup ubah SERVER_IP ke IP server RS Anda)
nano .env
# Ganti baris teratas:
# SERVER_IP=192.168.1.50   <--- (Sesuaikan IP server Anda)

# 4. Berikan izin eksekusi dan jalankan deploy script
chmod +x deploy.sh
./deploy.sh
```

### C. Langkah Update di Masa Mendatang:
Setiap kali ada pembaruan kode atau rilis fitur baru, cukup jalankan ulang script deploy:
```bash
cd /opt/SmartRIS_V3
./deploy.sh
```
Script akan otomatis melakukan `git pull`, kompilasi ulang image yang berubah, dan me-restart service tanpa menghapus database.

---

## 5. Ringkasan Port dan Akses Layanan

| Service | Port Host | Protokol | URL / Endpoint Akses | Keterangan |
|---|---|---|---|---|
| **SmartRIS Frontend** | `8080` | HTTP | `http://<SERVER_IP>:8080` | Web Dashboard Radiologi & PACS |
| **SmartRIS Backend API** | `3000` | HTTP | `http://<SERVER_IP>:3000/api` | REST API Middleware & Webhook |
| **OHIF DICOM Viewer** | `3001` | HTTP | `http://<SERVER_IP>:3001` | Penampil Gambar Radiologi |
| **DCM4CHEE Web UI** | `8082` | HTTP | `http://<SERVER_IP>:8082/dcm4chee-arc/ui2` | Konsol Manajemen PACS |
| **DCM4CHEE DICOM** | `11112` | DICOM | `dicom://<SERVER_IP>:11112` | Port Store/Query Modality (AET: DCM4CHEE) |
| **DCM4CHEE HL7** | `2575` | HL7 | `mllp://<SERVER_IP>:2575` | Penerima pesan HL7 ADT/ORM |
| **MySQL (RIS DB)** | `33060` | TCP | `mysql://<SERVER_IP>:33060/ris_v3` | Database Transaksional SmartRIS |
| **PostgreSQL (PACS DB)**| `15432` | TCP | `postgresql://<SERVER_IP>:15432/pacsdb` | Database Arsip DCM4CHEE |
| **OpenLDAP** | `389` | LDAP | `ldap://<SERVER_IP>:389` | Konfigurasi AE Title DICOM |
| **Wildfly Admin** | `9990` | HTTP | `http://<SERVER_IP>:9990` | Admin Console Wildfly Application Server |

---

## 6. Integrasi Standar Medis & Interoperabilitas

1. **DICOM MWL (Modality Worklist)**:
   - Order pemeriksaan yang didaftarkan di SmartRIS otomatis terdaftar di Worklist DCM4CHEE. Mesin radiologi (CT Scan, MRI, X-Ray) dapat langsung mengambil data pasien tanpa pengetikan ulang.
2. **SATUSEHAT Kemenkes RI (FHIR R4)**:
   - Mendukung siklus bridging standar nasional: `Encounter`, `ServiceRequest`, `ImagingStudy`, dan `DiagnosticReport`.
3. **Deep Link SIMRS**:
   - SIMRS eksternal dapat membuka hasil citra pasien langsung dengan memanggil format:
     `http://<SERVER_IP>:3001/viewer?StudyInstanceUIDs=<StudyInstanceUID>`
