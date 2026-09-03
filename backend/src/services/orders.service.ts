import { db } from "../db";
import { orders, patients, doctors, modalities, modalityTypes, expertise } from "../db/schema";
import { eq, inArray, desc, or, and, isNull, isNotNull } from "drizzle-orm";
import { DCM4CHEEService } from "./dcm4chee.service";

export class OrderService {
  // 0. Get ALL Orders (semua status, untuk Manajemen Order)
  static async getAllOrders() {
    return await db.select({
      id: orders.id,
      patientId: orders.patientId,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      clinicalInfo: orders.clinicalInfo,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
        gender: patients.gender,
        dob: patients.dob,
      },
      doctor: {
        fullName: doctors.fullName,
      },
      modality: {
        name: modalities.name,
        aet: modalities.aet,
      }
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(doctors, eq(orders.doctorId, doctors.id))
    .leftJoin(modalities, eq(orders.modalityId, modalities.id))
    .orderBy(desc(orders.orderDate));
  }

  // 1. Get Active Worklist (Status: scheduled, in_progress)
  static async getWorklist() {
    return await db.select({
      id: orders.id,
      patientId: orders.patientId,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      clinicalInfo: orders.clinicalInfo,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
        gender: patients.gender,
        dob: patients.dob,
      },
      doctor: {
        fullName: doctors.fullName,
      },
      modality: {
        name: modalities.name,
        aet: modalities.aet,
      }
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(doctors, eq(orders.doctorId, doctors.id))
    .leftJoin(modalities, eq(orders.modalityId, modalities.id))
    .where(inArray(orders.status, ["scheduled", "in_progress"]))
    .orderBy(desc(orders.orderDate));
  }

  // 1b. Get API-Ready DICOM Worklist Format
  static async getDicomWorklist() {
    const records = await this.getWorklist();

    // Helper: safely parse dari DB (bisa Date object atau MySQL string "YYYY-MM-DD HH:MM:SS")
    // Bun (JavaScriptCore) strict soal format date, tidak bisa parse spasi separator
    const toDateSafe = (d: any): Date | null => {
      if (!d) return null;
      if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
      const parsed = new Date(String(d).replace(' ', 'T'));
      return isNaN(parsed.getTime()) ? null : parsed;
    };
    const formatDicomDate = (d: Date | null): string =>
      d ? d.toISOString().split('T')[0].replace(/-/g, '') : '';
    // Gunakan toISOString() bukan toTimeString() agar selalu UTC, konsisten dengan server
    const formatDicomTime = (d: Date | null): string =>
      d ? d.toISOString().split('T')[1].substring(0, 8).replace(/:/g, '') : '';

    return records.map(r => {
      const dateObj = toDateSafe(r.orderDate);
      const dobObj  = toDateSafe(r.patient?.dob);

      return {
        PatientID: r.patient?.mrn || r.patientId.toString(),
        PatientName: r.patient?.fullName || "UNKNOWN",
        PatientBirthDate: formatDicomDate(dobObj),
        PatientSex: r.patient?.gender === "L" ? "M" : (r.patient?.gender === "P" ? "F" : "O"),
        AccessionNumber: r.accessionNumber || "",
        RequestedProcedureID: r.id.toString(),
        RequestedProcedureDescription: r.bodyPart || "ROUTINE",
        ScheduledProcedureStepStartDate: formatDicomDate(dateObj),
        ScheduledProcedureStepStartTime: formatDicomTime(dateObj),
        ScheduledPerformingPhysicianName: r.doctor?.fullName || "",
        Modality: r.modalityTypeCode || "OT",
        ScheduledStationAETitle: r.modality?.aet || ""
      };
    });
  }


  // 2. Get Historical Orders (Status: canceled, failed, or completed WITH expertise)
  static async getHistory() {
    return await db.select({
      id: orders.id,
      patientId: orders.patientId,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
        gender: patients.gender,
      },
      doctor: {
        fullName: doctors.fullName,
      },
      expertise: {
        id: expertise.id
      }
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(doctors, eq(orders.doctorId, doctors.id))
    .leftJoin(expertise, eq(orders.id, expertise.orderId))
    .where(
      or(
        inArray(orders.status, ["canceled", "failed"]),
        and(eq(orders.status, "completed"), isNotNull(expertise.id))
      )
    )
    .orderBy(desc(orders.orderDate));
  }

  // 2b. Get Expertise Worklist (Status: completed WITHOUT expertise)
  static async getExpertiseWorklist() {
    return await db.select({
      id: orders.id,
      patientId: orders.patientId,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
        gender: patients.gender,
      },
      doctor: {
        fullName: doctors.fullName,
      }
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(doctors, eq(orders.doctorId, doctors.id))
    .leftJoin(expertise, eq(orders.id, expertise.orderId))
    .where(
      and(eq(orders.status, "completed"), isNull(expertise.id))
    )
    .orderBy(desc(orders.orderDate));
  }

  // 2c. Get Examination Worklist (Status: scheduled, in_progress)
  // Digunakan oleh Radiografer untuk memproses antrean rontgen
  static async getExaminationWorklist() {
    return await db.select({
      id: orders.id,
      patientId: orders.patientId,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
      }
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .where(
      inArray(orders.status, ["scheduled", "in_progress"])
    )
    .orderBy(desc(orders.orderDate));
  }


  // 3. Update Order Status
  static async updateOrderStatus(id: number, status: "scheduled" | "in_progress" | "completed" | "canceled" | "failed") {
    await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id));
    return { success: true, message: `Status order berhasil diubah menjadi ${status}` };
  }

  // 4. Start Examination (Radiographer clicks "Mulai")
  static async startExamination(id: number, radiographerId: number) {
    await db.update(orders).set({ 
      status: "in_progress",
      radiographerId,
      examStartedAt: new Date()
    }).where(eq(orders.id, id));
    return { success: true, message: "Pemeriksaan dimulai" };
  }

  // 5. Finish Examination (Radiographer clicks "Selesai")
  static async finishExamination(id: number) {
    await db.update(orders).set({ 
      status: "completed",
      examFinishedAt: new Date()
    }).where(eq(orders.id, id));
    return { success: true, message: "Pemeriksaan selesai" };
  }

  // 6. Create New Order (With Accession Generation + MWL Push ke DCM4CHEE)
  static async createOrder(data: typeof orders.$inferInsert) {
    // Generate Accession Number jika tidak disuplai (Format: ACC-YYYYMMDD-Random)
    if (!data.accessionNumber) {
        const date = new Date();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const yyyymmdd = date.toISOString().split('T')[0].replace(/-/g, '');
        data.accessionNumber = `ACC-${yyyymmdd}-${rand}`;
    }
    
    // Insert ke MySQL
    const result = await db.insert(orders).values(data);
    const orderId = Number(result[0].insertId);

    // === Push MWL ke DCM4CHEE ===
    // Ambil data pasien, dokter, dan modality untuk MWL payload
    try {
      const patientData = await db.select().from(patients).where(eq(patients.id, data.patientId)).limit(1);
      
      let doctorName: string | null = null;
      if (data.doctorId) {
        const doctorData = await db.select().from(doctors).where(eq(doctors.id, data.doctorId)).limit(1);
        doctorName = doctorData[0]?.fullName || null;
      }

      let modalityAet: string | null = null;
      if (data.modalityId) {
        const modalityData = await db.select().from(modalities).where(eq(modalities.id, data.modalityId)).limit(1);
        modalityAet = modalityData[0]?.aet || null;
      }

      if (patientData.length > 0) {
        const mwlResult = await DCM4CHEEService.pushMwlItem({
          patientMrn: patientData[0].mrn,
          patientName: patientData[0].fullName,
          patientDob: patientData[0].dob,
          patientGender: patientData[0].gender,
          accessionNumber: data.accessionNumber!,
          modalityTypeCode: data.modalityTypeCode,
          modalityAet,
          bodyPart: data.bodyPart || null,
          clinicalInfo: data.clinicalInfo || null,
          doctorName,
          priority: data.priority || "routine",
          orderDate: data.orderDate || new Date(),
          orderId,
        });
        
        console.log(`📋 MWL Push: ${mwlResult.message}`);
      }
    } catch (err: any) {
      // MWL push gagal tidak menggagalkan pembuatan order
      console.warn(`⚠️ Order dibuat tapi MWL push gagal: ${err.message}`);
    }

    return { success: true, message: "Order pemeriksaan radiologi berhasil dibuat", orderId };
  }

  // 6b. Query MWL Items langsung dari DCM4CHEE (untuk monitoring/debugging)
  static async getMwlFromDCM4CHEE() {
    return await DCM4CHEEService.queryMwlItems();
  }

  // 6c. Cek koneksi DCM4CHEE
  static async checkDCM4CHEEHealth() {
    const isUp = await DCM4CHEEService.healthCheck();
    return { dcm4chee: isUp ? "connected" : "disconnected" };
  }

  // 5. Get Order Details & Expertise
  static async getOrderDetails(id: number) {
    const orderData = await db.select({
      id: orders.id,
      patientId: orders.patientId,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      clinicalInfo: orders.clinicalInfo,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      patient: {
        mrn: patients.mrn,
        fullName: patients.fullName,
        gender: patients.gender,
        dob: patients.dob,
        address: patients.address
      },
      doctor: {
        fullName: doctors.fullName,
        specialization: doctors.specialization
      },
      modality: {
        name: modalities.name,
      }
    })
    .from(orders)
    .innerJoin(patients, eq(orders.patientId, patients.id))
    .leftJoin(doctors, eq(orders.doctorId, doctors.id))
    .leftJoin(modalities, eq(orders.modalityId, modalities.id))
    .where(eq(orders.id, id))
    .limit(1);

    if (orderData.length === 0) return null;

    // Get expertise if exists
    const expertiseData = await db.select()
      .from(expertise)
      .where(eq(expertise.orderId, id))
      .limit(1);

    return {
      ...orderData[0],
      expertise: expertiseData.length > 0 ? expertiseData[0] : null
    };
  }

  // 6. Save or Update Expertise
  static async saveExpertise(orderId: number, data: { doctorId: number, findings: string, conclusions: string }) {
    // Check if expertise already exists
    const existing = await db.select().from(expertise).where(eq(expertise.orderId, orderId)).limit(1);
    
    if (existing.length > 0) {
      await db.update(expertise)
        .set({
          doctorId: data.doctorId,
          findings: data.findings,
          conclusions: data.conclusions
        })
        .where(eq(expertise.orderId, orderId));
      return { success: true, message: "Expertise berhasil diperbarui" };
    } else {
      await db.insert(expertise).values({
        orderId,
        doctorId: data.doctorId,
        findings: data.findings,
        conclusions: data.conclusions
      });
      return { success: true, message: "Expertise berhasil disimpan" };
    }
  }

  // 7. Delete Expertise (kembalikan order ke Antrean Bacaan)
  static async deleteExpertise(orderId: number) {
    await db.delete(expertise).where(eq(expertise.orderId, orderId));
    return { success: true, message: "Bacaan dihapus, order dikembalikan ke antrean bacaan" };
  }
}
