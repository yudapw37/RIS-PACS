import { Elysia } from "elysia";
import { ReportController } from "../controllers/reports.controller";

export const reportRoutes = new Elysia({ prefix: "/api/reports" })
  .get("/summary", ReportController.getSummaryHandler)
  .get("/by-day", ReportController.getByDayHandler)
  .get("/by-modality", ReportController.getByModalityHandler)
  .get("/by-body-part", ReportController.getByBodyPartHandler)
  .get("/by-radiologist", ReportController.getRadiologistHandler)
  .get("/by-referring-doctor", ReportController.getReferringDoctorsHandler)
  .get("/by-status", ReportController.getByStatusHandler)
  .get("/by-priority", ReportController.getByPriorityHandler);
