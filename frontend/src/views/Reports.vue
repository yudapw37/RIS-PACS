<template>
  <div class="page-enter pb-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Laporan & Analitik</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau kinerja operasional dan statistik radiologi secara real-time</p>
      </div>

      <!-- Date Filter -->
      <div class="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div class="flex items-center px-3 gap-2 border-r border-slate-100 dark:border-slate-800">
          <svg class="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input type="date" v-model="filter.from" class="text-xs font-bold bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 p-0" />
        </div>
        <div class="flex items-center px-3 gap-2">
          <input type="date" v-model="filter.to" class="text-xs font-bold bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 p-0" />
        </div>
        <button @click="fetchAllData" :disabled="loading" class="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors">
          <svg :class="loading ? 'animate-spin' : ''" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex items-center gap-1 mb-8 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full md:w-max">
      <button 
        v-for="t in tabs" :key="t.id"
        @click="activeTab = t.id"
        :class="activeTab === t.id ? 'bg-white dark:bg-slate-800 text-cyan-600 shadow-sm' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/30'"
        class="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2"
      >
        <component :is="t.icon" class="w-4 h-4" />
        {{ t.name }}
      </button>
    </div>

    <!-- Tab Content: Ringkasan -->
    <div v-show="activeTab === 'summary'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="card in summaryCards" :key="card.label" class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
          <div class="flex items-start justify-between mb-4">
            <div :class="card.color" class="w-12 h-12 rounded-2xl flex items-center justify-center bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110 duration-300">
               <component :is="card.icon" class="w-6 h-6" />
            </div>
            <span v-if="card.trend" :class="card.trend > 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'" class="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current border-opacity-10">
              {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
            </span>
          </div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{{ card.value }}</div>
          <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{{ card.label }}</div>
        </div>
      </div>

      <!-- Main Trend Chart -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100">Tren Volume Pemeriksaan</h3>
            <p class="text-xs text-slate-500 mt-0.5">Jumlah order yang masuk per hari dalam periode terpilih</p>
          </div>
        </div>
        <div class="h-80 w-full relative">
          <canvas ref="mainTrendChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Tab Content: Analitik -->
    <div v-show="activeTab === 'analytics'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Modality Breakdown -->
        <div class="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 mb-6">Distribusi Modality</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas ref="modalityChart"></canvas>
          </div>
          <div class="mt-6 space-y-2">
             <div v-for="(item, idx) in modalityStats" :key="idx" class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: chartColors[idx % chartColors.length] }"></div>
                  <span class="font-bold text-slate-600 dark:text-slate-400">{{ item.modalityTypeCode }}</span>
                </div>
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ item.total }}</span>
             </div>
          </div>
        </div>

        <!-- Distributions -->
        <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 class="font-bold text-slate-800 dark:text-slate-100 mb-6">Prioritas Order</h3>
              <div class="h-64">
                <canvas ref="priorityChart"></canvas>
              </div>
           </div>
           <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 class="font-bold text-slate-800 dark:text-slate-100 mb-6">Status Penyelesaian</h3>
              <div class="h-64">
                <canvas ref="statusChart"></canvas>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Produktivitas -->
    <div v-show="activeTab === 'productivity'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <!-- Radiolog Productivity -->
         <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <h3 class="font-bold text-slate-800 dark:text-slate-100">Produktivitas Dokter Radiologi</h3>
               <span class="text-[10px] font-bold text-slate-400 uppercase">Top Reviewers</span>
            </div>
            <div class="overflow-x-auto">
               <table class="w-full text-xs">
                  <thead>
                     <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                        <th class="px-6 py-3 text-left">Nama Dokter</th>
                        <th class="px-6 py-3 text-right">Total Bacaan</th>
                        <th class="px-6 py-3 text-right w-32">Proporsi</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
                     <tr v-for="doc in radiologistStats" :key="doc.doctorId" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{{ doc.doctorName }}</td>
                        <td class="px-6 py-4 text-right font-mono font-bold text-cyan-600">{{ doc.total }}</td>
                        <td class="px-6 py-4">
                           <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div class="h-full bg-cyan-500 rounded-full" :style="{ width: `${summary.totalCompleted > 0 ? (doc.total / summary.totalCompleted) * 100 : 0}%` }"></div>
                           </div>
                        </td>
                     </tr>
                     <tr v-if="radiologistStats.length === 0">
                        <td colspan="3" class="px-6 py-10 text-center text-slate-400">Belum ada data bacaan.</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Referring Doctors -->
         <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <h3 class="font-bold text-slate-800 dark:text-slate-100">Sumber Referal Pengirim</h3>
               <span class="text-[10px] font-bold text-slate-400 uppercase">Top Senders</span>
            </div>
            <div class="overflow-x-auto">
               <table class="w-full text-xs">
                  <thead>
                     <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                        <th class="px-6 py-3 text-left">Dokter Pengirim</th>
                        <th class="px-6 py-3 text-right">Total Order</th>
                        <th class="px-6 py-3 text-right w-32">Intensitas</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
                     <tr v-for="doc in senderStats" :key="doc.doctorId" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{{ doc.doctorName }}</td>
                        <td class="px-6 py-4 text-right font-mono font-bold text-blue-600">{{ doc.total }}</td>
                        <td class="px-6 py-4">
                           <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${summary.totalOrders > 0 ? (doc.total / summary.totalOrders) * 100 : 0}%` }"></div>
                           </div>
                        </td>
                     </tr>
                     <tr v-if="senderStats.length === 0">
                        <td colspan="3" class="px-6 py-10 text-center text-slate-400">Belum ada data rujukan.</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw, defineComponent, h, computed, watch, nextTick } from 'vue'
import axios from 'axios'

import { Chart, registerables } from 'chart.js'
import API_BASE from '../config/api'

Chart.register(...registerables)

// Custom Icons for Cards
const IconOrders = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }), h('polyline', { points: '14 2 14 8 20 8' }), h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }), h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }), h('polyline', { points: '10 9 9 9 8 9' })]) })
const IconPatients = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }), h('circle', { cx: '9', cy: '7', r: '4' }), h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })]) })
const IconTimer = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) })
const IconDone = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('polyline', { points: '20 6 9 17 4 12' })]) })

// Refs
const loading = ref(false)
const filter = ref({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0]
})

const activeTab = ref('summary')
const tabs = [
  { id: 'summary', name: 'Ringkasan', icon: defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('rect', { x: '3', y: '3', width: '7', height: '9' }), h('rect', { x: '14', y: '3', width: '7', height: '5' }), h('rect', { x: '14', y: '12', width: '7', height: '9' }), h('rect', { x: '3', y: '16', width: '7', height: '5' })]) }) },
  { id: 'analytics', name: 'Analitik', icon: defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('line', { x1: '18', y1: '20', x2: '18', y2: '10' }), h('line', { x1: '12', y1: '20', x2: '12', y2: '4' }), h('line', { x1: '6', y1: '20', x2: '6', y2: '14' })]) }) },
  { id: 'productivity', name: 'Produktivitas', icon: defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }), h('circle', { cx: '9', cy: '7', r: '4' }), h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })]) }) }
]

const summary = ref({
  totalOrders: 0,
  totalPatients: 0,
  totalCompleted: 0,
  totalCanceled: 0,
  cancellationRate: 0,
  avgReportingHours: 0
})

const summaryCards = computed(() => [
  { label: 'Total Order', value: summary.value.totalOrders, icon: markRaw(IconOrders), color: 'text-cyan-600 bg-cyan-600', trend: 12 },
  { label: 'Total Pasien', value: summary.value.totalPatients, icon: markRaw(IconPatients), color: 'text-blue-600 bg-blue-600', trend: 8 },
  { label: 'Selesai Hasil', value: summary.value.totalCompleted, icon: markRaw(IconDone), color: 'text-emerald-600 bg-emerald-600', trend: 15 },
  { label: 'Rata-rata Waktu', value: `${summary.value.avgReportingHours} Jam`, icon: markRaw(IconTimer), color: 'text-amber-600 bg-amber-600' }
])

const modalityStats = ref<any[]>([])
const radiologistStats = ref<any[]>([])
const senderStats = ref<any[]>([])

// Chart Refs
const mainTrendChart = ref<HTMLCanvasElement | null>(null)
const modalityChart = ref<HTMLCanvasElement | null>(null)
const priorityChart = ref<HTMLCanvasElement | null>(null)
const statusChart = ref<HTMLCanvasElement | null>(null)

let charts: Record<string, Chart | null> = { trend: null, modality: null, priority: null, status: null }

const chartColors = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#64748b'  // slate-500
]

const fetchAllData = async () => {
  loading.value = true
  const params = { from: filter.value.from, to: filter.value.to }
  try {
    const [resSummary, resDay, resMod, resRad, resSend, resPri, resStat] = await Promise.all([
      axios.get(`${API_BASE}/api/reports/summary`, { params }),
      axios.get(`${API_BASE}/api/reports/by-day`, { params }),
      axios.get(`${API_BASE}/api/reports/by-modality`, { params }),
      axios.get(`${API_BASE}/api/reports/by-radiologist`, { params }),
      axios.get(`${API_BASE}/api/reports/by-referring-doctor`, { params }),
      axios.get(`${API_BASE}/api/reports/by-priority`, { params }),
      axios.get(`${API_BASE}/api/reports/by-status`, { params })
    ])

    summary.value = resSummary.data.data
    modalityStats.value = resMod.data.data
    radiologistStats.value = resRad.data.data
    senderStats.value = resSend.data.data

    renderCharts(resDay.data.data, resMod.data.data, resPri.data.data, resStat.data.data)
  } catch (err) {
    console.error('Failed to fetch report data', err)
  } finally {
    loading.value = false
  }
}

const renderCharts = (dayData: any[], modData: any[], priData: any[], statData: any[]) => {
  // Dispose existing charts
  Object.keys(charts).forEach(k => { if (charts[k]) charts[k]?.destroy() })

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#1e293b' : '#f1f5f9'

  // 1. Trend Line Chart
  if (mainTrendChart.value) {
    charts.trend = new Chart(mainTrendChart.value, {
      type: 'line',
      data: {
        labels: dayData.map(d => new Date(d.day).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })),
        datasets: [{
          label: 'Jumlah Order',
          data: dayData.map(d => d.total),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
        }
      }
    })
  }

  // 2. Modality Doughnut
  if (modalityChart.value) {
    charts.modality = new Chart(modalityChart.value, {
      type: 'doughnut',
      data: {
        labels: modData.map(d => d.modalityTypeCode),
        datasets: [{
          data: modData.map(d => d.total),
          backgroundColor: chartColors,
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { display: false } }
      }
    })
  }

  // 3. Priority Bar (Horizontal)
  if (priorityChart.value) {
    const pColors: any = { routine: '#94a3b8', urgent: '#f59e0b', stat: '#ef4444' }
    charts.priority = new Chart(priorityChart.value, {
      type: 'bar',
      data: {
        labels: priData.map(d => d.priority.toUpperCase()),
        datasets: [{
          data: priData.map(d => d.total),
          backgroundColor: priData.map(d => pColors[d.priority] || '#cbd5e1'),
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: gridColor }, ticks: { display: false } },
          y: { grid: { display: false }, ticks: { color: textColor, font: { size: 11, weight: 'bold' } } }
        }
      }
    })
  }

  // 4. Status Breakdown
  if (statusChart.value) {
     const sColors: any = { scheduled: '#3b82f6', completed: '#10b981', canceled: '#64748b' }
     charts.status = new Chart(statusChart.value, {
      type: 'bar',
      data: {
        labels: statData.map(d => d.status.charAt(0).toUpperCase() + d.status.slice(1)),
        datasets: [{
          data: statData.map(d => d.total),
          backgroundColor: statData.map(d => sColors[d.status] || '#cbd5e1'),
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10, weight: 'bold' } } }
        }
      }
    })
  }
}

onMounted(() => {
  fetchAllData()
})

// Watch tab changes to resize charts (essential when using v-show)
watch(activeTab, () => {
  nextTick(() => {
    Object.values(charts).forEach(chart => {
      if (chart) chart.resize()
    })
  })
})

onUnmounted(() => {
  Object.keys(charts).forEach(k => { if (charts[k]) charts[k]?.destroy() })
})

</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
