import { SatusehatService } from "../services/satusehat.service";
import { OrderService } from "../services/orders.service";

export class SatusehatController {

  /**
   * GET /api/satusehat/stats
   * Ringkasan statistik & koneksi
   */
  static async getStatsHandler({ set }: any) {
    try {
      const stats = await SatusehatService.getStats();
      return { success: true, data: stats };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * GET /api/satusehat/logs
   * List log transaksi dengan filter
   */
  static async getLogsHandler({ query, set }: any) {
    try {
      const result = await SatusehatService.getLogs({
        status: query?.status,
        resourceType: query?.resourceType,
        search: query?.search,
        limit: query?.limit ? Number(query.limit) : 20,
        page: query?.page ? Number(query.page) : 1,
      });
      return { success: true, ...result };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * GET /api/satusehat/logs/:id
   * Detail log transaksi (request/response payload)
   */
  static async getLogDetailHandler({ params: { id }, set }: any) {
    try {
      const log = await SatusehatService.getLogDetail(Number(id));
      if (!log) {
        set.status = 404;
        return { success: false, message: "Log tidak ditemukan" };
      }
      return { success: true, data: log };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/push-order/:orderId
   * Trigger sinkronisasi manual order pemeriksaan radiologi ke SATUSEHAT
   */
  static async pushOrderHandler({ params: { orderId }, set }: any) {
    try {
      const id = Number(orderId);
      if (!id || isNaN(id)) {
        set.status = 400;
        return { success: false, message: "ID Order tidak valid atau kosong." };
      }
      const result = await SatusehatService.pushOrderToSatusehat(id);
      if (!result.success) {
        set.status = 400;
      }
      return result;
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/push-service-request/:orderId
   * Kirim ServiceRequest mandiri ke SATUSEHAT
   */
  static async pushServiceRequestHandler({ params: { orderId }, set }: any) {
    try {
      const id = Number(orderId);
      if (!id || isNaN(id)) {
        set.status = 400;
        return { success: false, message: "ID Order tidak valid." };
      }
      const result = await SatusehatService.pushServiceRequest(id);
      return result;
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * PUT /api/satusehat/orders/:orderId/service-request-id
   * Simpan atau update manual ID ServiceRequest (dari SIMRS eksternal)
   */
  static async updateServiceRequestIdHandler({ params: { orderId }, body, set }: any) {
    try {
      const id = Number(orderId);
      if (!id || isNaN(id)) {
        set.status = 400;
        return { success: false, message: "ID Order tidak valid." };
      }
      const result = await SatusehatService.updateServiceRequestId(id, body?.serviceRequestId || "");
      return result;
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * PUT /api/satusehat/orders/:orderId/encounter-id
   * Simpan atau update manual ID Encounter (dari SIMRS eksternal)
   */
  static async updateEncounterIdHandler({ params: { orderId }, body, set }: any) {
    try {
      const id = Number(orderId);
      if (!id || isNaN(id)) {
        set.status = 400;
        return { success: false, message: "ID Order tidak valid." };
      }
      const result = await SatusehatService.updateEncounterId(id, body?.encounterId || "");
      return result;
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/retry-log/:logId
   * Kirim ulang transaksi yang gagal
   */
  static async retryLogHandler({ params: { logId }, set }: any) {
    try {
      const result = await SatusehatService.retryLog(Number(logId));
      return { success: true, message: "Transaksi berhasil dikirim ulang", data: result };
    } catch (err: any) {
      set.status = 400;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/lookup-patient-ihs/:patientId
   * Cek / lookup IHS Number Pasien ke SATUSEHAT
   */
  static async lookupPatientIhsHandler({ params: { patientId }, body, set }: any) {
    try {
      const result = await SatusehatService.lookupPatientIhs(Number(patientId), body?.nik);
      return { success: true, ...result };
    } catch (err: any) {
      set.status = 400;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/lookup-doctor-ihs/:doctorId
   * Cek / lookup IHS Number Dokter ke SATUSEHAT
   */
  static async lookupDoctorIhsHandler({ params: { doctorId }, body, set }: any) {
    try {
      const result = await SatusehatService.lookupDoctorIhs(Number(doctorId), body?.nik);
      return { success: true, ...result };
    } catch (err: any) {
      set.status = 400;
      return { success: false, message: err.message };
    }
  }

  /**
   * GET /api/satusehat/settings
   * Mengambil setting konfigurasi
   */
  static async getSettingsHandler({ set }: any) {
    try {
      const settings = await SatusehatService.getSettings();
      // Mask client secret untuk keamanan tampilan
      const masked = {
        ...settings,
        clientSecret: settings.clientSecret ? `${settings.clientSecret.slice(0, 4)}••••••••` : "",
      };
      return { success: true, data: masked };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/settings
   * Update setting konfigurasi
   */
  static async updateSettingsHandler({ body, set }: any) {
    try {
      const result = await SatusehatService.updateSettings(body);
      return result;
    } catch (err: any) {
      set.status = 400;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/satusehat/test-connection
   * Uji coba token OAuth2 ke server SATUSEHAT
   */
  static async testConnectionHandler({ set }: any) {
    try {
      const result = await SatusehatService.getAuthToken();
      if (result.success) {
        return { success: true, message: "Koneksi ke SATUSEHAT berhasil!", tokenSample: result.token.slice(0, 15) + "..." };
      } else {
        set.status = 400;
        return { success: false, message: result.error || "Gagal menghubungi SATUSEHAT" };
      }
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: err.message };
    }
  }

  /**
   * POST /api/webhooks/dcm4chee/study-received
   * Webhook otomatis saat DCM4CHEE menerima DICOM study baru (Event-driven DICOM Router)
   */
  static async dicomWebhookHandler({ body, set }: any) {
    try {
      console.log("📥 [DCM4CHEE Webhook] DICOM Study Event diterima:", JSON.stringify(body));

      const accessionNumber = body?.accessionNumber || body?.["00080050"]?.Value?.[0];
      const studyInstanceUid = body?.studyInstanceUid || body?.["0020000D"]?.Value?.[0];

      if (!accessionNumber) {
        set.status = 400;
        return { success: false, message: "Accession Number tidak ditemukan dalam payload webhook" };
      }

      // Cari order di RIS yang memiliki accession number tersebut
      const allOrders = await OrderService.getAllOrders();
      const targetOrder = allOrders.find(o => o.accessionNumber === accessionNumber);

      if (!targetOrder) {
        console.warn(`⚠️ Order dengan Accession Number ${accessionNumber} tidak ditemukan di RIS.`);
        return { success: false, message: "Order tidak ditemukan di sistem RIS" };
      }

      // Cek setting auto-sync
      const settings = await SatusehatService.getSettings();
      if (settings.autoSyncOnExpertise === "yes") {
        // Trigger sinkronisasi secara background
        SatusehatService.pushOrderToSatusehat(targetOrder.id)
          .then(res => console.log(`🚀 [Auto-Sync Webhook] Hasil sync order ${targetOrder.id}:`, res.message))
          .catch(err => console.error(`❌ [Auto-Sync Webhook] Error sync order ${targetOrder.id}:`, err));
      }

      return {
        success: true,
        message: `Event DICOM diproses untuk Order ${accessionNumber}`,
        orderId: targetOrder.id,
      };
    } catch (err: any) {
      console.error("Error processing DCM4CHEE webhook:", err);
      set.status = 500;
      return { success: false, message: err.message };
    }
  }
}
