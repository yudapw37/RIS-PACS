import { AuthService } from "../services/auth.service";
import { sendResponse } from "../utils/response";

export class AuthController {
  static async loginHandler({ body, jwt, set }: any) {
    try {
      const { username, password } = body;
      
      if (!username || !password) {
         return sendResponse(set, 400, "Username dan password wajib diisi", null);
      }
      
      const user = await AuthService.login(username, password);
      
      // Generate JWT Token
      // Waktu expired 8 jam
      const token = await jwt.sign({
         id: user.id,
         role: user.role,
         exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60)
      });

      return sendResponse(set, 200, "Login Berhasil", {
         user,
         token
      });
    } catch (err: any) {
      return sendResponse(set, 401, "Gagal Login", { error: err.message });
    }
  }
}
