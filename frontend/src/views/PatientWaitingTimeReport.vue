<template>
  <div class="page-enter pb-10">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Audit SPM & Mutu Layanan
          </span>
          <span class="text-xs text-slate-400">Turnaround Time (TAT)</span>
        </div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mt-1">Laporan Waktu Tunggu Pasien</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Rincian waktu tunggu diterima, durasi tindakan, hingga ekspertise per masing-masing pasien</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button 
          @click="exportCsv" 
          :disabled="loading || rows.length === 0"
          class="btn-secondary flex items-center gap-2 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV / Excel
        </button>
        <button 
          @click="printReport" 
          :disabled="loading || rows.length === 0"
          class="btn-secondary flex items-center gap-2 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Cetak Laporan
        </button>
        <router-link 
          to="/admin/reports" 
          class="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Laporan Statistik
        </router-link>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <!-- 1. Antre Masuk -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase">Tahap 1</span>
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {{ formatMinutes(summary.avgWaitExamMinutes) }}
        </div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Rata-rata Antre Masuk</div>
        <div class="text-[10px] text-slate-500 mt-1">Diterima ➔ Mulai Periksa</div>
      </div>

      <!-- 2. Durasi Tindakan -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase">Tahap 2</span>
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {{ formatMinutes(summary.avgExamDurationMinutes) }}
        </div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Durasi Tindakan</div>
        <div class="text-[10px] text-slate-500 mt-1">Mulai ➔ Selesai Rontgen</div>
      </div>

      <!-- 3. Tunggu Ekspertise -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase">Tahap 3</span>
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {{ formatMinutes(summary.avgWaitExpertiseMinutes) }}
        </div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Tunggu Ekspertise</div>
        <div class="text-[10px] text-slate-500 mt-1">Selesai ➔ Ekspertise Dokter</div>
      </div>

      <!-- 4. Total TAT Layanan -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <span class="text-[10px] font-bold text-indigo-500 uppercase font-mono">TOTAL TAT</span>
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {{ formatMinutes(summary.avgTotalTatMinutes) }}
        </div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Rata-rata Total Waktu</div>
        <div class="text-[10px] text-slate-500 mt-1">Order ➔ Hasil Jadi Selesai</div>
      </div>

      <!-- 5. Kepatuhan SPM -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-3">
          <div :class="summary.complianceRate >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600'" class="w-10 h-10 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <span :class="summary.complianceRate >= 80 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'text-rose-500 bg-rose-50 dark:bg-rose-900/30'" class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-current border-opacity-15">
            {{ summary.complianceRate }}%
          </span>
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {{ summary.compliantCount }} <span class="text-sm font-semibold text-slate-400">/ {{ summary.completedCount }}</span>
        </div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Kepatuhan Standar SPM</div>
        <div class="text-[10px] text-slate-500 mt-1">CITO &le;60m | Rutin &le;180m</div>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <!-- Date From -->
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
          <div class="flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input type="date" v-model="filter.from" @change="fetchData" class="w-full text-xs font-bold bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 p-0" />
          </div>
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
          <div class="flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input type="date" v-model="filter.to" @change="fetchData" class="w-full text-xs font-bold bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 p-0" />
          </div>
        </div>

        <!-- Priority Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prioritas</label>
          <select v-model="filter.priority" @change="fetchData" class="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-cyan-500">
            <option value="all">Semua Prioritas</option>
            <option value="routine">Rutin (Standar &le; 180 Menit)</option>
            <option value="urgent">Urgent / CITO (&le; 60 Menit)</option>
            <option value="stat">STAT / Darurat (&le; 60 Menit)</option>
          </select>
        </div>

        <!-- Compliance Filter -->
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kepatuhan SPM</label>
          <select v-model="filter.compliance" @change="fetchData" class="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-cyan-500">
            <option value="all">Semua Status Kepatuhan</option>
            <option value="compliant">✅ Tepat Waktu (Memenuhi SPM)</option>
            <option value="overtime">⚠️ Melebihi Standar (Overtime)</option>
            <option value="in_progress">⏳ Sedang Dalam Pelayanan</option>
          </select>
        </div>

        <!-- Search Input -->
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pencarian Pasien</label>
          <div class="relative">
            <input 
              type="text" 
              v-model="filter.search" 
              @input="debounceSearch"
              placeholder="Nama / No. RM / Aksesi..." 
              class="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-400"
            />
            <svg class="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- Table Header & Counter -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <h3 class="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Rincian Durasi Waktu Pelayanan Per Pasien</h3>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {{ pagination.totalItems }} Pasien
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Menampilkan {{ rows.length }} dari {{ pagination.totalItems }} data</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg class="animate-spin w-8 h-8 text-cyan-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-semibold">Memuat data waktu tunggu pasien...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="rows.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <div class="w-14 h-14 rounded-3xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center mb-3 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300 text-sm">Tidak ada data waktu tunggu pasien</p>
        <p class="text-xs text-slate-400 mt-1">Coba ubah rentang tanggal atau kriteria filter pencarian.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <th class="px-5 py-3.5">Pasien & No. RM</th>
              <th class="px-4 py-3.5">Pemeriksaan / Aksesi</th>
              <th class="px-4 py-3.5">Prioritas</th>
              <th class="px-4 py-3.5 text-center">Waktu Diterima</th>
              <th class="px-4 py-3.5 text-center">Mulai ➔ Selesai</th>
              <th class="px-4 py-3.5 text-center">Ekspertise Selesai</th>
              <th class="px-4 py-3.5 text-center bg-cyan-50/40 dark:bg-cyan-950/20">Antre Masuk</th>
              <th class="px-4 py-3.5 text-center bg-blue-50/40 dark:bg-blue-950/20">Tindakan</th>
              <th class="px-4 py-3.5 text-center bg-amber-50/40 dark:bg-amber-950/20">Tunggu Baca</th>
              <th class="px-4 py-3.5 text-center bg-indigo-50/40 dark:bg-indigo-950/20 font-extrabold text-indigo-600 dark:text-indigo-400">Total TAT</th>
              <th class="px-4 py-3.5 text-center">Status SPM</th>
              <th class="px-5 py-3.5 text-right">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="item in rows" :key="item.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
              <!-- Pasien -->
              <td class="px-5 py-3.5">
                <div class="font-bold text-slate-800 dark:text-slate-100 text-xs">{{ item.patientName }}</div>
                <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span class="font-mono">{{ item.patientMrn }}</span>
                  <span v-if="item.noReg">&bull; {{ item.noReg }}</span>
                </div>
              </td>

              <!-- Pemeriksaan -->
              <td class="px-4 py-3.5">
                <div class="font-bold text-slate-700 dark:text-slate-200">
                  <span class="text-cyan-600 font-mono">[{{ item.modalityTypeCode }}]</span> {{ item.bodyPart || 'Pemeriksaan Radiologi' }}
                </div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">{{ item.accessionNumber }}</div>
              </td>

              <!-- Prioritas -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span 
                  :class="{
                    'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400': item.priority === 'urgent' || item.priority === 'stat',
                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400': item.priority === 'routine'
                  }"
                  class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border"
                >
                  {{ item.priority === 'urgent' ? 'CITO' : item.priority === 'stat' ? 'STAT' : 'Rutin' }}
                </span>
              </td>

              <!-- Waktu Diterima -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                <div>{{ formatTime(item.orderDate) }}</div>
                <div class="text-[10px] text-slate-400">{{ formatDate(item.orderDate) }}</div>
              </td>

              <!-- Mulai & Selesai Diperiksa -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                <div v-if="item.examStartedAt">
                  <span>{{ formatTime(item.examStartedAt) }}</span>
                  <span class="text-slate-400"> ➔ </span>
                  <span>{{ formatTime(item.examFinishedAt) || '...' }}</span>
                </div>
                <span v-else class="text-slate-300 dark:text-slate-600 italic">Belum mulai</span>
              </td>

              <!-- Ekspertise Selesai -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                <div v-if="item.expertiseCreatedAt">
                  {{ formatTime(item.expertiseCreatedAt) }}
                  <div class="text-[10px] text-slate-400 max-w-[120px] truncate mx-auto" :title="item.radiologistName || ''">
                    {{ item.radiologistName || '-' }}
                  </div>
                </div>
                <span v-else class="text-amber-500 text-[10px] font-semibold italic">Belum dibaca</span>
              </td>

              <!-- Antre Masuk (orderDate -> examStartedAt) -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap bg-cyan-50/30 dark:bg-cyan-950/10">
                <span v-if="item.waitTimeExamMinutes !== null" class="font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">
                  {{ formatMinutes(item.waitTimeExamMinutes) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600">-</span>
              </td>

              <!-- Tindakan (examStartedAt -> examFinishedAt) -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap bg-blue-50/30 dark:bg-blue-950/10">
                <span v-if="item.examDurationMinutes !== null" class="font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                  {{ formatMinutes(item.examDurationMinutes) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600">-</span>
              </td>

              <!-- Tunggu Baca (examFinishedAt -> expertiseCreatedAt) -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap bg-amber-50/30 dark:bg-amber-950/10">
                <span v-if="item.waitTimeExpertiseMinutes !== null" class="font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                  {{ formatMinutes(item.waitTimeExpertiseMinutes) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600">-</span>
              </td>

              <!-- Total TAT (orderDate -> expertiseCreatedAt) -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap bg-indigo-50/30 dark:bg-indigo-950/10 font-bold">
                <span v-if="item.totalTatMinutes !== null" class="text-indigo-700 dark:text-indigo-300 tabular-nums font-mono text-xs">
                  {{ formatMinutes(item.totalTatMinutes) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-[10px] italic">Sedang berjalan</span>
              </td>

              <!-- Status SPM -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap">
                <span 
                  v-if="item.complianceStatus === 'compliant'"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Tepat Waktu
                </span>
                <span 
                  v-else-if="item.complianceStatus === 'overtime'"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  :title="`Melebihi target SPM ${item.spmTargetMinutes} menit`"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Overtime
                </span>
                <span 
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Dalam Proses
                </span>
              </td>

              <!-- Detail Action -->
              <td class="px-5 py-3.5 text-right whitespace-nowrap">
                <button 
                  @click="openDetailModal(item)"
                  class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Detail Waktu
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span class="text-xs text-slate-400">
          Halaman <strong class="text-slate-700 dark:text-slate-200">{{ pagination.page }}</strong> dari <strong>{{ pagination.totalPages }}</strong>
        </span>
        <div class="flex items-center gap-1">
          <button 
            @click="changePage(pagination.page - 1)" 
            :disabled="pagination.page <= 1"
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Sebelumnya
          </button>
          <button 
            @click="changePage(pagination.page + 1)" 
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Kronologi Detail Waktu Pasien -->
    <div v-if="selectedItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-100 dark:border-slate-800 shadow-2xl relative">
        <div class="flex items-start justify-between mb-5">
          <div>
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600">Kronologi Audit Waktu Pasien</div>
            <h3 class="text-lg font-black text-slate-800 dark:text-slate-100">{{ selectedItem.patientName }}</h3>
            <p class="text-xs text-slate-400 font-mono mt-0.5">{{ selectedItem.patientMrn }} &bull; Aksesi: {{ selectedItem.accessionNumber }}</p>
          </div>
          <button @click="selectedItem = null" class="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Step-by-Step Timeline -->
        <div class="space-y-4 my-6">
          <!-- Milestone 1: Order Diterima -->
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <div class="flex-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-800 dark:text-slate-200">Order Diterima di Radiologi</span>
                <span class="font-mono text-xs font-semibold text-slate-500">{{ formatFullDateTime(selectedItem.orderDate) }}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">Pemeriksaan {{ selectedItem.bodyPart }} ({{ selectedItem.priority }})</div>
            </div>
          </div>

          <!-- Durasi Antre -->
          <div class="ml-10 text-[11px] text-cyan-600 font-bold bg-cyan-50 dark:bg-cyan-950/30 px-3 py-1.5 rounded-xl flex items-center justify-between">
            <span>⏱️ Waktu Antre Tunggu Masuk:</span>
            <span>{{ formatMinutes(selectedItem.waitTimeExamMinutes) }}</span>
          </div>

          <!-- Milestone 2: Mulai Diperiksa -->
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <div class="flex-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-800 dark:text-slate-200">Mulai Masuk Ruang Pemeriksaan</span>
                <span class="font-mono text-xs font-semibold text-slate-500">{{ formatFullDateTime(selectedItem.examStartedAt) || '-' }}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">Teknisi: {{ selectedItem.radiographerName || 'Radiografer' }}</div>
            </div>
          </div>

          <!-- Durasi Tindakan -->
          <div class="ml-10 text-[11px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-xl flex items-center justify-between">
            <span>⚙️ Durasi Tindakan Rontgen:</span>
            <span>{{ formatMinutes(selectedItem.examDurationMinutes) }}</span>
          </div>

          <!-- Milestone 3: Selesai Diperiksa -->
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <div class="flex-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-800 dark:text-slate-200">Selesai Tindakan & Kirim ke PACS</span>
                <span class="font-mono text-xs font-semibold text-slate-500">{{ formatFullDateTime(selectedItem.examFinishedAt) || '-' }}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">Citra DICOM tersimpan di server PACS</div>
            </div>
          </div>

          <!-- Durasi Tunggu Ekspertise -->
          <div class="ml-10 text-[11px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl flex items-center justify-between">
            <span>🩺 Waktu Tunggu Baca Dokter:</span>
            <span>{{ formatMinutes(selectedItem.waitTimeExpertiseMinutes) }}</span>
          </div>

          <!-- Milestone 4: Ekspertise Dokter -->
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-800 dark:text-slate-200">Hasil Ekspertise Selesai</span>
                <span class="font-mono text-xs font-semibold text-slate-500">{{ formatFullDateTime(selectedItem.expertiseCreatedAt) || 'Belum Diisi' }}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">Dokter: {{ selectedItem.radiologistName || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Total TAT Summary Box -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Waktu Layanan (TAT)</div>
            <div class="text-xl font-black text-indigo-600 dark:text-indigo-400">{{ formatMinutes(selectedItem.totalTatMinutes) }}</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target SPM Kemenkes</div>
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">&le; {{ selectedItem.spmTargetMinutes }} Menit</div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="selectedItem = null" class="btn-primary text-xs font-bold px-5 py-2.5 rounded-xl">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Filters
const filter = ref({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0],
  priority: 'all',
  compliance: 'all',
  search: ''
})

const loading = ref(false)
const rows = ref<any[]>([])
const summary = ref({
  totalPatients: 0,
  completedCount: 0,
  inProgressCount: 0,
  avgWaitExamMinutes: 0,
  avgExamDurationMinutes: 0,
  avgWaitExpertiseMinutes: 0,
  avgTotalTatMinutes: 0,
  compliantCount: 0,
  overtimeCount: 0,
  complianceRate: 100
})

const pagination = ref({
  page: 1,
  limit: 25,
  totalItems: 0,
  totalPages: 1
})

const selectedItem = ref<any>(null)
let searchTimeout: any = null

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchData()
  }, 350)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      from: filter.value.from,
      to: filter.value.to,
      priority: filter.value.priority,
      compliance: filter.value.compliance,
      search: filter.value.search,
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    const token = localStorage.getItem('ris_token') || localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const res = await axios.get(`${API_BASE}/api/reports/waiting-time`, { params, headers })
    if (res.data?.data) {
      summary.value = res.data.data.summary || summary.value
      pagination.value = res.data.data.pagination || pagination.value
      rows.value = res.data.data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch waiting time report', err)
  } finally {
    loading.value = false
  }
}

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  pagination.value.page = newPage
  fetchData()
}

const openDetailModal = (item: any) => {
  selectedItem.value = item
}

// Formatters
const formatMinutes = (m: number | null | undefined) => {
  if (m === null || m === undefined) return '-'
  if (m < 60) return `${m} Menit`
  const hours = Math.floor(m / 60)
  const remainingMins = m % 60
  return remainingMins > 0 ? `${hours} Jam ${remainingMins}m` : `${hours} Jam`
}

const formatTime = (isoString?: string | null) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (isoString?: string | null) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const formatFullDateTime = (isoString?: string | null) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
}

// Export CSV
const exportCsv = () => {
  if (rows.value.length === 0) return

  const headers = [
    'No. RM',
    'Nama Pasien',
    'No. Registrasi',
    'No. Aksesi',
    'Modalitas',
    'Pemeriksaan',
    'Prioritas',
    'Tgl & Jam Order',
    'Jam Mulai Periksa',
    'Jam Selesai Periksa',
    'Jam Selesai Ekspertise',
    'Dokter Radiologi',
    'Waktu Antre Masuk (Menit)',
    'Durasi Tindakan (Menit)',
    'Waktu Tunggu Baca (Menit)',
    'Total TAT (Menit)',
    'Status Kepatuhan SPM'
  ]

  const csvRows = rows.value.map(r => [
    `"${r.patientMrn || ''}"`,
    `"${r.patientName || ''}"`,
    `"${r.noReg || ''}"`,
    `"${r.accessionNumber || ''}"`,
    `"${r.modalityTypeCode || ''}"`,
    `"${r.bodyPart || ''}"`,
    `"${r.priority || ''}"`,
    `"${formatFullDateTime(r.orderDate)}"`,
    `"${formatFullDateTime(r.examStartedAt)}"`,
    `"${formatFullDateTime(r.examFinishedAt)}"`,
    `"${formatFullDateTime(r.expertiseCreatedAt)}"`,
    `"${r.radiologistName || ''}"`,
    r.waitTimeExamMinutes ?? '',
    r.examDurationMinutes ?? '',
    r.waitTimeExpertiseMinutes ?? '',
    r.totalTatMinutes ?? '',
    `"${r.complianceStatus === 'compliant' ? 'Tepat Waktu' : r.complianceStatus === 'overtime' ? 'Overtime' : 'Dalam Proses'}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Laporan_Waktu_Tunggu_Pasien_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Print Report
const printReport = () => {
  window.print()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
@media print {
  body {
    background: white !important;
    color: black !important;
  }
  .btn-secondary, button, select, input {
    display: none !important;
  }
}
</style>
