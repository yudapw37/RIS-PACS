import { Elysia } from "elysia";
import { DCM4CHEEService } from "../services/dcm4chee.service";

const DCM4CHEE_URL = process.env.DCM4CHEE_API_URL || "http://127.0.0.1:8082";
const DCM4CHEE_AET = process.env.DCM4CHEE_AET || "DCM4CHEE";

export const systemRoutes = new Elysia({ prefix: "/api/system" })

  // GET /api/system/info — Informasi sistem & koneksi
  .get("/info", async ({ request }) => {
    // Ambil IP dari request header (dari Nginx/proxy) atau hostname
    const host = request.headers.get("host") || "localhost";
    const serverIp = host.split(":")[0]; // strip port

    // Cek status DCM4CHEE
    const dcm4cheeHealthy = await DCM4CHEEService.healthCheck();

    // Cek status backend (sudah pasti alive kalau endpoint ini respond)
    const backendAlive = true;

    return {
      success: true,
      data: {
        serverIp,
        // Komponen Sistem
        components: [
          {
            name: "SmartRIS Frontend",
            description: "Dashboard & UI untuk operator radiologi",
            url: `http://${serverIp}:8080`,
            port: 8080,
            protocol: "HTTP",
            status: "online", // Frontend pasti online kalau user bisa akses
          },
          {
            name: "SmartRIS Backend API",
            description: "REST API middleware (Bun/ElysiaJS)",
            url: `http://${serverIp}:3000`,
            port: 3000,
            protocol: "HTTP",
            status: backendAlive ? "online" : "offline",
          },
          {
            name: "DCM4CHEE UI",
            description: "PACS Admin - Device, AE Title, Study management",
            url: `http://${serverIp}:8082/dcm4chee-arc/ui2`,
            port: 8082,
            protocol: "HTTP",
            status: dcm4cheeHealthy ? "online" : "offline",
          },
          {
            name: "OHIF Viewer",
            description: "DICOM Viewer (DICOMWeb) untuk melihat gambar medis",
            url: `http://${serverIp}:3001`,
            port: 3001,
            protocol: "HTTP",
            status: "online",
          },
          {
            name: "DICOM Port (MWL + Store)",
            description: "Port DICOM standar untuk komunikasi modality",
            url: `${serverIp}:11112`,
            port: 11112,
            protocol: "DICOM",
            status: dcm4cheeHealthy ? "online" : "offline",
          },
        ],
        // Setting Modality
        modalitySettings: {
          worklistQuery: {
            label: "Query Worklist (MWL)",
            description: "Modality query daftar pasien yang akan diperiksa",
            aet: "WORKLIST",
            ip: serverIp,
            port: 11112,
            protocol: "DICOM C-FIND (MWL SCP)",
          },
          storeImage: {
            label: "Kirim Gambar (C-STORE)",
            description: "Modality mengirim hasil foto/scan ke PACS",
            aet: DCM4CHEE_AET,
            ip: serverIp,
            port: 11112,
            protocol: "DICOM C-STORE SCP",
          },
          echoTest: {
            label: "Test Koneksi (C-ECHO)",
            description: "Cek apakah PACS bisa dihubungi dari modality",
            aet: DCM4CHEE_AET,
            ip: serverIp,
            port: 11112,
            protocol: "DICOM C-ECHO (Ping)",
          },
        },
        // Flow koneksi
        connectionFlow: [
          {
            step: 1,
            from: "Operator SmartRIS",
            to: "SmartRIS Backend",
            action: "Buat Order Pemeriksaan",
            description: "Operator mendaftarkan pasien dan membuat order radiologi",
            protocol: "REST API (HTTP)",
          },
          {
            step: 2,
            from: "SmartRIS Backend",
            to: "DCM4CHEE PACS",
            action: "Push MWL (Modality Worklist)",
            description: "Sistem otomatis mendaftarkan pasien dan worklist ke PACS",
            protocol: "REST API → DICOM MWL SCP",
          },
          {
            step: 3,
            from: "Modality (CT/CR/IO)",
            to: "DCM4CHEE PACS",
            action: "Query Worklist",
            description: "Modality menarik daftar pasien dari PACS (AET: WORKLIST)",
            protocol: "DICOM C-FIND (Port 11112)",
          },
          {
            step: 4,
            from: "Modality (CT/CR/IO)",
            to: "DCM4CHEE PACS",
            action: "Kirim Gambar DICOM",
            description: "Setelah foto selesai, modality mengirim hasil ke PACS (AET: DCM4CHEE)",
            protocol: "DICOM C-STORE (Port 11112)",
          },
          {
            step: 5,
            from: "Dokter Radiolog",
            to: "OHIF Viewer",
            action: "Baca & Interpretasi Gambar",
            description: "Dokter membuka gambar dari OHIF Viewer melalui browser",
            protocol: "DICOMWeb (WADO-RS)",
          },
        ],
        // Metadata
        version: "3.0.0",
        pacs: "DCM4CHEE Arc Light 5",
        lastChecked: new Date().toISOString(),
      },
    };
  });
