import { eq } from "drizzle-orm";
import { db } from "../db";
import { modalities, modalityTypes, modalityConnectionLogs } from "../db/schema";

const DCM4CHEE_URL = process.env.DCM4CHEE_API_URL || "http://127.0.0.1:8082";
const DCM4CHEE_AET = process.env.DCM4CHEE_AET || "DCM4CHEE";

export class ModalityService {
  static async getAllModalities() {
    return await db.select().from(modalities);
  }

  static async getModalityTypes() {
    return await db.select().from(modalityTypes);
  }

  static async createModality(data: any) {
    // BUSINESS LOGIC: Register modality ke DCM4CHEE via REST Config API
    // DCM4CHEE mengelola device configuration melalui LDAP, diakses via REST:
    //   1. PUT /devices/{deviceName}  → Buat device baru
    //   Payload harus berisi: dicomDeviceName, AE Title, dan Network Connection
    try {
      const deviceName = data.aet.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

      // Device payload lengkap: device + AE + network connection
      const devicePayload = {
        dicomDeviceName: deviceName,
        dicomInstalled: true,
        dicomDescription: `${data.name} (SmartRIS)`,
        // Network Connection
        dicomNetworkConnection: [
          {
            cn: `dicom`,
            dicomHostname: data.ipAddress,
            dicomPort: data.port,
            dicomInstalled: true,
          }
        ],
        // AE Title
        dicomNetworkAE: [
          {
            dicomAETitle: data.aet,
            dicomAssociationInitiator: true,
            dicomAssociationAcceptor: true,
            dicomNetworkConnectionReference: ["/dicomNetworkConnection/0"],
            dicomInstalled: true,
          }
        ]
      };

      const dcm4cheeRes = await fetch(
        `${DCM4CHEE_URL}/dcm4chee-arc/devices/${deviceName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(devicePayload),
        }
      );

      if (dcm4cheeRes.ok || dcm4cheeRes.status === 204) {
        console.log(`✅ Device ${data.aet} berhasil didaftarkan ke DCM4CHEE`);
      } else {
        const errText = await dcm4cheeRes.text();
        console.warn(
          `⚠️ DCM4CHEE merespon ${dcm4cheeRes.status}: ${errText} — registrasi RIS dilanjutkan`
        );
      }
    } catch (err: any) {
      console.warn(`⚠️ Gagal koneksi ke DCM4CHEE (${err.message}), registrasi RIS dilanjutkan`);
    }

    // Insert ke Database MySQL
    await db.insert(modalities).values({
      name: data.name,
      typeCode: data.typeCode,
      aet: data.aet,
      ipAddress: data.ipAddress,
      port: data.port,
    });

    return {
      success: true,
      message: "Modality berhasil ditambahkan ke RIS dan DCM4CHEE",
    };
  }

  static async getModalityById(id: number) {
    const records = await db
      .select()
      .from(modalities)
      .where(eq(modalities.id, id));
    return records.length ? records[0] : null;
  }

  static async updateModality(id: number, data: any) {
    await db
      .update(modalities)
      .set({
        name: data.name || undefined,
        typeCode: data.typeCode || undefined,
        aet: data.aet || undefined,
        ipAddress: data.ipAddress || undefined,
        port: data.port || undefined,
      })
      .where(eq(modalities.id, id));
    return { success: true, message: "Data modality berhasil diperbarui" };
  }

  static async deleteModality(id: number) {
    await db.delete(modalities).where(eq(modalities.id, id));
    return { success: true, message: "Data modality berhasil dihapus" };
  }

  static async testConnection(id: number) {
    // 1. Ambil Modality
    const modality = await this.getModalityById(id);
    if (!modality) throw new Error("Alat modality tidak ditemukan");

    // 2. Tembak ke DCM4CHEE DIMSE Echo API
    let statusMessage = "Koneksi DCM4CHEE gagal / Timeout";
    let isSuccess = false;
    try {
      // DCM4CHEE: DICOM Echo via REST
      // POST /dcm4chee-arc/aets/{aet}/dimse/{externalAET}
      const response = await fetch(
        `${DCM4CHEE_URL}/dcm4chee-arc/aets/${DCM4CHEE_AET}/dimse/${modality.aet}`,
        { method: "POST" }
      );

      if (response.ok) {
        isSuccess = true;
        statusMessage = "Koneksi DICOM Echo berhasil direspon alat";
      } else {
        const errText = await response.text();
        statusMessage = `Alat menolak / DCM4CHEE gagal menyapa. Error: ${response.status} - ${errText}`;
      }
    } catch (err: any) {
      statusMessage = `Error Network: ${err.message}`;
    }

    // 3. Masukkan Log ke DB
    await db.insert(modalityConnectionLogs).values({
      modalityId: id,
      status: isSuccess ? "success" : "failed",
      message: statusMessage,
    });

    if (!isSuccess) throw new Error(statusMessage);
    return { success: true, message: statusMessage };
  }

  static async getConnectionLogs() {
    return await db
      .select({
        id: modalityConnectionLogs.id,
        modalityId: modalityConnectionLogs.modalityId,
        status: modalityConnectionLogs.status,
        message: modalityConnectionLogs.message,
        createdAt: modalityConnectionLogs.createdAt,
        modalityName: modalities.name,
        modalityAet: modalities.aet,
      })
      .from(modalityConnectionLogs)
      .leftJoin(
        modalities,
        eq(modalityConnectionLogs.modalityId, modalities.id)
      )
      .orderBy(modalityConnectionLogs.createdAt);
  }
}
