import { eq, like, or } from "drizzle-orm";
import { db } from "../db";
import { patients } from "../db/schema";

export class PatientService {
  static async getAllPatients(options?: { search?: string; limit?: number }) {
    let q = db.select().from(patients).$dynamic();
    
    if (options?.search) {
      q = q.where(
        or(
          like(patients.fullName, `%${options.search}%`),
          like(patients.mrn, `%${options.search}%`)
        )
      );
    }
    
    if (options?.limit) {
      q = q.limit(options.limit);
    }
    
    return await q;
  }

  static async createPatient(data: any) {
    await db.insert(patients).values({
      mrn: data.mrn,
      fullName: data.fullName,
      dob: data.dob ? new Date(data.dob) : null,
      gender: data.gender,
      address: data.address
    });
    return { success: true, message: "Pasien berhasil didaftarkan" };
  }

  static async getPatientById(id: number) {
    const records = await db.select().from(patients).where(eq(patients.id, id));
    return records.length ? records[0] : null;
  }

  static async updatePatient(id: number, data: any) {
    await db.update(patients)
      .set({
        mrn: data.mrn || undefined,
        fullName: data.fullName || undefined,
        dob: data.dob ? new Date(data.dob) : undefined,
        gender: data.gender || undefined,
        address: data.address || undefined
      })
      .where(eq(patients.id, id));
    return { success: true, message: "Data pasien berhasil diperbarui" };
  }

  static async deletePatient(id: number) {
    await db.delete(patients).where(eq(patients.id, id));
    return { success: true, message: "Data pasien berhasil dihapus" };
  }
}
