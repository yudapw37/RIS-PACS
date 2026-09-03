# Panduan Menjalankan SmartRIS V3 (Lokal Development)

## Prasyarat Utama

| Tool | Versi | Keterangan |
|---|---|---|
| Bun | 1.x+ | Runtime backend |
| Node.js | 20+ | Untuk frontend build tools |
| MySQL | 8.x | Database transaksional RIS |
| Docker | 24+ | Untuk PACS stack (DCM4CHEE) |
| DCM4CHEE Stack _(opsional)_ | — | Hanya dibutuhkan untuk fitur DICOM |

---

## 1. Jalankan MySQL (Development)

```bash
docker compose up -d
```
> File `docker-compose.yml` hanya berisi MySQL untuk development lokal.

---

## 2. Setup Backend

```bash
cd backend
bun install
```

Pastikan file `.env` sudah ada:
```env
DATABASE_URL="mysql://root:root@localhost:3306/ris_v3"
JWT_SECRET="smartris-v3-dev-secret"
PORT=3000
DCM4CHEE_API_URL="http://127.0.0.1:8082"
DCM4CHEE_AET="DCM4CHEE"
```

Jalankan migrasi dan seeder:
```bash
bun run db:generate
bun run src/db/migrate.ts
bun run src/db/seed.ts
```

Jalankan backend:
```bash
bun run dev
```

---

## 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 4. (Opsional) Jalankan DCM4CHEE PACS Stack

Untuk development dengan DICOM, jalankan DCM4CHEE stack minimal:

```bash
# Buat network
docker network create dcm4chee_network

# 1. OpenLDAP
docker run --network=dcm4chee_network --name ldap \
  -p 389:389 \
  -d dcm4che/slapd-dcm4chee:2.6.10-34.2

# 2. PostgreSQL
docker run --network=dcm4chee_network --name dcm4chee-db \
  -p 15432:5432 \
  -e POSTGRES_DB=pacsdb \
  -e POSTGRES_USER=pacs \
  -e POSTGRES_PASSWORD=pacs \
  -d dcm4che/postgres-dcm4chee:17.4-34

# 3. DCM4CHEE Arc Light
docker run --network=dcm4chee_network --name arc \
  -p 8082:8080 \
  -p 8443:8443 \
  -p 11112:11112 \
  -p 2575:2575 \
  -e POSTGRES_DB=pacsdb \
  -e POSTGRES_USER=pacs \
  -e POSTGRES_PASSWORD=pacs \
  -e WILDFLY_WAIT_FOR="ldap:389 dcm4chee-db:5432" \
  -d dcm4che/dcm4chee-arc-psql:5.34.2
```

Akses DCM4CHEE UI: http://localhost:8082/dcm4chee-arc/ui2

---

## 5. Akses Aplikasi

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| DCM4CHEE UI (opsional) | http://localhost:8082/dcm4chee-arc/ui2 |

---

## 6. Login Default

Setelah menjalankan seeder:
- **Username**: `superadmin`
- **Password**: `password123`

---

## Production Deployment

Untuk deploy full stack ke server:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

| Service | URL (Production) |
|---|---|
| Frontend | http://<IP_SERVER>:8080 |
| Backend API | http://<IP_SERVER>:3000 |
| DCM4CHEE UI | http://<IP_SERVER>:8082/dcm4chee-arc/ui2 |
| OHIF Viewer | http://<IP_SERVER>:3001 |
