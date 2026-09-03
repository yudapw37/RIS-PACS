<template>
  <div class="page-enter">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Log Modality</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">Sistem pencatatan real-time koneksi DICOM Echo dari modality</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="fetchLogs" class="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh Data
        </button>
      </div>
    </div>

    <!-- Overview Status -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <div class="glass border border-emerald-100 dark:border-emerald-800/50 rounded-3xl p-6 relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <p class="text-sm font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-1">Total Sukses Uji Koneksi</p>
        <h3 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{{ logs.filter(l => l.status === 'success').length }}</h3>
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl"></div>
      </div>
      
      <div class="glass border border-red-100 dark:border-red-800/50 rounded-3xl p-6 relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/40 flex items-center justify-center text-red-500 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>
        <p class="text-sm font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-1">Gagal Terhubung (Timeout)</p>
        <h3 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{{ logs.filter(l => l.status === 'failed').length }}</h3>
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-red-50/50 rounded-full blur-2xl"></div>
      </div>

      <div class="bg-indigo-900 rounded-3xl p-7 relative overflow-hidden text-white flex flex-col justify-center shadow-lg">
        <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-4">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-50 dark:bg-cyan-900/400"></span>
            </span>
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-200">Live Monitor</span>
          </div>
          <p class="text-indigo-100 font-medium text-sm leading-relaxed">Sistem logging mencatat setiap respons DICOM Echo dari alat diagnostik (Modality) secara real-time via Orthanc.</p>
        </div>
        <svg class="absolute right-0 bottom-0 text-white/5 w-40 h-40 transform translate-x-8 translate-y-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="text" placeholder="Cari log atau alat..." class="pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-72 transition-all font-medium text-slate-700 dark:text-slate-200" />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500 dark:text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat log DICOM Echo...</span>
      </div>

      <div v-else-if="filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-4 text-left">Waktu Log</th>
              <th class="px-6 py-4 text-left">Alat Target (Modality)</th>
              <th class="px-6 py-4 text-left">Status</th>
              <th class="px-6 py-4 text-left">Pesan Sistem / Error</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
            <tr v-for="(log, i) in paginated" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="font-bold text-slate-700 dark:text-slate-200">{{ formatDate(log.createdAt) }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-0.5">{{ formatTime(log.createdAt) }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ log.modalityName || 'Modality Dihapus' }}</p>
                    <p class="font-mono text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold tracking-tight">AET: {{ log.modalityAet || '?' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="log.status === 'success'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  CONNECTED
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold text-xs border border-red-200 dark:border-red-800/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  FAILED / TIMEOUT
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="font-mono text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg break-words leading-relaxed shadow-inner">
                  {{ log.message }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <Pagination 
          v-model:itemsPerPage="itemsPerPage" 
          v-model:currentPage="currentPage" 
          :totalItems="filtered.length" 
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300 text-lg">Belum ada riwayat uji koneksi</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1 max-w-md">Lakukan test koneksi DICOM Echo dari halaman daftar Modality untuk melihat log real-time di sini.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import API_BASE from '../config/api'
import Pagination from '../components/Pagination.vue'

const API = `${API_BASE}/api/modalities/logs`

interface LogEntry {
  id: number;
  modalityId: number;
  status: 'success' | 'failed';
  message: string;
  createdAt: string;
  modalityName: string | null;
  modalityAet: string | null;
}

const logs = ref<LogEntry[]>([])
const loading = ref(true)
const search = ref('')

// Pagination states
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filtered = computed(() => {
  let sorted = [...logs.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (!search.value) return sorted
  
  const q = search.value.toLowerCase()
  return sorted.filter(l => 
    (l.modalityName && l.modalityName.toLowerCase().includes(q)) || 
    (l.modalityAet && l.modalityAet.toLowerCase().includes(q)) ||
    l.message.toLowerCase().includes(q)
  )
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.value.slice(start, end)
})

watch(search, () => { currentPage.value = 1 })

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await axios.get(API)
    logs.value = res.data.data || res.data
  } catch (err) {
    console.error('Failed to fetch logs:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) + ' WIB'
}

onMounted(() => {
  fetchLogs()
})
</script>\n