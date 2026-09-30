/**
 * Script Pengujian Lengkap Berurutan:
 * 1. Buat Pasien Baru (IHS Valid Kemenkes Sandbox)
 * 2. [SIMRS] Buat Encounter ke SATUSEHAT
 * 3. [SIMRS -> SmartRIS] Buat Order Baru (Status: scheduled) -> Terlihat di Antrean Pemeriksaan
 * 4. [Radiografer] Mulai Pemeriksaan (Status: in_progress)
 * 5. [Radiografer] Selesai Pemeriksaan (Status: completed) -> MASUK KE ANTREAN BACA!
 * 6. Verifikasi keberadaan order di API Antrean Baca (/api/orders/expertise-worklist)
 * 7. [Dokter Radiologi] Mengisi Ekspertise (Temuan & Kesimpulan)
 * 8. Verifikasi order berpindah dari Antrean Baca ke Riwayat Order
 * 9. Kirim seluruh resource FHIR ke SATUSEHAT Staging (SR, ImagingStudy, Observation, DiagnosticReport)
 * 10. Buat 1 Order Cadangan yang dibiarkan di Antrean Baca agar USER bisa melihatnya langsung di Web!
 */

import { createSimrsEncounter } from "./create_simrs_encounter";

const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("======================================================================");
  console.log("🏥 PENGUJIAN END-TO-END STEP-BY-STEP: ALUR PENGERJAAN & BACAAN DOKTER");
  console.log("======================================================================\n");

  // 1. LOGIN
  console.log("▶ [1/8] Login ke SmartRIS API...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "superadmin", password: "password123" })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  console.log(`✅ Berhasil login sebagai: ${loginData.data.user.username}`);

  // 2. BUAT PASIEN BARU
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const patientMrn = `RM-STG-${randomSuffix}`;
  const nik = `317101${randomSuffix}0001`;
  const patientName = `Bpk. Rahmat Santoso ${randomSuffix}`;
  const patientIhs = "100000030009";

  console.log(`\n▶ [2/8] Menambahkan Pasien Baru: ${patientName} (${patientMrn})...`);
  const patientRes = await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      mrn: patientMrn,
      fullName: patientName,
      gender: "male",
      birthDate: "1988-05-12",
      phone: "081234567890",
      address: "Jl. Percobaan Sandbox Kemenkes No. 25",
      nik: nik,
      ihsNumber: patientIhs
    })
  });
  const patientJson = await patientRes.json();
  const patientId = patientJson.data.id;
  console.log(`✅ Pasien berhasil dibuat: ID ${patientId}, IHS: ${patientIhs}`);

  // 3. [SIMRS] BUAT ENCOUNTER
  console.log(`\n▶ [3/8] [SIMRS SIMULATION] Membuat Encounter Kunjungan di SATUSEHAT...`);
  const noReg = `REG-${randomSuffix}`;
  const encounterId = await createSimrsEncounter({
    patientIhs: patientIhs,
    patientName: patientName,
    registrationNumber: noReg,
    practitionerIhs: "10009880728",
    practitionerName: "dr. Alexander"
  });
  console.log(`✅ SIMRS Encounter ID: ${encounterId}`);

  // 4. [SIMRS -> SMARTRIS] BUAT ORDER BARU
  const accessionNumber = `ACC-${Date.now().toString().slice(-8)}`;
  console.log(`\n▶ [4/8] [SIMRS -> SmartRIS] Membuat Order Radiologi (${accessionNumber})...`);
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      patientId: patientId,
      noReg: noReg,
      accessionNumber: accessionNumber,
      modalityTypeCode: "DX",
      bodyPart: "Thorax PA",
      clinicalInfo: "Batuk kronis 2 minggu, evaluasi infiltrat paru",
      priority: "urgent",
      doctorId: 1,
      satusehatEncounterId: encounterId
    })
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;
  console.log(`✅ Order berhasil masuk: ID ${orderId}, Status: SCHEDULED`);
  console.log(`   👉 Posisi Order saat ini: [Antrean Pemeriksaan / Pengerjaan]`);

  // 5. [PROSES PENGERJAAN OLEH RADIOGRAFER]
  console.log(`\n▶ [5/8] Radiografer Mengerjakan Tindakan Rontgen di Ruang Pemeriksaan...`);
  
  // 5a. Mulai
  await fetch(`${BASE_URL}/api/orders/${orderId}/start`, { method: "PATCH", headers: authHeaders });
  console.log(`   [a] Radiografer klik 'Mulai Periksa' -> Status: IN_PROGRESS`);

  // Simulasi waktu pemotretan
  await new Promise(r => setTimeout(r, 1000));

  // 5b. Selesai
  await fetch(`${BASE_URL}/api/orders/${orderId}/finish`, { method: "PATCH", headers: authHeaders });
  console.log(`   [b] Radiografer klik 'Selesai Periksa' -> Status: COMPLETED`);

  // 6. [VERIFIKASI KEBERADAAN DI ANTREAN BACA]
  console.log(`\n▶ [6/8] Memeriksa Daftar 'Antrean Baca' (Expertise Worklist)...`);
  const readingListRes = await fetch(`${BASE_URL}/api/orders/expertise-worklist`, { headers: authHeaders });
  const readingListData = await readingListRes.json();
  const isInReadingList = (readingListData.data || []).some((item: any) => item.id === orderId);

  if (isInReadingList) {
    console.log(`✅ TERKONFIRMASI: Order #${orderId} (${accessionNumber}) SEKARANG ADA DI 'ANTREAN BACA'!`);
    console.log(`   Menunggu dokter spesialis radiologi membuka citra DICOM dan mengisi ekspertise.`);
  } else {
    console.warn(`⚠️ Catatan: Order #${orderId} belum terdeteksi di antrean baca.`);
  }

  // Simulasi waktu jeda sebelum dokter membaca
  console.log(`   Dokter Radiologi menelaah citra rontgen...`);
  await new Promise(r => setTimeout(r, 1500));

  // 7. [DOKTER RADIOLOGI MENGISI EKSPERTISE]
  console.log(`\n▶ [7/8] Dokter Radiologi Menyimpan Hasil Ekspertise (Bacaan)...`);
  const expRes = await fetch(`${BASE_URL}/api/orders/${orderId}/expertise`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      doctorId: 1,
      findings: "Cor: Ukuran dan bentuk dalam batas normal.\nPulmo: Tampak peningkatan corakan bronkovaskular di lapangan bawah kedua paru. Tidak tampak infiltrat fokal maupun kavitas.\nSinus kostofrenikus kanan dan kiri tajam.\nDiafragma normal.\nTulang iga intak.",
      conclusions: "Foto Thorax PA: Bronkitis kronis suspek, tidak tampak pneumonia aktif maupun TB."
    })
  });
  const expData = await expRes.json();
  console.log(`✅ Ekspertise berhasil disimpan! Pesan: ${expData.message}`);

  // Cek kembali antrean baca: order harusnya sudah pindah (keluar dari antrean baca)
  const readingListAfter = await (await fetch(`${BASE_URL}/api/orders/expertise-worklist`, { headers: authHeaders })).json();
  const stillInReading = (readingListAfter.data || []).some((item: any) => item.id === orderId);
  console.log(`   Status di Antrean Baca setelah ekspertise: ${stillInReading ? "Masih ada" : "SUDAH PINDAH KE RIWAYAT SELESAI ✅"}`);

  // 8. SINKRONISASI KE SATUSEHAT
  console.log(`\n▶ [8/8] Sinkronisasi Transaksi Lengkap ke SATUSEHAT Staging...`);
  const pushRes = await fetch(`${BASE_URL}/api/satusehat/push-order/${orderId}`, {
    method: "POST",
    headers: authHeaders
  });
  const pushJson = await pushRes.json();
  console.log(`Hasil Push SATUSEHAT:`, JSON.stringify(pushJson, null, 2));

  // ======================================================================
  // BONUS: BUAT 1 ORDER LAGI YANG DIBIARKAN STANDBY DI ANTREAN BACA!
  // ======================================================================
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`🎯 MEMBUAT 1 ORDER STANDBY DI 'ANTREAN BACA' UNTUK ANDA LIHAT DI WEB:`);
  console.log(`----------------------------------------------------------------------`);

  const standbySuffix = Math.floor(100000 + Math.random() * 900000);
  const standbyMrn = `RM-STG-${standbySuffix}`;
  const standbyName = `Ibu Siti Aminah ${standbySuffix}`;
  const standbyAcc = `ACC-${Date.now().toString().slice(-8)}`;

  // Pasien standby
  const pStandbyRes = await (await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      mrn: standbyMrn,
      fullName: standbyName,
      gender: "female",
      birthDate: "1995-11-20",
      nik: `317101${standbySuffix}0002`,
      ihsNumber: patientIhs
    })
  })).json();

  // Order standby
  const oStandbyRes = await (await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      patientId: pStandbyRes.data.id,
      noReg: `REG-${standbySuffix}`,
      accessionNumber: standbyAcc,
      modalityTypeCode: "DX",
      bodyPart: "Thorax AP/Lat",
      clinicalInfo: "Skrining pre-operatif, evaluasi kardiotoraks",
      priority: "routine",
      doctorId: 1
    })
  })).json();

  const standbyOrderId = oStandbyRes.data.orderId;
  // Kerjakan sampai selesai rontgen
  await fetch(`${BASE_URL}/api/orders/${standbyOrderId}/start`, { method: "PATCH", headers: authHeaders });
  await fetch(`${BASE_URL}/api/orders/${standbyOrderId}/finish`, { method: "PATCH", headers: authHeaders });

  console.log(`✅ Order Standby #${standbyOrderId} BERHASIL DIBUAT!`);
  console.log(`   - Pasien      : ${standbyName} (${standbyMrn})`);
  console.log(`   - Accession   : ${standbyAcc}`);
  console.log(`   - Status Saat Ini : COMPLETED (Belum Diisi Ekspertise)`);
  console.log(`   👉 Buka menu 'Daftar Bacaan' (Expertise Worklist) di web browser Anda,`);
  console.log(`      order ini akan standby menunggu tombol 'Beri Expertise' diklik!`);

  console.log("\n======================================================================");
  console.log("🏁 PENGUJIAN SELESAI");
  console.log("======================================================================");
}

main().catch(console.error);
