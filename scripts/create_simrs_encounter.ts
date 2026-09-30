/**
 * Script Simulasi SIMRS (Sistem Informasi Manajemen Rumah Sakit)
 * 
 * Tanggung jawab SIMRS:
 * 1. Mendaftarkan kunjungan pasien (Encounter) ke SATUSEHAT Kemenkes RI.
 * 2. Menerima ID Encounter dari SATUSEHAT.
 * 3. Mengirimkan order radiologi ke SmartRIS beserta `satusehat_encounter_id`.
 */

export interface CreateSimrsEncounterOptions {
  patientIhs: string;
  patientName: string;
  registrationNumber?: string;
  practitionerIhs?: string;
  practitionerName?: string;
  locationId?: string;
  locationName?: string;
}

export async function createSimrsEncounter(options: CreateSimrsEncounterOptions): Promise<string> {
  // Konfigurasi SATUSEHAT Staging Kemenkes
  const authUrl = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";
  const baseUrl = "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1";
  const organizationId = "ad58ff1f-b948-498b-ae80-f1df1a04c7b4";
  const clientId = "AY8PdbXVufjN75APCbNBlSIOFurcjunWoe19tAH4BZbuA3iB";
  const clientSecret = "LrhwPDoQ4OGEhEG6q7qmGd8JX1w0FpKmPyefqlAkWNFmanKCMLWKGIGtdFoVgqrG";

  console.log(`   [SIMRS] Meminta Token Otentikasi SATUSEHAT Staging...`);
  const formBody = new URLSearchParams();
  formBody.append("client_id", clientId);
  formBody.append("client_secret", clientSecret);

  const authRes = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody.toString()
  });

  const authData = await authRes.json();
  if (!authRes.ok || !authData.access_token) {
    throw new Error(`[SIMRS] Gagal autentikasi SATUSEHAT: ${JSON.stringify(authData)}`);
  }

  const token = authData.access_token;
  const regNo = options.registrationNumber || `REG-${Date.now()}`;
  const now = new Date().toISOString();
  const practitionerIhs = options.practitionerIhs || "10009880728"; // dr. Alexander
  const practitionerName = options.practitionerName || "dr. Alexander";

  // Payload FHIR Encounter standar Kemenkes RI untuk Kunjungan Rawat Jalan (AMB)
  const encounterPayload: any = {
    resourceType: "Encounter",
    status: "arrived",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "AMB",
      display: "ambulatory"
    },
    subject: {
      reference: `Patient/${options.patientIhs}`,
      display: options.patientName
    },
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                code: "ATND",
                display: "attender"
              }
            ]
          }
        ],
        individual: {
          reference: `Practitioner/${practitionerIhs}`,
          display: practitionerName
        }
      }
    ],
    period: {
      start: now
    },
    statusHistory: [
      {
        status: "arrived",
        period: {
          start: now
        }
      }
    ],
    serviceProvider: {
      reference: `Organization/${organizationId}`
    },
    identifier: [
      {
        system: `http://sys-ids.kemkes.go.id/encounter/${organizationId}`,
        value: regNo
      }
    ]
  };

  // Lookup lokasi jika tersedia
  try {
    const locRes = await fetch(`${baseUrl}/Location?organization=${organizationId}&_count=1`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const locData = await locRes.json();
    const locEntry = locData.entry?.[0]?.resource;
    if (locEntry?.id) {
      encounterPayload.location = [
        {
          location: {
            reference: `Location/${locEntry.id}`,
            display: locEntry.name || "Instalasi Rawat Jalan"
          }
        }
      ];
    }
  } catch {}

  console.log(`   [SIMRS] Mengirim FHIR Encounter ke SATUSEHAT (No. Reg: ${regNo})...`);
  const encRes = await fetch(`${baseUrl}/Encounter`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(encounterPayload)
  });

  const encData = await encRes.json();
  if (encRes.status === 201 || encRes.ok) {
    const encounterId = encData.id;
    console.log(`   [SIMRS] ✅ Berhasil membuat Encounter di SATUSEHAT: ${encounterId}`);
    return encounterId;
  } else {
    const errMsg = encData.issue?.[0]?.details?.text || `HTTP ${encRes.status}: Gagal push Encounter`;
    throw new Error(`[SIMRS] Gagal push Encounter ke SATUSEHAT: ${errMsg}`);
  }
}

// Support CLI execution: bun scripts/create_simrs_encounter.ts <patientIhs> <patientName> <orderId?>
if (import.meta.main) {
  const args = process.argv.slice(2);
  const patientIhs = args[0] || "100000030009";
  const patientName = args[1] || "Pasien Uji Coba SIMRS";
  const orderId = args[2] ? Number(args[2]) : undefined;

  console.log("🏥 SIMULATOR SIMRS: Pendaftaran Kunjungan (Encounter)");
  console.log(`- Pasien: ${patientName} (IHS: ${patientIhs})`);

  createSimrsEncounter({ patientIhs, patientName })
    .then(async (encounterId) => {
      console.log(`\n🎉 Encounter ID yang dihasilkan: ${encounterId}`);

      if (orderId) {
        console.log(`\nMenghubungkan Encounter ID ke Order #${orderId} di SmartRIS...`);
        const putRes = await fetch(`http://localhost:3000/api/satusehat/orders/${orderId}/encounter-id`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encounterId })
        });
        const putData = await putRes.json();
        console.log("Hasil update SmartRIS:", putData);
      }
    })
    .catch((err) => {
      console.error("❌ Error:", err.message);
      process.exit(1);
    });
}
