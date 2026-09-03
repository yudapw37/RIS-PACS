import { eq } from "drizzle-orm";
import { db } from "../db";
import { doctors } from "../db/schema";

export class DoctorService {
  static async getAllDoctors() {
    return await db.select().from(doctors);
  }

  static async getDoctorById(id: number) {
    const records = await db.select().from(doctors).where(eq(doctors.id, id));
    return records.length ? records[0] : null;
  }

  static async createDoctor(data: any) {
    await db.insert(doctors).values({
      userId: data.userId || null,
      nip: data.nip || null,
      fullName: data.fullName,
      specialization: data.specialization || null,
      department: data.department || null
    });
    return { success: true, message: "Data dokter berhasil didaftarkan" };
  }

  static async updateDoctor(id: number, data: any) {
    await db.update(doctors)
      .set({
        userId: data.userId || undefined,
        nip: data.nip || undefined,
        fullName: data.fullName || undefined,
        specialization: data.specialization || undefined,
        department: data.department || undefined
      })
      .where(eq(doctors.id, id));
    return { success: true, message: "Data dokter berhasil diperbarui" };
  }


  static async deleteDoctor(id: number) {
    await db.delete(doctors).where(eq(doctors.id, id));
    return { success: true, message: "Data dokter berhasil dihapus" };
  }
}
