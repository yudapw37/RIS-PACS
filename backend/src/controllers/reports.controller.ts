import { ReportService } from "../services/reports.service";

const sendResponse = (set: any, status: number, msg: string, data: any = null) => {
  set.status = status;
  return { code: status, msg, data };
};

export class ReportController {
  static async getSummaryHandler({ query, set }: any) {
    try {
      const data = await ReportService.getSummary(query.from, query.to);
      return sendResponse(set, 200, "Summary berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat summary", { error: err.message });
    }
  }

  static async getByDayHandler({ query, set }: any) {
    try {
      const data = await ReportService.getByDay(query.from, query.to);
      return sendResponse(set, 200, "Data per hari berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat data per hari", { error: err.message });
    }
  }

  static async getByModalityHandler({ query, set }: any) {
    try {
      const data = await ReportService.getByModality(query.from, query.to);
      return sendResponse(set, 200, "Data per modality berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat data modality", { error: err.message });
    }
  }

  static async getByBodyPartHandler({ query, set }: any) {
    try {
      const data = await ReportService.getByBodyPart(query.from, query.to);
      return sendResponse(set, 200, "Data per body part berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat data body part", { error: err.message });
    }
  }

  static async getRadiologistHandler({ query, set }: any) {
    try {
      const data = await ReportService.getRadiologistProductivity(query.from, query.to);
      return sendResponse(set, 200, "Data radiolog berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat data radiolog", { error: err.message });
    }
  }

  static async getReferringDoctorsHandler({ query, set }: any) {
    try {
      const data = await ReportService.getReferringDoctors(query.from, query.to);
      return sendResponse(set, 200, "Data dokter pengirim berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat data dokter pengirim", { error: err.message });
    }
  }

  static async getByStatusHandler({ query, set }: any) {
    try {
      const data = await ReportService.getByStatus(query.from, query.to);
      return sendResponse(set, 200, "Distribusi status berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat distribusi status", { error: err.message });
    }
  }

  static async getByPriorityHandler({ query, set }: any) {
    try {
      const data = await ReportService.getByPriority(query.from, query.to);
      return sendResponse(set, 200, "Distribusi prioritas berhasil dimuat", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal memuat distribusi prioritas", { error: err.message });
    }
  }
}
