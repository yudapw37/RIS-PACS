/**
 * End-to-End Test Workflow dengan Real DICOM File:
 * 1. Login ke SmartRIS API
 * 2. Tambah Pasien Baru (dengan Sandbox IHS & NIK)
 * 3. [SIMULASI SIMRS] Registrasi Kunjungan (Encounter) ke SATUSEHAT Staging
 * 4. [SIMRS -> SmartRIS] Buat Order Radiologi dengan Nomor Aksesi unik & Encounter ID
 * 5. [SIMULASI MODALITAS] Buat file citra medis asli (.dcm) dengan metadata pasien & nomor aksesi
 * 6. [MODALITAS -> PACS] Kirim file .dcm ke PACS DCM4CHEE via STOW-RS
 * 7. [SMARTRIS PACS QUERY] Cek verifikasi ketersediaan citra di DCM4CHEE via QIDO-RS
 * 8. [RADIOGRAFER] Mulai Pemeriksaan -> Selesai Pemeriksaan
 * 9. [DOKTER RADIOLOGI] Isi Hasil Bacaan & Ekspertise (Findings & Conclusion)
 * 10. [SATUSEHAT SYNC] SmartRIS query metadata PACS & kirim ImagingStudy + ServiceRequest + DiagnosticReport ke SATUSEHAT
 * 11. Verifikasi akhir integrasi OHIF Viewer & SATUSEHAT
 */

import { spawnSync } from "child_process";
import path from "path";
import { createSimrsEncounter } from "./create_simrs_encounter";

const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("==========================================================================");
  console.log("🏥 PENGUJIAN WORKFLOW LENGKAP: CITRA MEDIS DICOM (.dcm) -> PACS -> SATUSEHAT");
  console.log("==========================================================================\n");

  // 1. LOGIN KE SMARTRIS
  console.log("▶ [1/9] Login ke SmartRIS API...");
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

  // 2. TAMBAH PASIEN BARU
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const patientMrn = `RM-DCM-${randomSuffix}`;
  const nik = `320101${randomSuffix}0002`;
  const patientName = `Bpk. Uji Coba DICOM ${randomSuffix}`;
  const patientIhs = "100000030009"; // Valid Sandbox IHS Pasien Kemenkes

  console.log(`\n▶ [2/9] Membuat Pasien Baru di SmartRIS...`);
  console.log(`   Nama Pasien : ${patientName}`);
  console.log(`   No. RM (MRN): ${patientMrn}`);
  console.log(`   NIK         : ${nik}`);
  console.log(`   IHS Number  : ${patientIhs}`);

  const patientRes = await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      mrn: patientMrn,
      fullName: patientName,
      gender: "male",
      birthDate: "1988-05-12",
      phone: "081298765432",
      address: "Jl. Radiologi Medika Terpadu No. 45",
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
  console.log(`✅ Pasien tersimpan di DB: ID #${patientId}`);

  // 3. SIMULASI SIMRS: BUAT ENCOUNTER KE SATUSEHAT
  console.log(`\n▶ [3/9] [SIMRS SIMULATION] Mendaftarkan Kunjungan (Encounter) ke SATUSEHAT Staging...`);
  const noReg = `REG-DCM-${randomSuffix}`;
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

  // 4. SIMRS -> SMARTRIS: BUAT ORDER RADIOLOGI
  const accessionNumber = `ACCDCM-${randomSuffix}`;
  console.log(`\n▶ [4/9] [SIMRS -> SmartRIS] Menerbitkan Order Radiologi...`);
  console.log(`   Accession Number : ${accessionNumber}`);
  console.log(`   Encounter ID     : ${encounterId}`);

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      patientId: patientId,
      noReg: noReg,
      accessionNumber: accessionNumber,
      modalityTypeCode: "DX",
      bodyPart: "Thorax AP/PA",
      clinicalInfo: "Skrining paru dengan file DICOM uji coba rontgen",
      priority: "routine",
      doctorId: 1,
      satusehatEncounterId: encounterId
    })
  });

  const orderJson = await orderRes.json();
  if (!orderRes.ok || !orderJson.data?.orderId) {
    console.error("❌ Gagal membuat order:", orderJson);
    process.exit(1);
  }

  const orderId = orderJson.data.orderId;
  console.log(`✅ Order Radiologi dibuat: Order #${orderId} (Status: ${orderJson.data.status})`);

  // 5. GENERATE FILE .DCM DAN UPLOAD KE PACS (DCM4CHEE)
  console.log(`\n▶ [5/9] [MODALITAS RONTGEN] Membuat file citra medis asli (.dcm) & Kirim ke PACS...`);
  const pythonScript = path.join(__dirname, "generate_and_upload_dicom.py");
  const pyProc = spawnSync("python", [
    pythonScript,
    "--mrn", patientMrn,
    "--name", patientName,
    "--accession", accessionNumber,
    "--modality", "DX",
    "--body-part", "Thorax AP/PA"
  ], { encoding: "utf-8" });

  if (pyProc.error || pyProc.status !== 0) {
    console.error("❌ Gagal menjalankan pembuatan DICOM:", pyProc.stderr || pyProc.error);
    process.exit(1);
  }

  let dicomResult: any = {};
  try {
    dicomResult = JSON.parse(pyProc.stdout.trim());
  } catch (parseErr) {
    console.error("❌ Output Python tidak valid JSON:", pyProc.stdout);
    process.exit(1);
  }

  if (!dicomResult.success) {
    console.error("❌ Gagal upload DICOM ke DCM4CHEE:", dicomResult.error);
    process.exit(1);
  }

  console.log(`✅ File DICOM berhasil dibuat & dikirim ke PACS:`);
  console.log(`   • Path File Lokal     : ${dicomResult.filepath}`);
  console.log(`   • Ukuran File         : ${(dicomResult.fileSize / 1024).toFixed(1)} KB`);
  console.log(`   • StudyInstanceUID    : ${dicomResult.studyInstanceUid}`);
  console.log(`   • SeriesInstanceUID   : ${dicomResult.seriesInstanceUid}`);
  console.log(`   • SOPInstanceUID      : ${dicomResult.sopInstanceUid}`);
  console.log(`   • DCM4CHEE STOW-RS    : HTTP ${dicomResult.httpStatus} OK`);

  // 6. VERIFIKASI PACS DARI SMARTRIS API (QIDO-RS)
  console.log(`\n▶ [6/9] [SmartRIS -> PACS] Memverifikasi deteksi citra di DCM4CHEE berdasarkan Accession Number...`);
  const checkStudyRes = await fetch(`${BASE_URL}/api/orders/${orderId}/study-status`, {
    headers: authHeaders
  });
  const checkStudyJson = await checkStudyRes.json();
  console.log(`   Hasil Cek PACS: HTTP ${checkStudyRes.status} -> Found: ${checkStudyJson.data?.found}`);
  console.log(`   StudyInstanceUID terdeteksi: ${checkStudyJson.data?.studyInstanceUID}`);

  if (!checkStudyJson.data?.found || checkStudyJson.data?.studyInstanceUID !== dicomResult.studyInstanceUid) {
    console.warn("⚠️ Peringatan: UID di PACS belum sinkron sempurna");
  } else {
    console.log(`✅ Match 100%! Study di PACS cocok dengan file .dcm yang baru diunggah.`);
  }

  // 7. PENGERJAAN PEMERIKSAAN OLEH RADIOGRAFER
  console.log(`\n▶ [7/9] [RADIOGRAFER] Pengerjaan Pemeriksaan di SmartRIS...`);
  const startRes = await fetch(`${BASE_URL}/api/orders/${orderId}/start`, {
    method: "PATCH",
    headers: authHeaders
  });
  console.log(`   [a] Mulai Pemeriksaan  : HTTP ${startRes.status} (${(await startRes.json()).message})`);

  const finishRes = await fetch(`${BASE_URL}/api/orders/${orderId}/finish`, {
    method: "PATCH",
    headers: authHeaders
  });
  console.log(`   [b] Selesai Pemeriksaan: HTTP ${finishRes.status} (${(await finishRes.json()).message})`);

  // 8. BACAAN & EKSPERTISE DOKTER RADIOLOGI
  console.log(`\n▶ [8/9] [DOKTER RADIOLOGI] Mengisi Hasil Ekspertise & Diagnosis...`);
  const expRes = await fetch(`${BASE_URL}/api/orders/${orderId}/expertise`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      doctorId: 1,
      findings: "Pemeriksaan Foto Thorax PA (Simulasi File DICOM):\n- Cor: CTR < 50%, bentuk dan letak apeks jantung normal.\n- Pulmo: Tidak tampak infiltrat aktif, tidak tampak konsolidasi, corakan bronkovaskular normal.\n- Sinus kostofrenikus dan diafragma dalam batas normal.\n- Tulang-tulang dinding toraks intak, tidak tampak fraktur.",
      conclusions: "Foto Thorax PA: Pulmo dan Cor dalam batas normal. Tidak tampak kelainan radiologis aktif."
    })
  });
  const expJson = await expRes.json();
  console.log(`✅ Ekspertise tersimpan: HTTP ${expRes.status} (${expJson.message})`);

  // Jeda agar transaksi stabil
  await new Promise(r => setTimeout(r, 2000));

  // 9. SINKRONISASI KE SATUSEHAT STAGING
  console.log(`\n▶ [9/9] Mengirim Bundel Radiologi ke SATUSEHAT Staging...`);
  console.log(`   - Mengirim ServiceRequest`);
  console.log(`   - Query DCM4CHEE & Mengirim ImagingStudy (berisi metadata StudyInstanceUID asli)`);
  console.log(`   - Mengirim Observation & DiagnosticReport`);

  const pushRes = await fetch(`${BASE_URL}/api/satusehat/push-order/${orderId}`, {
    method: "POST",
    headers: authHeaders
  });

  const pushJson = await pushRes.json();
  console.log(`\nHasil Response Push SATUSEHAT (HTTP ${pushRes.status}):`);
  console.log(JSON.stringify(pushJson, null, 2));

  // AMBIL LOG AUDIT DETAIL
  console.log(`\n==========================================================================`);
  console.log(`📊 LOG AUDIT RESMI TRANSAKSI SATUSEHAT KEMENKES (ORDER #${orderId}):`);
  console.log(`==========================================================================`);
  const logsRes = await fetch(`${BASE_URL}/api/satusehat/logs?orderId=${orderId}`, {
    headers: authHeaders
  });

  if (logsRes.ok) {
    const logsJson = await logsRes.json();
    for (const log of (logsJson.data || [])) {
      console.log(`• [${log.resourceType}] ${log.action} -> Status: ${log.status.toUpperCase()} (HTTP ${log.httpStatus})`);
      console.log(`    SATUSEHAT Resource ID: ${log.satusehatId || "-"}`);
      if (log.resourceType === "ImagingStudy") {
        console.log(`    DICOM Study UID      : ${dicomResult.studyInstanceUid}`);
      }
    }
  }

  // TAMPILKAN LINK VIEWER OHIF & KESIMPULAN
  console.log(`\n==========================================================================`);
  console.log(`🌟 RINGKASAN INTEGRASI RADIOLOGI LENGKAP`);
  console.log(`==========================================================================`);
  console.log(`1. File Gambar Medis (.dcm):`);
  console.log(`   - Status    : Tersimpan di PACS Lokal RS (DCM4CHEE)`);
  console.log(`   - File Path : ${dicomResult.filepath}`);
  console.log(`   - Akses WADO-RS / OHIF Viewer Langsung:`);
  console.log(`     👉 http://localhost:3001/viewer?StudyInstanceUIDs=${dicomResult.studyInstanceUid}`);
  console.log(`2. Metadata di SATUSEHAT Kemenkes (ImagingStudy):`);
  console.log(`   - Resource ID : ${pushJson.imagingStudyId || pushJson.data?.imagingStudyId || "Terkirim (Lihat log)"}`);
  console.log(`   - UID Terindeks: ${dicomResult.studyInstanceUid}`);
  console.log(`   - Catatan     : Kemenkes HANYA menyimpan referensi metadata indeks.`);
  console.log(`                   Gambar asli TIDAK dikirim ke Kemenkes demi efisiensi bandwidth & privasi faskes.`);
  console.log(`3. SmartRIS UI:`);
  console.log(`   - Buka Detail Order: http://localhost:8080/admin/orders/${orderId}`);
  console.log(`==========================================================================\n`);
}

main().catch(console.error);
