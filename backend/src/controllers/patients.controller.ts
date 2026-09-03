import { PatientService } from "../services/patients.service";
import { sendResponse } from "../utils/response";

export class PatientController {
  static async getPatientsHandler({ query, set }: any) {
    try {
      const options = {
        search: query?.search,
        limit: query?.limit ? Number(query.limit) : undefined
      };
      const data = await PatientService.getAllPatients(options);
      return sendResponse(set, 200, "Berhasil mengambil list pasien", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal meload database", { error: err.message });
    }
  }

  static async createPatientHandler({ body, set }: any) {
    try {
      const result = await PatientService.createPatient(body);
      return sendResponse(set, 201, "Data pasien berhasil disimpan", result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menyimpan pasien", { error: err.message });
    }
  }

  static async getPatientByIdHandler({ params: { id }, set }: any) {
    try {
      const data = await PatientService.getPatientById(Number(id));
      if (!data) return sendResponse(set, 404, "Pasien tidak ditemukan");
      return sendResponse(set, 200, "Profile pasien berhasil ditarik", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal mengambil data pasien", { error: err.message });
    }
  }

  static async updatePatientHandler({ params: { id }, body, set }: any) {
    try {
      const result = await PatientService.updatePatient(Number(id), body);
      return sendResponse(set, 200, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal memperbarui data pasien", { error: err.message });
    }
  }

  static async deletePatientHandler({ params: { id }, set }: any) {
    try {
      const result = await PatientService.deletePatient(Number(id));
      return sendResponse(set, 200, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menghapus pasien", { error: err.message });
    }
  }
}
