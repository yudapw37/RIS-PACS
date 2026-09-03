import { db } from "../db";
import { orders, patients, expertise, doctors, users } from "../db/schema";
import { eq, and, gte, lte, isNotNull, isNull, sql, count } from "drizzle-orm";

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
}
