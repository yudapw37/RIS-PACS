import { db } from "../db";
import { orders, patients, expertise, doctors, users } from "../db/schema";
import { eq, and, gte, lte, isNotNull, isNull, sql, count, desc } from "drizzle-orm";

export class ReportService {

  // Parsing tanggal: default range = 30 hari terakhir
  static parseDateRange(from?: string, to?: string) {
    const end   = to   ? new Date(to)   : new Date();
    const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Set ke awal/akhir hari
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // 1. Ringkasan (Summary Cards)
  static async getSummary(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    const [totalOrders] = await db.select({ count: count() })
      .from(orders)
      .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)));

    const [totalCanceled] = await db.select({ count: count() })
      .from(orders)
      .where(and(
        gte(orders.orderDate, start),
        lte(orders.orderDate, end),
        eq(orders.status, "canceled")
      ));

    const [totalCompleted] = await db.select({ count: count() })
      .from(orders)
      .where(and(
        gte(orders.orderDate, start),
        lte(orders.orderDate, end),
        eq(orders.status, "completed")
      ));

    // Hitung jumlah pasien unik dalam periode
    const uniquePatients = await db.selectDistinct({ patientId: orders.patientId })
      .from(orders)
      .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)));

    // Waktu rata-rata pelaporan (orderDate → expertise.createdAt)
    const reportingTimes = await db.select({
      orderDate:        orders.orderDate,
      expertiseCreated: expertise.createdAt,
    })
    .from(orders)
    .innerJoin(expertise, eq(expertise.orderId, orders.id))
    .where(and(
      gte(orders.orderDate, start),
      lte(orders.orderDate, end),
      isNotNull(expertise.createdAt)
    ));

    let avgReportingHours = 0;
    if (reportingTimes.length > 0) {
      const totalMs = reportingTimes.reduce((acc, r) => {
        const diffMs = new Date(r.expertiseCreated!).getTime() - new Date(r.orderDate!).getTime();
        return acc + (diffMs > 0 ? diffMs : 0);
      }, 0);
      avgReportingHours = Math.round((totalMs / reportingTimes.length) / (1000 * 60 * 60) * 10) / 10;
    }

    const totalCount    = totalOrders.count;
    const canceledCount = totalCanceled.count;
    const completedCount = totalCompleted.count;

    return {
      totalOrders:        totalCount,
      totalPatients:      uniquePatients.length,
      totalCompleted:     completedCount,
      totalCanceled:      canceledCount,
      cancellationRate:   totalCount > 0 ? Math.round((canceledCount / totalCount) * 100 * 10) / 10 : 0,
      avgReportingHours,
    };
  }

  // 2. Pemeriksaan per hari (untuk line chart)
  static async getByDay(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    const rows = await db.select({
      day:   sql<string>`DATE(orders.order_date)`,
      total: count(),
    })
    .from(orders)
    .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)))
    .groupBy(sql`DATE(orders.order_date)`)
    .orderBy(sql`DATE(orders.order_date)`);

    return rows;
  }

  // 3. Pemeriksaan per Modality Type (bar chart)
  static async getByModality(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    return await db.select({
      modalityTypeCode: orders.modalityTypeCode,
      total:            count(),
    })
    .from(orders)
    .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)))
    .groupBy(orders.modalityTypeCode)
    .orderBy(sql`count(*) desc`);
  }

  // 4. Pemeriksaan per Body Part (bar chart horizontal)
  static async getByBodyPart(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    return await db.select({
      bodyPart: orders.bodyPart,
      total:    count(),
    })
    .from(orders)
    .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end), isNotNull(orders.bodyPart)))
    .groupBy(orders.bodyPart)
    .orderBy(sql`count(*) desc`)
    .limit(10);
  }

  // 5. Produktivitas Dokter Radiologi (tabel)
  static async getRadiologistProductivity(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    return await db.select({
      doctorId:   expertise.doctorId,
      doctorName: doctors.fullName,
      total:      count(),
    })
    .from(expertise)
    .innerJoin(doctors, eq(doctors.id, expertise.doctorId))
    .innerJoin(orders, eq(orders.id, expertise.orderId))
    .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)))
    .groupBy(expertise.doctorId, doctors.fullName)
    .orderBy(sql`count(*) desc`);
  }

  // 6. Dokter Pengirim Terbanyak (tabel)
  static async getReferringDoctors(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    return await db.select({
      doctorId:   orders.doctorId,
      doctorName: doctors.fullName,
      total:      count(),
    })
    .from(orders)
    .innerJoin(doctors, eq(doctors.id, orders.doctorId!))
    .where(and(
      gte(orders.orderDate, start),
      lte(orders.orderDate, end),
      isNotNull(orders.doctorId)
    ))
    .groupBy(orders.doctorId, doctors.fullName)
    .orderBy(sql`count(*) desc`)
    .limit(10);
  }

  // 7. Status Distribusi (doughnut chart)
  static async getByStatus(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    return await db.select({
      status: orders.status,
      total:  count(),
    })
    .from(orders)
    .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)))
    .groupBy(orders.status)
    .orderBy(sql`count(*) desc`);
  }

  // 8. Distribusi Prioritas (doughnut chart)
  static async getByPriority(from?: string, to?: string) {
    const { start, end } = this.parseDateRange(from, to);

    return await db.select({
      priority: orders.priority,
      total:    count(),
    })
    .from(orders)
    .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)))
    .groupBy(orders.priority);
  }

  // 9. Laporan Rinci Waktu Tunggu Pasien (Turnaround Time - TAT & Standar Pelayanan Minimal)
  static async getPatientWaitingTimeReport(params: {
    from?: string;
    to?: string;
    modality?: string;
    priority?: string;
    compliance?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { start, end } = this.parseDateRange(params.from, params.to);
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 25;
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      gte(orders.orderDate, start),
      lte(orders.orderDate, end),
    ];

    if (params.modality && params.modality !== "all") {
      conditions.push(eq(orders.modalityTypeCode, params.modality));
    }
    if (params.priority && params.priority !== "all") {
      conditions.push(eq(orders.priority, params.priority as any));
    }

    const rows = await db.select({
      id: orders.id,
      noReg: orders.noReg,
      accessionNumber: orders.accessionNumber,
      modalityTypeCode: orders.modalityTypeCode,
      bodyPart: orders.bodyPart,
      priority: orders.priority,
      status: orders.status,
      orderDate: orders.orderDate,
      examStartedAt: orders.examStartedAt,
      examFinishedAt: orders.examFinishedAt,
      patientId: patients.id,
      patientMrn: patients.mrn,
      patientName: patients.fullName,
      expertiseId: expertise.id,
      expertiseCreatedAt: expertise.createdAt,
      radiologistName: doctors.fullName,
      radiographerName: users.username,
    })
    .from(orders)
    .innerJoin(patients, eq(patients.id, orders.patientId))
    .leftJoin(expertise, eq(expertise.orderId, orders.id))
    .leftJoin(doctors, eq(doctors.id, expertise.doctorId))
    .leftJoin(users, eq(users.id, orders.radiographerId))
    .where(and(...conditions))
    .orderBy(desc(orders.orderDate));

    // Hitung metrik durasi per baris pasien
    let list = rows.map((r) => {
      const tOrder = r.orderDate ? new Date(r.orderDate).getTime() : null;
      const tStart = r.examStartedAt ? new Date(r.examStartedAt).getTime() : null;
      const tFinish = r.examFinishedAt ? new Date(r.examFinishedAt).getTime() : null;
      const tExp = r.expertiseCreatedAt ? new Date(r.expertiseCreatedAt).getTime() : null;

      // 1. Waktu Tunggu Diterima (Antre Masuk Ruang Pemeriksaan: orderDate -> examStartedAt)
      const waitTimeExamMinutes = (tOrder && tStart)
        ? Math.max(0, Math.round((tStart - tOrder) / 60000))
        : null;

      // 2. Durasi Tindakan Pemeriksaan (examStartedAt -> examFinishedAt)
      const examDurationMinutes = (tStart && tFinish)
        ? Math.max(0, Math.round((tFinish - tStart) / 60000))
        : null;

      // 3. Waktu Tunggu Ekspertise (Antre Baca Dokter: examFinishedAt -> expertiseCreatedAt)
      const waitTimeExpertiseMinutes = (tFinish && tExp)
        ? Math.max(0, Math.round((tExp - tFinish) / 60000))
        : null;

      // 4. Total Waktu Layanan (Turnaround Time: orderDate -> expertiseCreatedAt)
      const totalTatMinutes = (tOrder && tExp)
        ? Math.max(0, Math.round((tExp - tOrder) / 60000))
        : null;

      // Standar Pelayanan Minimal (SPM) Kemenkes:
      // - CITO (urgent / stat): target maksimal 60 menit
      // - Rutin (routine): target maksimal 180 menit (3 jam)
      const isCito = r.priority === "urgent" || r.priority === "stat";
      const spmTargetMinutes = isCito ? 60 : 180;
      
      let complianceStatus: "compliant" | "overtime" | "in_progress" = "in_progress";
      if (totalTatMinutes !== null) {
        complianceStatus = totalTatMinutes <= spmTargetMinutes ? "compliant" : "overtime";
      }

      return {
        ...r,
        waitTimeExamMinutes,
        examDurationMinutes,
        waitTimeExpertiseMinutes,
        totalTatMinutes,
        spmTargetMinutes,
        complianceStatus,
      };
    });

    // Filter pencarian
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(item =>
        (item.patientName && item.patientName.toLowerCase().includes(q)) ||
        (item.patientMrn && item.patientMrn.toLowerCase().includes(q)) ||
        (item.accessionNumber && item.accessionNumber.toLowerCase().includes(q)) ||
        (item.noReg && item.noReg.toLowerCase().includes(q)) ||
        (item.radiologistName && item.radiologistName.toLowerCase().includes(q))
      );
    }

    // Filter status kepatuhan
    if (params.compliance && params.compliance !== "all") {
      list = list.filter(item => item.complianceStatus === params.compliance);
    }

    // Hitung Summary KPI
    const helperAvg = (arr: number[]) => arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    
    const validWaitExam = list.map(x => x.waitTimeExamMinutes).filter((x): x is number => x !== null);
    const validExamDuration = list.map(x => x.examDurationMinutes).filter((x): x is number => x !== null);
    const validWaitExpertise = list.map(x => x.waitTimeExpertiseMinutes).filter((x): x is number => x !== null);
    const completedItems = list.filter(x => x.totalTatMinutes !== null);
    const validTotalTat = completedItems.map(x => x.totalTatMinutes!);

    const compliantCount = completedItems.filter(x => x.complianceStatus === "compliant").length;
    const overtimeCount = completedItems.filter(x => x.complianceStatus === "overtime").length;
    const complianceRate = completedItems.length > 0
      ? Math.round((compliantCount / completedItems.length) * 100 * 10) / 10
      : 100;

    const totalCount = list.length;
    const paginatedItems = list.slice(offset, offset + limit);

    return {
      summary: {
        totalPatients: totalCount,
        completedCount: completedItems.length,
        inProgressCount: totalCount - completedItems.length,
        avgWaitExamMinutes: helperAvg(validWaitExam),
        avgExamDurationMinutes: helperAvg(validExamDuration),
        avgWaitExpertiseMinutes: helperAvg(validWaitExpertise),
        avgTotalTatMinutes: helperAvg(validTotalTat),
        compliantCount,
        overtimeCount,
        complianceRate,
      },
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      data: paginatedItems,
    };
  }
}
