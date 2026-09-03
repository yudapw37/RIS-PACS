import { db } from "./index";
import { patients } from "./schema";

async function runPatientSeeder() {
  console.log("Memulai proses seeding 10.000 data pasien...");

  const firstNames = ["Budi", "Siti", "Agus", "Dewi", "Rudi", "Ayu", "Joko", "Rina", "Cipto", "Wati", "Bambang", "Putri", "Adi", "Sri", "Hendra", "Lestari", "Eko", "Maya"];
  const lastNames = ["Santoso", "Wijaya", "Kusuma", "Pratama", "Hidayat", "Saputra", "Wibowo", "Nugroho", "Gunawan", "Setiawan", "Utama", "Purnama", "Kurniawan", "Sari"];
  const cities = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Yogyakarta", "Malang", "Denpasar", "Palembang"];
  
  const generateRandomPatient = (index: number) => {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const gender = Math.random() > 0.5 ? "L" : "P";
    
    // Generate Random DOB between 1940 and 2020
    const startObj = new Date(1940, 0, 1);
    const endObj = new Date(2020, 11, 31);
    const randomDate = new Date(startObj.getTime() + Math.random() * (endObj.getTime() - startObj.getTime()));
    
    return {
      mrn: `RM-10K-${new Date().getTime().toString().slice(-6)}-${index.toString().padStart(5, '0')}`,
      fullName: `${fName} ${lName}`,
      dob: randomDate,
      gender: gender as "L" | "P",
      address: `Jl. Merdeka No. ${Math.floor(Math.random() * 200)}, ${city}`,
    };
  };

  const TOTAL = 10000;
  const BATCH_SIZE = 1000;
  
  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL; j++) {
      batch.push(generateRandomPatient(i + j));
    }
    
    await db.insert(patients).values(batch);
    console.log(`[+] Inserted batch: ${i + batch.length} / ${TOTAL}`);
  }

  console.log("Seeding 10.000 pasien selesai!");
  process.exit(0);
}

runPatientSeeder().catch((err) => {
  console.error("Terjadi kesalahan saat seeding pasien:", err);
  process.exit(1);
});
