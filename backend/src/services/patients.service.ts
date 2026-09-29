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
    // 1. Cek apakah Nomor Rekam Medis (MRN) sudah pernah didaftarkan
    const existing = await db.select().from(patients).where(eq(patients.mrn, data.mrn)).limit(1);
    if (existing.length > 0) {
      const p = existing[0];
      const err: any = new Error(`Nomor Rekam Medis (MRN) '${data.mrn}' sudah terdaftar atas nama '${p.fullName}' (ID Pasien: ${p.id}).`);
      err.code = "ER_DUP_ENTRY";
      err.duplicateField = "mrn";
      err.duplicateValue = data.mrn;
      err.existingPatient = {
        id: p.id,
        mrn: p.mrn,
        fullName: p.fullName,
        nik: p.nik,
        gender: p.gender,
        dob: p.dob
      };
      throw err;
    }

    let normalizedGender: "L" | "P" | null = null;
    if (data.gender) {
      const g = String(data.gender).trim().toUpperCase();
      if (g === "L" || g === "M" || g === "MALE") {
        normalizedGender = "L";
      } else if (g === "P" || g === "F" || g === "FEMALE") {
        normalizedGender = "P";
      }
    }

    const dobValue = data.dob || data.birthDate;

    const [result]: any = await db.insert(patients).values({
      mrn: data.mrn,
      nik: data.nik || null,
      ihsNumber: data.ihsNumber || null,
      fullName: data.fullName,
      dob: dobValue ? new Date(dobValue) : null,
      gender: normalizedGender,
      address: data.address || null
    });

    const newId = result?.insertId ? Number(result.insertId) : undefined;
    return { 
      success: true, 
      message: "Pasien berhasil didaftarkan",
      id: newId,
      mrn: data.mrn,
      fullName: data.fullName,
      nik: data.nik || null,
      gender: normalizedGender,
      dob: dobValue || null
    };
  }

  static async getPatientById(id: number) {
    const records = await db.select().from(patients).where(eq(patients.id, id));
    return records.length ? records[0] : null;
  }

  static async updatePatient(id: number, data: any) {
    let normalizedGender: "L" | "P" | undefined = undefined;
    if (data.gender !== undefined) {
      const g = String(data.gender).trim().toUpperCase();
      if (g === "L" || g === "M" || g === "MALE") {
        normalizedGender = "L";
      } else if (g === "P" || g === "F" || g === "FEMALE") {
        normalizedGender = "P";
      }
    }

    const dobValue = data.dob || data.birthDate;

    await db.update(patients)
      .set({
        mrn: data.mrn || undefined,
        nik: data.nik !== undefined ? data.nik : undefined,
        ihsNumber: data.ihsNumber !== undefined ? data.ihsNumber : undefined,
        fullName: data.fullName || undefined,
        dob: dobValue ? new Date(dobValue) : undefined,
        gender: normalizedGender,
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
