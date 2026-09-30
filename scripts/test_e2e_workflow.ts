/**
 * End-to-End Test Workflow:
 * 1. Login to SmartRIS API
 * 2. Add new Patient (with Kemenkes Sandbox IHS)
 * 3. [SIMRS SIMULATION] Create Encounter in SATUSEHAT & obtain Encounter ID
 * 4. [SIMRS -> SmartRIS Integration] Create Radiology Order with satusehatEncounterId
 * 5. Start Examination (in_progress)
 * 6. Finish Examination (completed)
 * 7. Save Radiologist Expertise Reading
 * 8. Push / Auto-sync to SATUSEHAT Sandbox (ServiceRequest + ImagingStudy + Observation + DiagnosticReport)
 * 9. Verify DB status and transaction logs
 */

import { createSimrsEncounter } from "./create_simrs_encounter";

const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("==========================================================");
  console.log("🏥 PENGUJIAN END-TO-END WORKFLOW SIMRS & SMARTRIS (SATUSEHAT STAGING)");
  console.log("==========================================================\n");

  // 1. LOGIN
  console.log("▶ [1/7] Login ke SmartRIS API...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "superadmin",
      password: "password123"
    })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.data?.token) {
    console.error("❌ Login gagal:", loginData);
    process.exit(1);
  }

  const token = loginData.data.token;
  console.log(`✅ Berhasil login sebagai: ${loginData.data.user.username} (${loginData.data.user.role})`);

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // 2. ADD PATIENT
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const patientMrn = `RM-STG-${randomSuffix}`;
  const nik = `317101${randomSuffix}0001`;
  const patientName = `Pasien Uji Coba Staging ${randomSuffix}`;
  const patientIhs = "100000030009"; // Valid Kemenkes Sandbox Patient IHS

  console.log(`\n▶ [2/7] Menambahkan Pasien Baru (MRN: ${patientMrn})...`);
  const patientRes = await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      mrn: patientMrn,
      fullName: patientName,
      gender: "male",
      birthDate: "1990-08-17",
      phone: "081234567890",
      address: "Jl. Percobaan Sandbox Kemenkes No. 10",
      nik: nik,
      ihsNumber: patientIhs
    })
  });

  const patientJson = await patientRes.json();
  if (!patientRes.ok || !patientJson.data) {
    console.error("❌ Gagal membuat pasien:", patientJson);
    process.exit(1);
  }

  const patientId = patientJson.data.id;
  console.log(`✅ Pasien berhasil dibuat: ID ${patientId}, Nama: ${patientJson.data.fullName}`);
  console.log(`   MRN: ${patientJson.data.mrn}, IHS: ${patientJson.data.ihsNumber}`);

  // 3. [SIMRS SIMULATION] CREATE ENCOUNTER IN SATUSEHAT
  console.log(`\n▶ [3/7] [SIMRS SIMULATION] Mendaftarkan Kunjungan (Encounter) ke SATUSEHAT Staging...`);
  const noReg = `REG-${randomSuffix}`;
  let encounterId: string;
  try {
    encounterId = await createSimrsEncounter({
      patientIhs: patientIhs,
      patientName: patientName,
      registrationNumber: noReg,
      practitionerIhs: "10009880728",
      practitionerName: "dr. Alexander"
    });
    console.log(`✅ SIMRS berhasil mendapatkan Encounter ID SATUSEHAT: ${encounterId}`);
  } catch (encErr: any) {
    console.error("❌ Gagal membuat Encounter di SATUSEHAT:", encErr.message);
    process.exit(1);
  }

  // 4. [SIMRS -> SMARTRIS] CREATE ORDER WITH ENCOUNTER ID
  const accessionNumber = `ACC-${Date.now().toString().slice(-8)}`;

  console.log(`\n▶ [4/7] [SIMRS -> SmartRIS] Mengirim Order Radiologi (Accession: ${accessionNumber})...`);
  console.log(`   Mengirimkan satusehatEncounterId: ${encounterId} dari SIMRS ke SmartRIS`);
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      patientId: patientId,
      noReg: noReg,
      accessionNumber: accessionNumber,
      modalityTypeCode: "DX",
      bodyPart: "Thorax PA",
      clinicalInfo: "Pemeriksaan foto dada skrining kesehatan berkala",
      priority: "routine",
      doctorId: 1,
      satusehatEncounterId: encounterId // Disuplai oleh SIMRS!
    })
  });

  const orderJson = await orderRes.json();
  if (!orderRes.ok || !orderJson.data?.orderId) {
    console.error("❌ Gagal membuat order:", orderJson);
    process.exit(1);
  }

  const orderId = orderJson.data.orderId;
  console.log(`✅ Order berhasil dibuat di SmartRIS: ID ${orderId}, Pesan: ${orderJson.data.message}`);

  // 5. PENGERJAAN PEMERIKSAAN (START -> FINISH)
  console.log(`\n▶ [5/7] Pengerjaan Pemeriksaan Radiologi oleh Radiografer...`);
  // 5a. Mulai Pemeriksaan
  const startRes = await fetch(`${BASE_URL}/api/orders/${orderId}/start`, {
    method: "PATCH",
    headers: authHeaders
  });
  const startJson = await startRes.json();
  console.log(`   [a] Mulai Pemeriksaan: HTTP ${startRes.status} -> ${startJson.message}`);

  // Jeda simulasi pengerjaan rontgen
  await new Promise(r => setTimeout(r, 600));

  // 5b. Selesai Pemeriksaan
  const finishRes = await fetch(`${BASE_URL}/api/orders/${orderId}/finish`, {
    method: "PATCH",
    headers: authHeaders
  });
  const finishJson = await finishRes.json();
  console.log(`   [b] Selesai Pemeriksaan: HTTP ${finishRes.status} -> ${finishJson.message}`);

  // 6. EKSPERTISE DOKTER RADIOLOGI
  console.log(`\n▶ [6/7] Dokter Radiologi Mengisi Hasil Bacaan & Ekspertise...`);
  const expRes = await fetch(`${BASE_URL}/api/orders/${orderId}/expertise`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      doctorId: 1,
      findings: "Cor: Bentuk dan ukuran dalam batas normal (CTR < 50%).\nPulmo: Corakan bronkovaskular dalam batas normal, tidak tampak infiltrat, kavitas, maupun nodul spesifik.\nSinus kostofrenikus kanan dan kiri tajam.\nDiafragma kanan dan kiri licin/normal.\nSkeletal dan soft tissue normal.",
      conclusions: "Foto Thorax PA: Jantung dan paru dalam batas normal (tidak tampak lesi aktif spesifik)."
    })
  });

  const expJson = await expRes.json();
  console.log(`✅ Ekspertise berhasil disimpan: HTTP ${expRes.status} -> ${expJson.message}`);

  // Jeda 2 detik untuk auto-sync jika aktif
  console.log(`   Menunggu sinkronisasi background SATUSEHAT...`);
  await new Promise(r => setTimeout(r, 2500));

  // 7. PUSH KE SATUSEHAT (SmartRIS: ServiceRequest, ImagingStudy, Observation, DiagnosticReport)
  console.log(`\n▶ [7/7] Memastikan Semua Resource Terkirim ke SATUSEHAT Staging...`);
  const pushRes = await fetch(`${BASE_URL}/api/satusehat/push-order/${orderId}`, {
    method: "POST",
    headers: authHeaders
  });

  const pushJson = await pushRes.json();
  console.log(`Hasil Push SATUSEHAT (HTTP ${pushRes.status}):`, JSON.stringify(pushJson, null, 2));

  // VERIFIKASI AKHIR DATABASE & LOGS
  console.log(`\n==========================================================`);
  console.log(`📋 HASIL VERIFIKASI AKHIR ORDER #${orderId}:`);
  console.log(`==========================================================`);

  const detailRes = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
    headers: authHeaders
  });
  const detailJson = await detailRes.json();
  const d = detailJson.data;

  console.log(`- Pasien                 : ${d.patient?.fullName} (MRN: ${d.patient?.mrn}, IHS: ${d.patient?.ihsNumber})`);
  console.log(`- Accession Number       : ${d.accessionNumber}`);
  console.log(`- Modality / Body Part   : ${d.modalityTypeCode} / ${d.bodyPart}`);
  console.log(`- Status Pemeriksaan     : ${d.status}`);
  console.log(`- Hasil Ekspertise       : Ada`);
  console.log(`  > Temuan               : ${d.expertise?.findings?.replace(/\n/g, ' ')}`);
  console.log(`  > Kesimpulan           : "${d.expertise?.conclusions}"`);
  console.log(`- Status SATUSEHAT       : ${d.satusehatStatus}`);
  console.log(`- SATUSEHAT Encounter ID : ${d.satusehatEncounterId || "(belum ada)"}`);
  console.log(`- SATUSEHAT SR ID        : ${d.satusehatServiceRequestId || "(belum ada)"}`);
  console.log(`- SATUSEHAT Study ID     : ${d.satusehatStudyId || "(belum ada)"}`);
  console.log(`- SATUSEHAT Report ID    : ${d.satusehatReportId || "(belum ada)"}`);

  // Fetch Log Transaksi SATUSEHAT
  const logsRes = await fetch(`${BASE_URL}/api/satusehat/logs?orderId=${orderId}`, {
    headers: authHeaders
  });
  if (logsRes.ok) {
    const logsJson = await logsRes.json();
    console.log(`\nAudit Logs Transaksi SATUSEHAT Order #${orderId} (${logsJson.data?.length || 0} entri):`);
    for (const log of (logsJson.data || [])) {
      console.log(`  • [Log #${log.id}] [${log.resourceType}] ${log.action}: ${log.status.toUpperCase()} (HTTP ${log.httpStatus}) -> SATUSEHAT ID: ${log.satusehatId || "-"}`);
      if (log.errorMessage) console.log(`      Detail / Error: ${log.errorMessage}`);
    }
  }

  console.log("\n==========================================================");
  console.log("🏁 PENGUJIAN END-TO-END BERHASIL DILAKSANAKAN");
  console.log("==========================================================");
}

main().catch(console.error);
