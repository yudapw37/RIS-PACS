import { Elysia, t } from "elysia";
import { OrderController } from "../controllers/orders.controller";

export const orderRoutes = new Elysia({ prefix: "/api/orders" })
  .get("/all", OrderController.getAllOrdersHandler)
  .get("/worklist", OrderController.getWorklistHandler)


  .get("/dicom-worklist", OrderController.getDicomWorklistHandler)
  .get("/expertise-worklist", OrderController.getExpertiseWorklistHandler)
  .get("/examination-worklist", OrderController.getExaminationWorklistHandler)
  .get("/history", OrderController.getHistoryHandler)
  .get("/recent-studies", OrderController.getRecentStudiesHandler)
  .patch("/:id/start", OrderController.startExaminationHandler)
  .patch("/:id/finish", OrderController.finishExaminationHandler)
  .patch("/:id/status", OrderController.updateStatusHandler, {
    body: t.Object({
      status: t.Union([
        t.Literal("scheduled"), 
        t.Literal("in_progress"), 
        t.Literal("completed"), 
        t.Literal("canceled"), 
        t.Literal("failed")
      ])
    })
  })
  .post("/", OrderController.createOrderHandler, {
    body: t.Object({
      patientId: t.Number(),
      noReg: t.String(),
      doctorId: t.Optional(t.Number()),
      accessionNumber: t.Optional(t.String()),
      modalityTypeCode: t.String(),
      modalityId: t.Optional(t.Number()),
      bodyPart: t.Optional(t.String()),
      clinicalInfo: t.Optional(t.String()),
      priority: t.Optional(t.Union([t.Literal("routine"), t.Literal("urgent"), t.Literal("stat")]))
    })
  })
  .get("/:id", OrderController.getDetailsHandler)
  .get("/:id/study-status", OrderController.getStudyStatusHandler)
  .post("/:id/expertise", OrderController.saveExpertiseHandler, {
    body: t.Object({
      doctorId: t.Number(),
      findings: t.String(),
      conclusions: t.String()
    })
  })
  .delete("/:id/expertise", OrderController.deleteExpertiseHandler)
  // === DCM4CHEE Integration ===
  .get("/dcm4chee/mwl", OrderController.getMwlItemsHandler)
  .get("/dcm4chee/health", OrderController.getDCM4CHEEHealthHandler);

