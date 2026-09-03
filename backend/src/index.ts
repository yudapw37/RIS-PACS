import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { patientRoutes } from "./routes/patients";
import { modalityRoutes } from "./routes/modalities";
import { orderRoutes } from "./routes/orders";
import { authRoutes } from "./routes/auth";
import { doctorRoutes } from "./routes/doctors";
import { reportRoutes } from "./routes/reports";
import { systemRoutes } from "./routes/system";
import { authMiddleware } from "./middleware/auth.middleware";
import { OrderController } from "./controllers/orders.controller";
import { runMigrations } from "./db/migrate";

// Jalankan migrasi database saat startup
await runMigrations();

const app = new Elysia()
  .use(cors())
  // Public routes (no JWT required)
  .use(authRoutes)
  // Endpoint internal untuk DCM4CHEE MWL Bridge (server-to-server, tanpa JWT)
  // DCM4CHEE memiliki built-in MWL SCP, endpoint ini sebagai fallback/debugging
  .get("/api/orders/dicom-worklist", OrderController.getDicomWorklistHandler)
  // ── Protected routes (requires valid JWT Token) ──
  .use(authMiddleware)
  .use(doctorRoutes)
  .use(patientRoutes)
  .use(modalityRoutes)
  .use(orderRoutes)
  .use(reportRoutes)
  .use(systemRoutes)
  .get("/", () => {
    return {
      status: "alive",
      service: "SmartRIS V3 Middleware API (DCM4CHEE PACS)",
      timestamp: new Date().toISOString()
    };
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Smart RIS V3 Backend API is running at ${app.server?.hostname}:${app.server?.port}`
);
