# Dokumentasi Smart RIS V3 (DCM4CHEE PACS)

## Visi dan Konsep Utama
Smart RIS V3 dirancang sebagai Sistem Informasi Radiologi modern yang sepenuhnya berjalan dalam environment **Docker**. Tujuan utama adalah untuk mengkombinasikan kecepatan, skalabilitas, dan efisiensi melalui arsitektur decoupled antara Viewer, Data Transaksional, dan Penyimpanan DICOM.

**Perbedaan dengan SmartRIS V2**: Versi ini menggunakan **DCM4CHEE Arc Light 5** sebagai PACS Server pengganti Orthanc, memberikan fitur enterprise-grade seperti built-in MWL (Modality Worklist), HL7 support, dan DICOMWeb standar.

## Arsitektur Teknologi
1. **Frontend (Vue.js + Tailwind CSS)**: 
   - Digunakan oleh Radiografer dan Dokter Spesialis Radiologi.
   - Mengombinasikan kecepatan rendering dari Vue dan desain modern, responsif menggunakan sistem utility **Tailwind CSS**.
   - Menyediakan fitur *Viewer Iframe* untuk menampilkan hasil dari OHIF Viewer / Cornerstone secara split-screen, berdampingan dengan form input *Expertise* dokter.

2. **Backend (ElysiaJS + Bun)**:
   - Berjalan pada runtime *Bun* yang sangat cepat.
   - Sebagai penghubung (transaksional) antara Frontend dan database relasional.
   - Menulis dan membaca ke database utama RIS menggunakan Drizzle ORM.
   - Mengekspos REST API dan mendukung fungsionalitas CRUD secara native.
   - Berkomunikasi dengan DCM4CHEE via DICOMWeb REST API.

3. **Database (Pemisahan Beban RIS & PACS)**:
   - **MySQL (Didedikasikan untuk RIS)**: Digunakan khusus sebagai database operasional Backend Smart RIS. Skema di dalamnya akan mencatat detail login pengguna, pendaftaran antrian pasien, jadwal pemeriksaan, dan order metadata. MySQL dipilih agar beban komputasi server *web operasional* benar-benar terisolasi dari *DICOM processing*.
   - **PostgreSQL (Didedikasikan untuk DCM4CHEE)**: Digunakan oleh sistem PACS (*DCM4CHEE Arc Light 5*) melalui image khusus `dcm4che/postgres-dcm4chee`. Database ini menyimpan metadata DICOM, study index, dan konfigurasi archive.

4. **PACS (DCM4CHEE Arc Light 5)**:
   - Server PACS enterprise-grade berbasis Java/Wildfly.
   - Menerima, menyimpan, dan mengirimkan file DICOM (AET: DCM4CHEE, Port: 11112).
   - **Built-in MWL SCP** — Modality Worklist sudah tersedia tanpa plugin tambahan.
   - **DICOMWeb Standar** — Mendukung QIDO-RS, WADO-RS, STOW-RS secara native.
   - **HL7 Support** — Mendengar di port 2575 untuk integrasi HIS.
   - Konfigurasi DICOM disimpan di **OpenLDAP** (`dcm4che/slapd-dcm4chee`).
   - Web UI Admin tersedia di `/dcm4chee-arc/ui2`.

5. **OpenLDAP (Konfigurasi DICOM)**:
   - Menyimpan konfigurasi archive: AE titles, connection pools, modality registrations.
   - Image: `dcm4che/slapd-dcm4chee:2.6.10-34.2`

## Entitas Sistem & Manajemen
Sistem secara bertahap akan menangani empat pilar manajemen utama:
- **Management User**: Mengelola Autentikasi dan otorisasi (Admin, Radiografer, Dokter).
- **Management Pasien**: Memenuhi standar struktur demografi medis.
- **Management Modality**: Form UI pada web yang otomatis meregistrasikan alamat dan AET modality secara live ke server DCM4CHEE.
- **Management Order**: Melacak journey dari rawat jalan/inap, pembacaan DICOM di iframe, hingga expertise dari dokter spesialis.

## Kompatibilitas Standar (HL7 & DICOM)
- Sistem dirancang dengan referensi entitas relasional berbasis *HL7*. 
- Skema JSON/Relasional di MySQL akan didesain untuk merekam struktur field *Patient ID*, *Accession Number* yang compatible dengan SIMRS eksternal atau bridging API.
- DCM4CHEE mendukung HL7 ADT/ORM messages natively di port 2575.

## Port Services Summary

| Service | Port | Keterangan |
|---|---|---|
| Frontend (Vue 3) | 8080 | Web UI SmartRIS |
| Backend API (Elysia) | 3000 | REST API |
| DCM4CHEE Web UI | 8082 | Admin PACS `/dcm4chee-arc/ui2` |
| DCM4CHEE DICOM | 11112 | Koneksi DICOM modality |
| DCM4CHEE HL7 | 2575 | HL7 Message Receiver |
| OHIF Viewer | 3001 | DICOM Image Viewer |
| MySQL | 33060 | Database RIS |
| PostgreSQL (DCM4CHEE) | 15432 | Database PACS |
| OpenLDAP | 389 | Konfigurasi DICOM |
| Wildfly Admin | 9990 | Admin Console Wildfly |
