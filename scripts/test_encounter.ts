/**
 * Test SATUSEHAT Encounter creation in Sandbox
 */
async function testEncounter() {
  // Login to SmartRIS
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "superadmin", password: "password123" })
  });
  const token = (await loginRes.json()).data.token;

  // Test Connection
  const connRes = await fetch("http://localhost:3000/api/satusehat/test-connection", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const conn = await connRes.json();
  console.log("Koneksi SATUSEHAT:", conn);

  // Get raw settings
  const settingsRes = await fetch("http://localhost:3000/api/satusehat/settings", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const settings = (await settingsRes.json()).data;

  // Get token via direct token endpoint
  const authBody = new URLSearchParams({
    client_id: settings.clientId,
    client_secret: process.env.SATUSEHAT_CLIENT_SECRET || "AY8PdbXVufjN75APCbNBlSIOFurcjunWoe19tAH4BZbuA3iB",
  });

  const oauthRes = await fetch("https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: authBody
  });
  const oauth = await oauthRes.json();
  const stgToken = oauth.access_token;
  console.log("STG Access Token retrieved:", stgToken ? "YES" : "NO");

  if (!stgToken) return;

  const now = new Date().toISOString();
  const encounterPayload = {
    resourceType: "Encounter",
    status: "finished",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "AMB",
      display: "ambulatory"
    },
    subject: {
      reference: "Patient/100000030009",
      display: "Pasien Uji Coba"
    },
    period: {
      start: now,
      end: now
    },
    serviceProvider: {
      reference: `Organization/${settings.organizationId}`
    }
  };

  const res = await fetch("https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Encounter", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stgToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(encounterPayload)
  });

  const resJson = await res.json();
  console.log(`Encounter Response (HTTP ${res.status}):`, JSON.stringify(resJson, null, 2));
}

testEncounter().catch(console.error);
