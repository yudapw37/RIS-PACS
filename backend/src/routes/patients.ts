import { Elysia, t } from "elysia";
import { PatientController } from "../controllers/patients.controller";

export const patientRoutes = new Elysia({ prefix: "/api/patients" })
  .get("/", PatientController.getPatientsHandler)
  .post("/", PatientController.createPatientHandler, {
    body: t.Object({
      mrn: t.String(),
      fullName: t.String(),
      dob: t.Optional(t.String()),
      gender: t.Optional(t.Union([t.Literal("L"), t.Literal("P")])),
      address: t.Optional(t.String())
    })
  })
  .get("/:id", PatientController.getPatientByIdHandler)
  .put("/:id", PatientController.updatePatientHandler)
  .delete("/:id", PatientController.deletePatientHandler);
