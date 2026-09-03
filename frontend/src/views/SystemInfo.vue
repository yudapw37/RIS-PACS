<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    <!-- Header -->
    <div>
      <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Info Sistem & Koneksi PACS</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Monitoring komponen, setting modality, dan flow koneksi DICOM — IP otomatis sesuai server deploy.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="ml-3 text-slate-500 dark:text-slate-400 font-medium">Memuat info sistem...</span>
    </div>

    <template v-else-if="systemData">
      <!-- ============ SECTION 1: Status Komponen ============ -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-slate-100">Status Komponen Sistem</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Server IP: <span class="font-mono font-bold text-cyan-600 dark:text-cyan-400">{{ systemData.serverIp }}</span></p>
            </div>
          </div>
          <button @click="fetchSystemInfo" class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl border border-cyan-100 dark:border-cyan-800/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="{'animate-spin': loading}"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50">
                <th class="px-6 py-3 text-left font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Komponen</th>
                <th class="px-6 py-3 text-left font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Deskripsi</th>
                <th class="px-6 py-3 text-left font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">URL / Port</th>
                <th class="px-6 py-3 text-left font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Protokol</th>
                <th class="px-6 py-3 text-center font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="c in systemData.components" :key="c.name" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{{ c.name }}</td>
                <td class="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs max-w-[240px]">{{ c.description }}</td>
                <td class="px-6 py-4">
                  <a v-if="c.protocol === 'HTTP'" :href="c.url" target="_blank" class="font-mono text-xs text-cyan-600 dark:text-cyan-400 hover:underline break-all">{{ c.url }}</a>
                  <span v-else class="font-mono text-xs text-slate-600 dark:text-slate-300">{{ c.url }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold"
                    :class="c.protocol === 'DICOM' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50' : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50'">
                    {{ c.protocol }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    :class="c.status === 'online' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50'">
                    <span class="w-2 h-2 rounded-full" :class="c.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
                    {{ c.status === 'online' ? 'Online' : 'Offline' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <p class="text-xs text-slate-400 dark:text-slate-500">
            Terakhir dicek: <span class="font-mono">{{ formatDate(systemData.lastChecked) }}</span> • PACS: <span class="font-bold">{{ systemData.pacs }}</span> • Versi: <span class="font-bold">v{{ systemData.version }}</span>
          </p>
        </div>
      </div>

      <!-- ============ SECTION 2: Setting Modality ============ -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100">Setting Koneksi Modality ke PACS</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Konfigurasi ini dimasukkan di software modality (CT Scan, CR, I.O, dll)</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          <!-- Worklist -->
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ systemData.modalitySettings.worklistQuery.label }}</h4>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ systemData.modalitySettings.worklistQuery.description }}</p>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">AE Title</span>
                <span class="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{{ systemData.modalitySettings.worklistQuery.aet }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">IP Address</span>
                <span class="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{{ systemData.modalitySettings.worklistQuery.ip }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Port</span>
                <span class="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{{ systemData.modalitySettings.worklistQuery.port }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Protokol</span>
                <span class="text-xs font-bold text-purple-600 dark:text-purple-400">{{ systemData.modalitySettings.worklistQuery.protocol }}</span>
              </div>
            </div>
          </div>
          <!-- Store Image -->
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ systemData.modalitySettings.storeImage.label }}</h4>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ systemData.modalitySettings.storeImage.description }}</p>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">AE Title</span>
                <span class="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{{ systemData.modalitySettings.storeImage.aet }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">IP Address</span>
                <span class="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{{ systemData.modalitySettings.storeImage.ip }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Port</span>
                <span class="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{{ systemData.modalitySettings.storeImage.port }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Protokol</span>
                <span class="text-xs font-bold text-purple-600 dark:text-purple-400">{{ systemData.modalitySettings.storeImage.protocol }}</span>
              </div>
            </div>
          </div>
          <!-- Echo Test -->
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">3</span>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ systemData.modalitySettings.echoTest.label }}</h4>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ systemData.modalitySettings.echoTest.description }}</p>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">AE Title</span>
                <span class="font-mono font-bold text-sm text-orange-600 dark:text-orange-400">{{ systemData.modalitySettings.echoTest.aet }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">IP Address</span>
                <span class="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{{ systemData.modalitySettings.echoTest.ip }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Port</span>
                <span class="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{{ systemData.modalitySettings.echoTest.port }}</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Protokol</span>
                <span class="text-xs font-bold text-purple-600 dark:text-purple-400">{{ systemData.modalitySettings.echoTest.protocol }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ SECTION 3: Flow Koneksi ============ -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100">Flow Koneksi Data DICOM</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Alur pengiriman data dari pendaftaran hingga pembacaan gambar</p>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-0">
            <div v-for="(step, idx) in systemData.connectionFlow" :key="step.step" class="relative flex gap-4">
              <!-- Timeline line -->
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg"
                  :class="stepColors[idx % stepColors.length]">
                  {{ step.step }}
                </div>
                <div v-if="idx < systemData.connectionFlow.length - 1" class="w-0.5 flex-1 min-h-[24px] bg-gradient-to-b from-slate-300 dark:from-slate-600 to-slate-200 dark:to-slate-700"></div>
              </div>
              <!-- Content -->
              <div class="pb-6 flex-1 min-w-0">
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{{ step.from }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 dark:text-slate-500 shrink-0"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <span class="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">{{ step.to }}</span>
                  </div>
                  <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{{ step.action }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ step.description }}</p>
                  <div class="mt-2">
                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50">{{ step.protocol }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <p class="text-red-500 dark:text-red-400 font-bold">Gagal memuat info sistem</p>
      <button @click="fetchSystemInfo" class="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors">Coba Lagi</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import API_BASE from '../config/api'

const loading = ref(true)
const systemData = ref<any>(null)

const stepColors = [
  'bg-blue-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
]

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  } catch { return iso }
}

const fetchSystemInfo = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_BASE}/api/system/info`)
    if (data.success) {
      systemData.value = data.data
    }
  } catch (err) {
    console.error('Failed to load system info:', err)
    systemData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchSystemInfo)
</script>
