import { ModalityService } from "../services/modalities.service";
import { sendResponse } from "../utils/response";

export class ModalityController {
  static async getModalitiesHandler({ set }: any) {
    try {
      const data = await ModalityService.getAllModalities();
      return sendResponse(set, 200, "Katalog alat Modality berhasil diretrieve", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Server Error", { error: err.message });
    }
  }

  static async getTypesHandler({ set }: any) {
    try {
      const data = await ModalityService.getModalityTypes();
      return sendResponse(set, 200, "Berhasil mengambil master jenis tipe modality", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Server Error", { error: err.message });
    }
  }

  static async createModalityHandler({ body, set }: any) {
    try {
      const output = await ModalityService.createModality(body);
      return sendResponse(set, 201, "Instalasi proxy Modality berhasil ditambahkan", output);
    } catch (err: any) {
      return sendResponse(set, 400, "Ada kesalahan pada penulisan Orthanc host atau database", { error: err.message });
    }
  }

  static async getByIdHandler({ params: { id }, set }: any) {
    try {
      const data = await ModalityService.getModalityById(Number(id));
      if (!data) return sendResponse(set, 404, "Modality tidak ditemukan");
      return sendResponse(set, 200, "Detail Modality berhasil ditarik", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Gagal mengambil data", { error: err.message });
    }
  }

  static async updateHandler({ params: { id }, body, set }: any) {
    try {
      const result = await ModalityService.updateModality(Number(id), body);
      return sendResponse(set, 200, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal memperbarui data", { error: err.message });
    }
  }

  static async deleteHandler({ params: { id }, set }: any) {
    try {
      const result = await ModalityService.deleteModality(Number(id));
      return sendResponse(set, 200, result.message, result);
    } catch (err: any) {
      return sendResponse(set, 400, "Gagal menghapus modality", { error: err.message });
    }
  }

  static async testConnectionHandler({ params: { id }, set }: any) {
    try {
      const result = await ModalityService.testConnection(Number(id));
      return sendResponse(set, 200, "Sukses", result);
    } catch (err: any) {
      return sendResponse(set, 400, "Uji koneksi gagal atau timeout", { error: err.message });
    }
  }

  static async getLogsHandler({ set }: any) {
    try {
      const data = await ModalityService.getConnectionLogs();
      return sendResponse(set, 200, "Log koneksi modality berhasil diretrieve", data);
    } catch (err: any) {
      return sendResponse(set, 500, "Server Error", { error: err.message });
    }
  }
}
