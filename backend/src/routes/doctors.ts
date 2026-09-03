import { Elysia } from "elysia";
import { DoctorController } from "../controllers/doctors.controller";

export const doctorRoutes = new Elysia({ prefix: "/api/doctors" })
  .get("/", DoctorController.getAllHandler)
  .post("/", DoctorController.createHandler)
  .get("/:id", DoctorController.getByIdHandler)
  .put("/:id", DoctorController.updateHandler)
  .delete("/:id", DoctorController.deleteHandler);
