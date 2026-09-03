<template>
  <div class="page-enter">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Antrean Pemeriksaan</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar pasien menunggu tindakan radiologi di Ruang Pemeriksaan.</p>
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
        <button @click="fetchWorklist" class="btn-secondary flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat antrean...</span>
      </div>

      <!-- Table Content -->
      <div v-else-if="filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">Pasien</th>
              <th class="px-6 py-3.5 text-left">Pemeriksaan</th>
              <th class="px-6 py-3.5 text-left text-center">Status</th>
              <th class="px-6 py-3.5 text-left">Waktu Daftar</th>
              <th class="px-6 py-3.5 text-center">Aksi Pemeriksaan</th>
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
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  <span class="badge-type mr-1">{{ h.modalityTypeCode }}</span> {{ h.bodyPart || 'Umum' }}
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5 font-mono">{{ h.accessionNumber }}</div>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="h.status === 'scheduled'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Menunggu
                </span>
                <span v-else-if="h.status === 'in_progress'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800 animate-pulse">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Diperiksa
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">
                {{ h.orderDate ? new Date(h.orderDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <!-- Start Exam Button -->
                  <button 
                    v-if="h.status === 'scheduled'" 
                    @click="startExam(h.id)" 
                    class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
                    Mulai Periksa
                  </button>

                  <!-- Finish Exam Button -->
                  <button 
                    v-if="h.status === 'in_progress'" 
                    @click="finishExam(h.id)" 
                    class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm shadow-emerald-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Selesai Periksa
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

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300">Antrean Kosong</p>
        <p class="text-slate-400 text-sm mt-1">Tidak ada pasien yang menunggu pemeriksaan saat ini.</p>
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

const API_WORKLIST = `${API_BASE}/api/orders/examination-worklist`
const API_ORDERS = `${API_BASE}/api/orders`

const worklist = ref<any[]>([])
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
  if (!search.value) return worklist.value
  const q = search.value.toLowerCase()
  return worklist.value.filter(h => 
    h.patient?.fullName.toLowerCase().includes(q) || 
    h.patient?.mrn.toLowerCase().includes(q)
  )
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

const fetchWorklist = async () => {
  loading.value = true
  try {
    const res = await axios.get(API_WORKLIST)
    worklist.value = res.data.data
  } catch (err) {
    console.error('Failed to load worklist', err)
    showToast('Gagal memuat antrean', 'error')
  } finally {
    loading.value = false
  }
}

const startExam = async (id: number) => {
  try {
    await axios.patch(`${API_ORDERS}/${id}/start`)
    showToast('Pemeriksaan dimulai!')
    fetchWorklist()
  } catch {
    showToast('Gagal memulai pemeriksaan', 'error')
  }
}

const finishExam = async (id: number) => {
  try {
    await axios.patch(`${API_ORDERS}/${id}/finish`)
    showToast('Pemeriksaan selesai! Pasien dikirim ke Antrean Bacaan.')
    fetchWorklist()
  } catch {
    showToast('Gagal menyelesaikan pemeriksaan', 'error')
  }
}

onMounted(fetchWorklist)
</script>
