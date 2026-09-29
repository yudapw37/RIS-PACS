<template>
  <div class="space-y-6">
    
    <!-- ── HEADER BANNER ── -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-900/40 shadow-xl">
      <div class="relative z-10 max-w-4xl">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            RESTful API v3
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            HL7 FHIR R4 & DICOM Ready
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Bridging SIMRS Interoperability
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Katalog API & Panduan Bridging SIMRS
        </h1>
        <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          Dokumentasi teknis antarmuka REST API SmartRIS untuk mempermudah tim IT dan vendor SIMRS melakukan integrasi dua arah: pengiriman order radiologi, sinkronisasi NIK & ID ServiceRequest, pemantauan status pemeriksaan, penarikan ekspertise dokter, hingga pembukaan citra DICOM viewer.
        </p>

        <!-- Quick Integration Spec Badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/60 text-xs">
          <div>
            <p class="text-slate-400 font-semibold">Base URL API</p>
            <p class="font-mono font-bold text-cyan-300 truncate mt-0.5">{{ apiBaseUrl }}</p>
          </div>
          <div>
            <p class="text-slate-400 font-semibold">Tipe Autentikasi</p>
            <p class="font-bold text-slate-200 mt-0.5">Bearer Token (JWT)</p>
          </div>
          <div>
            <p class="text-slate-400 font-semibold">Format Payload</p>
            <p class="font-bold text-slate-200 mt-0.5">application/json</p>
          </div>
          <div>
            <p class="text-slate-400 font-semibold">Integrasi SATUSEHAT</p>
            <p class="font-bold text-emerald-400 mt-0.5">Auto ServiceRequest & DICOM</p>
          </div>
        </div>
      </div>

      <!-- Background decorative glow -->
      <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute right-40 -top-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
    </div>

    <!-- ── SEARCH & CATEGORY FILTER ── -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
            selectedCategory === cat.id
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500'
          ]"
        >
          {{ cat.name }} ({{ getCategoryCount(cat.id) }})
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative min-w-[260px]">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari endpoint, method, atau URL..." 
          class="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-3 text-slate-400" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>

    <!-- ── ENDPOINTS CARD GRID ── -->
    <div v-if="filteredEndpoints.length === 0" class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <p class="font-bold text-slate-700 dark:text-slate-300 text-sm">Tidak ada endpoint yang cocok</p>
      <p class="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="ep in filteredEndpoints" 
        :key="ep.id"
        @click="openDetail(ep)"
        class="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
      >
        <div>
          <!-- Top Row: Method & Category -->
          <div class="flex items-center justify-between mb-3">
            <span :class="['px-2.5 py-1 rounded-lg text-xs font-black tracking-wide border', getMethodClass(ep.method)]">
              {{ ep.method }}
            </span>
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {{ ep.categoryName }}
            </span>
          </div>

          <!-- Title & Description -->
          <h3 class="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {{ ep.title }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {{ ep.description }}
          </p>

          <!-- Endpoint URL Bar -->
          <div class="mt-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-800 flex items-center justify-between group-hover:bg-cyan-50/40 dark:group-hover:bg-cyan-950/20 transition-colors">
            <code class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate" :title="ep.path">
              {{ ep.path }}
            </code>
            <button 
              @click.stop="copyText(ep.path)" 
              class="text-slate-400 hover:text-cyan-600 p-1 transition"
              title="Salin path URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>

          <!-- Feature Tags -->
          <div class="flex flex-wrap gap-1.5 mt-3">
            <span 
              v-for="tag in ep.tags" 
              :key="tag"
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
          <span>Buka Detail & Contoh Payload</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>

    <!-- ── MODAL DETAIL ENDPOINT (WIDE & COMPREHENSIVE) ── -->
    <Transition name="modal">
      <div v-if="selectedEndpoint" class="modal-backdrop !p-2 sm:!p-4" @click.self="selectedEndpoint = null">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-[96vw] max-w-[1400px] h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span :class="['px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide border', getMethodClass(selectedEndpoint.method)]">
                  {{ selectedEndpoint.method }}
                </span>
                <span class="text-xs font-semibold text-slate-400">
                  {{ selectedEndpoint.categoryName }}
                </span>
                <span v-if="selectedEndpoint.authRequired" class="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                  Auth Required
                </span>
              </div>
              <h2 class="text-xl font-black text-slate-800 dark:text-slate-100">
                {{ selectedEndpoint.title }}
              </h2>
              <div class="mt-2 flex items-center gap-2">
                <code class="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 select-all">
                  {{ selectedEndpoint.method }} {{ apiBaseUrl }}{{ selectedEndpoint.path }}
                </code>
                <button 
                  @click="copyText(`${apiBaseUrl}${selectedEndpoint.path}`)" 
                  class="text-xs font-bold text-slate-500 hover:text-cyan-600 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Salin URL
                </button>
              </div>
            </div>

            <button @click="selectedEndpoint = null" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Description & Usage Note -->
          <div class="py-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed shrink-0 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl my-3 border border-slate-200/60 dark:border-slate-800">
            <span class="font-bold text-slate-800 dark:text-slate-200">Panduan Integrasi:</span>
            {{ selectedEndpoint.fullDescription || selectedEndpoint.description }}
          </div>

          <!-- Modal Tabs Switcher -->
          <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0 overflow-x-auto scrollbar-none">
            <button 
              type="button"
              @click="activeModalTab = 'request'"
              :class="['px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap', activeModalTab === 'request' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800']"
            >
              1. Request Body (JSON)
            </button>
            <button 
              type="button"
              @click="activeModalTab = 'response'"
              :class="['px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap', activeModalTab === 'response' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800']"
            >
              2. Response Sample (JSON)
            </button>
            <button 
              type="button"
              @click="activeModalTab = 'curl'"
              :class="['px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap', activeModalTab === 'curl' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800']"
            >
              3. Contoh cURL
            </button>
            <button 
              type="button"
              @click="activeModalTab = 'params'"
              :class="['px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap', activeModalTab === 'params' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800']"
            >
              4. Spesifikasi Parameter
            </button>
            <button 
              type="button"
              @click="activeModalTab = 'tester'"
              :class="['px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap', activeModalTab === 'tester' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100']"
            >
              <span>⚡</span> 5. Live Tester (Coba Kirim)
            </button>
          </div>

          <!-- Tab Content (Full Height Scrollable) -->
          <div class="flex-1 min-h-0 pt-4 overflow-y-auto">
            
            <!-- TAB 1: Request Payload -->
            <div v-if="activeModalTab === 'request'" class="h-full flex flex-col">
              <div class="flex items-center justify-between pb-2">
                <span class="text-xs font-bold text-slate-500">Header Wajib: <code class="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-cyan-600">Content-Type: application/json</code> <span v-if="selectedEndpoint.authRequired" class="ml-2 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-cyan-600">Authorization: Bearer &lt;token&gt;</span></span>
                <button @click="copyText(JSON.stringify(selectedEndpoint.requestPayload, null, 2))" class="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Salin JSON Request
                </button>
              </div>
              <pre class="flex-1 p-5 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-auto leading-relaxed select-all border border-slate-800 shadow-inner">{{ JSON.stringify(selectedEndpoint.requestPayload, null, 2) || '// Tidak membutuhkan request body (GET request)' }}</pre>
            </div>

            <!-- TAB 2: Response Payload -->
            <div v-if="activeModalTab === 'response'" class="h-full flex flex-col">
              <div class="flex items-center justify-between pb-2">
                <span class="text-xs font-bold text-slate-500">Status Response: <span class="font-mono text-emerald-500 font-black">HTTP 200 OK / 201 Created</span></span>
                <button @click="copyText(JSON.stringify(selectedEndpoint.responsePayload, null, 2))" class="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Salin JSON Response
                </button>
              </div>
              <pre class="flex-1 p-5 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-auto leading-relaxed select-all border border-slate-800 shadow-inner">{{ JSON.stringify(selectedEndpoint.responsePayload, null, 2) }}</pre>
            </div>

            <!-- TAB 3: cURL Command -->
            <div v-if="activeModalTab === 'curl'" class="h-full flex flex-col">
              <div class="flex items-center justify-between pb-2">
                <span class="text-xs font-bold text-slate-500">Bash / Terminal Command:</span>
                <button @click="copyText(generateCurlCommand(selectedEndpoint))" class="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Salin cURL
                </button>
              </div>
              <pre class="flex-1 p-5 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs overflow-auto leading-relaxed select-all border border-slate-800 shadow-inner whitespace-pre-wrap">{{ generateCurlCommand(selectedEndpoint) }}</pre>
            </div>

            <!-- TAB 4: Parameters Table -->
            <div v-if="activeModalTab === 'params'" class="space-y-4">
              <div v-if="!selectedEndpoint.parameters || selectedEndpoint.parameters.length === 0" class="py-12 text-center text-slate-400 text-xs">
                Tidak ada parameter spesifik untuk endpoint ini.
              </div>
              <div v-else class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th class="px-5 py-3">Parameter / Field</th>
                      <th class="px-5 py-3">Tipe</th>
                      <th class="px-5 py-3">Sifat</th>
                      <th class="px-5 py-3">Deskripsi & Catatan Bridging</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr v-for="param in selectedEndpoint.parameters" :key="param.name" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td class="px-5 py-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {{ param.name }}
                      </td>
                      <td class="px-5 py-3 font-mono text-slate-500">
                        {{ param.type }}
                      </td>
                      <td class="px-5 py-3">
                        <span :class="['px-2 py-0.5 rounded font-bold text-[10px]', param.required ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900' : 'bg-slate-100 text-slate-500']">
                          {{ param.required ? 'Wajib (Required)' : 'Opsional' }}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {{ param.description }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 5: Live Tester -->
            <div v-if="activeModalTab === 'tester'" class="space-y-4">
              <!-- Tester Header Controls -->
              <div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span :class="['px-3 py-2 rounded-xl text-xs font-black tracking-wide border shrink-0', getMethodClass(testMethod)]">
                    {{ testMethod }}
                  </span>
                  <div class="flex-1 relative">
                    <input 
                      v-model="testUrl" 
                      type="text" 
                      class="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 shadow-sm"
                      placeholder="/api/..."
                    />
                  </div>
                  <button 
                    type="button"
                    @click="executeTestRequest" 
                    :disabled="isExecutingTest"
                    class="btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 shrink-0"
                  >
                    <svg v-if="isExecutingTest" class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>{{ isExecutingTest ? 'Mengirim...' : 'Kirim Request' }}</span>
                  </button>
                </div>

                <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input type="checkbox" v-model="testUseAuth" class="rounded text-cyan-600 focus:ring-cyan-500" />
                    <span>Gunakan Token Login Aktif (Otomatis Bearer)</span>
                  </label>
                  <span class="font-mono text-[11px] text-slate-400">Target: {{ apiBaseUrl }}{{ testUrl }}</span>
                </div>
              </div>

              <!-- Request Body Editor (If method != GET) -->
              <div v-if="testMethod !== 'GET'" class="space-y-1.5">
                <div class="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Request Body (JSON Payload):</span>
                  <button type="button" @click="resetTestBody" class="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px]">
                    Reset ke Default Payload
                  </button>
                </div>
                <textarea 
                  v-model="testRequestBody" 
                  rows="7" 
                  class="w-full text-xs font-mono bg-slate-900 text-cyan-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-cyan-500 leading-relaxed shadow-inner resize-y"
                  placeholder="{}"
                ></textarea>
              </div>

              <!-- Test Result Output -->
              <div v-if="testResponse" class="space-y-1.5 pt-2">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-700 dark:text-slate-200">Hasil Respons Server:</span>
                    <span 
                      :class="[
                        'px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-wide border',
                        testResponse.status >= 200 && testResponse.status < 300 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                      ]"
                    >
                      HTTP {{ testResponse.status }} {{ testResponse.statusText }}
                    </span>
                    <span class="font-mono text-[11px] text-slate-400">⏱️ {{ testResponse.duration }} ms</span>
                  </div>
                  <button type="button" @click="copyText(JSON.stringify(testResponse.data, null, 2))" class="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    Salin Respons
                  </button>
                </div>
                <pre class="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-auto max-h-72 leading-relaxed border border-slate-800 shadow-inner select-all">{{ JSON.stringify(testResponse.data, null, 2) }}</pre>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 mt-3">
            <button @click="selectedEndpoint = null" class="btn-cancel text-xs px-6">Tutup</button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ── TOAST NOTIFICATION ── -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast toast-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import axios from 'axios'
import API_BASE from '../config/api'

const apiBaseUrl = computed(() => API_BASE || window.location.origin)

// Toast
const toast = reactive({ show: false, message: '' })
const showToast = (msg: string) => {
  toast.message = msg
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  showToast('Berhasil disalin ke clipboard!')
}

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedEndpoint = ref<any | null>(null)
const activeModalTab = ref<'request' | 'response' | 'curl' | 'params' | 'tester'>('request')

// Tester State
const testMethod = ref('GET')
const testUrl = ref('')
const testRequestBody = ref('')
const testUseAuth = ref(true)
const isExecutingTest = ref(false)
const testResponse = ref<{ status: number; statusText: string; duration: number; data: any } | null>(null)

const openDetail = (ep: any) => {
  selectedEndpoint.value = ep
  activeModalTab.value = ep.requestPayload ? 'request' : 'response'
  
  // Init tester state with endpoint default values
  testMethod.value = ep.method
  testUrl.value = ep.path
  testRequestBody.value = ep.requestPayload ? JSON.stringify(ep.requestPayload, null, 2) : ''
  testUseAuth.value = ep.authRequired !== false
  testResponse.value = null
}

const resetTestBody = () => {
  if (selectedEndpoint.value?.requestPayload) {
    testRequestBody.value = JSON.stringify(selectedEndpoint.value.requestPayload, null, 2)
  } else {
    testRequestBody.value = ''
  }
}

const executeTestRequest = async () => {
  isExecutingTest.value = true
  testResponse.value = null
  const startTime = Date.now()

  try {
    let parsedBody: any = undefined
    if (testMethod.value !== 'GET' && testRequestBody.value.trim()) {
      try {
        parsedBody = JSON.parse(testRequestBody.value)
      } catch (e: any) {
        showToast('Format JSON Body tidak valid! Mohon cek tanda kutip dan koma.')
        isExecutingTest.value = false
        return
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Skip-Auth-Redirect': 'true'
    }
    if (testUseAuth.value) {
      const token = localStorage.getItem('ris_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const targetUrl = `${apiBaseUrl.value}${testUrl.value}`
    
    // Gunakan native window.fetch agar tidak memicu interceptor Axios global
    // Sehingga respons 401 tidak akan menghapus token login aktif ataupun me-redirect ke login
    const fetchOptions: RequestInit = {
      method: testMethod.value,
      headers
    }
    if (testMethod.value !== 'GET' && parsedBody !== undefined) {
      fetchOptions.body = JSON.stringify(parsedBody)
    }

    const response = await fetch(targetUrl, fetchOptions)
    const duration = Date.now() - startTime

    let responseData: any = null
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      const text = await response.text()
      try {
        responseData = JSON.parse(text)
      } catch {
        responseData = text
      }
    }

    testResponse.value = {
      status: response.status,
      statusText: response.statusText || (response.status >= 200 && response.status < 300 ? 'OK' : 'Error'),
      duration,
      data: responseData
    }

    if (response.status >= 200 && response.status < 300) {
      showToast(`Berhasil (${response.status} ${response.statusText || 'OK'})`)
    } else {
      showToast(`Respons Server: HTTP ${response.status}`)
    }
  } catch (err: any) {
    const duration = Date.now() - startTime
    testResponse.value = {
      status: 0,
      statusText: 'Network Error',
      duration,
      data: {
        error: err.message || 'Koneksi ke backend server gagal.',
        tip: 'Pastikan backend server berjalan di port 3000 dan URL target dapat dijangkau.'
      }
    }
    showToast(`Gagal: ${err.message || 'Koneksi gagal'}`)
  } finally {
    isExecutingTest.value = false
  }
}

// Categories
const categories = [
  { id: 'all', name: 'Semua Endpoint' },
  { id: 'auth', name: '1. Autentikasi' },
  { id: 'patient', name: '2. Pasien' },
  { id: 'order', name: '3. Order & ServiceRequest' },
  { id: 'expertise', name: '4. Hasil Ekspertise' },
  { id: 'pacs', name: '5. PACS DICOM & Viewer' },
  { id: 'satusehat', name: '6. SATUSEHAT Gateway' },
]

// Method Class helper
const getMethodClass = (method: string) => {
  switch (method) {
    case 'POST': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    case 'GET': return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
    case 'PUT': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    case 'PATCH': return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    case 'DELETE': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}

// Endpoints Database
const endpoints = [
  // ── 1. AUTH ──
  {
    id: 'auth-login',
    category: 'auth',
    categoryName: 'Autentikasi',
    method: 'POST',
    path: '/api/auth/login',
    title: 'Login & Dapatkan JWT Access Token',
    description: 'SIMRS melakukan autentikasi ke SmartRIS untuk mendapatkan token Bearer yang digunakan pada setiap pemanggilan API.',
    fullDescription: 'Setiap permintaan API dari SIMRS harus menyertakan Header Authorization: Bearer <token>. Token ini berlaku selama sesi operasional.',
    authRequired: false,
    tags: ['Auth', 'JWT', 'Bearer'],
    requestPayload: {
      username: 'superadmin',
      password: 'password123'
    },
    responsePayload: {
      code: 200,
      msg: 'Login Berhasil',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 2,
        username: 'simrs_client',
        role: 'admin'
      }
    },
    parameters: [
      { name: 'username', type: 'string', required: true, description: 'Username akun integrasi SIMRS' },
      { name: 'password', type: 'string', required: true, description: 'Password akun integrasi SIMRS' }
    ]
  },

  // ── 2. PASIEN ──
  {
    id: 'patient-create',
    category: 'patient',
    categoryName: 'Master Pasien',
    method: 'POST',
    path: '/api/patients',
    title: 'Sinkronisasi Pasien Baru (Patient Ingest)',
    description: 'Kirim data demografi pasien dari loket pendaftaran SIMRS ke SmartRIS, lengkap dengan NIK 16 digit untuk interoperabilitas SATUSEHAT.',
    fullDescription: 'Dianjurkan selalu menyertakan NIK 16 digit agar SmartRIS dapat langsung melakukan pencarian otomatis IHS Number Patient ke SATUSEHAT Kemenkes RI.',
    authRequired: true,
    tags: ['Pasien', 'MRN', 'NIK KTP', 'IHS'],
    requestPayload: {
      mrn: 'RM-2026-0089',
      fullName: 'Bambang Sudarsono',
      nik: '3201011508890002',
      gender: 'male',
      dob: '1989-08-15',
      address: 'Jl. Merdeka No. 45, Jakarta Pusat',
      phone: '081234567890'
    },
    responsePayload: {
      code: 201,
      msg: 'Pasien berhasil didaftarkan ke SmartRIS',
      data: {
        id: 12,
        mrn: 'RM-2026-0089',
        fullName: 'Bambang Sudarsono',
        nik: '3201011508890002',
        gender: 'male',
        dob: '1989-08-15',
        ihsNumber: null
      }
    },
    parameters: [
      { name: 'mrn', type: 'string', required: true, description: 'Nomor Rekam Medis unik dari SIMRS' },
      { name: 'fullName', type: 'string', required: true, description: 'Nama lengkap pasien sesuai KTP' },
      { name: 'nik', type: 'string (16 digit)', required: false, description: 'NIK KTP untuk lookup IHS SATUSEHAT (Sangat disarankan)' },
      { name: 'gender', type: 'enum (male, female)', required: true, description: 'Jenis kelamin pasien' },
      { name: 'dob', type: 'string (YYYY-MM-DD)', required: true, description: 'Tanggal lahir pasien' },
      { name: 'address', type: 'string', required: false, description: 'Alamat domisili pasien' }
    ]
  },

  // ── 3. ORDER & SERVICEREQUEST ──
  {
    id: 'order-create',
    category: 'order',
    categoryName: 'Order Radiologi',
    method: 'POST',
    path: '/api/orders',
    title: 'Kirim Order Pemeriksaan Radiologi (ServiceRequest)',
    description: 'Dokter poliklinik / IGD / rawat inap SIMRS membuat permintaan rujukan foto rontgen/CT/USG ke instalasi radiologi SmartRIS.',
    fullDescription: 'Jika SIMRS Anda sudah memiliki ID ServiceRequest dari Kemenkes SATUSEHAT, masukkan ke field `satusehatServiceRequestId`. Jika belum ada, biarkan kosong; SmartRIS akan membuatkannya secara mandiri ke SATUSEHAT.',
    authRequired: true,
    tags: ['Order', 'Accession No', 'ServiceRequest', 'Modality'],
    requestPayload: {
      patientId: 12,
      noReg: 'REG-20260929-001',
      accessionNumber: 'ACC-20260929-001',
      doctorId: 1,
      modalityTypeCode: 'DX',
      bodyPart: 'Thorax PA',
      clinicalInfo: 'Batuk berdarah > 2 minggu, suspek TB Paru aktif',
      priority: 'urgent',
      satusehatServiceRequestId: 'sr-1727589123-simrs'
    },
    responsePayload: {
      code: 201,
      msg: 'Order radiologi berhasil dibuat dan masuk antrean Worklist',
      data: {
        id: 45,
        accessionNumber: 'ACC-20260929-001',
        status: 'scheduled',
        satusehatStatus: 'unmapped',
        satusehatServiceRequestId: 'sr-1727589123-simrs'
      }
    },
    parameters: [
      { name: 'patientId', type: 'number', required: true, description: 'ID Pasien di database SmartRIS' },
      { name: 'noReg', type: 'string', required: true, description: 'Nomor registrasi rawat jalan / rawat inap SIMRS' },
      { name: 'accessionNumber', type: 'string', required: true, description: 'Nomor order radiologi unik (Accession Number DICOM)' },
      { name: 'modalityTypeCode', type: 'string (DX, CT, MR, US, CR)', required: true, description: 'Kode modalitas pemeriksaan radiologi' },
      { name: 'bodyPart', type: 'string', required: false, description: 'Bagian tubuh yang difoto (cth: Thorax PA, Abdomen 3 Posisi)' },
      { name: 'clinicalInfo', type: 'string', required: false, description: 'Indikasi klinis / diagnosis awal rujukan dokter' },
      { name: 'priority', type: 'enum (routine, urgent, stat)', required: false, description: 'Tingkat urgensi order (routine = biasa, urgent/stat = cito)' },
      { name: 'satusehatServiceRequestId', type: 'string', required: false, description: 'ID ServiceRequest dari SIMRS jika sudah di-generate lebih dulu' }
    ]
  },

  // ── 3.2 UPDATE SR ID MANUAL ──
  {
    id: 'order-update-sr',
    category: 'order',
    categoryName: 'Order Radiologi',
    method: 'PUT',
    path: '/api/satusehat/orders/:orderId/service-request-id',
    title: 'Set / Update ID ServiceRequest (SR) dari SIMRS',
    description: 'Menyetor atau memperbarui nomor ID ServiceRequest SATUSEHAT ke order tertentu yang sudah ada di SmartRIS.',
    fullDescription: 'Endpoint ini dipanggil jika SIMRS baru berhasil mendapatkan ID ServiceRequest dari Kemenkes setelah order radiologi terkirim.',
    authRequired: true,
    tags: ['ServiceRequest', 'SIMRS Bridging', 'SATUSEHAT'],
    requestPayload: {
      serviceRequestId: 'sr-10000004-20260929001'
    },
    responsePayload: {
      success: true,
      message: 'ID ServiceRequest berhasil disimpan',
      serviceRequestId: 'sr-10000004-20260929001'
    },
    parameters: [
      { name: ':orderId', type: 'path param (number)', required: true, description: 'ID Order internal SmartRIS' },
      { name: 'serviceRequestId', type: 'string', required: true, description: 'ID resmi FHIR ServiceRequest dari Kemenkes' }
    ]
  },

  // ── 4. STATUS PEMERIKSAAN & DICOM ──
  {
    id: 'order-status',
    category: 'pacs',
    categoryName: 'Status & PACS DICOM',
    method: 'GET',
    path: '/api/orders/:id/study-status',
    title: 'Cek Status Pemeriksaan & Ketersediaan Citra DICOM',
    description: 'SIMRS memeriksa apakah pasien sudah selesai difoto di ruang radiologi dan citra DICOM sudah diterima oleh PACS DCM4CHEE.',
    fullDescription: 'Mengembalikan Study Instance UID DICOM, jumlah frame/series, dan link penampil web viewer jika citra sudah tersedia.',
    authRequired: true,
    tags: ['Status', 'DICOM UID', 'DCM4CHEE', 'Study'],
    requestPayload: null,
    responsePayload: {
      code: 200,
      msg: 'Informasi status study DICOM',
      data: {
        orderId: 45,
        accessionNumber: 'ACC-20260929-001',
        status: 'completed',
        studyAvailable: true,
        studyInstanceUid: '1.2.840.10008.5.1.4.1.1.20260929.45',
        numberOfSeries: 1,
        numberOfInstances: 2,
        viewerUrl: 'http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.10008.5.1.4.1.1.20260929.45'
      }
    },
    parameters: [
      { name: ':id', type: 'path param (number)', required: true, description: 'ID Order di SmartRIS' }
    ]
  },

  // ── 5. EKSPERTISE DOKTER RADIOLOGI ──
  {
    id: 'expertise-get',
    category: 'expertise',
    categoryName: 'Hasil Ekspertise',
    method: 'GET',
    path: '/api/orders/:id/expertise',
    title: 'Tarik Hasil Ekspertise Dokter Radiologi',
    description: 'SIMRS mengambil hasil ekspertise bacaan radiologi (temuan klinis & kesimpulan) untuk dimasukkan ke Rekam Medis Elektronik (RME).',
    fullDescription: 'Hasil ekspertise dilengkapi nama dokter spesialis radiologi yang memvalidasi, tanggal verifikasi, serta status sinkronisasi SATUSEHAT DiagnosticReport.',
    authRequired: true,
    tags: ['Ekspertise', 'Hasil Bacaan', 'DiagnosticReport', 'RME'],
    requestPayload: null,
    responsePayload: {
      code: 200,
      msg: 'Data Ekspertise Ditemukan',
      data: {
        id: 18,
        orderId: 45,
        accessionNumber: 'ACC-20260929-001',
        findings: 'Cor tidak membesar. Pulmo: corakan bronkovaskular bertambah, tampak bercak infiltrat di lapang atas paru kanan. Sinus kostofrenikus lancip.',
        conclusions: 'Kesan: TB Paru Aktif Duplex, Cor dalam batas normal.',
        verifiedAt: '2026-09-29T10:15:00.000Z',
        doctor: {
          id: 1,
          fullName: 'dr. Budi Santoso, Sp.Rad',
          nik: '3201011203750001',
          ihsNumber: 'N10000001'
        },
        satusehatReportId: 'dr-78901234'
      }
    },
    parameters: [
      { name: ':id', type: 'path param (number)', required: true, description: 'ID Order pemeriksaan radiologi' }
    ]
  },

  // ── 6. WEB VIEWER DEEP LINK ──
  {
    id: 'pacs-viewer-link',
    category: 'pacs',
    categoryName: 'Status & PACS DICOM',
    method: 'GET',
    path: 'http://<SERVER_IP>:3001/viewer?StudyInstanceUIDs=:studyUid',
    title: 'URL Deep Link OHIF PACS DICOM Web Viewer',
    description: 'Buka citra radiologi interaktif (zoom, pan, windowing, pengukuran) langsung dari tombol SIMRS tanpa perlu instalasi aplikasi tambahan.',
    fullDescription: 'Dapat dibuka pada browser Google Chrome / Edge dokter di ruang poliklinik atau IGD. Cukup pasang tag iframe atau buka di window baru menggunakan StudyInstanceUID.',
    authRequired: false,
    tags: ['OHIF Viewer', 'DICOM', 'Web PACS', 'Deep Link'],
    requestPayload: null,
    responsePayload: {
      type: 'HTML Web Application (OHIF Medical Viewer v3)',
      viewerUrlExample: 'http://192.168.1.100:3001/viewer?StudyInstanceUIDs=1.2.840.10008.5.1.4.1.1.20260928.1'
    },
    parameters: [
      { name: 'StudyInstanceUIDs', type: 'query param (string)', required: true, description: 'UID unik dari study DICOM yang ingin ditampilkan di viewer' }
    ]
  },

  // ── 7. WEBHOOK DICOM ──
  {
    id: 'webhook-dicom',
    category: 'pacs',
    categoryName: 'Status & PACS DICOM',
    method: 'POST',
    path: '/api/webhooks/dcm4chee/study-received',
    title: 'Webhook Penerima Event DCM4CHEE PACS Store',
    description: 'Endpoint webhook yang dipanggil otomatis oleh PACS DCM4CHEE saat mesin modalitas selesai mengirimkan citra baru.',
    fullDescription: 'SmartRIS otomatis mengaitkan Study Instance UID dengan Accession Number order yang bersangkutan dan memicu persiapan ImagingStudy SATUSEHAT.',
    authRequired: false,
    tags: ['Webhook', 'DCM4CHEE', 'DICOM Router', 'Auto-Trigger'],
    requestPayload: {
      accessionNumber: 'ACC-20260929-001',
      studyInstanceUid: '1.2.840.10008.5.1.4.1.1.20260929.45',
      patientId: 'RM-2026-0089',
      modality: 'DX',
      numberOfInstances: 2
    },
    responsePayload: {
      success: true,
      message: 'DICOM study metadata berhasil dipetakan ke order',
      orderId: 45
    },
    parameters: [
      { name: 'accessionNumber', type: 'string', required: true, description: 'Accession Number tag (0008,0050)' },
      { name: 'studyInstanceUid', type: 'string', required: true, description: 'Study Instance UID tag (0020,000D)' }
    ]
  },

  // ── 8. SATUSEHAT PUSH ORDER ──
  {
    id: 'satusehat-push',
    category: 'satusehat',
    categoryName: 'SATUSEHAT Gateway',
    method: 'POST',
    path: '/api/satusehat/push-order/:orderId',
    title: 'Trigger Sinkronisasi Lengkap ke SATUSEHAT Kemenkes',
    description: 'Memicu pengiriman berantai: ServiceRequest ➔ ImagingStudy ➔ DiagnosticReport langsung ke SATUSEHAT Kemenkes RI.',
    fullDescription: 'Eksekusi ini secara otomatis memvalidasi IHS Pasien dan Dokter, menautkan basedOn ServiceRequest, dan mencatat seluruh request/response di audit log outbox.',
    authRequired: true,
    tags: ['SATUSEHAT', 'ImagingStudy', 'DiagnosticReport', 'Kemenkes'],
    requestPayload: null,
    responsePayload: {
      success: true,
      message: 'Order radiologi berhasil disinkronkan ke SATUSEHAT',
      serviceRequestId: 'sr-1727589123-simrs',
      imagingStudyId: 'is-90823412',
      diagnosticReportId: 'dr-78901234',
      logIds: [102, 103, 104]
    },
    parameters: [
      { name: ':orderId', type: 'path param (number)', required: true, description: 'ID Order di SmartRIS yang akan dikirim ke SATUSEHAT' }
    ]
  }
]

// Filtered endpoints computed
const filteredEndpoints = computed(() => {
  return endpoints.filter(ep => {
    // Filter Category
    if (selectedCategory.value !== 'all' && ep.category !== selectedCategory.value) {
      return false
    }
    // Filter Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchPath = ep.path.toLowerCase().includes(q)
      const matchTitle = ep.title.toLowerCase().includes(q)
      const matchMethod = ep.method.toLowerCase().includes(q)
      const matchDesc = ep.description.toLowerCase().includes(q)
      return matchPath || matchTitle || matchMethod || matchDesc
    }
    return true
  })
})

const getCategoryCount = (catId: string) => {
  if (catId === 'all') return endpoints.length
  return endpoints.filter(e => e.category === catId).length
}

// Generate cURL command sample
const generateCurlCommand = (ep: any) => {
  let cmd = `curl -X ${ep.method} "${apiBaseUrl.value}${ep.path}" \\\n`
  cmd += `  -H "Content-Type: application/json"`
  if (ep.authRequired) {
    cmd += ` \\\n  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
  }
  if (ep.requestPayload) {
    cmd += ` \\\n  -d '${JSON.stringify(ep.requestPayload, null, 2)}'`
  }
  return cmd
}
</script>
