import { eq } from "drizzle-orm";
import { db } from "./index";
import { users, modalityTypes, doctors, modalities } from "./schema";

async function runSeeder() {
  console.log("Memulai proses seeding database...");

  // 1. Seed Modality Types (Kamus Standar DICOM)
  const dicomTypes = [
    { code: "DX", description: "Digital Radiography (X-Ray)" },
    { code: "CR", description: "Computed Radiography" },
    { code: "CT", description: "Computed Tomography (CT-Scan)" },
    { code: "MR", description: "Magnetic Resonance (MRI)" },
    { code: "US", description: "Ultrasound (USG)" },
    { code: "XA", description: "X-Ray Angiography" },
    { code: "MG", description: "Mammography" },
    { code: "IO", description: "Intra-oral Radiography" },
  ];

  for (const t of dicomTypes) {
    const exists = await db.select().from(modalityTypes).where(eq(modalityTypes.code, t.code));
    if (exists.length === 0) {
      await db.insert(modalityTypes).values(t);
      console.log(`[+] Modality Type ditambahkan: ${t.code}`);
    }
  }

  // 2. Seed Super Admin
  const adminUsername = "superadmin";
  const adminExists = await db.select().from(users).where(eq(users.username, adminUsername));
  
  if (adminExists.length === 0) {
    // Menggunakan Bun.password.hashSync() untuk enkripsi sesuai best practice
    const hashedPassword = await Bun.password.hash("password123");
    await db.insert(users).values({
      username: adminUsername,
      password: hashedPassword, // Disimpan sebagai hash
      role: "admin",
    });
    console.log(`[+] User Super Admin ditambahkan: ${adminUsername}`);
  }

  // 3. Seed 1 Dokter Dummy
  const doctorName = "dr. Budi Santoso, Sp.Rad";
  const doctorExists = await db.select().from(doctors).where(eq(doctors.fullName, doctorName));
  if (doctorExists.length === 0) {
    await db.insert(doctors).values({
      nip: "198001012010121001",
      fullName: doctorName,
      specialization: "Spesialis Radiologi",
    });
    console.log(`[+] Dokter dummy ditambahkan: ${doctorName}`);
  }

  // 4. Seed 1 Modality Dummy
  const modalityAET = "CTSCAN_A";
  const modalityExists = await db.select().from(modalities).where(eq(modalities.aet, modalityAET));
  if (modalityExists.length === 0) {
    await db.insert(modalities).values({
      name: "CT Scan Ruang A",
      typeCode: "CT",
      aet: modalityAET,
      ipAddress: "192.168.1.100",
      port: 11112,
    });
    console.log(`[+] Modality dummy ditambahkan: ${modalityAET}`);
  }

  console.log("Seeding selesai!");
  process.exit(0);
}

runSeeder().catch((err) => {
  console.error("Terjadi kesalahan saat seeding:", err);
  process.exit(1);
});
