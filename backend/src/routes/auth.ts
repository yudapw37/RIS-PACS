import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../controllers/auth.controller";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'super_secret_ris_key'
    })
  )
  .post("/login", AuthController.loginHandler);
