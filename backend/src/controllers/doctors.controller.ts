import { DoctorService } from "../services/doctors.service";
import { sendResponse } from "../utils/response";

export class DoctorController {
  static async getAllHandler({ set }: any) {
    try {
      const data = await DoctorService.getAllDoctors();
      return sendResponse(set, 200, "Berhasil mengambil daftar dokter", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal mengambil data", { error: err.message });
    }
  }

  static async getByIdHandler({ params: { id }, set }: any) {
    try {
      const data = await DoctorService.getDoctorById(Number(id));
      if (!data) return sendResponse(set, 404, "Dokter tidak ditemukan");
      return sendResponse(set, 200, "Profile dokter berhasil ditarik", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal mengambil data dokter", { error: err.message });
    }
  }

  static async createHandler({ body, set }: any) {
    try {
      if (!body.fullName) return sendResponse(set, 400, "Nama Lengkap wajib diisi");
      const result = await DoctorService.createDoctor(body);
      return sendResponse(set, 201, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menyimpan dokter", { error: err.message });
    }
  }

  static async updateHandler({ params: { id }, body, set }: any) {
    try {
      const result = await DoctorService.updateDoctor(Number(id), body);
      return sendResponse(set, 200, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal memperbarui data dokter", { error: err.message });
    }
  }

  static async deleteHandler({ params: { id }, set }: any) {
    try {
      const result = await DoctorService.deleteDoctor(Number(id));
      return sendResponse(set, 200, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menghapus dokter", { error: err.message });
    }
  }
}
