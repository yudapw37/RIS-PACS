import { db } from "./index";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";

/**
 * Ototmatis menjalankan semua file migrasi SQL di folder /drizzle 
 * ke database tujuan.
 */
export async function runMigrations() {
  console.log("⏳ Menjalankan migrasi database...");
  
  try {
    // Arahkan ke folder 'drizzle' di root backend
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    
    await migrate(db, { migrationsFolder });
    
    console.log("✅ Migrasi database selesai!");
  } catch (err) {
    console.error("❌ Gagal menjalankan migrasi database:");
    console.error(err);
    // Kita tidak menghentikan proses aplikasi agar jika DB 
    // sudah OK (manual), aplikasi tetap bisa jalan.
  }
}
