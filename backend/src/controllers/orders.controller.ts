import { OrderService } from "../services/orders.service";
import { sendResponse } from "../utils/response";

export class OrderController {
  static async getAllOrdersHandler({ set }: any) {
    try {
      const data = await OrderService.getAllOrders();
      return sendResponse(set, 200, "Berhasil memuat semua order", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Terjadi gangguan sistem memuat semua order", { error: err.message });
    }
  }

  static async getWorklistHandler({ set }: any) {
    try {
      const data = await OrderService.getWorklist();
      return sendResponse(set, 200, "Berhasil memuat Data Worklist", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Terjadi gangguan sistem memuat worklist", { error: err.message });
    }
  }

  static async getDicomWorklistHandler({ set }: any) {
    try {
      const data = await OrderService.getDicomWorklist();
      return sendResponse(set, 200, "Berhasil memuat Dicom Worklist", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Terjadi gangguan sistem memuat dicom worklist", { error: err.message });
    }
  }

  static async getExpertiseWorklistHandler({ set }: any) {
    try {
      const data = await OrderService.getExpertiseWorklist();
      return sendResponse(set, 200, "Berhasil memuat Worklist Bacaan", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Terjadi gangguan sistem memuat worklist bacaan", { error: err.message });
    }
  }

  static async getHistoryHandler({ set }: any) {
    try {
      const data = await OrderService.getHistory();
      return sendResponse(set, 200, "Berhasil memuat History Order", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Terjadi gangguan sistem memuat history", { error: err.message });
    }
  }

  static async updateStatusHandler({ params: { id }, body, set }: any) {
    try {
      if (!body.status) throw new Error("Status harus disertakan");
      const data = await OrderService.updateOrderStatus(Number(id), body.status);
      return sendResponse(set, 200, data.message, data);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal mengubah status order", { error: err.message });
    }
  }

  static async createOrderHandler({ body, set }: any) {
    try {
      const output = await OrderService.createOrder({
        patientId: body.patientId,
        noReg: body.noReg,
        doctorId: body.doctorId || null,
        accessionNumber: body.accessionNumber || "", // Service will regenerate if empty
        modalityTypeCode: body.modalityTypeCode,
        modalityId: body.modalityId || null,
        bodyPart: body.bodyPart || null,
        clinicalInfo: body.clinicalInfo || null,
        priority: body.priority || "routine",
      });
      
      return sendResponse(set, 201, "Jadwal order berhasil diciptakan", output);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal membuat jadwal radiologi", { error: err.message });
    }
  }

  static async getDetailsHandler({ params: { id }, set }: any) {
    try {
      const data = await OrderService.getOrderDetails(Number(id));
      if (!data) return sendResponse(set, 404, "Order tidak ditemukan", null);
      return sendResponse(set, 200, "Berhasil memuat detail order", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Terjadi gangguan sistem memuat detail", { error: err.message });
    }
  }

  static async saveExpertiseHandler({ params: { id }, body, set }: any) {
    try {
      const data = await OrderService.saveExpertise(Number(id), {
        doctorId: body.doctorId,
        findings: body.findings,
        conclusions: body.conclusions
      });
      return sendResponse(set, 200, data.message, data);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal meresepkan hasil keahlian", { error: err.message });
    }
  }

  static async deleteExpertiseHandler({ params: { id }, set }: any) {
    try {
      const data = await OrderService.deleteExpertise(Number(id));
      return sendResponse(set, 200, data.message, data);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menghapus hasil bacaan", { error: err.message });
    }
  }


  // 2c. Ambil Antrean Pemeriksaan (scheduled, in_progress)
  static async getExaminationWorklistHandler({ set }: any) {
    try {
      const data = await OrderService.getExaminationWorklist();
      return sendResponse(set, 200, "Antrean pemeriksaan berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat antrean pemeriksaan", { error: err.message });
    }
  }

  // 4. Mulai Pemeriksaan (Set status in_progress + catat jam mulai)
  static async startExaminationHandler({ params: { id }, user, set }: any) {
    try {
      if (!user || !user.id) {
        return sendResponse(set, 401, "Sesi login tidak valid atau kadaluarsa. Silakan login ulang.");
      }
      const data = await OrderService.startExamination(Number(id), Number(user.id));
      return sendResponse(set, 200, data.message, data);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal memulai pemeriksaan", { error: err.message });
    }
  }


  // 5. Selesai Pemeriksaan (Set status completed + catat jam selesai)
  static async finishExaminationHandler({ params: { id }, set }: any) {
    try {
      const data = await OrderService.finishExamination(Number(id));
      return sendResponse(set, 200, data.message, data);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menyelesaikan pemeriksaan", { error: err.message });
    }
  }

  // Cek apakah studi DICOM sudah ada di DCM4CHEE berdasarkan AccessionNumber order
  static async getStudyStatusHandler({ params: { id }, set }: any) {

    try {
      const dcm4cheeUrl = process.env.DCM4CHEE_API_URL || "http://arc:8080";
      const dcm4cheeAet = process.env.DCM4CHEE_AET || "DCM4CHEE";

      // Ambil accessionNumber dari order
      const order = await OrderService.getOrderDetails(Number(id));
      if (!order) return sendResponse(set, 404, "Order tidak ditemukan", null);

      const accession = order.accessionNumber;

      // Cari study di DCM4CHEE berdasarkan AccessionNumber via DICOMWeb QIDO-RS
      const qidoUrl = `${dcm4cheeUrl}/dcm4chee-arc/aets/${dcm4cheeAet}/rs/studies?AccessionNumber=${encodeURIComponent(accession)}&includefield=00080020,00100010`;
      const findRes = await fetch(qidoUrl, {
        headers: { "Accept": "application/dicom+json" }
      });

      if (!findRes.ok) throw new Error("DCM4CHEE PACS tidak dapat dijangkau");
      
      const studies: any[] = await findRes.json();

      if (!studies || studies.length === 0) {
        return sendResponse(set, 200, "Studi belum tersedia di PACS", { found: false, studyInstanceUID: null });
      }

      // Ambil StudyInstanceUID dari DICOM JSON response (tag 0020,000D)
      const studyInstanceUID = studies[0]?.["0020000D"]?.Value?.[0] || null;

      return sendResponse(set, 200, "Studi ditemukan", { found: true, studyInstanceUID });
    } catch (err: any) {
      return sendResponse(set, 200, "Gagal memeriksa PACS", { found: false, studyInstanceUID: null, error: err.message });
    }
  }

  // Ambil 8 studi terbaru dari DCM4CHEE
  static async getRecentStudiesHandler({ set }: any) {
    try {
      const dcm4cheeUrl = process.env.DCM4CHEE_API_URL || "http://arc:8080";
      const dcm4cheeAet = process.env.DCM4CHEE_AET || "DCM4CHEE";

      // DICOMWeb QIDO-RS: query studies, ordered by date, limit 8
      const qidoUrl = `${dcm4cheeUrl}/dcm4chee-arc/aets/${dcm4cheeAet}/rs/studies?limit=8&offset=0&orderby=-StudyDate&includefield=00080050,00100010,00080020`;
      const res = await fetch(qidoUrl, {
        headers: { "Accept": "application/dicom+json" }
      });

      if (!res.ok) throw new Error("DCM4CHEE PACS tidak dapat dijangkau");

      const dicomStudies: any[] = await res.json();

      const studies = dicomStudies.map((study: any) => ({
        studyInstanceUID: study?.["0020000D"]?.Value?.[0] || "",
        patientName: study?.["00100010"]?.Value?.[0]?.Alphabetic || "Unknown Patient",
        accessionNumber: study?.["00080050"]?.Value?.[0] || "",
        studyDate: study?.["00080020"]?.Value?.[0] || ""
      }));

      return sendResponse(set, 200, "Berhasil memuat studi terbaru", studies);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat studi DCM4CHEE", { error: err.message });
    }
  }

  // Query MWL items langsung dari DCM4CHEE (monitoring/debugging)
  static async getMwlItemsHandler({ set }: any) {
    try {
      const data = await OrderService.getMwlFromDCM4CHEE();
      return sendResponse(set, 200, "Berhasil memuat MWL dari DCM4CHEE", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat MWL dari DCM4CHEE", { error: err.message });
    }
  }

  // Cek koneksi DCM4CHEE
  static async getDCM4CHEEHealthHandler({ set }: any) {
    try {
      const data = await OrderService.checkDCM4CHEEHealth();
      return sendResponse(set, 200, "Status DCM4CHEE", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal cek DCM4CHEE", { error: err.message });
    }
  }
}
