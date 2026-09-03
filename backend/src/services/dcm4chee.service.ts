/**
 * DCM4CHEE Integration Service
 * 
 * Menangani komunikasi dengan DCM4CHEE Arc Light 5 REST API
 * untuk push MWL (Modality Worklist) items dan operasi PACS lainnya.
 * 
 * DCM4CHEE REST API MWL Endpoint:
 *   POST   /dcm4chee-arc/aets/{aet}/rs/mwlitems     → Create MWL item
 *   DELETE /dcm4chee-arc/aets/{aet}/rs/mwlitems/{id} → Delete MWL item
 *   GET    /dcm4chee-arc/aets/{aet}/rs/mwlitems      → Query MWL items
 * 
 * Format payload: DICOM JSON (tag-based keys)
 */

const DCM4CHEE_URL = process.env.DCM4CHEE_API_URL || "http://127.0.0.1:8082";
const DCM4CHEE_AET = process.env.DCM4CHEE_AET || "DCM4CHEE";

// Helper: format Date ke DICOM DA (YYYYMMDD)
const toDicomDate = (d: Date | string | null): string => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(String(d).replace(" ", "T"));
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0].replace(/-/g, "");
};

// Helper: format Date ke DICOM TM (HHMMSS)
const toDicomTime = (d: Date | string | null): string => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(String(d).replace(" ", "T"));
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[1].substring(0, 8).replace(/:/g, "");
};

interface MwlOrderData {
  patientMrn: string;
  patientName: string;
  patientDob: Date | string | null;
  patientGender: string | null;   // "L" atau "P"
  accessionNumber: string;
  modalityTypeCode: string;       // "CT", "CR", "DX", dll
  modalityAet: string | null;     // AET modality tujuan
  bodyPart: string | null;
  clinicalInfo: string | null;
  doctorName: string | null;
  priority: string;               // "routine", "urgent", "stat"
  orderDate: Date | string | null;
  orderId: number;
}

export class DCM4CHEEService {

  /**
   * Register Patient di DCM4CHEE (jika belum ada)
   * Harus dipanggil SEBELUM push MWL, karena DCM4CHEE butuh patient exist
   */
  static async ensurePatient(data: { mrn: string; name: string; dob: Date | string | null; gender: string | null }): Promise<boolean> {
    try {
      const dicomSex = data.gender === "L" ? "M" : (data.gender === "P" ? "F" : "O");

      const patientJson = {
        "00100020": { "vr": "LO", "Value": [data.mrn] },
        "00100010": { "vr": "PN", "Value": [{ "Alphabetic": data.name }] },
        "00100030": { "vr": "DA", "Value": [toDicomDate(data.dob)] },
        "00100040": { "vr": "CS", "Value": [dicomSex] },
      };

      const res = await fetch(
        `${DCM4CHEE_URL}/dcm4chee-arc/aets/${DCM4CHEE_AET}/rs/patients`,
        {
          method: "POST",
          headers: { "Content-Type": "application/dicom+json" },
          body: JSON.stringify(patientJson),
        }
      );

      if (res.ok || res.status === 200 || res.status === 204 || res.status === 409) {
        // 409 = patient already exists, which is fine
        console.log(`✅ Patient ${data.mrn} ready in DCM4CHEE`);
        return true;
      } else {
        const errText = await res.text();
        console.warn(`⚠️ Create patient failed (${res.status}): ${errText}`);
        return false;
      }
    } catch (err: any) {
      console.warn(`⚠️ Create patient error: ${err.message}`);
      return false;
    }
  }

  /**
   * Push MWL Item ke DCM4CHEE
   * Dipanggil setelah order dibuat di SmartRIS
   * 
   * Flow: 1) Create/ensure patient → 2) Create MWL item
   * Modality akan bisa query worklist ini via DICOM C-FIND (MWL SCP)
   * di port 11112, tanpa perlu plugin tambahan.
   */
  static async pushMwlItem(data: MwlOrderData): Promise<{ success: boolean; message: string }> {
    try {
      // Step 1: Pastikan patient terdaftar di DCM4CHEE
      await this.ensurePatient({
        mrn: data.patientMrn,
        name: data.patientName,
        dob: data.patientDob,
        gender: data.patientGender,
      });

      // Step 2: Map gender & priority
      const dicomSex = data.patientGender === "L" ? "M" : (data.patientGender === "P" ? "F" : "O");
      const dicomPriority = data.priority === "stat" ? "STAT" : (data.priority === "urgent" ? "URGENT" : "ROUTINE");

      // Step 3: Build DICOM JSON payload untuk MWL
      // Referensi: DICOM PS3.4 Annex K - Modality Worklist

      // === Scheduled Procedure Step (SPS) Item ===
      // Mode Spesifik : modalityAet diisi → ScheduledStationAETitle = AET alat (hanya alat itu yg lihat)
      // Mode Broadcast: modalityAet kosong → tag 00400001 dihapus → semua alat tipe sama bisa lihat
      const spsItem: Record<string, any> = {
        "00080060": { "vr": "CS", "Value": [data.modalityTypeCode] },                 // Modality
        "00400002": { "vr": "DA", "Value": [toDicomDate(data.orderDate)] },           // Scheduled Procedure Step Start Date
        "00400003": { "vr": "TM", "Value": [toDicomTime(data.orderDate)] },           // Scheduled Procedure Step Start Time
        "00400007": { "vr": "LO", "Value": [data.bodyPart || "EXAMINATION"] },        // Scheduled Procedure Step Description
        "00400009": { "vr": "SH", "Value": [`SPS-${data.orderId}`] },                 // Scheduled Procedure Step ID
        "00400010": { "vr": "SH", "Value": [""] },                                    // Scheduled Station Name
        "00400011": { "vr": "SH", "Value": [data.bodyPart || ""] },                   // Scheduled Procedure Step Location
        "00400008": {                                                                   // Scheduled Protocol Code Sequence
          "vr": "SQ",
          "Value": [{
            "00080100": { "vr": "SH", "Value": [data.modalityTypeCode] },
            "00080102": { "vr": "SH", "Value": ["DCM"] },
            "00080104": { "vr": "LO", "Value": [data.bodyPart || "ROUTINE"] }
          }]
        }
      };

      // Hanya tambahkan ScheduledStationAETitle jika alat fisik dipilih (Mode Spesifik)
      if (data.modalityAet) {
        spsItem["00400001"] = { "vr": "AE", "Value": [data.modalityAet] };
        console.log(`🎯 Mode Spesifik: Order diarahkan ke alat [${data.modalityAet}]`);
      } else {
        console.log(`📡 Mode Broadcast: Order terlihat semua alat tipe [${data.modalityTypeCode}]`);
      }

      const dicomJson = {
        // === Patient Module ===
        "00100020": { "vr": "LO", "Value": [data.patientMrn] },                          // Patient ID
        "00100010": { "vr": "PN", "Value": [{ "Alphabetic": data.patientName }] },        // Patient Name
        "00100030": { "vr": "DA", "Value": [toDicomDate(data.patientDob)] },              // Patient Birth Date
        "00100040": { "vr": "CS", "Value": [dicomSex] },                                  // Patient Sex

        // === General Study Module ===
        "00080050": { "vr": "SH", "Value": [data.accessionNumber] },                      // Accession Number
        "00080090": { "vr": "PN", "Value": [{ "Alphabetic": data.doctorName || "" }] },   // Referring Physician Name
        "00081080": { "vr": "LO", "Value": [data.clinicalInfo || ""] },                   // Admitting Diagnoses Description

        // === Requested Procedure Module ===
        "00401001": { "vr": "SH", "Value": [`RP-${data.orderId}`] },                     // Requested Procedure ID
        "00321060": { "vr": "LO", "Value": [data.bodyPart || "ROUTINE EXAMINATION"] },   // Requested Procedure Description
        "00401003": { "vr": "SH", "Value": [dicomPriority] },                             // Requested Procedure Priority

        // === Imaging Service Request Module ===
        "00402001": { "vr": "LO", "Value": [data.clinicalInfo || ""] },                   // Reason for Requested Procedure
        "00080080": { "vr": "LO", "Value": ["SmartRIS V3"] },                             // Institution Name

        // === Scheduled Procedure Step Sequence ===
        "00400100": { "vr": "SQ", "Value": [spsItem] }
      };

      // Step 4: Push MWL item
      const response = await fetch(
        `${DCM4CHEE_URL}/dcm4chee-arc/aets/${DCM4CHEE_AET}/rs/mwlitems`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/dicom+json",
            "Accept": "application/dicom+json"
          },
          body: JSON.stringify(dicomJson),
        }
      );

      if (response.ok || response.status === 200 || response.status === 204) {
        console.log(`✅ MWL pushed to DCM4CHEE: ${data.accessionNumber}`);
        return { success: true, message: `MWL berhasil dikirim ke DCM4CHEE (ACC: ${data.accessionNumber})` };
      } else {
        const errText = await response.text();
        console.warn(`⚠️ MWL push failed (${response.status}): ${errText}`);
        return { success: false, message: `DCM4CHEE merespon ${response.status}: ${errText}` };
      }
    } catch (err: any) {
      console.warn(`⚠️ MWL push error: ${err.message}`);
      return { success: false, message: `Gagal koneksi DCM4CHEE: ${err.message}` };
    }
  }

  /**
   * Delete MWL Item dari DCM4CHEE
   * Dipanggil saat order di-cancel dari SmartRIS
   */
  static async deleteMwlItem(studyInstanceUID: string, spsID: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${DCM4CHEE_URL}/dcm4chee-arc/aets/${DCM4CHEE_AET}/rs/mwlitems/${studyInstanceUID}/${spsID}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        console.log(`✅ MWL deleted from DCM4CHEE: ${spsID}`);
        return { success: true, message: "MWL berhasil dihapus dari DCM4CHEE" };
      } else {
        return { success: false, message: `DCM4CHEE merespon ${response.status}` };
      }
    } catch (err: any) {
      return { success: false, message: `Gagal koneksi DCM4CHEE: ${err.message}` };
    }
  }

  /**
   * Query MWL Items dari DCM4CHEE
   * Untuk debugging/monitoring dari SmartRIS dashboard
   */
  static async queryMwlItems(): Promise<any[]> {
    try {
      const response = await fetch(
        `${DCM4CHEE_URL}/dcm4chee-arc/aets/${DCM4CHEE_AET}/rs/mwlitems`,
        {
          headers: { "Accept": "application/dicom+json" }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Cek apakah DCM4CHEE bisa dihubungi
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${DCM4CHEE_URL}/dcm4chee-arc/aets`, { signal: AbortSignal.timeout(5000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}
