import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  json,
  date,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// 1. Management User
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "radiografer", "dokter"]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 1.5 Management Dokter (Master Dokter Rujuk & Dokter Baca)
export const doctors = mysqlTable("doctors", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id), // Link ke user auth (bila dokter berhak login ke sistem RIS)
  nip: varchar("nip", { length: 50 }).unique(), // NIP / Nomor Induk Pegawai Dokter
  nik: varchar("nik", { length: 20 }), // NIK KTP Dokter (untuk sinkronisasi IHS Practitioner SATUSEHAT)
  ihsNumber: varchar("ihs_number", { length: 50 }), // IHS Practitioner ID dari SATUSEHAT (cth: 10000000001)
  fullName: varchar("full_name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 150 }), // cth: Spesialis Radiologi, THT, Dokter Umum
  department: varchar("department", { length: 150 }), // [Tahap 2] Unit/Departemen (cth: Poli Gigi, IGD, Rawat Inap)
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Management Pasien (Kompatibel dengan demografi HL7 dasar)
export const patients = mysqlTable("patients", {
  id: serial("id").primaryKey(),
  mrn: varchar("mrn", { length: 50 }).notNull().unique(), // Medical Record Number (Patient ID dalam DICOM)
  nik: varchar("nik", { length: 20 }), // NIK Pasien (wajib untuk lookup IHS Patient SATUSEHAT)
  ihsNumber: varchar("ihs_number", { length: 50 }), // IHS Number dari SATUSEHAT Kemenkes (cth: P01234567890)
  fullName: varchar("full_name", { length: 255 }).notNull(),
  dob: date("dob"), // Tanggal Lahir (Date of Birth)
  gender: mysqlEnum("gender", ["L", "P"]), // Laki-laki / Perempuan
  address: text("address"),
  hl7Metadata: json("hl7_metadata"), // Untuk menyimpan JSON metadata bridging sistem HIS/HL7 lain
  createdAt: timestamp("created_at").defaultNow(),
});

// 2.5 Modality Types (Katalog Standar Modality)
export const modalityTypes = mysqlTable("modality_types", {
  code: varchar("code", { length: 10 }).primaryKey(), // cth: "DX", "CT" (Primary Key berupa String Code)
  description: varchar("description", { length: 100 }), // cth: "Digital Radiography"
});

// 3. Management Modality (Bisa di-sync dengan Orthanc API tanpa edit orthanc.json)
export const modalities = mysqlTable("modalities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // cth: "CT Scan Ruang A"
  typeCode: varchar("type_code", { length: 10 }).notNull().references(() => modalityTypes.code), // FK menggunakan tipe string
  aet: varchar("aet", { length: 50 }).notNull().unique(), // AE Title (harus sesuai dengan mesin)
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  port: int("port").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3.5 Log Uji Koneksi Modality (Misal: DICOM Echo / Ping)
export const modalityConnectionLogs = mysqlTable("modality_connection_logs", {
  id: serial("id").primaryKey(),
  modalityId: bigint("modality_id", { mode: "number", unsigned: true }).notNull().references(() => modalities.id),
  status: mysqlEnum("status", ["success", "failed"]).notNull(),
  message: text("message"), // Jika gagal, simpan output error-nya di sini
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Management Order (Worklist / Antrian Periksa DICOM)
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull().references(() => patients.id),
  noReg: varchar("no_reg", { length: 50 }).notNull(), // Nomor Registrasi (ID Kunjungan Pasien)
  doctorId: bigint("doctor_id", { mode: "number", unsigned: true }).references(() => doctors.id), // Referensi Master Tabel Dokter perujuk/operator
  accessionNumber: varchar("accession_number", { length: 50 }).notNull().unique(), // Accession Number standar DICOM
  modalityTypeCode: varchar("modality_type_code", { length: 10 }).notNull().references(() => modalityTypes.code), // Wajib diisi (cth: "DX", "CT") 
  modalityId: bigint("modality_id", { mode: "number", unsigned: true }).references(() => modalities.id), // Boleh kosong (opsional jika untuk 1 ruangan khusus)
  bodyPart: varchar("body_part", { length: 100 }), // Bagian Tubuh (Kepala, Thorax, dst)
  clinicalInfo: text("clinical_info"), // Informasi Klinis / Indikasi Pemeriksaan
  priority: mysqlEnum("priority", ["routine", "urgent", "stat"]).default("routine"), // CITO/TIDAK
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "canceled", "failed"]).default("scheduled"),
  orderDate: timestamp("order_date").defaultNow(),
  // [Tahap 2] Audit mutu: teknisi, waktu tunggu, waktu pengerjaan
  radiographerId: bigint("radiographer_id", { mode: "number", unsigned: true }).references(() => users.id), // Teknisi/radiografer yang melakukan
  examStartedAt: timestamp("exam_started_at"),   // Waktu mulai diperiksa
  examFinishedAt: timestamp("exam_finished_at"), // Waktu selesai diperiksa
  // [SATUSEHAT DICOM Gateway Integration]
  studyInstanceUid: varchar("study_instance_uid", { length: 128 }), // UID Study DICOM dari DCM4CHEE
  satusehatStatus: mysqlEnum("satusehat_status", ["unmapped", "pending", "synced", "failed"]).default("unmapped"),
  satusehatEncounterId: varchar("satusehat_encounter_id", { length: 100 }), // ID FHIR Encounter Kemenkes
  satusehatServiceRequestId: varchar("satusehat_service_request_id", { length: 100 }), // ID FHIR ServiceRequest Kemenkes / SIMRS
  satusehatStudyId: varchar("satusehat_study_id", { length: 100 }), // ID FHIR ImagingStudy Kemenkes
  satusehatObservationId: varchar("satusehat_observation_id", { length: 100 }), // ID FHIR Observation Kemenkes
  satusehatReportId: varchar("satusehat_report_id", { length: 100 }), // ID FHIR DiagnosticReport Kemenkes
});

// 5. Medical Expertise / Hasil Bacaan
export const expertise = mysqlTable("expertise", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull().references(() => orders.id),
  doctorId: bigint("doctor_id", { mode: "number", unsigned: true }).notNull().references(() => doctors.id), // Link ke Master Dokter Spesialis Radiologi yang membaca
  findings: text("findings"), // Temuan/Details bacaan
  conclusions: text("conclusions"), // Kesimpulan/Kesan
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. SATUSEHAT Audit Log & Transaction Queue (Monitoring & Outbox)
export const satusehatLogs = mysqlTable("satusehat_logs", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).references(() => patients.id),
  resourceType: mysqlEnum("resource_type", [
    "Patient",
    "Practitioner",
    "ServiceRequest",
    "ImagingStudy",
    "DiagnosticReport",
    "Encounter",
    "Auth"
  ]).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // cth: "PUSH_IMAGING_STUDY", "PUSH_DIAGNOSTIC_REPORT", "LOOKUP_PATIENT_IHS"
  status: mysqlEnum("status", ["pending", "success", "failed"]).notNull(),
  satusehatId: varchar("satusehat_id", { length: 100 }), // ID Resource hasil submit
  httpStatus: int("http_status"),
  requestPayload: json("request_payload"),
  responsePayload: json("response_payload"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 7. SATUSEHAT Gateway Configuration Settings
export const satusehatSettings = mysqlTable("satusehat_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 100 }).notNull().default("10000004"), // ID Faskes Kemenkes DTO
  clientId: varchar("client_id", { length: 255 }).default(""),
  clientSecret: varchar("client_secret", { length: 255 }).default(""),
  environment: mysqlEnum("environment", ["sandbox", "staging", "production"]).default("staging"),
  authUrl: varchar("auth_url", { length: 255 }).default("https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1"),
  baseUrl: varchar("base_url", { length: 255 }).default("https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1"),
  autoSyncOnExpertise: mysqlEnum("auto_sync_on_expertise", ["yes", "no"]).default("yes"),
  simulationMode: mysqlEnum("simulation_mode", ["yes", "no"]).default("yes"), // Mode simulasi untuk demo/testing tanpa auth live
  updatedAt: timestamp("updated_at").defaultNow(),
});
