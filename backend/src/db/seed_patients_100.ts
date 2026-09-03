import { db } from "./index";
import { patients } from "./schema";

async function runPatientSeeder100() {
  console.log("Memulai proses seeding 100 data pasien dummy...");

  const firstNames = [
    "Budi", "Siti", "Agus", "Dewi", "Rudi", "Ayu", "Joko", "Rina",
    "Bambang", "Putri", "Adi", "Sri", "Hendra", "Lestari", "Eko", "Maya",
    "Dian", "Wahyu", "Fitri", "Hasan", "Kartika", "Suryono", "Nurul", "Dedi",
    "Ratna", "Tono", "Lina", "Fajar", "Anisa", "Yusuf"
  ];
  const lastNames = [
    "Santoso", "Wijaya", "Kusuma", "Pratama", "Hidayat", "Saputra",
    "Wibowo", "Nugroho", "Gunawan", "Setiawan", "Utama", "Purnama",
    "Kurniawan", "Sari", "Rahayu", "Permana", "Suryadi", "Hartono"
  ];
  const cities = [
    "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang",
    "Makassar", "Yogyakarta", "Malang", "Denpasar", "Palembang"
  ];

  const patientList = [];

  for (let i = 0; i < 100; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const gender: "L" | "P" = Math.random() > 0.5 ? "L" : "P";

    // DOB antara 1950-2010
    const startDate = new Date(1950, 0, 1);
    const endDate = new Date(2010, 11, 31);
    const dob = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

    patientList.push({
      mrn: `RM-${(i + 1).toString().padStart(4, "0")}`,
      fullName: `${fName} ${lName}`,
      dob,
      gender,
      address: `Jl. Merdeka No. ${Math.floor(1 + Math.random() * 200)}, ${city}`,
    });
  }

  // Insert in one batch
  await db.insert(patients).values(patientList);
  console.log(`✅ 100 pasien dummy berhasil ditambahkan!`);

  process.exit(0);
}

runPatientSeeder100().catch((err) => {
  console.error("Terjadi kesalahan saat seeding pasien:", err);
  process.exit(1);
});
