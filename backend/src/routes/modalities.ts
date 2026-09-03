import { Elysia, t } from "elysia";
import { ModalityController } from "../controllers/modalities.controller";

export const modalityRoutes = new Elysia({ prefix: "/api/modalities" })
  .get("/", ModalityController.getModalitiesHandler)
  .get("/types", ModalityController.getTypesHandler)
  .post("/", ModalityController.createModalityHandler, {
    body: t.Object({
      name: t.String(),
      typeCode: t.String(),
      aet: t.String(),
      ipAddress: t.String(),
      port: t.Number()
    })
  })
  .get("/:id", ModalityController.getByIdHandler)
  .put("/:id", ModalityController.updateHandler)
  .delete("/:id", ModalityController.deleteHandler)
  .post("/:id/test-connection", ModalityController.testConnectionHandler)
  .get("/logs", ModalityController.getLogsHandler);
