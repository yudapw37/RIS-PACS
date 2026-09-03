# SmartRIS V3 — Context & Conventions (Skills)

## Arsitektur

1. **Frontend**: Vue 3 SPA dibangun dengan Vite & TailwindCSS v4. State management menggunakan `localStorage` untuk token JWT.
2. **Backend**: ElysiaJS di-host oleh runtime Bun. ORM menggunakan **Drizzle** yang men-generate migrasi SQL secara otomatis.
3. **Database Utama (RIS)**: MySQL 8.0 — Menyimpan Users, Patients, Doctors, Modalities, Orders, dan Expertise.
4. **PACS (DCM4CHEE Arc Light 5)**:
   - PostgreSQL khusus DCM4CHEE untuk indexing DICOM.
   - OpenLDAP untuk konfigurasi archive dan AE Titles.
   - DCM4CHEE Arc berjalan di Wildfly Application Server.
5. **DCM4CHEE Integrations**: Berinteraksi via DICOMWeb REST API (`/dcm4chee-arc/aets/{aet}/rs/...`). Gunakan native `fetch` milik Bun untuk komunikasi.

## Konvensi Kode

- Controller → Service → DB (Drizzle). Jangan pernah menulis query DB langsung di controller.
- Setiap response API menggunakan helper `sendResponse(set, code, message, data?)`.
- Environment variable untuk DCM4CHEE: `DCM4CHEE_API_URL`, `DCM4CHEE_AET`.

## Infrastruktur Docker

- `docker-compose.yml` — Development lokal (MySQL only).
- `docker-compose.prod.yml` — Full production stack (MySQL + Backend + Frontend + LDAP + PostgreSQL + DCM4CHEE Arc + OHIF Viewer).
- Tiap container wajib mempunyai auto-restart policy dan binding volumes untuk persistensi.
- Endpoint di backend Elysia yang mencatat (CRUD) modality harus melakukan operasi sinkron REST API ke DCM4CHEE (`/dcm4chee-arc/aets/{aet}/dimse/{externalAET}`).

## Perbedaan dengan SmartRIS V2

| Aspek | V2 (Orthanc) | V3 (DCM4CHEE) |
|---|---|---|
| PACS | Orthanc (ringan, ~512MB) | DCM4CHEE Arc Light 5 (enterprise, ~4GB) |
| Worklist | Custom Python Plugin | Built-in MWL SCP |
| DICOMWeb | Plugin (harus diaktifkan) | Native/Built-in |
| HL7 | Tidak ada | Port 2575 (built-in) |
| Konfigurasi DICOM | orthanc.json (statis) | OpenLDAP (dinamis) |
| REST API | `/modalities/{aet}` | `/dcm4chee-arc/aets/{aet}/dimse/{ext}` |
| Study Query | `/tools/find` (proprietary) | QIDO-RS (DICOMWeb standar) |
