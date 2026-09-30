<template>
  <div class="page-enter">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Antrean Pemeriksaan</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar pemeriksaan radiologi di Ruang Pemeriksaan (Radiografer).</p>
      </div>
    </div>

    <!-- Tab Filter: Menunggu vs Selesai -->
    <div class="flex items-center gap-1 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm">
      <button 
        @click="activeTab = 'active'; currentPage = 1"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
          activeTab === 'active'
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span>Menunggu Tindakan</span>
        <span 
          class="text-xs px-2 py-0.5 rounded-full font-bold" 
          :class="activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'"
        >
          {{ activeList.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'completed'; currentPage = 1"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
          activeTab === 'completed'
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span>Selesai Dikerjakan (Riwayat)</span>
        <span 
          class="text-xs px-2 py-0.5 rounded-full font-bold" 
          :class="activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
        >
          {{ completedList.length }}
        </span>
      </button>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="text" placeholder="Cari MRN / Nama Pasien..." class="pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-64 transition-all" />
        </div>
        <button @click="loadData" class="btn-secondary flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat data antrean...</span>
      </div>

      <!-- Table Content: Menunggu Tindakan (Active) -->
      <div v-else-if="activeTab === 'active' && filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">Pasien</th>
              <th class="px-6 py-3.5 text-left">Tanggal & Jam Order</th>
              <th class="px-6 py-3.5 text-left">Pemeriksaan</th>
              <th class="px-6 py-3.5 text-left text-center">Status</th>
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
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {{ formatDateTime(h.orderDate).date }}
                </div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                  {{ formatDateTime(h.orderDate).time }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  <span class="badge-type mr-1">{{ h.modalityTypeCode }}</span> {{ h.bodyPart || 'Umum' }}
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5 font-mono">{{ h.accessionNumber }}</div>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="h.status === 'scheduled'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Menunggu
                </span>
                <span v-else-if="h.status === 'in_progress'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800 animate-pulse">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Diperiksa
                </span>
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

      <!-- Table Content: Selesai Dikerjakan (Completed History) -->
      <div v-else-if="activeTab === 'completed' && filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">Pasien</th>
              <th class="px-6 py-3.5 text-left">Tanggal & Jam Order</th>
              <th class="px-6 py-3.5 text-left">Pemeriksaan</th>
              <th class="px-6 py-3.5 text-left text-center">Status Tindakan</th>
              <th class="px-6 py-3.5 text-center">Aksi</th>
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
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {{ formatDateTime(h.orderDate).date }}
                </div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                  {{ formatDateTime(h.orderDate).time }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  <span class="badge-type mr-1">{{ h.modalityTypeCode }}</span> {{ h.bodyPart || 'Umum' }}
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5 font-mono">{{ h.accessionNumber }}</div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Tindakan Selesai
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <router-link :to="`/admin/orders/${h.id}`" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition inline-flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Detail Order
                </router-link>
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
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300">
          {{ activeTab === 'active' ? 'Tidak Ada Pasien Menunggu' : 'Belum Ada Pemeriksaan Selesai' }}
        </p>
        <p class="text-slate-400 text-sm mt-1">
          {{ activeTab === 'active' ? 'Semua antrean pemeriksaan tindakan saat ini telah dikerjakan.' : 'Pemeriksaan yang telah diselesaikan radiografer akan muncul di sini.' }}
        </p>
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
const API_ALL_ORDERS = `${API_BASE}/api/orders/all?status=completed`

const activeTab = ref<'active' | 'completed'>('active')
const activeList = ref<any[]>([])
const completedList = ref<any[]>([])
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

const formatDateTime = (val: any) => {
  if (!val) return { date: '-', time: '' }
  try {
    const s = String(val).replace(' ', 'T')
    const d = new Date(s)
    if (isNaN(d.getTime())) return { date: '-', time: '' }
    return {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  } catch {
    return { date: '-', time: '' }
  }
}

const currentList = computed(() => {
  return activeTab.value === 'active' ? activeList.value : completedList.value
})

const filtered = computed(() => {
  if (!search.value) return currentList.value
  const q = search.value.toLowerCase()
  return currentList.value.filter(h => 
    h.patient?.fullName?.toLowerCase().includes(q) || 
    h.patient?.mrn?.toLowerCase().includes(q) ||
    h.accessionNumber?.toLowerCase().includes(q)
  )
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

const loadData = async () => {
  loading.value = true
  try {
    const [activeRes, completedRes] = await Promise.all([
      axios.get(API_WORKLIST),
      axios.get(API_ALL_ORDERS)
    ])
    activeList.value = activeRes.data.data || []
    completedList.value = completedRes.data.data || []
  } catch (err) {
    console.error('Failed to load examination worklist', err)
  } finally {
    loading.value = false
  }
}

const startExam = async (id: number) => {
  try {
    await axios.patch(`${API_ORDERS}/${id}/start`)
    showToast('Pemeriksaan dimulai')
    loadData()
  } catch (err: any) {
    showToast('Gagal memulai pemeriksaan', 'error')
  }
}

const finishExam = async (id: number) => {
  try {
    await axios.patch(`${API_ORDERS}/${id}/finish`)
    showToast('Pemeriksaan selesai, order diteruskan ke antrean baca dokter')
    loadData()
  } catch (err: any) {
    showToast('Gagal menyelesaikan pemeriksaan', 'error')
  }
}

onMounted(() => {
  loadData()
})
</script>
