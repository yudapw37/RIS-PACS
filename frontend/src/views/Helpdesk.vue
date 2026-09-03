<template>
  <div class="page-enter max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Helpdesk & Panduan Penggunaan</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Dokumentasi lengkap sistem SmartRIS V3</p>
    </div>

    <!-- Alur Kerja -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 mb-6">
      <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 text-sm font-black">1</span>
        Alur Kerja (Workflow) SmartRIS
      </h3>
      <div class="flex flex-col gap-0">
        <div v-for="(step, i) in workflow" :key="i" class="flex gap-4">
          <div class="flex flex-col items-center">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0', step.color]">{{ i + 1 }}</div>
            <div v-if="i < workflow.length - 1" class="w-0.5 bg-slate-100 dark:bg-slate-800 flex-1 my-1"></div>
          </div>
          <div class="pb-6 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-slate-800 dark:text-slate-100">{{ step.title }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :class="step.badgeClass">{{ step.actor }}</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Penjelasan Menu -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 mb-6">
      <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 text-sm font-black">2</span>
        Penjelasan Setiap Menu
      </h3>
      <div class="space-y-4">
        <div v-for="menu in menus" :key="menu.name" class="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-cyan-200 dark:hover:border-cyan-800 transition-colors">
          <div class="flex items-start gap-3">
            <div :class="['w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg', menu.iconBg]">{{ menu.icon }}</div>
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-slate-800 dark:text-slate-100">{{ menu.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">{{ menu.path }}</span>
                <span v-if="menu.role" class="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600">{{ menu.role }}</span>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ menu.desc }}</p>
              <ul v-if="menu.features" class="mt-2 space-y-1">
                <li v-for="f in menu.features" :key="f" class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>{{ f }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DICOM MWL -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 mb-6">
      <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 text-sm font-black">3</span>
        Integrasi DICOM Modality Worklist (MWL)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="item in dicomInfo" :key="item.title" class="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4">
          <p class="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{{ item.title }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Status Order -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 mb-6">
      <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 text-sm font-black">4</span>
        Status Order & Transisi
      </h3>
      <div class="flex flex-wrap gap-3">
        <div v-for="s in statuses" :key="s.key" class="flex items-center gap-2 rounded-xl border px-4 py-3" :class="s.border">
          <span class="w-2.5 h-2.5 rounded-full" :class="s.dot"></span>
          <div>
            <p class="font-bold text-sm" :class="s.text">{{ s.label }}</p>
            <p class="text-xs text-slate-400">{{ s.desc }}</p>
          </div>
        </div>
      </div>
      <div class="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
        scheduled → in_progress → completed → (expertise) → History
        <br/>
        scheduled → canceled → History
      </div>
    </div>

    <!-- Tips -->
    <div class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-3xl border border-cyan-100 dark:border-cyan-800/30 p-8">
      <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span class="text-xl">💡</span> Tips Penggunaan
      </h3>
      <ul class="space-y-3">
        <li v-for="tip in tips" :key="tip" class="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span class="text-cyan-500 font-bold mt-0.5">→</span>{{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const workflow = [
  {
    title: 'Registrasi Pasien', actor: 'Admin / Petugas Pendaftaran', color: 'bg-slate-500',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    desc: 'Daftarkan data pasien baru di menu Master Data → Pasien (Nama, MRN, Tanggal Lahir, Jenis Kelamin).'
  },
  {
    title: 'Buat Order Pemeriksaan', actor: 'Admin / Petugas Pendaftaran', color: 'bg-cyan-500',
    badgeClass: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600',
    desc: 'Buka menu Manajemen Order → klik "+ Registrasi Order". Pilih pasien, dokter pengirim, modalitas, alat fisik (penting untuk Worklist!), body part, dan info klinis. Setelah disimpan, data otomatis dikirim ke DCM4CHEE sebagai MWL item.'
  },
  {
    title: 'Alat Membaca Worklist', actor: 'Alat / Modality', color: 'bg-blue-500',
    badgeClass: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600',
    desc: 'Alat radiologi (CT, X-Ray, Dental IO, dll) melakukan C-FIND query ke PACS. Jika AE Title alat cocok dengan ScheduledStationAETitle di Worklist, data pasien otomatis muncul di layar alat tanpa input manual.'
  },
  {
    title: 'Mulai Pemeriksaan', actor: 'Radiografer', color: 'bg-violet-500',
    badgeClass: 'bg-violet-50 dark:bg-violet-900/40 text-violet-600',
    desc: 'Buka menu Antrean Pemeriksaan → klik tombol Edit → pilih "Mulai Pemeriksaan". Status berubah menjadi in_progress. Radiografer mengoperasikan alat dan mengambil gambar.'
  },
  {
    title: 'Selesai Pemeriksaan', actor: 'Radiografer', color: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600',
    desc: 'Klik Edit → "Selesai Pemeriksaan". Status berubah ke completed. Order otomatis pindah ke Antrean Bacaan menunggu dibaca oleh dokter radiologi.'
  },
  {
    title: 'Baca & Expertise', actor: 'Dokter Radiologi', color: 'bg-amber-500',
    badgeClass: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600',
    desc: 'Buka menu Antrean Bacaan. Dokter radiologi membaca hasil foto dan mengisi laporan (Temuan/Findings & Kesimpulan/Conclusions). Setelah disimpan, order masuk ke History Order.'
  },
]

const menus = [
  {
    icon: '📊', iconBg: 'bg-slate-50 dark:bg-slate-800',
    name: 'Dashboard Utama', path: '/admin', role: 'Semua',
    desc: 'Tampilan ringkasan statistik sistem: jumlah kunjungan, alat tersambung, dan order yang menunggu expertise.',
    features: []
  },
  {
    icon: '🧑‍🤝‍🧑', iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',
    name: 'Pasien', path: '/admin/patients', role: 'Admin',
    desc: 'Master data pasien. Daftarkan, edit, dan cari data pasien berdasarkan nama atau MRN.',
    features: ['Tambah / Edit pasien', 'Cari pasien real-time', 'Lihat riwayat order per pasien']
  },
  {
    icon: '👨‍⚕️', iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    name: 'Dokter', path: '/admin/doctors', role: 'Admin',
    desc: 'Master data dokter pengirim. Dokter ini akan tercatat di DICOM tag sebagai Referring Physician.',
    features: ['Tambah / Edit dokter', 'Nama dokter otomatis masuk ke tag DICOM 00080090']
  },
  {
    icon: '🖥️', iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    name: 'Modality', path: '/admin/modalities', role: 'Admin',
    desc: 'Master data alat fisik. Setiap alat memiliki AE Title unik yang digunakan untuk routing DICOM Worklist.',
    features: ['Tambah alat dengan AE Title, IP, Port', 'AE Title digunakan sebagai ScheduledStationAETitle', 'C-ECHO ping untuk tes koneksi alat']
  },
  {
    icon: '📋', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    name: 'Manajemen Order', path: '/admin/orders', role: 'Admin / Petugas',
    desc: 'Pusat manajemen semua order pemeriksaan radiologi. Tampilkan semua status dengan filter tab.',
    features: [
      'Filter tab: Semua / Terjadwal / Dalam Proses / Selesai / Dibatalkan',
      'Tombol Detail: lihat info lengkap order',
      'Tombol Edit: ubah status (hanya untuk order aktif)',
      'Buat order baru → otomatis push ke DICOM MWL',
      'Pilih alat spesifik (Mode Spesifik) atau biarkan kosong (Mode Broadcast)'
    ]
  },
  {
    icon: '🔬', iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    name: 'Antrean Pemeriksaan', path: '/admin/examination-worklist', role: 'Radiografer',
    desc: 'Daftar order yang siap atau sedang dikerjakan oleh radiografer (status: scheduled & in_progress).',
    features: ['Mulai pemeriksaan → status jadi in_progress', 'Selesai pemeriksaan → status jadi completed']
  },
  {
    icon: '📖', iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    name: 'Antrean Bacaan', path: '/admin/expertise-worklist', role: 'Dokter Radiologi',
    desc: 'Daftar order yang sudah selesai difoto (completed) tapi belum ada laporan expertise dari dokter radiologi.',
    features: ['Isi temuan (Findings) dan kesimpulan (Conclusions)', 'Simpan expertise → order pindah ke History']
  },
  {
    icon: '🕐', iconBg: 'bg-slate-50 dark:bg-slate-800',
    name: 'History Order', path: '/admin/history', role: 'Semua',
    desc: 'Arsip semua order yang sudah selesai penuh (ada expertise), dibatalkan, atau gagal.',
    features: []
  },
  {
    icon: '📡', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    name: 'Info Sistem & PACS', path: '/admin/system-info', role: 'Admin / IT',
    desc: 'Status koneksi DCM4CHEE PACS, health check, dan informasi server. Termasuk verifikasi MWL item yang tersimpan di PACS.',
    features: ['C-ECHO ping ke DCM4CHEE', 'Lihat MWL items di PACS', 'Status container Docker']
  },
]

const dicomInfo = [
  { title: 'Mode Spesifik', desc: 'Pilih alat fisik saat registrasi order → ScheduledStationAETitle diisi AET alat. Hanya alat tersebut yang melihat order ini.' },
  { title: 'Mode Broadcast', desc: 'Biarkan kolom "Modality Alat" kosong → tag 00400001 tidak dikirim. Semua alat dengan Modality Type yang sama dapat melihat order.' },
  { title: 'C-FIND (Query)', desc: 'Alat melakukan C-FIND ke AET WORKLIST. PACS mencocokkan filter AE Title alat dengan data Worklist yang tersimpan.' },
  { title: 'Auto Push MWL', desc: 'Saat order dibuat di SmartRIS, backend otomatis mengirim HTTP POST ke DCM4CHEE REST API untuk mendaftarkan MWL item baru.' },
]

const statuses = [
  { key: 'scheduled', label: 'Terjadwal', desc: 'Order baru dibuat', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-600', border: 'border-amber-100 dark:border-amber-900/40' },
  { key: 'in_progress', label: 'Dalam Proses', desc: 'Sedang difoto', dot: 'bg-blue-400 animate-spin', text: 'text-blue-600', border: 'border-blue-100 dark:border-blue-900/40' },
  { key: 'completed', label: 'Selesai', desc: 'Foto selesai', dot: 'bg-emerald-400', text: 'text-emerald-600', border: 'border-emerald-100 dark:border-emerald-900/40' },
  { key: 'canceled', label: 'Dibatalkan', desc: 'Order dibatal', dot: 'bg-red-400', text: 'text-red-500', border: 'border-red-100 dark:border-red-900/40' },
  { key: 'failed', label: 'Gagal', desc: 'Gagal diproses', dot: 'bg-slate-400', text: 'text-slate-500', border: 'border-slate-100 dark:border-slate-700' },
]

const tips = [
  'Selalu isi MRN pasien dengan format yang konsisten (contoh: RM-0001) agar mudah dicari dan sesuai dengan sistem PACS.',
  'Saat membuat order untuk alat gigi (IO), pastikan memilih alat yang benar di kolom "Modality Alat" agar Worklist muncul di alat.',
  'Gunakan "Mode Broadcast" (biarkan alat kosong) jika ada lebih dari satu alat dengan tipe yang sama dan belum ditentukan siapa yang mengerjakan.',
  'Jika alat tidak menerima Worklist, cek di menu Info Sistem → pastikan AE Title alat di SmartRIS sama persis dengan konfigurasi di alat fisik.',
  'Order yang sudah dibatalkan atau selesai tidak bisa diubah statusnya lagi. Buat order baru jika diperlukan.',
  'Expertise (laporan dokter) hanya bisa diisi setelah status order menjadi "Selesai (completed)".',
  'Lakukan C-ECHO ping secara berkala di menu Info Sistem untuk memastikan koneksi PACS tetap stabil.',
]
</script>
