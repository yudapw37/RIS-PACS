import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { sendResponse } from "../utils/response";

// Middleware Auth yang dapat dicolok (Plug & Play) ke Route mana saja
export const authMiddleware = new Elysia({ name: 'auth-plugin' })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_ris_key",
    })
  )
  .derive({ as: 'global' }, async ({ jwt, headers }) => {
    const authHeader = headers["authorization"];
    let user = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      user = await jwt.verify(token);
    }
    
    return { user };
  })
  .onBeforeHandle({ as: 'global' }, ({ user, set, path }) => {
    // Kecualikan rute publik dan internal orthanc dari blokir satpam
    if (path === "/api/orders/dicom-worklist" || path === "/") {
      return;
    }

    if (!user) {
      return sendResponse(set, 401, "Akses tertolak: Token JWT salah atau kadaluarsa!");
    }
  });


