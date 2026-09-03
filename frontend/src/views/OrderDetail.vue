<template>
  <div class="page-enter pb-10">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Detail Pemeriksaan</h2>
            <span v-if="isHistoryMode" class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">Mode History (Read-Only)</span>
            <span v-else class="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 border border-cyan-200 dark:border-cyan-700">Mode Bacaan</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">No. Reg: <span class="font-bold font-mono text-cyan-600">{{ order?.noReg }}</span></p>
        </div>
      </div>
      <button v-if="studyInstanceUID" @click="openOhifNewTab" class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Buka OHIF Tab Baru
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20 gap-3 text-slate-400">
      <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      <span class="text-sm font-medium">Memuat detail pemeriksaan...</span>
    </div>

    <div v-else-if="order">

      <!-- ── SECTION 1: Info Pasien & Order ── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <!-- Data Pasien -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
          <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Data Pasien
          </h3>
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
              {{ order.patient.fullName?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight">{{ order.patient.fullName }}</h3>
              <div class="flex flex-wrap gap-2 mt-1">
                <span class="font-mono text-[11px] bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-100 dark:border-cyan-800">{{ order.patient.mrn }}</span>
                <span class="text-xs text-slate-500 font-medium">{{ order.patient.gender === 'L' ? '♂ Laki-laki' : '♀ Perempuan' }}</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Tanggal Lahir</div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ order.patient.dob ? new Date(order.patient.dob).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-' }}</div>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Alamat</div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{{ order.patient.address || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Info Order -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
          <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
            Informasi Order
          </h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">No. Aksesi</div>
              <div class="text-sm font-bold font-mono text-cyan-600">{{ order.accessionNumber }}</div>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Jenis Pemeriksaan</div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ order.modalityTypeCode }} — {{ order.bodyPart || 'Umum' }}</div>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Prioritas</div>
              <div>
                <span :class="order.priority === 'stat' ? 'bg-red-50 text-red-600 border-red-200' : order.priority === 'urgent' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'" class="text-[11px] font-bold px-2 py-0.5 rounded border capitalize">{{ order.priority }}</span>
              </div>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Tanggal Order</div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ new Date(order.orderDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</div>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dokter Pengirim</div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ order.doctor?.fullName || '-' }}</div>
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Informasi Klinis</div>
              <div class="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{{ order.clinicalInfo || '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── SECTION 2: OHIF Viewer (kiri) + Panel Kanan ── -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- OHIF Viewer Area -->
        <div class="lg:col-span-8">
          <div v-if="studyInstanceUID" class="bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-slate-800" style="height: 620px;">
            <iframe :src="ohifStudyUrl" class="w-full h-full border-0" title="DICOM Viewer" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
          </div>

          <div v-else class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" class="text-amber-500"><polygon points="12 2 2 22 22 22"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 class="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-1">Gambar Belum Tersedia</h3>
              <p class="text-sm text-slate-500">Studi DICOM dengan No. Aksesi <span class="font-bold font-mono text-cyan-600">{{ order.accessionNumber }}</span> belum ditemukan di PACS.</p>
              <p v-if="studyCheckError" class="text-xs text-red-500 mt-1">{{ studyCheckError }}</p>
            </div>
            <div class="flex items-center justify-center gap-3 mb-4">
              <button @click="checkStudyStatus" :disabled="checkingStudy" class="btn-secondary flex items-center gap-2 text-sm">
                <svg :class="checkingStudy ? 'animate-spin' : ''" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Coba Lagi
              </button>
              <button @click="loadRecentStudies" :disabled="loadingRecent" class="btn-secondary flex items-center gap-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Studi Terbaru di PACS
              </button>
            </div>
            <div v-if="recentStudies.length > 0" class="border-t border-slate-100 dark:border-slate-800 pt-5">
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pilih dari Orthanc:</p>
              <div class="space-y-2">
                <div v-for="study in recentStudies" :key="study.orthancId" class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div>
                    <div class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ study.patientName }}</div>
                    <div class="text-xs text-slate-500 flex gap-3 mt-0.5">
                      <span>📅 {{ formatDicomDate(study.studyDate) }}</span>
                      <span>🔑 {{ study.accessionNumber || '-' }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2 ml-3 flex-shrink-0">
                    <a :href="`${ohifBaseUrl}/viewer?StudyInstanceUIDs=${study.studyInstanceUID}`" target="_blank" class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">Lihat</a>
                    <button @click="useStudy(study.studyInstanceUID)" class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-colors">Pakai</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="loadingRecent" class="flex items-center justify-center py-6 gap-2 text-slate-400">
              <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span class="text-sm">Memuat studi dari PACS...</span>
            </div>
          </div>
        </div>

        <!-- Panel Kanan -->
        <div class="lg:col-span-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden" style="height: 620px; display: flex; flex-direction: column;">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 class="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                <svg class="text-cyan-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Hasil Bacaan (Expertise)
              </h3>
              <div class="text-xs mt-1" :class="order.expertise ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'">
                ● {{ order.expertise ? 'Sudah Dibaca' : 'Belum Dibaca' }}
              </div>
            </div>

            <!-- ═══ MODE HISTORY: READ-ONLY ═══ -->
            <div v-if="isHistoryMode" class="flex-1 overflow-y-auto px-5 py-4">
              <div v-if="order.expertise">
                <!-- Tampilan read-only expertise -->
                <div class="mb-4">
                  <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Dokter Radiologi</div>
                  <div class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ order.expertise.doctorName || getDoctorName(order.expertise.doctorId) }}</div>
                </div>
                <div class="mb-4">
                  <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Temuan (Findings)</div>
                  <div class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-3 whitespace-pre-wrap">{{ order.expertise.findings }}</div>
                </div>
                <div class="mb-5">
                  <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Kesan (Conclusions)</div>
                  <div class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-3 whitespace-pre-wrap">{{ order.expertise.conclusions }}</div>
                </div>

                <!-- Kembalikan ke Antrean Bacaan -->
                <div class="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <p class="text-xs text-slate-400 mb-3 leading-relaxed">Perlu koreksi hasil bacaan? Kembalikan ke Antrean Bacaan agar dokter radiologi dapat mengedit.</p>
                  <button @click="returnToQueue" :disabled="returningToQueue" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                    {{ returningToQueue ? 'Memproses...' : 'Kembalikan ke Antrean Bacaan' }}
                  </button>
                </div>
              </div>
              <div v-else class="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p class="text-sm font-medium">Belum ada hasil bacaan</p>
              </div>
            </div>

            <!-- ═══ MODE EXPERTISE: EDITABLE FORM ═══ -->
            <div v-else class="flex-1 overflow-y-auto px-5 py-4">
              <form @submit.prevent="saveExpertise" class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="form-label text-xs mb-0">Dokter Radiologi <span class="text-red-500">*</span></label>
                    <!-- Language Selector for Dictation -->
                    <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                      <span class="text-slate-400 px-1">🎙️ Bahasa:</span>
                      <button type="button" @click="speechLang = 'id-ID'" :class="speechLang === 'id-ID' ? 'bg-cyan-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'" class="px-1.5 py-0.5 rounded transition-all">ID</button>
                      <button type="button" @click="speechLang = 'en-US'" :class="speechLang === 'en-US' ? 'bg-cyan-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'" class="px-1.5 py-0.5 rounded transition-all">EN</button>
                    </div>
                  </div>
                  <select v-model="form.doctorId" class="form-input text-sm font-medium" required>
                    <option value="" disabled>-- Pilih Dokter Pembaca --</option>
                    <option v-for="d in doctorsList" :key="d.id" :value="d.id">{{ d.fullName }}</option>
                  </select>
                </div>

                <!-- ── FIELD 1: Temuan (Findings) ── -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="form-label text-xs mb-0 font-bold">Temuan (Findings) <span class="text-red-500">*</span></label>
                    
                    <div class="flex items-center gap-1.5">
                      <!-- Tombol Template Cepat Temuan -->
                      <div class="relative">
                        <button type="button" @click="showTemplateMenu = showTemplateMenu === 'findings' ? null : 'findings'" class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors">
                          <span>⚡ Template</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <!-- Dropdown Template -->
                        <div v-if="showTemplateMenu === 'findings'" class="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-30 space-y-1">
                          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Pilih Frasa Cepat:</div>
                          <button type="button" v-for="(tpl, idx) in findingTemplates" :key="idx" @click="applyTemplate('findings', tpl.text)" class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-600 transition-colors">
                            {{ tpl.label }}
                          </button>
                        </div>
                      </div>

                      <!-- Tombol Mic Dikte Temuan -->
                      <button 
                        type="button" 
                        @click="toggleDictation('findings')"
                        :class="isDictating && activeField === 'findings' ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300' : 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800'"
                        class="text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-all">
                        <span v-if="isDictating && activeField === 'findings'" class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                        {{ isDictating && activeField === 'findings' ? 'Berhenti Dikte' : '🎙️ Dikte' }}
                      </button>
                    </div>
                  </div>

                  <!-- Banner Status Dikte Aktif -->
                  <div v-if="isDictating && activeField === 'findings'" class="mb-1.5 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between text-xs text-red-700 dark:text-red-300">
                    <div class="flex items-center gap-2">
                      <span class="relative flex h-2.5 w-2.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span class="font-bold">Mendengarkan suara dokter... (Bicara sekarang)</span>
                    </div>
                    <span class="text-[10px] font-mono opacity-75">{{ speechLang === 'id-ID' ? 'ID' : 'EN' }}</span>
                  </div>

                  <div class="relative">
                    <textarea 
                      ref="findingsInputRef"
                      v-model="form.findings" 
                      class="form-input text-sm resize-none leading-relaxed transition-all" 
                      :class="isDictating && activeField === 'findings' ? 'ring-2 ring-red-400 border-red-400 bg-red-50/20' : ''"
                      style="height: 160px;" 
                      placeholder="Ketikkan atau klik tombol 🎙️ Dikte untuk mengisi temuan klinis..." 
                      required></textarea>
                    
                    <button v-if="form.findings" type="button" @click="form.findings = ''" class="absolute bottom-2 right-2 text-[10px] text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors" title="Kosongkan">
                      ✕ Clear
                    </button>
                  </div>
                </div>

                <!-- ── FIELD 2: Kesan (Conclusions) ── -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="form-label text-xs mb-0 font-bold">Kesan (Conclusions) <span class="text-red-500">*</span></label>
                    
                    <div class="flex items-center gap-1.5">
                      <!-- Tombol Template Cepat Kesan -->
                      <div class="relative">
                        <button type="button" @click="showTemplateMenu = showTemplateMenu === 'conclusions' ? null : 'conclusions'" class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors">
                          <span>⚡ Template</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <!-- Dropdown Template -->
                        <div v-if="showTemplateMenu === 'conclusions'" class="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-30 space-y-1">
                          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Pilih Kesan Cepat:</div>
                          <button type="button" v-for="(tpl, idx) in conclusionTemplates" :key="idx" @click="applyTemplate('conclusions', tpl.text)" class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-600 transition-colors">
                            {{ tpl.label }}
                          </button>
                        </div>
                      </div>

                      <!-- Tombol Mic Dikte Kesan -->
                      <button 
                        type="button" 
                        @click="toggleDictation('conclusions')"
                        :class="isDictating && activeField === 'conclusions' ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300' : 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800'"
                        class="text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-all">
                        <span v-if="isDictating && activeField === 'conclusions'" class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                        {{ isDictating && activeField === 'conclusions' ? 'Berhenti Dikte' : '🎙️ Dikte' }}
                      </button>
                    </div>
                  </div>

                  <!-- Banner Status Dikte Aktif -->
                  <div v-if="isDictating && activeField === 'conclusions'" class="mb-1.5 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between text-xs text-red-700 dark:text-red-300">
                    <div class="flex items-center gap-2">
                      <span class="relative flex h-2.5 w-2.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span class="font-bold">Mendengarkan kesimpulan dokter...</span>
                    </div>
                    <span class="text-[10px] font-mono opacity-75">{{ speechLang === 'id-ID' ? 'ID' : 'EN' }}</span>
                  </div>

                  <div class="relative">
                    <textarea 
                      ref="conclusionsInputRef"
                      v-model="form.conclusions" 
                      class="form-input text-sm resize-none font-semibold leading-relaxed transition-all" 
                      :class="isDictating && activeField === 'conclusions' ? 'ring-2 ring-red-400 border-red-400 bg-red-50/20' : ''"
                      style="height: 95px;" 
                      placeholder="Ketikkan atau klik tombol 🎙️ Dikte untuk kesimpulan diagnosa..." 
                      required></textarea>
                    
                    <button v-if="form.conclusions" type="button" @click="form.conclusions = ''" class="absolute bottom-2 right-2 text-[10px] text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors" title="Kosongkan">
                      ✕ Clear
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn-primary w-full" :disabled="saving">
                  {{ saving ? 'Menyimpan...' : 'Simpan Bacaan' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 text-slate-500 font-medium">Data order tidak ditemukan.</div>

    <Transition name="toast">
      <div v-if="toastMessage" class="toast" :class="toastType === 'success' ? 'toast-success' : 'toast-error'">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import API_BASE from '../config/api'

const route  = useRoute()
const router = useRouter()
const orderId = route.params.id

// Deteksi mode: 'history' = read-only | 'expertise' atau default = editable
const isHistoryMode = computed(() => route.query.from === 'history')

const API_ORDER    = `${API_BASE}/api/orders/${orderId}`
const API_EXPERTISE = `${API_BASE}/api/orders/${orderId}/expertise`
const API_STUDY    = `${API_BASE}/api/orders/${orderId}/study-status`
const API_DOCTORS  = `${API_BASE}/api/doctors`
const API_RECENT   = `${API_BASE}/api/orders/recent-studies`

const ohifBaseUrl = computed(() => `http://${window.location.hostname}:3001`)

const order        = ref<any>(null)
const doctorsList  = ref<any[]>([])
const loading      = ref(true)
const saving       = ref(false)
const returningToQueue = ref(false)

const studyInstanceUID = ref<string | null>(null)
const checkingStudy    = ref(false)
const studyCheckError  = ref('')
const recentStudies    = ref<any[]>([])
const loadingRecent    = ref(false)

const toastMessage = ref('')
const toastType    = ref<'success' | 'error'>('success')
const form = ref({ doctorId: '' as any, findings: '', conclusions: '' })

// ══════════════════════════════════════════════════════════════════
// 🎙️ VOICE-TO-TEXT (CHROME / WEB SPEECH API) & TEMPLATES
// ══════════════════════════════════════════════════════════════════
const isDictating = ref(false)
const activeField = ref<'findings' | 'conclusions' | null>(null)
const speechLang  = ref<'id-ID' | 'en-US'>('id-ID')
const showTemplateMenu = ref<'findings' | 'conclusions' | null>(null)
const findingsInputRef = ref<HTMLTextAreaElement | null>(null)
const conclusionsInputRef = ref<HTMLTextAreaElement | null>(null)

let recognition: any = null

// Template Cepat Temuan (Findings)
const findingTemplates = [
  {
    label: "🫁 Thorax Normal",
    text: "Cor: Bentuk dan ukuran dalam batas normal (CTR < 50%).\nPulmo: Corakan bronkovaskuler dalam batas normal, tidak tampak infiltrat maupun konsolidasi pada kedua lapang paru.\nSinus costophrenicus kanan dan kiri lancip.\nDiafragma kanan dan kiri licin dan reguler.\nSkeletal dan soft tissue intak."
  },
  {
    label: "🫀 Kardiomegali",
    text: "Cor: Membesar ke lateral kiri dengan apeks tertanam (CTR > 50%), aorta normal.\nPulmo: Corakan bronkovaskuler normal, tidak tampak tanda-tanda bendungan paru.\nSinus costophrenicus kanan dan kiri lancip.\nDiafragma licin dan reguler."
  },
  {
    label: "🦠 Infiltrat Paru / Pneumonia",
    text: "Cor: Bentuk dan ukuran dalam batas normal.\nPulmo: Corakan bronkovaskuler meningkat. Tampak bercak-bercak infiltrat/konsolidasi pada lapang paru.\nSinus costophrenicus kanan dan kiri lancip.\nDiafragma licin."
  },
  {
    label: "🦴 Skeletal / Tulang Intak",
    text: "Struktur tulang dan densitas tulang dalam batas normal. Tidak tampak fraktur, destruksi, maupun dislokasi. Celah sendi normal. Soft tissue dalam batas normal."
  }
]

// Template Cepat Kesan (Conclusions)
const conclusionTemplates = [
  {
    label: "✅ Foto Thorax Normal",
    text: "Cor dan Pulmo dalam batas normal (Tidak tampak kelainan radiologis aktif pada thorax)."
  },
  {
    label: "🫀 Kardiomegali",
    text: "Kardiomegali tanpa bendungan paru (CTR > 50%)."
  },
  {
    label: "🦠 Gambaran Pneumonia",
    text: "Gambaran Pneumonia / Infiltrat paru aktif."
  },
  {
    label: "🦴 Tidak Tampak Fraktur",
    text: "Tidak tampak fraktur maupun dislokasi pada pemeriksaan radiologi."
  }
]

const applyTemplate = (field: 'findings' | 'conclusions', text: string) => {
  if (field === 'findings') {
    form.value.findings = form.value.findings ? `${form.value.findings}\n\n${text}` : text
  } else {
    form.value.conclusions = form.value.conclusions ? `${form.value.conclusions}\n\n${text}` : text
  }
  showTemplateMenu.value = null
  showToast(`Template ${field === 'findings' ? 'Temuan' : 'Kesan'} diterapkan!`)
}

// Inisialisasi Web Speech Recognition
const initSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) return null

  const recog = new SpeechRecognition()
  recog.continuous = true
  recog.interimResults = true
  recog.lang = speechLang.value

  recog.onstart = () => {
    isDictating.value = true
  }

  recog.onresult = (event: any) => {
    let finalTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
      }
    }

    if (finalTranscript) {
      const trimmed = finalTranscript.trim()
      // Kapitalisasi awal kalimat
      const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)

      if (activeField.value === 'findings') {
        const current = form.value.findings.trim()
        form.value.findings = current ? `${current} ${formatted}.` : `${formatted}.`
      } else if (activeField.value === 'conclusions') {
        const current = form.value.conclusions.trim()
        form.value.conclusions = current ? `${current} ${formatted}.` : `${formatted}.`
      }
    }
  }

  recog.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error)
    if (event.error === 'not-allowed') {
      showToast('Izin akses microphone ditolak. Izinkan mic di browser Chrome Anda.', 'error')
    } else if (event.error !== 'no-speech') {
      showToast(`Dikte suara: ${event.error}`, 'error')
    }
    stopDictation()
  }

  recog.onend = () => {
    // Jika masih dalam status mendikte dan tidak dihentikan manual, jangan langsung mati mendadak
    isDictating.value = false
    activeField.value = null
  }

  return recog
}

const toggleDictation = (field: 'findings' | 'conclusions') => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    showToast('Browser Anda belum mendukung Web Speech API. Gunakan Google Chrome atau Microsoft Edge.', 'error')
    return
  }

  // Jika sedang mendikte di field yang sama, stop
  if (isDictating.value && activeField.value === field) {
    stopDictation()
    return
  }

  // Jika sedang mendikte di field lain, stop dulu lalu mulai di field baru
  if (isDictating.value) {
    stopDictation()
  }

  activeField.value = field
  recognition = initSpeechRecognition()

  if (recognition) {
    try {
      recognition.lang = speechLang.value
      recognition.start()
      showToast(`🎙️ Dikte aktif untuk ${field === 'findings' ? 'Temuan' : 'Kesan'} (${speechLang.value === 'id-ID' ? 'Bahasa Indonesia' : 'English'})`)
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err)
      stopDictation()
    }
  }
}

const stopDictation = () => {
  if (recognition) {
    try { recognition.stop() } catch {}
  }
  isDictating.value = false
  activeField.value = null
}

const ohifStudyUrl = computed(() =>
  studyInstanceUID.value ? `${ohifBaseUrl.value}/viewer?StudyInstanceUIDs=${studyInstanceUID.value}` : ''
)

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg; toastType.value = type
  setTimeout(() => toastMessage.value = '', 3000)
}

const goBack = () => isHistoryMode.value ? router.push('/admin/history') : router.push('/admin/expertise-worklist')
const openOhifNewTab = () => window.open(ohifStudyUrl.value, '_blank')
const formatDicomDate = (d: string) => !d || d.length < 8 ? '-' : `${d.substring(6,8)}/${d.substring(4,6)}/${d.substring(0,4)}`
const getDoctorName = (id: number) => doctorsList.value.find(d => d.id === id)?.fullName || `Dokter #${id}`

const checkStudyStatus = async () => {
  checkingStudy.value = true; studyCheckError.value = ''
  try {
    const res = await axios.get(API_STUDY)
    const data = res.data.data
    studyInstanceUID.value = data.found ? data.studyInstanceUID : null
    if (!data.found) studyCheckError.value = 'Gambar belum ditemukan di PACS (No. Aksesi tidak cocok).'
  } catch { studyCheckError.value = 'Orthanc tidak dapat dijangkau.' }
  finally { checkingStudy.value = false }
}

const loadRecentStudies = async () => {
  loadingRecent.value = true
  try { recentStudies.value = (await axios.get(API_RECENT)).data.data }
  catch { showToast('Gagal memuat studi terbaru', 'error') }
  finally { loadingRecent.value = false }
}

const useStudy = (uid: string) => {
  studyInstanceUID.value = uid; recentStudies.value = []
  showToast('Studi berhasil dipilih!')
}

const fetchData = async () => {
  loading.value = true
  try {
    const [resDocs, resOrder] = await Promise.all([axios.get(API_DOCTORS), axios.get(API_ORDER)])
    doctorsList.value = resDocs.data.data
    order.value = resOrder.data.data
    if (order.value.expertise && !isHistoryMode.value) {
      form.value.doctorId    = order.value.expertise.doctorId
      form.value.findings    = order.value.expertise.findings
      form.value.conclusions = order.value.expertise.conclusions
    }
    await checkStudyStatus()
  } catch { showToast('Gagal memuat detail data', 'error') }
  finally { loading.value = false }
}

const saveExpertise = async () => {
  if (isDictating.value) stopDictation()
  saving.value = true
  try {
    await axios.post(API_EXPERTISE, {
      doctorId: Number(form.value.doctorId),
      findings: form.value.findings,
      conclusions: form.value.conclusions
    })
    showToast('Expertise berhasil disimpan!')
    fetchData()
  } catch { showToast('Terjadi kesalahan saat menyimpan', 'error') }
  finally { saving.value = false }
}

// Kembalikan ke Antrean Bacaan (hapus expertise)
const returnToQueue = async () => {
  if (!confirm('Yakin ingin menghapus hasil bacaan ini dan mengembalikannya ke Antrean Bacaan?')) return
  returningToQueue.value = true
  try {
    await axios.delete(`${API_BASE}/api/orders/${orderId}/expertise`)
    showToast('Order dikembalikan ke Antrean Bacaan!')
    setTimeout(() => router.push('/admin/history'), 1500)
  } catch { showToast('Gagal mengembalikan ke antrean', 'error') }
  finally { returningToQueue.value = false }
}

onMounted(fetchData)
onUnmounted(() => {
  if (isDictating.value) stopDictation()
})
</script>
