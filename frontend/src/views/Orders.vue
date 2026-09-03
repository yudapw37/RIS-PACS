<template>
  <div class="page-enter">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Manajemen Order</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Semua order radiologi — terjadwal, dalam proses, dan selesai</p>
      </div>
      <button @click="openAddModal" class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Registrasi Order
      </button>
    </div>

    <!-- Tab Filter -->
    <div class="flex items-center gap-1 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm">
      <button v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key; currentPage = 1"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
          activeTab === tab.key
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        {{ tab.label }}
        <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" :class="activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'">{{ tabCount(tab.key) }}</span>
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
        <button @click="fetchWorklist" class="btn-secondary flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400">
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="text-sm font-medium">Memuat data antrean...</span>
      </div>

      <!-- Table Content -->
      <div v-else-if="filtered.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="px-6 py-3.5 text-left">MRN & Pasien</th>
              <th class="px-6 py-3.5 text-left">Pemeriksaan</th>
              <th class="px-6 py-3.5 text-left">Prioritas</th>
              <th class="px-6 py-3.5 text-left">Status</th>
              <th class="px-6 py-3.5 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
            <tr v-for="w in paginated" :key="w.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800 dark:text-slate-100">{{ w.patient?.fullName }}</div>
                <div class="text-xs text-slate-500 mt-0.5">
                  <span class="font-mono bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 px-1.5 rounded">{{ w.patient?.mrn }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  <span class="badge-type mr-1">{{ w.modalityTypeCode }}</span> {{ w.bodyPart || 'Tanpa Keterangan' }}
                </div>
                <div class="text-xs text-slate-400 mt-1 truncate max-w-[200px]" :title="w.clinicalInfo">
                  {{ w.clinicalInfo || 'Tidak ada info klinis' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="{'badge-pink': w.priority === 'stat', 'badge-blue': w.priority === 'urgent', 'text-slate-500': w.priority === 'routine'}">
                  {{ w.priority.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="w.status === 'scheduled'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Terjadwal
                </span>
                <span v-else-if="w.status === 'in_progress'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800">
                  <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Dalam Proses
                </span>
                <span v-else-if="w.status === 'completed'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Selesai
                </span>
                <span v-else-if="w.status === 'canceled'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-500 border border-red-200 dark:border-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Dibatalkan
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {{ w.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <!-- Tombol Detail (selalu ada) -->
                  <button @click="openDetailModal(w)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" title="Lihat Detail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Detail
                  </button>
                  <!-- Tombol Edit Status (hanya jika aktif) -->
                  <button v-if="w.status === 'scheduled' || w.status === 'in_progress'" @click="openEditModal(w)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-all" title="Update Status">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
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
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        </div>
        <p class="font-bold text-slate-600 dark:text-slate-300">Tidak Ada Order</p>
        <p class="text-sm text-slate-400 mt-1">Tidak ada order dengan status ini.</p>
      </div>
    </div>

    <!-- Modals & Toasts -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">Registrasi Order Baru</h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 relative">
                <label class="form-label">Pasien <span class="text-red-500">*</span></label>
                <div class="relative">
                  <input 
                    type="text" 
                    v-model="patientSearchQuery"
                    @input="onPatientSearch"
                    @focus="isPatientDropdownOpen = true"
                    @blur="isPatientDropdownOpen = false"
                    class="form-input pr-10" 
                    placeholder="Ketik min. 3 huruf untuk cari nama / MRN..." 
                    autocomplete="off"
                    required
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                     <button v-if="form.patientId" @click.prevent="clearPatientSelection" class="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                     </button>
                     <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" class="text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                </div>
                
                <!-- Autocomplete Dropdown List -->
                <div v-if="isPatientDropdownOpen" class="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden">
                  <div v-if="searchingPatients" class="p-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
                    <svg class="animate-spin w-4 h-4 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mencari...
                  </div>
                  <div v-else-if="patientsDb.length === 0 && patientSearchQuery.length >= 3" class="p-4 text-sm text-slate-500 dark:text-slate-400 font-semibold text-center bg-slate-50/50 dark:bg-slate-900/50">
                    Tidak ada pasien ditemukan.
                  </div>
                  <div v-else-if="patientSearchQuery.length < 3" class="p-4 text-xs text-slate-400 dark:text-slate-500 font-semibold text-center bg-slate-50/50 dark:bg-slate-900/50">
                    Ketik min. 3 huruf untuk cari data (Max 10).
                  </div>
                  <ul v-else class="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    <li 
                      v-for="p in patientsDb" 
                      :key="p.id" 
                      @mousedown.prevent="selectPatient(p)"
                      class="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <div class="font-bold text-sm text-slate-800 dark:text-slate-100">{{ p.fullName }}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5"><span class="bg-slate-100 dark:bg-slate-900 px-1 rounded">{{ p.mrn }}</span></div>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <label class="form-label">No. Registrasi <span class="text-red-500">*</span></label>
                <input v-model="form.noReg" class="form-input font-mono" placeholder="REG-..." required />
              </div>
              <div>
                <label class="form-label">Prioritas <span class="text-red-500">*</span></label>
                <select v-model="form.priority" class="form-input text-sm font-semibold" required>
                  <option value="routine">Routine (Biasa)</option>
                  <option value="urgent">Urgent (Segera)</option>
                  <option value="stat">STAT (CITO!)</option>
                </select>
              </div>
              <div>
                <label class="form-label">Dokter Pengirim <span class="text-xs font-normal text-slate-400">(Opsional)</span></label>
                <select v-model="form.doctorId" class="form-input text-sm font-medium">
                  <option value="">-- Tidak Ada / Tidak Diisi --</option>
                  <option v-for="d in doctorsDb" :key="d.id" :value="d.id">{{ d.fullName }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Modality Alat <span class="text-xs font-normal text-slate-400">(Pilih alat fisik — opsional tapi penting untuk Worklist)</span></label>
                <select v-model="form.modalityId" @change="onModalitySelect" class="form-input text-sm font-medium">
                  <option value="">-- Pilih Alat Fisik --</option>
                  <option v-for="m in modalitiesDb" :key="m.id" :value="m.id">
                    {{ m.name }} — AET: {{ m.aet }}
                  </option>
                </select>
              </div>
              <div>
                <label class="form-label">Modality Type <span class="text-red-500">*</span></label>
                <select v-model="form.modalityTypeCode" class="form-input text-sm font-semibold" required>
                  <option v-for="t in modalityTypes" :key="t.code" :value="t.code">
                    {{ t.description }} ({{ t.code }})
                  </option>
                </select>
              </div>

              <div>
                <label class="form-label">Bagian Tubuh (Body Part)</label>
                <input v-model="form.bodyPart" class="form-input" placeholder="contoh: Thorax" />
              </div>
              <div class="col-span-2">
                <label class="form-label">Info Klinis</label>
                <textarea v-model="form.clinicalInfo" class="form-input h-20 resize-none" placeholder="Indikasi pemeriksaan..."></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
              <button type="submit" class="btn-primary flex items-center gap-2" :disabled="submitting">
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>Order Sekarang</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal: Detail Order -->
    <Transition name="modal">
      <div v-if="showDetailModal" class="modal-backdrop" @click.self="showDetailModal = false">
        <div class="modal-box max-w-lg">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">Detail Order</h3>
            <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="selectedOrder" class="space-y-3">
            <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Pasien</span>
                <span class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ selectedOrder.patient?.fullName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">MRN</span>
                <span class="text-sm font-mono text-cyan-600">{{ selectedOrder.patient?.mrn }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">No. Registrasi</span>
                <span class="text-sm font-mono text-slate-700 dark:text-slate-300">{{ selectedOrder.noReg }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Accession No.</span>
                <span class="text-sm font-mono text-slate-700 dark:text-slate-300">{{ selectedOrder.accessionNumber }}</span>
              </div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Modalitas</span>
                <span class="text-sm font-bold"><span class="badge-type mr-1">{{ selectedOrder.modalityTypeCode }}</span>{{ selectedOrder.bodyPart || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Alat</span>
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ selectedOrder.modality?.name || '📡 Broadcast' }} <span v-if="selectedOrder.modality?.aet" class="font-mono text-xs text-slate-400">({{ selectedOrder.modality.aet }})</span></span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Dokter</span>
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ selectedOrder.doctor?.fullName || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Prioritas</span>
                <span class="text-sm font-bold" :class="{'text-red-500': selectedOrder.priority === 'stat', 'text-amber-500': selectedOrder.priority === 'urgent', 'text-slate-500': selectedOrder.priority === 'routine'}">{{ selectedOrder.priority?.toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-400 font-semibold uppercase">Status</span>
                <span class="text-sm font-bold capitalize">{{ selectedOrder.status }}</span>
              </div>
            </div>
            <div v-if="selectedOrder.clinicalInfo" class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
              <span class="text-xs text-slate-400 font-semibold uppercase block mb-1">Info Klinis</span>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ selectedOrder.clinicalInfo }}</p>
            </div>
          </div>
          <div class="flex justify-end mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button @click="showDetailModal = false" class="btn-cancel">Tutup</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal: Edit Status Order -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
        <div class="modal-box max-w-sm">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-100">Update Status Order</h3>
            <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="selectedOrder" class="space-y-3">
            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm">
              <p class="font-bold text-slate-800 dark:text-slate-100">{{ selectedOrder.patient?.fullName }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ selectedOrder.modalityTypeCode }} — {{ selectedOrder.bodyPart || 'Pemeriksaan' }}</p>
            </div>
            <p class="text-xs text-slate-500 font-semibold uppercase px-1">Pilih Aksi:</p>
            <!-- Jika scheduled -->
            <template v-if="selectedOrder.status === 'scheduled'">
              <button @click="doUpdateStatus('in_progress')" class="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition font-semibold text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Mulai Pemeriksaan
              </button>
              <button @click="doUpdateStatus('canceled')" class="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition font-semibold text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Batalkan Order
              </button>
            </template>
            <!-- Jika in_progress -->
            <template v-if="selectedOrder.status === 'in_progress'">
              <button @click="doUpdateStatus('completed')" class="w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition font-semibold text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Selesai Pemeriksaan
              </button>
              <button @click="doUpdateStatus('canceled')" class="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition font-semibold text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Batalkan Order
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>

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
import Pagination from '../components/Pagination.vue'
import API_BASE from '../config/api'

const API_ALL_ORDERS = `${API_BASE}/api/orders/all`
const API_ORDERS = `${API_BASE}/api/orders`
const API_PATIENTS = `${API_BASE}/api/patients`
const API_DOCTORS  = `${API_BASE}/api/doctors`
const API_MODALITY_TYPES = `${API_BASE}/api/modalities/types`
const API_MODALITIES = `${API_BASE}/api/modalities`


const worklist = ref<any[]>([])
const patientsDb  = ref<any[]>([])
const doctorsDb   = ref<any[]>([])
const modalityTypes = ref<any[]>([])
const modalitiesDb  = ref<any[]>([])

const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Tab filter
const tabs = [
  { key: 'semua',     label: 'Semua' },
  { key: 'scheduled', label: 'Terjadwal' },
  { key: 'in_progress', label: 'Dalam Proses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'canceled',  label: 'Dibatalkan' },
]
const activeTab = ref('semua')
const tabCount = (key: string) => {
  if (key === 'semua') return worklist.value.length
  return worklist.value.filter((w: any) => w.status === key).length
}

const patientSearchQuery = ref('')
const isPatientDropdownOpen = ref(false)
const searchingPatients = ref(false)
let searchTimeout: any = null

const showModal = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const selectedOrder = ref<any>(null)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg; toastType.value = type
  setTimeout(() => toastMessage.value = '', 3000)
}

const form = ref({
  patientId: '',
  noReg: '',
  doctorId: '' as any,
  priority: 'routine',
  modalityId: '' as any,
  modalityTypeCode: 'DX',
  bodyPart: '',
  clinicalInfo: ''
})

// Saat alat fisik dipilih, auto-isi Modality Type sesuai alat
const onModalitySelect = () => {
  if (!form.value.modalityId) return
  const selected = modalitiesDb.value.find((m: any) => m.id === Number(form.value.modalityId))
  if (selected && selected.typeCode) {
    form.value.modalityTypeCode = selected.typeCode
  }
}

const filtered = computed(() => {
  let list = worklist.value
  // Filter by active tab
  if (activeTab.value !== 'semua') {
    list = list.filter((w: any) => w.status === activeTab.value)
  }
  // Filter by search
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((w: any) =>
      w.patient?.fullName.toLowerCase().includes(q) ||
      w.patient?.mrn.toLowerCase().includes(q)
    )
  }
  return list
})

const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

const fetchWorklist = async () => {
  loading.value = true
  try {
    const res = await axios.get(API_ALL_ORDERS)
    worklist.value = res.data.data
  } catch (err) {
    showToast('Gagal memuat data order', 'error')
  } finally {
    loading.value = false
  }
}

const onPatientSearch = () => {
  if (form.value.patientId) form.value.patientId = ''
  
  if (patientSearchQuery.value.length < 3) {
    patientsDb.value = []
    return
  }
  
  searchingPatients.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const res = await axios.get(`${API_PATIENTS}?search=${patientSearchQuery.value}&limit=10`)
      patientsDb.value = res.data.data
    } catch (err) {
      patientsDb.value = []
    } finally {
      searchingPatients.value = false
    }
  }, 400)
}

const selectPatient = (p: any) => {
  form.value.patientId = p.id
  patientSearchQuery.value = `${p.fullName} (${p.mrn})`
  isPatientDropdownOpen.value = false
}

const clearPatientSelection = () => {
  form.value.patientId = ''
  patientSearchQuery.value = ''
  patientsDb.value = []
  isPatientDropdownOpen.value = true
}

const updateStatus = async (id: number, status: string) => {
  try {
    await axios.patch(`${API_ORDERS}/${id}/status`, { status })
    showToast(`Order ditandai sebagai: ${status.toUpperCase()}`)
    fetchWorklist()
  } catch {
    showToast('Gagal update status', 'error')
  }
}

const openDetailModal = (order: any) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const openEditModal = (order: any) => {
  selectedOrder.value = order
  showEditModal.value = true
}

const doUpdateStatus = async (status: string) => {
  if (!selectedOrder.value) return
  try {
    await axios.patch(`${API_ORDERS}/${selectedOrder.value.id}/status`, { status })
    showEditModal.value = false
    showToast(`Status diubah → ${status.replace('_', ' ').toUpperCase()}`)
    fetchWorklist()
  } catch {
    showToast('Gagal update status', 'error')
  }
}

const openAddModal = () => {
  form.value = { patientId: '', noReg: `REG-${new Date().getTime().toString().slice(-6)}`, doctorId: '', priority: 'routine', modalityId: '', modalityTypeCode: 'DX', bodyPart: '', clinicalInfo: '' }
  patientSearchQuery.value = ''
  patientsDb.value = []
  isPatientDropdownOpen.value = false
  showModal.value = true
}
const closeModal = () => showModal.value = false

const submitForm = async () => {
  submitting.value = true
  try {
    const payload: any = {
      ...form.value,
      patientId: Number(form.value.patientId),
      doctorId: form.value.doctorId ? Number(form.value.doctorId) : undefined,
      modalityId: form.value.modalityId ? Number(form.value.modalityId) : undefined
    }
    await axios.post(API_ORDERS, payload)
    showToast('Order berhasil didaftarkan')
    closeModal()
    fetchWorklist()
  } catch (err: any) {
    showToast(err.response?.data?.msg || 'Gagal registrasi order', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  fetchWorklist()
  // Preload daftar dokter untuk dropdown
  try {
    const res = await axios.get(API_DOCTORS)
    doctorsDb.value = res.data.data
  } catch { /* silent */ }

  // Preload modality types
  try {
    const res = await axios.get(API_MODALITY_TYPES)
    modalityTypes.value = res.data.data
  } catch { /* silent */ }

  // Preload daftar alat fisik (modality devices)
  try {
    const res = await axios.get(API_MODALITIES)
    modalitiesDb.value = res.data.data
  } catch { /* silent */ }
})

</script>
