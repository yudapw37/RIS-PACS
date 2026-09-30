import { Elysia, t } from "elysia";
import { SatusehatController } from "../controllers/satusehat.controller";

export const satusehatRoutes = new Elysia({ prefix: "/api/satusehat" })
  .get("/stats", SatusehatController.getStatsHandler)
  .get("/logs", SatusehatController.getLogsHandler)
  .get("/logs/:id", SatusehatController.getLogDetailHandler)
  .post("/push-order/:orderId", SatusehatController.pushOrderHandler)
  .post("/push-service-request/:orderId", SatusehatController.pushServiceRequestHandler)
  .put("/orders/:orderId/service-request-id", SatusehatController.updateServiceRequestIdHandler, {
    body: t.Object({
      serviceRequestId: t.String()
    })
  })
  .put("/orders/:orderId/encounter-id", SatusehatController.updateEncounterIdHandler, {
    body: t.Object({
      encounterId: t.String()
    })
  })
  .post("/retry-log/:logId", SatusehatController.retryLogHandler)
  .post("/lookup-patient-ihs/:patientId", SatusehatController.lookupPatientIhsHandler, {
    body: t.Optional(t.Object({
      nik: t.Optional(t.String()),
    }))
  })
  .post("/lookup-doctor-ihs/:doctorId", SatusehatController.lookupDoctorIhsHandler, {
    body: t.Optional(t.Object({
      nik: t.Optional(t.String()),
    }))
  })
  .get("/settings", SatusehatController.getSettingsHandler)
  .post("/settings", SatusehatController.updateSettingsHandler, {
    body: t.Object({
      organizationId: t.Optional(t.String()),
      clientId: t.Optional(t.String()),
      clientSecret: t.Optional(t.String()),
      environment: t.Optional(t.Union([t.Literal("sandbox"), t.Literal("staging"), t.Literal("production")])),
      authUrl: t.Optional(t.String()),
      baseUrl: t.Optional(t.String()),
      autoSyncOnExpertise: t.Optional(t.Union([t.Literal("yes"), t.Literal("no")])),
      simulationMode: t.Optional(t.Union([t.Literal("yes"), t.Literal("no")])),
    })
  })
  .post("/test-connection", SatusehatController.testConnectionHandler);
