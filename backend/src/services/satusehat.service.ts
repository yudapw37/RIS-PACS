/**
 * SATUSEHAT DICOM Gateway & Integration Service
 * 
 * Menangani interoperabilitas SmartRIS & PACS DCM4CHEE dengan platform
 * Kemenkes SATUSEHAT RI berbasis standar HL7 FHIR R4:
 * 
 * - OAuth 2.0 Authentication (Client Credentials Flow)
 * - Lookup IHS Patient by NIK KTP
 * - Lookup IHS Practitioner (Dokter) by NIK
 * - Bridge DICOM Study Metadata -> FHIR ImagingStudy
 * - Bridge Medical Expertise -> FHIR DiagnosticReport
 * - Transaction Outbox & Audit Logging untuk Monitoring Real-time
 * - Mode Simulasi (Sandbox Mock) untuk testing tanpa koneksi Kemenkes
 */

import { db } from "../db";
import { 
  orders, 
  patients, 
  doctors, 
  modalities, 
  expertise, 
  satusehatLogs, 
  satusehatSettings 
} from "../db/schema";
import { eq, desc, and, count, sql, like } from "drizzle-orm";
import { DCM4CHEEService } from "./dcm4chee.service";

// In-memory cache untuk token OAuth SATUSEHAT
let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

export interface SatusehatPushResult {
  success: boolean;
  message: string;
  imagingStudyId?: string;
  diagnosticReportId?: string;
  logIds: number[];
}

export class SatusehatService {

  /**
   * Mengambil setting konfigurasi SATUSEHAT dari Database.
   * Jika tabel masih kosong, buat baris default pertama.
   */
  static async getSettings() {
    try {
      const rows = await db.select().from(satusehatSettings).limit(1);
      if (rows.length > 0) {
        return rows[0];
      }

      // Inisialisasi default settings
      const defaultData = {
        organizationId: process.env.SATUSEHAT_ORG_ID || "10000004",
        clientId: process.env.SATUSEHAT_CLIENT_ID || "",
        clientSecret: process.env.SATUSEHAT_CLIENT_SECRET || "",
        environment: (process.env.SATUSEHAT_ENV as any) || "staging",
        authUrl: process.env.SATUSEHAT_AUTH_URL || "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1",
        baseUrl: process.env.SATUSEHAT_BASE_URL || "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1",
        autoSyncOnExpertise: "yes" as const,
        simulationMode: (process.env.SATUSEHAT_SIMULATION === "no" ? "no" : "yes") as any,
      };

      await db.insert(satusehatSettings).values(defaultData);
      const created = await db.select().from(satusehatSettings).limit(1);
      return created[0];
    } catch (err: any) {
      // Fallback jika database offline / migrasi belum jalan
      return {
        id: 1,
        organizationId: "10000004",
        clientId: "",
        clientSecret: "",
        environment: "staging" as const,
        authUrl: "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1",
        baseUrl: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1",
        autoSyncOnExpertise: "yes" as const,
        simulationMode: "yes" as const,
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update konfigurasi SATUSEHAT
   */
  static async updateSettings(data: {
    organizationId?: string;
    clientId?: string;
    clientSecret?: string;
    environment?: "sandbox" | "staging" | "production";
    authUrl?: string;
    baseUrl?: string;
    autoSyncOnExpertise?: "yes" | "no";
    simulationMode?: "yes" | "no";
  }) {
    const current = await this.getSettings();
    cachedToken = null; // Reset token cache saat config berubah

    await db.update(satusehatSettings)
      .set({
        organizationId: data.organizationId ?? current.organizationId,
        clientId: data.clientId ?? current.clientId,
        clientSecret: data.clientSecret ?? current.clientSecret,
        environment: data.environment ?? current.environment,
        authUrl: data.authUrl ?? current.authUrl,
        baseUrl: data.baseUrl ?? current.baseUrl,
        autoSyncOnExpertise: data.autoSyncOnExpertise ?? current.autoSyncOnExpertise,
        simulationMode: data.simulationMode ?? current.simulationMode,
        updatedAt: new Date(),
      })
      .where(eq(satusehatSettings.id, current.id));

    return { success: true, message: "Pengaturan SATUSEHAT berhasil diperbarui" };
  }

  /**
   * Dapatkan Access Token OAuth 2.0 Kemenkes DTO
   */
  static async getAuthToken(): Promise<{ success: boolean; token: string; error?: string }> {
    const settings = await this.getSettings();

    // Jika mode simulasi aktif, gunakan mock token langsung
    if (settings.simulationMode === "yes") {
      return {
        success: true,
        token: "simulated_bearer_token_" + Buffer.from(settings.organizationId).toString("base64"),
      };
    }

    // Cek cache token jika masih valid (buffer 60 detik)
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60000) {
      return { success: true, token: cachedToken.accessToken };
    }

    if (!settings.clientId || !settings.clientSecret) {
      return { 
        success: false, 
        token: "", 
        error: "Client ID dan Client Secret belum dikonfigurasi di Pengaturan SATUSEHAT." 
      };
    }

    try {
      const authEndpoint = `${settings.authUrl.replace(/\/+$/, "")}/accesstoken?grant_type=client_credentials`;
      const formData = new URLSearchParams();
      formData.append("client_id", settings.clientId);
      formData.append("client_secret", settings.clientSecret);

      const response = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const responseBody = await response.json();

      if (response.ok && responseBody.access_token) {
        const expiresInSec = Number(responseBody.expires_in) || 3000;
        cachedToken = {
          accessToken: responseBody.access_token,
          expiresAt: now + expiresInSec * 1000,
        };

        // Log audit
        await this.logTransaction({
          resourceType: "Auth",
          action: "TEST_AUTH_TOKEN",
          status: "success",
          httpStatus: response.status,
          requestPayload: { client_id: settings.clientId, endpoint: authEndpoint },
          responsePayload: { status: "authenticated", expires_in: expiresInSec },
        });

        return { success: true, token: responseBody.access_token };
      } else {
        const errMsg = responseBody.issue?.[0]?.details?.text || responseBody.message || "Gagal autentikasi ke SATUSEHAT";
        await this.logTransaction({
          resourceType: "Auth",
          action: "TEST_AUTH_TOKEN",
          status: "failed",
          httpStatus: response.status,
          requestPayload: { client_id: settings.clientId },
          responsePayload: responseBody,
          errorMessage: errMsg,
        });

        return { success: false, token: "", error: `HTTP ${response.status}: ${errMsg}` };
      }
    } catch (err: any) {
      return { success: false, token: "", error: `Koneksi gagal: ${err.message}` };
    }
  }

  /**
   * Catat transaksi ke satusehat_logs untuk keperluan monitoring dan outbox
   */
  static async logTransaction(data: {
    orderId?: number;
    patientId?: number;
    resourceType: "Patient" | "Practitioner" | "ServiceRequest" | "ImagingStudy" | "DiagnosticReport" | "Encounter" | "Auth";
    action: string;
    status: "pending" | "success" | "failed";
    satusehatId?: string;
    httpStatus?: number;
    requestPayload?: any;
    responsePayload?: any;
    errorMessage?: string;
  }): Promise<number> {
    try {
      const [result] = await db.insert(satusehatLogs).values({
        orderId: data.orderId || null,
        patientId: data.patientId || null,
        resourceType: data.resourceType,
        action: data.action,
        status: data.status,
        satusehatId: data.satusehatId || null,
        httpStatus: data.httpStatus || null,
        requestPayload: data.requestPayload ? JSON.stringify(data.requestPayload) : null,
        responsePayload: data.responsePayload ? JSON.stringify(data.responsePayload) : null,
        errorMessage: data.errorMessage || null,
        retryCount: 0,
      });

      return Number((result as any)?.insertId || 0);
    } catch (err: any) {
      console.error("Gagal mencatat satusehat log:", err);
      return 0;
    }
  }

  /**
   * 1. Lookup Patient IHS Number berdasarkan NIK
   */
  static async lookupPatientIhs(patientId: number, directNik?: string) {
    const settings = await this.getSettings();
    const patientRecords = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    
    if (patientRecords.length === 0) {
      throw new Error(`Pasien ID ${patientId} tidak ditemukan.`);
    }

    const patient = patientRecords[0];
    const nik = directNik || patient.nik;

    if (!nik || nik.trim().length < 16) {
      throw new Error(`Pasien ${patient.fullName} belum memiliki NIK yang valid (16 digit).`);
    }

    // Jika mode simulasi: generate mock IHS yang deterministik
    if (settings.simulationMode === "yes") {
      const simulatedIhs = `P${nik.substring(0, 10)}${patient.id.toString().padStart(4, "0")}`;
      await db.update(patients)
        .set({ nik, ihsNumber: simulatedIhs })
        .where(eq(patients.id, patientId));

      await this.logTransaction({
        patientId,
        resourceType: "Patient",
        action: "LOOKUP_PATIENT_IHS",
        status: "success",
        satusehatId: simulatedIhs,
        httpStatus: 200,
        requestPayload: { nik, mode: "simulation" },
        responsePayload: { resourceType: "Patient", id: simulatedIhs, name: patient.fullName },
      });

      return { success: true, ihsNumber: simulatedIhs, isSimulated: true };
    }

    // Mode Live SATUSEHAT
    const auth = await this.getAuthToken();
    if (!auth.success) {
      throw new Error(`Gagal otentikasi SATUSEHAT: ${auth.error}`);
    }

    const url = `${settings.baseUrl.replace(/\/+$/, "")}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${auth.token}`,
        "Accept": "application/json"
      }
    });

    const body = await response.json();

    if (response.ok && body.entry && body.entry.length > 0) {
      const ihsNumber = body.entry[0].resource?.id;
      await db.update(patients)
        .set({ nik, ihsNumber })
        .where(eq(patients.id, patientId));

      await this.logTransaction({
        patientId,
        resourceType: "Patient",
        action: "LOOKUP_PATIENT_IHS",
        status: "success",
        satusehatId: ihsNumber,
        httpStatus: response.status,
        requestPayload: { url, nik },
        responsePayload: body,
      });

      return { success: true, ihsNumber, isSimulated: false };
    } else {
      const errMsg = body.issue?.[0]?.details?.text || "Pasien tidak ditemukan di database SatuSehat Kemenkes.";
      await this.logTransaction({
        patientId,
        resourceType: "Patient",
        action: "LOOKUP_PATIENT_IHS",
        status: "failed",
        httpStatus: response.status,
        requestPayload: { url, nik },
        responsePayload: body,
        errorMessage: errMsg,
      });

      throw new Error(errMsg);
    }
  }

  /**
   * 2. Lookup Doctor / Practitioner IHS Number berdasarkan NIK
   */
  static async lookupDoctorIhs(doctorId: number, directNik?: string) {
    const settings = await this.getSettings();
    const docRecords = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);

    if (docRecords.length === 0) {
      throw new Error(`Dokter ID ${doctorId} tidak ditemukan.`);
    }

    const doc = docRecords[0];
    const nik = directNik || doc.nik;

    if (!nik || nik.trim().length < 16) {
      throw new Error(`Dokter ${doc.fullName} belum memiliki NIK yang valid (16 digit).`);
    }

    if (settings.simulationMode === "yes") {
      const simulatedIhs = `100${doc.id.toString().padStart(7, "0")}`;
      await db.update(doctors)
        .set({ nik, ihsNumber: simulatedIhs })
        .where(eq(doctors.id, doctorId));

      await this.logTransaction({
        resourceType: "Practitioner",
        action: "LOOKUP_DOCTOR_IHS",
        status: "success",
        satusehatId: simulatedIhs,
        httpStatus: 200,
        requestPayload: { nik, mode: "simulation" },
        responsePayload: { resourceType: "Practitioner", id: simulatedIhs, name: doc.fullName },
      });

      return { success: true, ihsNumber: simulatedIhs, isSimulated: true };
    }

    const auth = await this.getAuthToken();
    if (!auth.success) {
      throw new Error(`Gagal otentikasi SATUSEHAT: ${auth.error}`);
    }

    const url = `${settings.baseUrl.replace(/\/+$/, "")}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${auth.token}`,
        "Accept": "application/json"
      }
    });

    const body = await response.json();

    if (response.ok && body.entry && body.entry.length > 0) {
      const ihsNumber = body.entry[0].resource?.id;
      await db.update(doctors)
        .set({ nik, ihsNumber })
        .where(eq(doctors.id, doctorId));

      await this.logTransaction({
        resourceType: "Practitioner",
        action: "LOOKUP_DOCTOR_IHS",
        status: "success",
        satusehatId: ihsNumber,
        httpStatus: response.status,
        requestPayload: { url, nik },
        responsePayload: body,
      });

      return { success: true, ihsNumber, isSimulated: false };
    } else {
      const errMsg = body.issue?.[0]?.details?.text || "Dokter / Tenaga Medis tidak ditemukan di SatuSehat.";
      await this.logTransaction({
        resourceType: "Practitioner",
        action: "LOOKUP_DOCTOR_IHS",
        status: "failed",
        httpStatus: response.status,
        requestPayload: { url, nik },
        responsePayload: body,
        errorMessage: errMsg,
      });

      throw new Error(errMsg);
    }
  }

  /**
   * 3. Ambil / Resolve DICOM Study Metadata dari DCM4CHEE
   */
  static async resolveDicomMetadata(accessionNumber: string, orderId: number) {
    const dcmUrl = process.env.DCM4CHEE_API_URL || "http://127.0.0.1:8082";
    const dcmAet = process.env.DCM4CHEE_AET || "DCM4CHEE";

    try {
      const res = await fetch(
        `${dcmUrl}/dcm4chee-arc/aets/${dcmAet}/rs/studies?AccessionNumber=${accessionNumber}`,
        {
          headers: { "Accept": "application/dicom+json" },
          signal: AbortSignal.timeout(4000)
        }
      );

      if (res.ok) {
        const studies = await res.json();
        if (Array.isArray(studies) && studies.length > 0) {
          const s = studies[0];
          const studyUID = s["0020000D"]?.Value?.[0];
          const modality = s["00080061"]?.Value?.[0] || "DX";
          const numSeries = s["00201206"]?.Value?.[0] || 1;
          const numInstances = s["00201208"]?.Value?.[0] || 1;

          return {
            studyInstanceUid: studyUID,
            modality,
            numberOfSeries: Number(numSeries),
            numberOfInstances: Number(numInstances),
            fromDcm4chee: true,
          };
        }
      }
    } catch {
      // Fallback deterministik jika DCM4CHEE offline
    }

    // Standardized fallback DICOM UID untuk SmartRIS
    const fallbackUID = `1.2.840.10008.5.1.4.1.1.${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.${orderId}`;
    return {
      studyInstanceUid: fallbackUID,
      modality: "DX",
      numberOfSeries: 1,
      numberOfInstances: 1,
      fromDcm4chee: false,
    };
  }

  /**
   * 4. Kirim FHIR ImagingStudy ke SATUSEHAT
   */
  static async pushImagingStudy(orderId: number) {
    const settings = await this.getSettings();

    // Query detail order + pasien + modality
    const orderRows = await db.select({
      order: orders,
      patient: patients,
      modality: modalities,
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(modalities, eq(orders.modalityId, modalities.id))
    .where(eq(orders.id, orderId))
    .limit(1);

    if (orderRows.length === 0) {
      throw new Error(`Order ID ${orderId} tidak ditemukan.`);
    }

    const { order, patient, modality } = orderRows[0];

    // Pastikan pasien punya IHS Number
    let patientIhs = patient.ihsNumber;
    if (!patientIhs) {
      if (patient.nik) {
        const lookup = await this.lookupPatientIhs(patient.id, patient.nik);
        patientIhs = lookup.ihsNumber;
      } else {
        throw new Error(`Pasien ${patient.fullName} belum memiliki NIK. Masukkan NIK terlebih dahulu.`);
      }
    }

    // Ambil metadata DICOM dari DCM4CHEE
    const dicomInfo = await this.resolveDicomMetadata(order.accessionNumber, order.id);
    const studyUid = order.studyInstanceUid || dicomInfo.studyInstanceUid;
    const seriesUid = `${studyUid}.1`;
    const sopUid = `${seriesUid}.1`;
    const modalityCode = order.modalityTypeCode || dicomInfo.modality || "DX";

    // Update study_instance_uid ke order jika belum ada
    if (!order.studyInstanceUid) {
      await db.update(orders)
        .set({ studyInstanceUid: studyUid })
        .where(eq(orders.id, orderId));
    }

    // Bangun payload FHIR ImagingStudy standar SATUSEHAT Kemenkes RI
    const imagingStudyPayload = {
      resourceType: "ImagingStudy",
      status: "available",
      subject: {
        reference: `Patient/${patientIhs}`,
        display: patient.fullName,
      },
      identifier: [
        {
          use: "official",
          system: "urn:dicom:uid",
          value: `urn:oid:${studyUid}`,
        },
        {
          use: "usual",
          system: `http://sys-ids.kemkes.go.id/acsn/${settings.organizationId}`,
          value: order.accessionNumber,
        }
      ],
      modality: [
        {
          system: "http://dicom.nema.org/resources/ontology/DCM",
          code: modalityCode,
          display: modality?.name || `${modalityCode} Examination`,
        }
      ],
      started: (order.examStartedAt || order.orderDate || new Date()).toISOString(),
      numberOfSeries: dicomInfo.numberOfSeries || 1,
      numberOfInstances: dicomInfo.numberOfInstances || 1,
      description: order.bodyPart || "Radiology Examination",
      series: [
        {
          uid: seriesUid,
          number: 1,
          modality: {
            system: "http://dicom.nema.org/resources/ontology/DCM",
            code: modalityCode,
          },
          description: order.bodyPart || "Standard View",
          numberOfInstances: dicomInfo.numberOfInstances || 1,
          bodySite: {
            system: "http://snomed.info/sct",
            display: order.bodyPart || "Body Structure",
          },
          instance: [
            {
              uid: sopUid,
              sopClass: {
                system: "urn:ietf:rfc:3986",
                code: "urn:oid:1.2.840.10008.5.1.4.1.1.1", // CR/DX Image Storage
              },
              number: 1,
              title: `${order.accessionNumber} Key Frame`,
            }
          ]
        }
      ],
      endpoint: [
        {
          reference: `Endpoint/${settings.organizationId}-wado-rs`,
          display: `DCM4CHEE PACS WADO-RS (${settings.organizationId})`,
        }
      ]
    };

    // Eksekusi kirim
    if (settings.simulationMode === "yes") {
      const simulatedStudyId = `is-${Date.now().toString(36)}-${order.id}`;

      await db.update(orders)
        .set({ 
          satusehatStatus: "synced",
          satusehatStudyId: simulatedStudyId,
        })
        .where(eq(orders.id, orderId));

      const logId = await this.logTransaction({
        orderId,
        patientId: patient.id,
        resourceType: "ImagingStudy",
        action: "PUSH_IMAGING_STUDY",
        status: "success",
        satusehatId: simulatedStudyId,
        httpStatus: 201,
        requestPayload: imagingStudyPayload,
        responsePayload: {
          ...imagingStudyPayload,
          id: simulatedStudyId,
          meta: { versionId: "1", lastUpdated: new Date().toISOString() },
        },
      });

      return {
        success: true,
        imagingStudyId: simulatedStudyId,
        logId,
        isSimulated: true,
      };
    }

    // Live SATUSEHAT
    const auth = await this.getAuthToken();
    if (!auth.success) {
      throw new Error(`Otentikasi gagal: ${auth.error}`);
    }

    const endpointUrl = `${settings.baseUrl.replace(/\/+$/, "")}/ImagingStudy`;
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(imagingStudyPayload),
    });

    const responseBody = await response.json();

    if (response.status === 201 || response.ok) {
      const satusehatStudyId = responseBody.id;
      await db.update(orders)
        .set({ 
          satusehatStatus: "synced",
          satusehatStudyId,
        })
        .where(eq(orders.id, orderId));

      const logId = await this.logTransaction({
        orderId,
        patientId: patient.id,
        resourceType: "ImagingStudy",
        action: "PUSH_IMAGING_STUDY",
        status: "success",
        satusehatId: satusehatStudyId,
        httpStatus: response.status,
        requestPayload: imagingStudyPayload,
        responsePayload: responseBody,
      });

      return { success: true, imagingStudyId: satusehatStudyId, logId, isSimulated: false };
    } else {
      const errMsg = responseBody.issue?.[0]?.details?.text || `HTTP ${response.status}: Gagal push ImagingStudy`;
      await db.update(orders)
        .set({ satusehatStatus: "failed" })
        .where(eq(orders.id, orderId));

      const logId = await this.logTransaction({
        orderId,
        patientId: patient.id,
        resourceType: "ImagingStudy",
        action: "PUSH_IMAGING_STUDY",
        status: "failed",
        httpStatus: response.status,
        requestPayload: imagingStudyPayload,
        responsePayload: responseBody,
        errorMessage: errMsg,
      });

      throw new Error(errMsg);
    }
  }

  /**
   * 5. Kirim FHIR DiagnosticReport (Hasil Ekspertise Dokter Radiologi) ke SATUSEHAT
   */
  static async pushDiagnosticReport(orderId: number) {
    const settings = await this.getSettings();

    // Query order + expertise + patient + doctor
    const orderRows = await db.select({
      order: orders,
      patient: patients,
      exp: expertise,
      doc: doctors,
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(expertise, eq(expertise.orderId, orders.id))
    .leftJoin(doctors, eq(orders.doctorId, doctors.id))
    .where(eq(orders.id, orderId))
    .limit(1);

    if (orderRows.length === 0) {
      throw new Error(`Order ID ${orderId} tidak ditemukan.`);
    }

    const { order, patient, exp, doc } = orderRows[0];

    if (!exp) {
      throw new Error(`Belum ada hasil ekspertise untuk Order ${order.accessionNumber}.`);
    }

    // Pastikan pasien & dokter punya IHS
    let patientIhs = patient.ihsNumber;
    if (!patientIhs && patient.nik) {
      const pLookup = await this.lookupPatientIhs(patient.id, patient.nik);
      patientIhs = pLookup.ihsNumber;
    }

    if (!patientIhs) {
      throw new Error(`Pasien belum memiliki IHS Number SATUSEHAT.`);
    }

    let doctorIhs = doc?.ihsNumber;
    if (!doctorIhs && doc?.nik) {
      const dLookup = await this.lookupDoctorIhs(doc.id, doc.nik);
      doctorIhs = dLookup.ihsNumber;
    }

    // Bangun payload FHIR DiagnosticReport standar SATUSEHAT
    const diagnosticReportPayload = {
      resourceType: "DiagnosticReport",
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0074",
              code: "RAD",
              display: "Radiology",
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "18748-4",
            display: "Diagnostic imaging study",
          }
        ],
        text: `Hasil Pemeriksaan Radiologi - ${order.bodyPart || "Radiografi"}`,
      },
      subject: {
        reference: `Patient/${patientIhs}`,
        display: patient.fullName,
      },
      effectiveDateTime: (order.examFinishedAt || order.orderDate || new Date()).toISOString(),
      issued: (exp.createdAt || new Date()).toISOString(),
      performer: doctorIhs ? [
        {
          reference: `Practitioner/${doctorIhs}`,
          display: doc?.fullName || "Dokter Spesialis Radiologi",
        }
      ] : undefined,
      resultsInterpreter: doctorIhs ? [
        {
          reference: `Practitioner/${doctorIhs}`,
          display: doc?.fullName || "Dokter Spesialis Radiologi",
        }
      ] : undefined,
      imagingStudy: order.satusehatStudyId ? [
        {
          reference: `ImagingStudy/${order.satusehatStudyId}`,
        }
      ] : undefined,
      conclusion: exp.conclusions || "Tidak ditemukan kelainan signifikan",
      presentedForm: [
        {
          contentType: "text/plain",
          language: "id-ID",
          data: Buffer.from(
            `TEMUAN:\n${exp.findings || "-"}\n\nKESIMPULAN:\n${exp.conclusions || "-"}`
          ).toString("base64"),
          title: `Ekspertise Radiologi ${order.accessionNumber}`,
        }
      ]
    };

    if (settings.simulationMode === "yes") {
      const simulatedReportId = `dr-${Date.now().toString(36)}-${order.id}`;

      await db.update(orders)
        .set({ satusehatReportId: simulatedReportId })
        .where(eq(orders.id, orderId));

      const logId = await this.logTransaction({
        orderId,
        patientId: patient.id,
        resourceType: "DiagnosticReport",
        action: "PUSH_DIAGNOSTIC_REPORT",
        status: "success",
        satusehatId: simulatedReportId,
        httpStatus: 201,
        requestPayload: diagnosticReportPayload,
        responsePayload: {
          ...diagnosticReportPayload,
          id: simulatedReportId,
        },
      });

      return {
        success: true,
        diagnosticReportId: simulatedReportId,
        logId,
        isSimulated: true,
      };
    }

    const auth = await this.getAuthToken();
    if (!auth.success) {
      throw new Error(`Otentikasi gagal: ${auth.error}`);
    }

    const endpointUrl = `${settings.baseUrl.replace(/\/+$/, "")}/DiagnosticReport`;
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(diagnosticReportPayload),
    });

    const responseBody = await response.json();

    if (response.status === 201 || response.ok) {
      const satusehatReportId = responseBody.id;
      await db.update(orders)
        .set({ satusehatReportId })
        .where(eq(orders.id, orderId));

      const logId = await this.logTransaction({
        orderId,
        patientId: patient.id,
        resourceType: "DiagnosticReport",
        action: "PUSH_DIAGNOSTIC_REPORT",
        status: "success",
        satusehatId: satusehatReportId,
        httpStatus: response.status,
        requestPayload: diagnosticReportPayload,
        responsePayload: responseBody,
      });

      return { success: true, diagnosticReportId: satusehatReportId, logId, isSimulated: false };
    } else {
      const errMsg = responseBody.issue?.[0]?.details?.text || `HTTP ${response.status}: Gagal push DiagnosticReport`;
      const logId = await this.logTransaction({
        orderId,
        patientId: patient.id,
        resourceType: "DiagnosticReport",
        action: "PUSH_DIAGNOSTIC_REPORT",
        status: "failed",
        httpStatus: response.status,
        requestPayload: diagnosticReportPayload,
        responsePayload: responseBody,
        errorMessage: errMsg,
      });

      throw new Error(errMsg);
    }
  }

  /**
   * 6. Workflow Lengkap: Push Order ke SATUSEHAT (ImagingStudy + DiagnosticReport jika ada)
   */
  static async pushOrderToSatusehat(orderId: number): Promise<SatusehatPushResult> {
    const logIds: number[] = [];

    // Tandai status order sedang diproses
    await db.update(orders)
      .set({ satusehatStatus: "pending" })
      .where(eq(orders.id, orderId));

    try {
      // Step A: Push ImagingStudy
      const studyResult = await this.pushImagingStudy(orderId);
      if (studyResult.logId) logIds.push(studyResult.logId);

      // Step B: Cek apakah ada ekspertise yang sudah dibuat
      const expRows = await db.select().from(expertise).where(eq(expertise.orderId, orderId)).limit(1);
      let reportId: string | undefined;

      if (expRows.length > 0) {
        try {
          const repResult = await this.pushDiagnosticReport(orderId);
          if (repResult.logId) logIds.push(repResult.logId);
          reportId = repResult.diagnosticReportId;
        } catch (repErr: any) {
          console.warn(`Peringatan: Gagal push DiagnosticReport: ${repErr.message}`);
        }
      }

      await db.update(orders)
        .set({ satusehatStatus: "synced" })
        .where(eq(orders.id, orderId));

      return {
        success: true,
        message: `Order radiologi berhasil disinkronkan ke SATUSEHAT${studyResult.isSimulated ? " (Mode Simulasi)" : ""}`,
        imagingStudyId: studyResult.imagingStudyId,
        diagnosticReportId: reportId,
        logIds,
      };
    } catch (err: any) {
      await db.update(orders)
        .set({ satusehatStatus: "failed" })
        .where(eq(orders.id, orderId));

      return {
        success: false,
        message: `Gagal sinkronisasi SATUSEHAT: ${err.message}`,
        logIds,
      };
    }
  }

  /**
   * 7. Retry Log yang gagal
   */
  static async retryLog(logId: number) {
    const logRecords = await db.select().from(satusehatLogs).where(eq(satusehatLogs.id, logId)).limit(1);
    if (logRecords.length === 0) {
      throw new Error(`Log ID ${logId} tidak ditemukan.`);
    }

    const log = logRecords[0];
    const retryCount = (log.retryCount || 0) + 1;

    // Update retry count
    await db.update(satusehatLogs)
      .set({ retryCount, updatedAt: new Date() })
      .where(eq(satusehatLogs.id, logId));

    if (log.action === "PUSH_IMAGING_STUDY" && log.orderId) {
      return await this.pushImagingStudy(log.orderId);
    } else if (log.action === "PUSH_DIAGNOSTIC_REPORT" && log.orderId) {
      return await this.pushDiagnosticReport(log.orderId);
    } else if (log.action === "LOOKUP_PATIENT_IHS" && log.patientId) {
      return await this.lookupPatientIhs(log.patientId);
    } else if (log.orderId) {
      return await this.pushOrderToSatusehat(log.orderId);
    }

    throw new Error(`Tipe aksi ${log.action} tidak mendukung automated retry.`);
  }

  /**
   * 8. Ambil Statistik Monitoring & Ringkasan Outbox
   */
  static async getStats() {
    const settings = await this.getSettings();

    // Hitung total log berdasarkan status
    const [totalRow] = await db.select({ count: count() }).from(satusehatLogs);
    const [successRow] = await db.select({ count: count() }).from(satusehatLogs).where(eq(satusehatLogs.status, "success"));
    const [failedRow] = await db.select({ count: count() }).from(satusehatLogs).where(eq(satusehatLogs.status, "failed"));
    const [pendingRow] = await db.select({ count: count() }).from(satusehatLogs).where(eq(satusehatLogs.status, "pending"));

    // Hitung order yang tersinkron
    const [ordersSynced] = await db.select({ count: count() }).from(orders).where(eq(orders.satusehatStatus, "synced"));
    const [ordersUnmapped] = await db.select({ count: count() }).from(orders).where(eq(orders.satusehatStatus, "unmapped"));
    const [ordersFailed] = await db.select({ count: count() }).from(orders).where(eq(orders.satusehatStatus, "failed"));

    // Status konektivitas DCM4CHEE
    const dcmHealth = await DCM4CHEEService.healthCheck();

    return {
      summary: {
        totalTransactions: totalRow.count || 0,
        successTransactions: successRow.count || 0,
        failedTransactions: failedRow.count || 0,
        pendingTransactions: pendingRow.count || 0,
        ordersSynced: ordersSynced.count || 0,
        ordersUnmapped: ordersUnmapped.count || 0,
        ordersFailed: ordersFailed.count || 0,
      },
      connection: {
        satusehatEnvironment: settings.environment,
        simulationMode: settings.simulationMode === "yes",
        organizationId: settings.organizationId,
        hasCredentials: !!(settings.clientId && settings.clientSecret),
        dcm4cheeConnected: dcmHealth,
      }
    };
  }

  /**
   * 9. Ambil List Log dengan Filter & Pagination
   */
  static async getLogs(options?: {
    status?: string;
    resourceType?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    let query = db.select({
      id: satusehatLogs.id,
      orderId: satusehatLogs.orderId,
      patientId: satusehatLogs.patientId,
      resourceType: satusehatLogs.resourceType,
      action: satusehatLogs.action,
      status: satusehatLogs.status,
      satusehatId: satusehatLogs.satusehatId,
      httpStatus: satusehatLogs.httpStatus,
      errorMessage: satusehatLogs.errorMessage,
      retryCount: satusehatLogs.retryCount,
      createdAt: satusehatLogs.createdAt,
      order: {
        accessionNumber: orders.accessionNumber,
        modalityTypeCode: orders.modalityTypeCode,
        bodyPart: orders.bodyPart,
      },
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
        nik: patients.nik,
        ihsNumber: patients.ihsNumber,
      }
    })
    .from(satusehatLogs)
    .leftJoin(orders, eq(satusehatLogs.orderId, orders.id))
    .leftJoin(patients, eq(satusehatLogs.patientId, patients.id))
    .$dynamic();

    const conditions = [];

    if (options?.status && options.status !== "all") {
      conditions.push(eq(satusehatLogs.status, options.status as any));
    }

    if (options?.resourceType && options.resourceType !== "all") {
      conditions.push(eq(satusehatLogs.resourceType, options.resourceType as any));
    }

    if (options?.search) {
      conditions.push(
        sql`(${orders.accessionNumber} LIKE ${`%${options.search}%`} OR ${patients.fullName} LIKE ${`%${options.search}%`} OR ${patients.mrn} LIKE ${`%${options.search}%`} OR ${satusehatLogs.satusehatId} LIKE ${`%${options.search}%`})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query.orderBy(desc(satusehatLogs.createdAt)).limit(limit).offset(offset);

    // Total count for pagination
    const [totalRow] = await db.select({ count: count() }).from(satusehatLogs);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: totalRow.count,
        totalPages: Math.ceil((totalRow.count || 0) / limit),
      }
    };
  }

  /**
   * 10. Ambil Detail Log lengkap (termasuk JSON payload)
   */
  static async getLogDetail(id: number) {
    const rows = await db.select().from(satusehatLogs).where(eq(satusehatLogs.id, id)).limit(1);
    if (rows.length === 0) return null;

    const log = rows[0];
    let requestPayload = null;
    let responsePayload = null;

    try {
      if (log.requestPayload) {
        requestPayload = typeof log.requestPayload === "string" 
          ? JSON.parse(log.requestPayload) 
          : log.requestPayload;
      }
      if (log.responsePayload) {
        responsePayload = typeof log.responsePayload === "string" 
          ? JSON.parse(log.responsePayload) 
          : log.responsePayload;
      }
    } catch {}

    return {
      ...log,
      requestPayload,
      responsePayload,
    };
  }
}
