<template>
  <div class="page-enter">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">History Order</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Riwayat pemeriksaan radiologi yang sudah selesai atau dibatalkan</p>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="text" placeholder="Cari MRN / Nama Pasien..." class="pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-64 transition-all" />
        </div>
        <button @click="fetchHistory" class="btn-secondary flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat history...</span>
      </div>

      <!-- Table Content -->
      <div v-else-if="filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">MRN & Pasien</th>
              <th class="px-6 py-3.5 text-left">Tgl. Order</th>
              <th class="px-6 py-3.5 text-left">Pemeriksaan</th>
              <th class="px-6 py-3.5 text-left">Status</th>
              <th class="px-6 py-3.5 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
            <tr v-for="h in paginated" :key="h.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800 dark:text-slate-100">{{ h.patient?.fullName }}</div>
                <div class="text-xs text-slate-500 mt-0.5">
                  <span class="font-mono bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 px-1.5 rounded">{{ h.patient?.mrn }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">
                {{ new Date(h.orderDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  <span class="badge-type mr-1">{{ h.modalityTypeCode }}</span> {{ h.bodyPart || 'Tanpa Keterangan' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="h.status === 'completed'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Selesai
                </span>
                <span v-else-if="h.status === 'canceled'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Batal
                </span>
                <span v-else-if="h.status === 'failed'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-200 dark:border-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Gagal
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <router-link :to="`/admin/orders/${h.id}?from=history`" class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-100 hover:bg-cyan-100 dark:hover:bg-cyan-800 transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    Lihat Detail
                  </router-link>

                  <button v-if="h.status === 'completed'" @click="updateStatus(h.id, 'scheduled')" class="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-all flex items-center gap-1" title="Kembalikan ke Antrian">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                  </button>
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

      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300">History Kosong</p>
      </div>
    </div>

    <!-- Toasts -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast" :class="toastType === 'success' ? 'toast-success' : 'toast-error'">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import API_BASE from '../config/api'
import Pagination from '../components/Pagination.vue'

const API_HISTORY = `${API_BASE}/api/orders/history`
const API_ORDERS = `${API_BASE}/api/orders`

const history = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg; toastType.value = type
  setTimeout(() => toastMessage.value = '', 3000)
}

const filtered = computed(() => {
  if (!search.value) return history.value
  const q = search.value.toLowerCase()
  return history.value.filter(h => 
    h.patient?.fullName.toLowerCase().includes(q) || 
    h.patient?.mrn.toLowerCase().includes(q)
  )
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

const fetchHistory = async () => {
  loading.value = true
  try {
    const res = await axios.get(API_HISTORY)
    history.value = res.data.data
  } catch (err) {
    console.error('Failed to load history', err)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id: number, status: string) => {
  try {
    await axios.patch(`${API_ORDERS}/${id}/status`, { status })
    showToast(`Order dikembalikan sebagai: ${status.toUpperCase()}`)
    fetchHistory()
  } catch {
    showToast('Gagal update status', 'error')
  }
}

onMounted(fetchHistory)
</script>
