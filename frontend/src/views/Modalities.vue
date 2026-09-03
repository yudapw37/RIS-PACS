<template>
  <div class="page-enter">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Manajemen Modality</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">Konfigurasi mesin DICOM yang terhubung ke Orthanc PACS</p>
      </div>
      <button @click="openAddModal" class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Modality
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold">Total Modality</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ modalities.length }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4 col-span-2">
        <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold">Jenis Modality DICOM</p>
          <div class="flex flex-wrap gap-1.5 mt-1">
            <span v-for="t in modalityTypes" :key="t.code" class="badge-type">{{ t.code }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="text" placeholder="Cari nama atau AET..." class="pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-64 transition-all" />
        </div>
        <button @click="fetchModalities" class="btn-secondary flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500 dark:text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat data modality...</span>
      </div>

      <div v-else-if="filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">No</th>
              <th class="px-6 py-3.5 text-left">Nama Alat</th>
              <th class="px-6 py-3.5 text-left">Tipe</th>
              <th class="px-6 py-3.5 text-left">AE Title</th>
              <th class="px-6 py-3.5 text-left">IP Address</th>
              <th class="px-6 py-3.5 text-left">Port</th>
              <th class="px-6 py-3.5 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
            <tr v-for="(m, i) in paginated" :key="m.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
              <td class="px-6 py-4 text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
              <td class="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{{ m.name }}</td>
              <td class="px-6 py-4">
                <span class="badge-type">{{ m.typeCode }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-bold">{{ m.aet }}</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{{ m.ipAddress }}</td>
              <td class="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{{ m.port }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="testConnection(m)" :disabled="testingId === m.id" class="btn-icon-ping" title="Test DICOM Echo">
                    <svg v-if="testingId !== m.id" xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <svg v-else class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  </button>
                  <button @click="openEditModal(m)" class="btn-icon-edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="confirmDelete(m)" class="btn-icon-delete" title="Hapus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
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
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300">Tidak ada modality terdaftar</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">{{ search ? 'Coba kata kunci lain' : 'Klik "Tambah Modality" untuk mendaftarkan alat baru' }}</p>
      </div>
    </div>

    <!-- MODAL ADD/EDIT -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">{{ isEdit ? 'Edit Modality' : 'Tambah Modality Baru' }}</h3>
            <button @click="closeModal" class="text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="form-label">Nama Alat <span class="text-red-500 dark:text-red-400">*</span></label>
                <input v-model="form.name" type="text" class="form-input" placeholder="cth: CT Scan Ruang A" required />
              </div>
              <div>
                <label class="form-label">Tipe DICOM <span class="text-red-500 dark:text-red-400">*</span></label>
                <select v-model="form.typeCode" class="form-input" required>
                  <option value="">-- Pilih Tipe --</option>
                  <option v-for="t in modalityTypes" :key="t.code" :value="t.code">{{ t.code }} — {{ t.description }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">AE Title <span class="text-red-500 dark:text-red-400">*</span></label>
                <input v-model="form.aet" type="text" class="form-input font-mono uppercase" placeholder="cth: CTSCAN_A" required />
              </div>
              <div>
                <label class="form-label">IP Address <span class="text-red-500 dark:text-red-400">*</span></label>
                <input v-model="form.ipAddress" type="text" class="form-input font-mono" placeholder="cth: 192.168.1.100" required />
              </div>
              <div>
                <label class="form-label">Port <span class="text-red-500 dark:text-red-400">*</span></label>
                <input v-model.number="form.port" type="number" class="form-input font-mono" placeholder="cth: 11112" required />
              </div>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/40 border border-amber-100 dark:border-amber-800/50 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" class="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Modality akan otomatis didaftarkan ke Orthanc PACS saat disimpan.
            </div>
            <div v-if="formError" class="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/40 border border-red-100 dark:border-red-800/50 rounded-xl px-4 py-3 font-medium">{{ formError }}</div>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
              <button type="submit" class="btn-primary flex items-center gap-2" :disabled="submitting">
                <svg v-if="submitting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Daftarkan Modality') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- MODAL DELETE CONFIRM -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-backdrop" @click.self="showDeleteModal = false">
        <div class="modal-box max-w-md">
          <div class="flex flex-col items-center text-center gap-3 mb-6">
            <div class="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/40 flex items-center justify-center text-red-500 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">Hapus Modality?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">Alat <span class="font-bold text-slate-700 dark:text-slate-200">{{ deleteTarget?.name }}</span> (AET: {{ deleteTarget?.aet }}) akan dihapus permanen.</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-cancel flex-1">Batal</button>
            <button @click="deleteModality" class="btn-danger flex-1 flex items-center justify-center gap-2" :disabled="submitting">
              <svg v-if="submitting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ submitting ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import API_BASE from '../config/api'
import Pagination from '../components/Pagination.vue'

const API = `${API_BASE}/api/modalities`

interface Modality { id: number; name: string; typeCode: string; aet: string; ipAddress: string; port: number; createdAt: string }
interface ModalityType { code: string; description: string }

const modalities = ref<Modality[]>([])
const modalityTypes = ref<ModalityType[]>([])
const loading = ref(true)
const search = ref('')
const submitting = ref(false)
const formError = ref('')
const testingId = ref<number | null>(null)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<Modality | null>(null)

// Pagination states
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = reactive({ name: '', typeCode: '', aet: '', ipAddress: '', port: 11112 })
const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const filtered = computed(() => {
  if (!search.value) return modalities.value
  const q = search.value.toLowerCase()
  return modalities.value.filter(m => m.name.toLowerCase().includes(q) || m.aet.toLowerCase().includes(q))
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.value.slice(start, end)
})

watch(search, () => { currentPage.value = 1 })

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toast.show = true; toast.message = msg; toast.type = type
  setTimeout(() => { toast.show = false }, 3500)
}

const fetchModalities = async () => {
  loading.value = true
  try {
    const [mod, types] = await Promise.all([axios.get(API), axios.get(`${API}/types`)])
    modalities.value = mod.data.data || mod.data
    modalityTypes.value = types.data.data || types.data
  } catch { showToast('Gagal memuat data modality', 'error') }
  finally { loading.value = false }
}

const testConnection = async (m: Modality) => {
  testingId.value = m.id
  try {
    await axios.post(`${API}/${m.id}/test-connection`)
    showToast(`✓ DICOM Echo ${m.aet} berhasil!`)
  } catch (err: any) {
    showToast(err.response?.data?.msg || `DICOM Echo ${m.aet} gagal`, 'error')
  } finally { testingId.value = null }
}

const openAddModal = () => {
  isEdit.value = false; editId.value = null
  Object.assign(form, { name: '', typeCode: '', aet: '', ipAddress: '', port: 11112 })
  formError.value = ''; showModal.value = true
}

const openEditModal = (m: Modality) => {
  isEdit.value = true; editId.value = m.id
  Object.assign(form, { name: m.name, typeCode: m.typeCode, aet: m.aet, ipAddress: m.ipAddress, port: m.port })
  formError.value = ''; showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true; formError.value = ''
  try {
    if (isEdit.value) {
      await axios.put(`${API}/${editId.value}`, { ...form })
      showToast('Modality berhasil diperbarui')
    } else {
      await axios.post(API, { ...form })
      showToast('Modality berhasil didaftarkan ke RIS & Orthanc')
    }
    closeModal(); fetchModalities()
  } catch (err: any) {
    formError.value = err.response?.data?.msg || 'Terjadi kesalahan. Coba lagi.'
  } finally { submitting.value = false }
}

const confirmDelete = (m: Modality) => { deleteTarget.value = m; showDeleteModal.value = true }

const deleteModality = async () => {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await axios.delete(`${API}/${deleteTarget.value.id}`)
    showToast('Modality berhasil dihapus')
    showDeleteModal.value = false; fetchModalities()
  } catch { showToast('Gagal menghapus modality', 'error') }
  finally { submitting.value = false }
}

onMounted(fetchModalities)
</script>\n