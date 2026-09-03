import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";

export class AuthService {
  static async login(username: string, passwordRaw: string) {
    const userResult = await db.select().from(users).where(eq(users.username, username));
    if (userResult.length === 0) {
      throw new Error("User tidak ditemukan");
    }

    const user = userResult[0];
    
    // Verifikasi password hash menggunakan Bun API native
    let isMatch = false;
    try {
      isMatch = await Bun.password.verify(passwordRaw, user.password);
    } catch {
       // fallback for older cleartext passwords during dev
       isMatch = passwordRaw === user.password;
    }

    if (!isMatch) {
      throw new Error("Password salah");
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  }
}
