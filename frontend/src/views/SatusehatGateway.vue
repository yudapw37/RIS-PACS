<template>
  <div class="page-enter space-y-8">
    
    <!-- ── HEADER SECTION ── -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              SATUSEHAT DICOM Gateway & Hub
              <span v-if="stats.connection?.simulationMode" class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Mode Simulasi (Mock Sandbox)
              </span>
              <span v-else class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Live {{ stats.connection?.satusehatEnvironment?.toUpperCase() }}
              </span>
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Monitoring interoperabilitas radiologi Kemenkes RI (FHIR R4 ImagingStudy & DiagnosticReport)
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <router-link 
          to="/admin/api-docs" 
          class="btn-secondary flex items-center gap-2 text-sm shadow-sm text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Panduan API SIMRS
        </router-link>

        <button 
          @click="testConnection" 
          :disabled="isTestingAuth"
          class="btn-secondary flex items-center gap-2 text-sm shadow-sm"
        >
          <svg v-if="isTestingAuth" class="animate-spin w-4 h-4 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          {{ isTestingAuth ? 'Menguji Auth...' : 'Uji Koneksi Token' }}
        </button>

        <button 
          @click="refreshAll" 
          class="btn-primary flex items-center gap-2 text-sm shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh Data
        </button>
      </div>
    </div>

    <!-- ── STATS CARDS ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Card 1: Total Transaksi -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Transaksi</p>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-black text-slate-800 dark:text-slate-100">{{ stats.summary?.totalTransactions || 0 }}</span>
            <span class="text-xs text-slate-500">outbox logs</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Berhasil -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Berhasil (201 Created)</p>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ stats.summary?.successTransactions || 0 }}</span>
            <span class="text-xs text-emerald-600/70 font-medium">tersinkron</span>
          </div>
        </div>
      </div>

      <!-- Card 3: Gagal / Error -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Gagal / Ditolak</p>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-black text-rose-600 dark:text-rose-400">{{ stats.summary?.failedTransactions || 0 }}</span>
            <span class="text-xs text-rose-600/70 font-medium">butuh retry</span>
          </div>
        </div>
      </div>

      <!-- Card 4: Order Terhubung -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Order Radiologi</p>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-black text-indigo-600 dark:text-indigo-400">{{ stats.summary?.ordersSynced || 0 }}</span>
            <span class="text-xs text-slate-400">dari {{ (stats.summary?.ordersSynced || 0) + (stats.summary?.ordersUnmapped || 0) }} total</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ── TAB NAVIGATION BAR ── -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 gap-8">
      <button 
        @click="activeTab = 'logs'" 
        :class="[
          'pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all',
          activeTab === 'logs' 
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        Log Transaksi & Outbox
      </button>

      <button 
        @click="activeTab = 'orders'" 
        :class="[
          'pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all',
          activeTab === 'orders' 
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        Manajemen Order & Sinkronisasi
      </button>

      <button 
        @click="activeTab = 'settings'" 
        :class="[
          'pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all',
          activeTab === 'settings' 
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Konfigurasi & Kredensial
      </button>
    </div>

    <!-- ── TAB 1: LOG TRANSAKSI & OUTBOX ── -->
    <div v-if="activeTab === 'logs'" class="space-y-4">
      
      <!-- Toolbar Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search Input -->
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              v-model="filters.search" 
              @input="debounceFetchLogs"
              type="text" 
              placeholder="Cari Acc No, MRN, Pasien..." 
              class="pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 w-64 transition-all"
            />
          </div>

          <!-- Status Filter -->
          <select 
            v-model="filters.status" 
            @change="fetchLogs"
            class="text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="success">Berhasil (Success)</option>
            <option value="failed">Gagal (Failed)</option>
            <option value="pending">Menunggu (Pending)</option>
          </select>

          <!-- Resource Type Filter -->
          <select 
            v-model="filters.resourceType" 
            @change="fetchLogs"
            class="text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Semua Resource</option>
            <option value="ServiceRequest">ServiceRequest (Order)</option>
            <option value="ImagingStudy">ImagingStudy (DICOM)</option>
            <option value="DiagnosticReport">DiagnosticReport (Ekspertise)</option>
            <option value="Patient">Patient (IHS)</option>
            <option value="Practitioner">Practitioner (Dokter)</option>
            <option value="Auth">Auth OAuth 2.0</option>
          </select>
        </div>

        <div class="text-xs text-slate-400 font-medium">
          Menampilkan {{ logs.length }} transaksi terbaru
        </div>
      </div>

      <!-- Logs Table Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div v-if="loadingLogs" class="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <svg class="animate-spin w-6 h-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span class="text-sm font-medium">Memuat data log SATUSEHAT...</span>
        </div>

        <div v-else-if="logs.length === 0" class="py-20 text-center text-slate-400 space-y-2">
          <p class="font-bold text-slate-600 dark:text-slate-300">Belum ada transaksi log SATUSEHAT</p>
          <p class="text-xs">Kirim order pemeriksaan radiologi atau uji koneksi untuk mulai mencatat transaksi.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th class="px-6 py-4 text-left">Waktu</th>
                <th class="px-6 py-4 text-left">Resource FHIR</th>
                <th class="px-6 py-4 text-left">Pasien / Order</th>
                <th class="px-6 py-4 text-left">Aksi / Endpoint</th>
                <th class="px-6 py-4 text-center">HTTP</th>
                <th class="px-6 py-4 text-center">Status</th>
                <th class="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                
                <!-- Waktu -->
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  <div class="font-bold text-slate-700 dark:text-slate-200">{{ formatTime(log.createdAt) }}</div>
                  <div>{{ formatDate(log.createdAt) }}</div>
                </td>

                <!-- Resource FHIR Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2.5 py-1 rounded-lg text-xs font-black tracking-wide border',
                      getResourceBadgeClass(log.resourceType)
                    ]"
                  >
                    {{ log.resourceType }}
                  </span>
                  <div v-if="log.satusehatId" class="text-[11px] font-mono text-slate-400 mt-1 truncate max-w-[140px]" :title="log.satusehatId">
                    ID: {{ log.satusehatId }}
                  </div>
                </td>

                <!-- Pasien & Order -->
                <td class="px-6 py-4">
                  <div v-if="log.patient">
                    <p class="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{{ log.patient.fullName }}</p>
                    <div class="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                      <span>MRN: {{ log.patient.mrn }}</span>
                      <span v-if="log.order" class="text-cyan-600 dark:text-cyan-400 font-bold">ACC: {{ log.order.accessionNumber }}</span>
                    </div>
                  </div>
                  <div v-else-if="log.order">
                    <span class="font-mono font-bold text-cyan-600 text-xs">ACC: {{ log.order.accessionNumber }}</span>
                  </div>
                  <div v-else class="text-xs text-slate-400 italic">
                    Sistem Internal
                  </div>
                </td>

                <!-- Aksi -->
                <td class="px-6 py-4">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {{ log.action }}
                  </span>
                  <p v-if="log.errorMessage" class="text-xs text-rose-500 line-clamp-1 mt-0.5" :title="log.errorMessage">
                    {{ log.errorMessage }}
                  </p>
                </td>

                <!-- HTTP Code -->
                <td class="px-6 py-4 text-center">
                  <span 
                    v-if="log.httpStatus"
                    :class="[
                      'font-mono text-xs px-2 py-0.5 rounded font-bold',
                      log.httpStatus >= 200 && log.httpStatus < 300 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' 
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                    ]"
                  >
                    {{ log.httpStatus }}
                  </span>
                  <span v-else class="text-xs text-slate-400">-</span>
                </td>

                <!-- Status Badge -->
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2.5 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5',
                      log.status === 'success' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                        : log.status === 'failed' 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' 
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    ]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="log.status === 'success' ? 'bg-emerald-500' : log.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'"></span>
                    {{ log.status === 'success' ? 'Sukses' : log.status === 'failed' ? 'Gagal' : 'Pending' }}
                  </span>
                </td>

                <!-- Aksi Detail & Retry -->
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-2">
                    
                    <!-- Detail Payload JSON -->
                    <button 
                      @click="viewLogDetail(log.id)" 
                      class="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg transition-colors"
                      title="Lihat Detail JSON Payload"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>

                    <!-- Retry Button (jika gagal) -->
                    <button 
                      v-if="log.status === 'failed'"
                      @click="retryLog(log.id)"
                      :disabled="retryingId === log.id"
                      class="px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                      title="Kirim Ulang Transaksi"
                    >
                      <svg v-if="retryingId === log.id" class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                      Retry
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── TAB 2: MANAJEMEN ORDER & SINKRONISASI ── -->
    <div v-if="activeTab === 'orders'" class="space-y-4">
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-extrabold text-base text-slate-800 dark:text-slate-100">Daftar Order Radiologi</h3>
            <p class="text-xs text-slate-400 mt-0.5">Kelola dan kirim metadata DICOM + hasil ekspertise ke SATUSEHAT</p>
          </div>
          <button @click="fetchOrders" class="btn-secondary text-xs flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Muat Ulang Order
          </button>
        </div>

        <div v-if="loadingOrders" class="py-16 flex justify-center items-center text-slate-400">
          <svg class="animate-spin w-6 h-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th class="px-5 py-3 text-left">Accession No</th>
                <th class="px-5 py-3 text-left">Pasien (NIK & IHS)</th>
                <th class="px-5 py-3 text-left">Pemeriksaan</th>
                <th class="px-5 py-3 text-left">ServiceRequest (ID SR)</th>
                <th class="px-5 py-3 text-left">Status RIS</th>
                <th class="px-5 py-3 text-center">Status SATUSEHAT</th>
                <th class="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr v-for="order in ordersList" :key="order.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <span class="font-mono text-xs font-black bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded border border-cyan-100 dark:border-cyan-800/50">
                    {{ order.accessionNumber }}
                  </span>
                </td>

                <td class="px-5 py-3.5">
                  <p class="font-bold text-slate-800 dark:text-slate-100">{{ order.patient?.fullName }}</p>
                  <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>MRN: {{ order.patient?.mrn }}</span>
                    <span v-if="order.patient?.nik" class="text-slate-500">NIK: {{ order.patient.nik }}</span>
                    <span v-else class="text-rose-500 font-semibold">[Belum ada NIK]</span>
                  </div>
                  <div v-if="order.patient?.ihsNumber" class="text-[11px] text-emerald-600 font-mono mt-0.5">
                    IHS: {{ order.patient.ihsNumber }}
                  </div>
                </td>

                <td class="px-5 py-3.5">
                  <span class="font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {{ order.modalityTypeCode }}
                  </span>
                  <span class="text-xs text-slate-600 dark:text-slate-400 ml-2 font-medium">
                    {{ order.bodyPart || 'Radiografi' }}
                  </span>
                </td>

                <!-- Kolom ServiceRequest (ID SR) -->
                <td class="px-5 py-3.5">
                  <!-- Mode Edit / Input Manual SR -->
                  <div v-if="editingSrOrderId === order.id" class="flex items-center gap-1.5">
                    <input 
                      v-model="srInputValues[order.id]" 
                      type="text" 
                      class="text-xs font-mono px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 w-32 focus:outline-none focus:border-cyan-500"
                      placeholder="cth: sr-12345"
                      @keyup.enter="saveManualSrId(order.id)"
                    />
                    <button 
                      @click="saveManualSrId(order.id)" 
                      class="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition" 
                      title="Simpan ID SR"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button 
                      @click="editingSrOrderId = null" 
                      class="p-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300"
                      title="Batal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>

                  <!-- Mode Normal: ID SR Sudah Ada -->
                  <div v-else-if="order.satusehatServiceRequestId" class="flex items-center gap-1.5">
                    <span class="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50 truncate max-w-[130px]" :title="order.satusehatServiceRequestId">
                      {{ order.satusehatServiceRequestId }}
                    </span>
                    <button 
                      @click="startEditSr(order)" 
                      class="p-1 text-slate-400 hover:text-slate-600 rounded transition" 
                      title="Ubah ID SR Manual"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                  </div>

                  <!-- Mode Normal: ID SR Belum Ada (Tersedia Tombol Kirim SR / Input Manual) -->
                  <div v-else class="flex items-center gap-1.5">
                    <button 
                      @click="pushServiceRequest(order.id)" 
                      :disabled="pushingSrId === order.id"
                      class="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg hover:bg-indigo-100 flex items-center gap-1 transition"
                      title="Kirim ServiceRequest mandiri ke SATUSEHAT"
                    >
                      <svg v-if="pushingSrId === order.id" class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Kirim SR
                    </button>
                    <button 
                      @click="startEditSr(order)" 
                      class="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline"
                      title="Isi manual jika sudah ada dari SIMRS"
                    >
                      Isi Manual
                    </button>
                  </div>
                </td>

                <td class="px-5 py-3.5">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="getOrderStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>

                <!-- Status SATUSEHAT -->
                <td class="px-5 py-3.5 text-center">
                  <span 
                    :class="[
                      'text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5',
                      order.satusehatStatus === 'synced' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : order.satusehatStatus === 'failed'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        : order.satusehatStatus === 'pending'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    ]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="order.satusehatStatus === 'synced' ? 'bg-emerald-500' : order.satusehatStatus === 'failed' ? 'bg-rose-500' : 'bg-slate-400'"></span>
                    {{ order.satusehatStatus === 'synced' ? 'Tersinkron' : order.satusehatStatus === 'failed' ? 'Gagal' : order.satusehatStatus === 'pending' ? 'Diproses' : 'Belum Dikirim' }}
                  </span>
                </td>

                <!-- Push Button -->
                <td class="px-5 py-3.5 text-right whitespace-nowrap">
                  <button 
                    @click="pushOrder(order.id)"
                    :disabled="pushingOrderId === order.id"
                    class="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
                  >
                    <svg v-if="pushingOrderId === order.id" class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    {{ order.satusehatStatus === 'synced' ? 'Kirim Ulang' : 'Kirim ke SATUSEHAT' }}
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── TAB 3: KONFIGURASI & KREDENSIAL ── -->
    <div v-if="activeTab === 'settings'" class="space-y-6">
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 max-w-4xl">
        <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-1">Pengaturan Integrasi Kemenkes SATUSEHAT</h3>
        <p class="text-sm text-slate-400 mb-6">Konfigurasi kredensial OAuth2 DTO Kemenkes RI dan webhook DICOM router</p>

        <form @submit.prevent="saveSettings" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Mode Simulasi Toggle -->
            <div class="col-span-1 md:col-span-2 p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-800/40 flex items-center justify-between">
              <div>
                <p class="font-extrabold text-sm text-cyan-900 dark:text-cyan-200">Mode Simulasi (Mock Sandbox)</p>
                <p class="text-xs text-cyan-700/80 dark:text-cyan-400 mt-0.5">
                  Aktifkan mode simulasi untuk demonstrasi dan uji coba flow pengiriman tanpa membutuhkan koneksi/kredensial live Kemenkes.
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settingsForm.simulationMode" true-value="yes" false-value="no" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <!-- Auto-Sync on Expertise Toggle -->
            <div class="col-span-1 md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <p class="font-extrabold text-sm text-slate-800 dark:text-slate-200">Auto-Sync Saat Ekspertise Selesai</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Otomatis kirim ImagingStudy & DiagnosticReport ke SATUSEHAT sesaat setelah dokter radiologi menyimpan ekspertise.
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settingsForm.autoSyncOnExpertise" true-value="yes" false-value="no" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <!-- Organization ID -->
            <div>
              <label class="form-label">Organization ID (ID Faskes) <span class="text-red-500">*</span></label>
              <input 
                v-model="settingsForm.organizationId" 
                type="text" 
                class="form-input font-mono" 
                placeholder="cth: 10000004" 
                required 
              />
              <p class="text-[11px] text-slate-400 mt-1">ID Organisasi / Rumah Sakit yang terdaftar di Kemenkes DTO</p>
            </div>

            <!-- Environment Selection -->
            <div>
              <label class="form-label">Environment</label>
              <select v-model="settingsForm.environment" class="form-input">
                <option value="sandbox">Sandbox</option>
                <option value="staging">Staging (Development)</option>
                <option value="production">Production</option>
              </select>
            </div>

            <!-- Client ID -->
            <div>
              <label class="form-label">Client ID</label>
              <input 
                v-model="settingsForm.clientId" 
                type="text" 
                class="form-input font-mono" 
                placeholder="Kredensial Client ID dari DTO" 
              />
            </div>

            <!-- Client Secret -->
            <div>
              <label class="form-label">Client Secret</label>
              <input 
                v-model="settingsForm.clientSecret" 
                type="password" 
                class="form-input font-mono" 
                placeholder="••••••••••••••••" 
              />
            </div>

            <!-- Auth URL -->
            <div>
              <label class="form-label">Auth OAuth2 URL</label>
              <input 
                v-model="settingsForm.authUrl" 
                type="text" 
                class="form-input text-xs font-mono" 
                placeholder="https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1" 
              />
            </div>

            <!-- Base FHIR URL -->
            <div>
              <label class="form-label">Base FHIR R4 API URL</label>
              <input 
                v-model="settingsForm.baseUrl" 
                type="text" 
                class="form-input text-xs font-mono" 
                placeholder="https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1" 
              />
            </div>

          </div>

          <!-- Webhook DICOM Router Info Card -->
          <div class="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40">
            <div class="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200">Endpoint Webhook DCM4CHEE DICOM Router</span>
            </div>
            <code class="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg block border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 select-all">
              POST http://&lt;IP_BACKEND&gt;:3000/api/webhooks/dcm4chee/study-received
            </code>
            <p class="text-[11px] text-indigo-600/80 dark:text-indigo-400 mt-1">
              DCM4CHEE export rule dapat memanggil webhook di atas saat instance foto baru berhasil di-store.
            </p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              @click="testConnection"
              :disabled="isTestingAuth" 
              class="btn-secondary flex items-center gap-2 text-xs py-2 px-4 font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
            >
              <svg v-if="isTestingAuth" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              {{ isTestingAuth ? 'Menguji Koneksi...' : 'Uji Koneksi SATUSEHAT' }}
            </button>

            <button 
              type="submit" 
              :disabled="isSavingSettings" 
              class="btn-primary flex items-center gap-2 px-6"
            >
              <svg v-if="isSavingSettings" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- ── MODAL JSON PAYLOAD INSPECTOR ── -->
    <Transition name="modal">
      <div v-if="selectedLog" class="modal-backdrop !p-2 sm:!p-4" @click.self="selectedLog = null">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-[96vw] max-w-[1600px] h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
          
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Inspector Payload SATUSEHAT</span>
                <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  #{{ selectedLog.id }}
                </span>
                <span 
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-bold',
                    selectedLog.status === 'success' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                  ]"
                >
                  {{ selectedLog.status === 'success' ? 'Sukses' : 'Gagal' }}
                </span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ selectedLog.action }} • {{ selectedLog.resourceType }} • HTTP {{ selectedLog.httpStatus || '-' }}
              </p>
            </div>
            <button @click="selectedLog = null" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Error Alert if exists -->
          <div v-if="selectedLog.errorMessage" class="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs shrink-0">
            <span class="font-bold">Error Detail:</span> <span class="font-mono ml-1">{{ selectedLog.errorMessage }}</span>
          </div>

          <!-- Kiri & Kanan Container (Side-by-Side 2 Columns) -->
          <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            
            <!-- Kolom Kiri: Request Payload -->
            <div class="flex flex-col h-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-900">
              <div class="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 shrink-0">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Request JSON (Dikirim)
                </span>
                <button @click="copyText(JSON.stringify(selectedLog.requestPayload, null, 2))" class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Salin JSON
                </button>
              </div>
              <pre class="flex-1 p-4 text-slate-100 text-xs font-mono overflow-y-auto leading-relaxed select-all">{{ JSON.stringify(selectedLog.requestPayload, null, 2) || '// Tidak ada request payload' }}</pre>
            </div>

            <!-- Kolom Kanan: Response Payload -->
            <div class="flex flex-col h-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-900">
              <div class="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 shrink-0">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Response JSON (Dari SATUSEHAT)
                </span>
                <button @click="copyText(JSON.stringify(selectedLog.responsePayload, null, 2))" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Salin JSON
                </button>
              </div>
              <pre class="flex-1 p-4 text-emerald-300 text-xs font-mono overflow-y-auto leading-relaxed select-all">{{ JSON.stringify(selectedLog.responsePayload, null, 2) || '// Tidak ada response payload' }}</pre>
            </div>

          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 mt-3">
            <button @click="selectedLog = null" class="btn-cancel text-xs px-5">Tutup</button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ── TOAST NOTIFICATION ── -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type === 'success' ? 'toast-success' : 'toast-error']">
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import API_BASE from '../config/api'

const activeTab = ref<'logs' | 'orders' | 'settings'>('logs')

// Stats & Connection
const stats = reactive<{
  summary?: any;
  connection?: any;
}>({})

// Logs State
const logs = ref<any[]>([])
const loadingLogs = ref(false)
const filters = reactive({
  search: '',
  status: 'all',
  resourceType: 'all',
})

// Orders State
const ordersList = ref<any[]>([])
const loadingOrders = ref(false)
const pushingOrderId = ref<number | null>(null)
const pushingSrId = ref<number | null>(null)
const editingSrOrderId = ref<number | null>(null)
const srInputValues = reactive<Record<number, string>>({})

const startEditSr = (order: any) => {
  editingSrOrderId.value = order.id
  srInputValues[order.id] = order.satusehatServiceRequestId || ''
}

const saveManualSrId = async (orderId: number) => {
  const val = srInputValues[orderId] || ''
  try {
    const res = await axios.put(`${API_BASE}/api/satusehat/orders/${orderId}/service-request-id`, {
      serviceRequestId: val
    })
    if (res.data.success) {
      showToast('ID ServiceRequest berhasil disimpan')
      editingSrOrderId.value = null
      fetchOrders()
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Gagal menyimpan ID SR', 'error')
  }
}

const pushServiceRequest = async (orderId: number) => {
  if (!orderId || isNaN(orderId)) {
    showToast('ID Order tidak valid', 'error')
    return
  }
  pushingSrId.value = orderId
  try {
    const res = await axios.post(`${API_BASE}/api/satusehat/push-service-request/${orderId}`)
    if (res.data.success) {
      showToast(res.data.message || 'ServiceRequest berhasil dibuat & dikirim ke SATUSEHAT')
      fetchOrders()
      fetchStats()
      if (activeTab.value === 'logs') fetchLogs()
    } else {
      showToast(res.data.message || 'Gagal mengirim ServiceRequest', 'error')
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Gagal kirim ServiceRequest', 'error')
  } finally {
    pushingSrId.value = null
  }
}

// Settings Form
const settingsForm = reactive({
  organizationId: '10000004',
  clientId: '',
  clientSecret: '',
  environment: 'staging',
  authUrl: 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1',
  baseUrl: 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1',
  autoSyncOnExpertise: 'yes',
  simulationMode: 'yes',
})
const isSavingSettings = ref(false)
const isTestingAuth = ref(false)
const retryingId = ref<number | null>(null)

// Detail modal
const selectedLog = ref<any | null>(null)

// Toast
const toast = reactive({
  show: false,
  message: '',
  type: 'success',
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

// ── API FETCHERS ──
const fetchStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/satusehat/stats`)
    if (res.data.success) {
      Object.assign(stats, res.data.data)
    }
  } catch (err: any) {
    console.error('Gagal mengambil statistik SATUSEHAT:', err)
  }
}

const fetchLogs = async () => {
  loadingLogs.value = true
  try {
    const params = new URLSearchParams()
    if (filters.status !== 'all') params.append('status', filters.status)
    if (filters.resourceType !== 'all') params.append('resourceType', filters.resourceType)
    if (filters.search) params.append('search', filters.search)
    params.append('limit', '50')

    const res = await axios.get(`${API_BASE}/api/satusehat/logs?${params.toString()}`)
    if (res.data.success) {
      logs.value = res.data.data
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Gagal memuat log SATUSEHAT', 'error')
  } finally {
    loadingLogs.value = false
  }
}

let searchTimer: any = null
const debounceFetchLogs = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchLogs, 400)
}

const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const res = await axios.get(`${API_BASE}/api/orders/all`)
    ordersList.value = Array.isArray(res.data?.data) 
      ? res.data.data 
      : Array.isArray(res.data) 
      ? res.data 
      : []
  } catch (err: any) {
    showToast('Gagal memuat antrean order', 'error')
  } finally {
    loadingOrders.value = false
  }
}

const fetchSettings = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/satusehat/settings`)
    if (res.data.success && res.data.data) {
      Object.assign(settingsForm, res.data.data)
    }
  } catch (err: any) {
    console.error('Gagal mengambil setting SATUSEHAT:', err)
  }
}

const refreshAll = () => {
  fetchStats()
  if (activeTab.value === 'logs') fetchLogs()
  if (activeTab.value === 'orders') fetchOrders()
  if (activeTab.value === 'settings') fetchSettings()
  showToast('Data berhasil dimuat ulang')
}

// ── ACTIONS ──
const pushOrder = async (orderId: number) => {
  if (!orderId || isNaN(orderId)) {
    showToast('ID Order tidak valid', 'error')
    return
  }
  pushingOrderId.value = orderId
  try {
    const res = await axios.post(`${API_BASE}/api/satusehat/push-order/${orderId}`)
    if (res.data.success) {
      showToast(res.data.message)
      fetchStats()
      fetchOrders()
      if (activeTab.value === 'logs') fetchLogs()
    } else {
      showToast(res.data.message || 'Gagal sinkronisasi ke SATUSEHAT', 'error')
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Gagal push order ke SATUSEHAT', 'error')
  } finally {
    pushingOrderId.value = null
  }
}

const retryLog = async (logId: number) => {
  retryingId.value = logId
  try {
    const res = await axios.post(`${API_BASE}/api/satusehat/retry-log/${logId}`)
    if (res.data.success) {
      showToast('Kirim ulang berhasil!')
      fetchStats()
      fetchLogs()
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Retry gagal', 'error')
  } finally {
    retryingId.value = null
  }
}

const testConnection = async () => {
  isTestingAuth.value = true
  try {
    const res = await axios.post(`${API_BASE}/api/satusehat/test-connection`)
    if (res.data.success) {
      showToast(res.data.message)
      fetchStats()
    } else {
      showToast(res.data.message, 'error')
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Uji coba koneksi gagal', 'error')
  } finally {
    isTestingAuth.value = false
  }
}

const saveSettings = async () => {
  isSavingSettings.value = true
  try {
    const res = await axios.post(`${API_BASE}/api/satusehat/settings`, settingsForm)
    if (res.data.success) {
      showToast('Pengaturan SATUSEHAT berhasil disimpan')
      fetchStats()
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Gagal menyimpan pengaturan', 'error')
  } finally {
    isSavingSettings.value = false
  }
}

const viewLogDetail = async (logId: number) => {
  try {
    const res = await axios.get(`${API_BASE}/api/satusehat/logs/${logId}`)
    if (res.data.success) {
      selectedLog.value = res.data.data
    }
  } catch {
    showToast('Gagal memuat detail log', 'error')
  }
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  showToast('JSON disalin ke clipboard')
}

// ── FORMATTERS & HELPERS ──
const formatDate = (dateVal: string | null) => {
  if (!dateVal) return '-'
  return new Date(dateVal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateVal: string | null) => {
  if (!dateVal) return '-'
  return new Date(dateVal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const getResourceBadgeClass = (resType: string) => {
  switch (resType) {
    case 'ServiceRequest':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'ImagingStudy':
      return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
    case 'DiagnosticReport':
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    case 'Patient':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    case 'Practitioner':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    case 'Auth':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
  }
}

const getOrderStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed': return 'badge-emerald'
    case 'in_progress': return 'badge-blue'
    case 'scheduled': return 'badge-amber'
    case 'canceled': return 'badge-red'
    default: return 'badge-blue'
  }
}

onMounted(() => {
  fetchStats()
  fetchLogs()
  fetchOrders()
  fetchSettings()
})
</script>
