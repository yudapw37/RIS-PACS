<template>
  <div class="page-enter">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Data Dokter</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">Manajemen master dokter perujuk & dokter radiologi</p>
      </div>
      <button @click="openAddModal" class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Dokter
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold">Total Dokter</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ doctors.length }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold">Spesialisasi Terdaftar</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ uniqueSpecs }}</p>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="text" placeholder="Cari nama dokter..." class="pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-64 transition-all" />
        </div>
        <button @click="fetchDoctors" class="btn-secondary flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500 dark:text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat data dokter...</span>
      </div>

      <!-- Table -->
      <div v-else-if="filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">No</th>
              <th class="px-6 py-3.5 text-left">NIP</th>
              <th class="px-6 py-3.5 text-left">Nama Lengkap</th>
              <th class="px-6 py-3.5 text-left">Spesialisasi</th>
              <th class="px-6 py-3.5 text-left">Terdaftar</th>
              <th class="px-6 py-3.5 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
            <tr v-for="(doctor, i) in paginated" :key="doctor.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
              <td class="px-6 py-4 text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
              <td class="px-6 py-4">
                <span class="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-bold border border-slate-200 dark:border-slate-700">{{ doctor.nip || '-' }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                    {{ doctor.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-slate-800 dark:text-slate-100">{{ doctor.fullName }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="doctor.specialization" class="badge-indigo">{{ doctor.specialization }}</span>
                <span v-else class="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs">-</span>
              </td>
              <td class="px-6 py-4 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs">{{ formatDate(doctor.createdAt) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEditModal(doctor)" class="btn-icon-edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="confirmDelete(doctor)" class="btn-icon-delete" title="Hapus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300">Tidak ada data dokter</p>
        <p class="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">{{ search ? 'Coba kata kunci lain' : 'Klik "Tambah Dokter" untuk mulai mendaftarkan' }}</p>
      </div>
    </div>

    <!-- MODAL ADD/EDIT -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">{{ isEdit ? 'Edit Data Dokter' : 'Tambah Dokter Baru' }}</h3>
            <button @click="closeModal" class="text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="form-label">NIP <span class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-normal ml-1">(opsional)</span></label>
              <input v-model="form.nip" type="text" class="form-input font-mono" placeholder="Nomor Induk Pegawai" />
            </div>
            <div>
              <label class="form-label">Nama Lengkap <span class="text-red-500 dark:text-red-400">*</span></label>
              <input v-model="form.fullName" type="text" class="form-input" placeholder="cth: dr. Budi Santoso, Sp.Rad" required />
            </div>
            <div>
              <label class="form-label">Spesialisasi</label>
              <input v-model="form.specialization" type="text" class="form-input" placeholder="cth: Spesialis Radiologi, Dokter Umum" />
            </div>
            <div v-if="formError" class="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/40 border border-red-100 dark:border-red-800/50 rounded-xl px-4 py-3 font-medium">{{ formError }}</div>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
              <button type="submit" class="btn-primary flex items-center gap-2" :disabled="submitting">
                <svg v-if="submitting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Daftarkan Dokter') }}
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
              <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">Hapus Data Dokter?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1">Data <span class="font-bold text-slate-700 dark:text-slate-200">{{ deleteTarget?.fullName }}</span> akan dihapus permanen.</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-cancel flex-1">Batal</button>
            <button @click="deleteDoctor" class="btn-danger flex-1 flex items-center justify-center gap-2" :disabled="submitting">
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

const API = `${API_BASE}/api/doctors`

interface Doctor {
  id: number
  nip: string | null
  fullName: string
  specialization: string | null
  createdAt: string
}

const doctors = ref<Doctor[]>([])
const loading = ref(true)
const search = ref('')
const submitting = ref(false)
const formError = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<Doctor | null>(null)

// Pagination states
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = reactive({ nip: '', fullName: '', specialization: '' })
const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const filtered = computed(() => {
  if (!search.value) return doctors.value
  const q = search.value.toLowerCase()
  return doctors.value.filter(d => 
    d.fullName.toLowerCase().includes(q) || 
    (d.nip && d.nip.toLowerCase().includes(q))
  )
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.value.slice(start, end)
})

watch(search, () => { currentPage.value = 1 })

const uniqueSpecs = computed(() =>
  new Set(doctors.value.map(d => d.specialization).filter(Boolean)).size
)

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.show = true; toast.message = message; toast.type = type
  setTimeout(() => { toast.show = false }, 3000)
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const fetchDoctors = async () => {
  loading.value = true
  try {
    const res = await axios.get(API)
    doctors.value = res.data.data || res.data
  } catch { showToast('Gagal memuat data dokter', 'error') }
  finally { loading.value = false }
}

const openAddModal = () => {
  isEdit.value = false; editId.value = null
  Object.assign(form, { nip: '', fullName: '', specialization: '' })
  formError.value = ''; showModal.value = true
}

const openEditModal = (d: Doctor) => {
  isEdit.value = true; editId.value = d.id
  Object.assign(form, { nip: d.nip || '', fullName: d.fullName, specialization: d.specialization || '' })
  formError.value = ''; showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true; formError.value = ''
  try {
    const payload = { nip: form.nip || undefined, fullName: form.fullName, specialization: form.specialization || undefined }
    if (isEdit.value) {
      await axios.put(`${API}/${editId.value}`, payload)
      showToast('Data dokter berhasil diperbarui')
    } else {
      await axios.post(API, payload)
      showToast('Dokter berhasil didaftarkan')
    }
    closeModal(); fetchDoctors()
  } catch (err: any) {
    formError.value = err.response?.data?.msg || 'Terjadi kesalahan. Coba lagi.'
  } finally { submitting.value = false }
}

const confirmDelete = (d: Doctor) => { deleteTarget.value = d; showDeleteModal.value = true }

const deleteDoctor = async () => {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await axios.delete(`${API}/${deleteTarget.value.id}`)
    showToast('Data dokter berhasil dihapus')
    showDeleteModal.value = false; fetchDoctors()
  } catch { showToast('Gagal menghapus data dokter', 'error') }
  finally { submitting.value = false }
}

onMounted(fetchDoctors)
</script>\n