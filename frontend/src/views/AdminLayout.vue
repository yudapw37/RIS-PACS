<template>
  <!-- Main Viewport with Ambient Slate Clinical / Cosmic Medical Background -->
  <div :class="[
    'h-screen w-full flex p-3 lg:p-4 gap-3.5 lg:gap-4 overflow-hidden relative font-sans select-none antialiased transition-colors duration-300',
    isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-200/60 text-slate-800'
  ]">
    
    <!-- Ambient Radial Glow Lights behind Floating Glass Cards -->
    <div :class="['absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none z-0 transition-opacity duration-500', isDark ? 'bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-transparent' : 'bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-transparent opacity-60']"></div>
    <div :class="['absolute -bottom-32 right-10 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none z-0 transition-opacity duration-500', isDark ? 'bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent' : 'bg-gradient-to-tr from-blue-600/8 via-indigo-600/5 to-transparent opacity-60']"></div>
    <div :class="['absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-500', isDark ? 'bg-teal-500/5' : 'bg-teal-500/5 opacity-40']"></div>

    <!-- Mobile Drawer Overlay Backdrop -->
    <div 
      v-if="isMobileSidebarOpen" 
      @click="isMobileSidebarOpen = false" 
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
    ></div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- FLOATING SIDEBAR ISLAND                                           -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <aside 
      :class="[
        'h-full rounded-3xl backdrop-blur-2xl flex flex-col transition-all duration-300 z-50 shrink-0 relative overflow-hidden',
        isDark 
          ? 'bg-[#070e1d]/85 border border-cyan-500/20 text-slate-100 shadow-2xl' 
          : 'bg-white/85 border border-slate-200/90 text-slate-800 shadow-xl shadow-slate-300/40',
        // Desktop width states
        isCollapsed ? 'lg:w-[84px]' : 'lg:w-72',
        // Mobile fixed drawer states
        isMobileSidebarOpen 
          ? 'fixed top-3 bottom-3 left-3 w-[290px] translate-x-0 shadow-2xl' 
          : 'fixed top-3 bottom-3 left-3 w-[290px] -translate-x-[110%] lg:translate-x-0 lg:static'
      ]"
    >
      <!-- Top Branding Area -->
      <div :class="['h-20 flex items-center justify-between px-5 shrink-0 transition-colors', isDark ? 'border-b border-white/[0.08] bg-white/[0.02]' : 'border-b border-slate-200/80 bg-slate-50/60']">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Radiology Aperture Logo Icon -->
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 shrink-0 group cursor-pointer relative overflow-hidden">
            <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <!-- High-tech Aperture / Pulse Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm animate-pulse-slow">
              <circle cx="12" cy="12" r="10" stroke-width="1.8" stroke-dasharray="4 2"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 9v6m-3-3h6"/>
            </svg>
          </div>

          <!-- Brand Text (Hidden when collapsed on desktop) -->
          <div v-show="!isCollapsed || isMobileSidebarOpen" class="min-w-0 transition-opacity duration-200">
            <div class="flex items-center gap-1.5">
              <span :class="['font-black text-lg tracking-tight', isDark ? 'text-white' : 'text-slate-800']">Smart<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500">RIS</span></span>
              <span class="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shadow-sm">v3.5</span>
            </div>
            <p :class="['text-[10px] font-semibold tracking-wide truncate', isDark ? 'text-slate-400' : 'text-slate-500']">PACS & Radiology Network</p>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button 
          @click="isMobileSidebarOpen = false" 
          :class="['lg:hidden p-2 rounded-xl transition-colors', isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Navigation Links Container -->
      <div class="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin">

        <!-- Group: Dashboard -->
        <div>
          <p v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-group-title">Menu Utama</p>
          <div class="space-y-1">
            <router-link 
              to="/admin" 
              exact-active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Dashboard Utama' : ''"
            >
              <div class="sidebar-icon-box text-cyan-400 group-hover:text-cyan-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Dashboard Utama</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Master Data -->
        <div>
          <p v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-group-title">Master Data</p>
          <div class="space-y-1">
            <router-link 
              to="/admin/patients" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Data Pasien' : ''"
            >
              <div class="sidebar-icon-box text-teal-400 group-hover:text-teal-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Data Pasien</span>
            </router-link>

            <router-link 
              to="/admin/doctors" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Dokter Radiologi' : ''"
            >
              <div class="sidebar-icon-box text-blue-400 group-hover:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Dokter Radiologi</span>
            </router-link>

            <!-- Parent: Alat & Modality (collapsible sub-menu) -->
            <div>
              <button
                @click="isModalityExpanded = !isModalityExpanded"
                :class="['sidebar-link group w-full text-left justify-between', isModalityActive ? 'sidebar-active' : '']"
                :title="isCollapsed ? 'Alat & Modality' : ''"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sidebar-icon-box text-indigo-400 group-hover:text-indigo-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Alat & Modality</span>
                </div>
                <svg 
                  v-show="!isCollapsed || isMobileSidebarOpen"
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  :class="['transition-transform duration-200 text-slate-400 shrink-0', isModalityExpanded ? 'rotate-180 text-cyan-400' : '']"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <!-- Sub-items for Modality -->
              <div v-if="isModalityExpanded && (!isCollapsed || isMobileSidebarOpen)" class="ml-4 mt-1.5 space-y-1 border-l-2 border-indigo-500/30 pl-3">
                <router-link to="/admin/modalities" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  <span>Daftar Modality</span>
                </router-link>

                <router-link to="/admin/modality-logs" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Log Modality (PACS)</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Group: Order & Worklist -->
        <div>
          <p v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-group-title">Pelayanan Radiologi</p>
          <div class="space-y-1">
            <!-- Parent: Manajemen Order (collapsible) -->
            <div>
              <button
                @click="isOrderExpanded = !isOrderExpanded"
                :class="['sidebar-link group w-full text-left justify-between', isOrderActive ? 'sidebar-active' : '']"
                :title="isCollapsed ? 'Alur Kerja Radiologi' : ''"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sidebar-icon-box text-amber-400 group-hover:text-amber-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                  </div>
                  <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Alur Order Radiologi</span>
                </div>
                <svg 
                  v-show="!isCollapsed || isMobileSidebarOpen"
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  :class="['transition-transform duration-200 text-slate-400 shrink-0', isOrderExpanded ? 'rotate-180 text-cyan-400' : '']"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <!-- Sub-items -->
              <div v-if="isOrderExpanded && (!isCollapsed || isMobileSidebarOpen)" class="ml-4 mt-1.5 space-y-1 border-l-2 border-cyan-500/30 pl-3">
                <router-link to="/admin/orders" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  <span>Semua Order</span>
                </router-link>

                <router-link to="/admin/examination-worklist" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Antrean Tindakan</span>
                  <span class="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                </router-link>

                <router-link to="/admin/expertise-worklist" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Antrean Ekspertise</span>
                  <span class="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                </router-link>
              </div>
            </div>

            <router-link 
              to="/admin/history" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Riwayat Order' : ''"
            >
              <div class="sidebar-icon-box text-slate-400 group-hover:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Riwayat Order Selesai</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Laporan -->
        <div>
          <p v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-group-title">Laporan & Evaluasi</p>
          <div class="space-y-1">
            <router-link 
              to="/admin/reports" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Laporan Statistik' : ''"
            >
              <div class="sidebar-icon-box text-emerald-400 group-hover:text-emerald-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Laporan Statistik</span>
            </router-link>

            <router-link 
              to="/admin/reports/waiting-time" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Waktu Tunggu Pasien' : ''"
            >
              <div class="sidebar-icon-box text-amber-400 group-hover:text-amber-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Waktu Tunggu Pasien</span>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">TAT</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Interoperabilitas -->
        <div>
          <p v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-group-title">Integrasi Nasional</p>
          <div class="space-y-1">
            <router-link 
              to="/admin/satusehat" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'SATUSEHAT Gateway' : ''"
            >
              <div class="sidebar-icon-box text-teal-400 group-hover:text-teal-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">SATUSEHAT Gateway</span>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">FHIR</span>
            </router-link>

            <router-link 
              to="/admin/api-docs" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Dokumentasi API SIMRS' : ''"
            >
              <div class="sidebar-icon-box text-cyan-400 group-hover:text-cyan-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Dokumentasi API SIMRS</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Sistem -->
        <div>
          <p v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-group-title">Sistem & Bantuan</p>
          <div class="space-y-1">
            <router-link 
              to="/admin/system-info" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Info Server & PACS' : ''"
            >
              <div class="sidebar-icon-box text-indigo-400 group-hover:text-indigo-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Info Server & PACS</span>
            </router-link>

            <router-link 
              to="/admin/helpdesk" 
              active-class="sidebar-active" 
              class="sidebar-link group"
              :title="isCollapsed ? 'Panduan Penggunaan' : ''"
            >
              <div class="sidebar-icon-box text-violet-400 group-hover:text-violet-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span v-show="!isCollapsed || isMobileSidebarOpen" class="sidebar-link-text">Panduan Penggunaan</span>
            </router-link>
          </div>
        </div>

      </div>

      <!-- Bottom User Profile Card (No top border line, no logout button) -->
      <div class="p-3 shrink-0">
        <div :class="['flex items-center gap-3 p-2.5 rounded-2xl transition-all', isDark ? 'bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30' : 'bg-slate-100/90 border border-slate-200/90 hover:border-cyan-500/40 shadow-sm']">
          <div class="relative shrink-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/20 border border-cyan-400/30">
              {{ userInitials }}
            </div>
            <span :class="['absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 animate-pulse', isDark ? 'border-slate-900' : 'border-white']" title="Status: Online"></span>
          </div>

          <div v-show="!isCollapsed || isMobileSidebarOpen" class="flex-1 min-w-0 transition-opacity duration-200">
            <p :class="['text-xs font-bold truncate', isDark ? 'text-white' : 'text-slate-800']">{{ userName }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 truncate">
                {{ userRole }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- MAIN WORKSPACE: FLOATING HEADER & CONTENT ISLAND                  -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <main class="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">

      <!-- FLOATING HEADER CAPSULE -->
      <header :class="[
        'h-16 lg:h-18 rounded-2xl backdrop-blur-2xl px-5 lg:px-6 flex items-center justify-between shrink-0 mb-3.5 relative z-20 transition-all duration-300',
        isDark 
          ? 'bg-[#070e1d]/85 border border-cyan-500/20 text-white shadow-xl' 
          : 'bg-white/85 border border-slate-200/90 text-slate-800 shadow-lg shadow-slate-300/30'
      ]">
        
        <!-- Left: Mobile Toggle, Desktop Collapse, Dynamic Breadcrumb -->
        <div class="flex items-center gap-3.5 min-w-0">
          
          <!-- Mobile Menu Trigger Button -->
          <button 
            @click="isMobileSidebarOpen = true" 
            :class="['lg:hidden p-2 rounded-xl transition-colors', isDark ? 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900']"
            title="Buka Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <!-- Desktop Sidebar Collapse Toggle -->
          <button 
            @click="isCollapsed = !isCollapsed" 
            :class="['hidden lg:flex p-2 rounded-xl transition-all', isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-cyan-700 border border-slate-200']"
            :title="isCollapsed ? 'Perlebar Sidebar' : 'Persempit Sidebar'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-200', isCollapsed ? 'rotate-180 text-cyan-400' : '']">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9-3 3 3 3"/>
            </svg>
          </button>

          <!-- Dynamic Title & Category Breadcrumb -->
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              <span>SmartRIS</span>
              <span :class="isDark ? 'text-slate-600' : 'text-slate-400'">&bull;</span>
              <span class="text-cyan-600 dark:text-cyan-400 font-extrabold">{{ pageMeta.category }}</span>
            </div>
            <h1 :class="['text-base lg:text-lg font-black tracking-tight leading-tight truncate', isDark ? 'text-white' : 'text-slate-900']">
              {{ pageMeta.title }}
            </h1>
          </div>
        </div>

        <!-- Center: Interactive Quick Search & Realtime Clock -->
        <div class="hidden md:flex items-center gap-4">
          <!-- Quick Search Bar -->
          <div class="relative w-64 lg:w-80 group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input 
              v-model="quickSearchQuery"
              @keydown.enter="handleQuickSearch"
              type="text" 
              placeholder="Cari pasien, no. RM, order..." 
              :class="[
                'w-full rounded-xl pl-9 pr-14 py-1.5 text-xs outline-none transition-all shadow-inner',
                isDark 
                  ? 'bg-white/[0.06] hover:bg-white/[0.09] focus:bg-slate-900 border border-white/10 focus:border-cyan-500/50 text-white placeholder-slate-400' 
                  : 'bg-slate-100/90 hover:bg-slate-200/60 focus:bg-white border border-slate-200 focus:border-cyan-500/60 text-slate-800 placeholder-slate-400'
              ]"
            />
            <div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <span :class="['px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border', isDark ? 'bg-white/10 text-slate-300 border-white/10' : 'bg-slate-200/90 text-slate-600 border-slate-300/80']">⌘K</span>
            </div>
          </div>

          <!-- Real-Time WIB Digital Clock -->
          <div :class="['hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono shadow-sm', isDark ? 'bg-white/[0.04] border border-white/[0.08] text-slate-300' : 'bg-slate-100 border border-slate-200/90 text-slate-700']">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping"></span>
            <span>{{ currentTimeWIB }}</span>
          </div>
        </div>

        <!-- Right: Server Status Pills, Dark Toggle, and Action Buttons -->
        <div class="flex items-center space-x-2.5 lg:space-x-3 shrink-0">
          
          <!-- Healthcare Server Status Badges -->
          <div class="hidden 2xl:flex items-center gap-2">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
              <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
              <span>DCM4CHEE PACS</span>
            </div>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
              <span>SATUSEHAT</span>
            </div>
          </div>

          <!-- Quick Action: Order Baru Button -->
          <router-link 
            to="/admin/orders" 
            class="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Order Baru</span>
          </router-link>

          <!-- Dark/Light Mode Switcher -->
          <button 
            @click="toggleTheme" 
            :title="isDark ? 'Beralih ke Mode Terang (Slate Clinical)' : 'Beralih ke Mode Gelap (Cosmic)'" 
            :class="['p-2 rounded-xl transition-all shadow-sm', isDark ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200']"
          >
            <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>

          <!-- Notification Bell -->
          <div :class="['relative p-2 rounded-xl transition-all cursor-pointer shadow-sm', isDark ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200']">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full"></span>
          </div>

          <div :class="['w-px h-5', isDark ? 'bg-white/10' : 'bg-slate-300']"></div>

          <!-- Logout Button -->
          <button 
            @click="logout" 
            title="Keluar dari Akun" 
            :class="['flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all font-bold text-xs group', isDark ? 'text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30' : 'text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200']"
          >
            <span class="hidden md:inline">Keluar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <!-- FLOATING WORKSPACE CONTENT CARD -->
      <div :class="[
        'flex-1 rounded-3xl backdrop-blur-2xl p-4 lg:p-7 overflow-y-auto relative scrollbar-thin transition-all duration-300',
        isDark 
          ? 'bg-[#070e1d]/70 border border-cyan-500/15 shadow-2xl text-slate-100' 
          : 'bg-slate-100/75 border border-slate-200/90 shadow-xl shadow-slate-300/30 text-slate-800'
      ]">
        
        <!-- Welcome Hero Widget on /admin Root -->
        <div v-if="$route.path === '/admin'" class="animate-in fade-in slide-in-from-bottom-3 duration-500 mb-8">
          <div :class="[
            'relative overflow-hidden rounded-3xl p-6 lg:p-8 border shadow-xl transition-all',
            isDark 
              ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-[#070e1d]/90 border-cyan-500/25 shadow-2xl' 
              : 'bg-gradient-to-r from-slate-100/95 via-sky-50/70 to-slate-100/95 border-cyan-500/30'
          ]">
            <!-- Decorative Ambient Glow in Card -->
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-bl from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 max-w-3xl">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Infrastruktur Aktif & Siap Melayani
                </span>
                <span class="hidden sm:inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-wider border border-cyan-500/30">
                  ⚡ C-ECHO DICOM OK
                </span>
              </div>

              <h2 :class="['text-2xl lg:text-3xl font-black tracking-tight mb-2', isDark ? 'text-white' : 'text-slate-900']">
                Sistem Radiologi Terpadu <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400">SmartRIS & PACS</span>
              </h2>

              <p :class="['text-xs lg:text-sm font-medium leading-relaxed mb-6 max-w-2xl', isDark ? 'text-slate-300' : 'text-slate-600']">
                Server DCM4CHEE PACS terkoneksi dengan modality MRI, CT-Scan, dan X-Ray. Modul pembacaan ekspertise klinis, pemantauan waktu tunggu pasien (TAT), serta Gateway SATUSEHAT Kemenkes RI berjalan normal.
              </p>

              <div class="flex flex-wrap gap-3">
                <router-link 
                  to="/admin/examination-worklist" 
                  class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs lg:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Buka Antrean Worklist</span>
                </router-link>

                <router-link 
                  to="/admin/expertise-worklist" 
                  :class="['border px-5 py-2.5 rounded-xl font-bold text-xs lg:text-sm shadow-sm transition-all flex items-center gap-2', isDark ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200']"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Antrean Ekspertise</span>
                </router-link>

                <router-link 
                  to="/admin/satusehat" 
                  :class="['border px-5 py-2.5 rounded-xl font-bold text-xs lg:text-sm shadow-sm transition-all flex items-center gap-2', isDark ? 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border-teal-500/30' : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200']"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>Kemenkes SATUSEHAT</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Render Child Router Views -->
        <div class="pb-10">
          <router-view></router-view>
        </div>

      </div>

    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Responsive & Collapse states
const isMobileSidebarOpen = ref(false)
const isCollapsed = ref(false)
const isDark = ref(true)

// User info from localStorage
const userName = ref('Superadmin')
const userRole = ref('ADMINISTRATOR IT')
const userInitials = computed(() => {
  return userName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA'
})

// Quick Search query
const quickSearchQuery = ref('')
const handleQuickSearch = () => {
  if (quickSearchQuery.value.trim()) {
    router.push({ path: '/admin/orders', query: { q: quickSearchQuery.value.trim() } })
  }
}

// Realtime WIB Clock
const currentTimeWIB = ref('')
let timerInterval: any = null

const updateClock = () => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  const timeStr = new Intl.DateTimeFormat('id-ID', options).format(now)
  currentTimeWIB.value = `${timeStr} WIB`
}

// Keyboard shortcut listener (Ctrl+K or Cmd+K)
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    const input = document.querySelector('input[placeholder*="Cari pasien"]') as HTMLInputElement
    if (input) input.focus()
  }
}

// Dynamic Breadcrumb / Page Title Mapping
const pageMeta = computed(() => {
  const p = route.path
  if (p === '/admin') return { title: 'Dashboard Utama', category: 'Ringkasan Sistem' }
  if (p.startsWith('/admin/patients')) return { title: 'Database Pasien', category: 'Master Data' }
  if (p.startsWith('/admin/doctors')) return { title: 'Dokter Radiologi', category: 'Master Data' }
  if (p.startsWith('/admin/modalities')) return { title: 'Alat & Modality Radiologi', category: 'Master Data' }
  if (p.startsWith('/admin/modality-logs')) return { title: 'Log Modality PACS', category: 'Master Data' }
  if (p.startsWith('/admin/orders')) return { title: 'Semua Order Pemeriksaan', category: 'Manajemen Order' }
  if (p.startsWith('/admin/examination-worklist')) return { title: 'Antrean Pemeriksaan (Worklist)', category: 'Alur Kerja Radiologi' }
  if (p.startsWith('/admin/expertise-worklist')) return { title: 'Antrean Bacaan (Expertise)', category: 'Alur Kerja Radiologi' }
  if (p.startsWith('/admin/history')) return { title: 'Riwayat & History Order', category: 'Manajemen Order' }
  if (p.startsWith('/admin/reports/waiting-time')) return { title: 'Laporan Waktu Tunggu Pasien (TAT)', category: 'Laporan & Mutu' }
  if (p.startsWith('/admin/reports')) return { title: 'Laporan Statistik Radiologi', category: 'Laporan & Mutu' }
  if (p.startsWith('/admin/satusehat')) return { title: 'SATUSEHAT Gateway Hub', category: 'Interoperabilitas' }
  if (p.startsWith('/admin/api-docs')) return { title: 'Dokumentasi API SIMRS', category: 'Interoperabilitas' }
  if (p.startsWith('/admin/system-info')) return { title: 'Info Server & PACS', category: 'Sistem' }
  if (p.startsWith('/admin/helpdesk')) return { title: 'Panduan Penggunaan', category: 'Sistem' }
  return { title: 'Pusat Informasi RIS', category: 'Portal' }
})

// Sub-menu expansion states
const orderRoutes = ['/admin/orders', '/admin/examination-worklist', '/admin/expertise-worklist']
const isOrderActive = computed(() => orderRoutes.some(r => route.path.startsWith(r)))
const isOrderExpanded = ref(true)

const modalityRoutes = ['/admin/modalities', '/admin/modality-logs']
const isModalityActive = computed(() => modalityRoutes.some(r => route.path.startsWith(r)))
const isModalityExpanded = ref(true)

// Auto-expand menus if on their corresponding routes
watch(() => route.path, (path) => {
  if (orderRoutes.some(r => path.startsWith(r))) isOrderExpanded.value = true
  if (modalityRoutes.some(r => path.startsWith(r))) isModalityExpanded.value = true
  if (window.innerWidth < 1024) isMobileSidebarOpen.value = false
}, { immediate: true })

onMounted(() => {
  // Update live clock
  updateClock()
  timerInterval = setInterval(updateClock, 1000)

  // Attach keyboard shortcut
  window.addEventListener('keydown', handleKeyDown)

  // Load user info if available
  try {
    const rawUser = localStorage.getItem('user')
    if (rawUser) {
      const u = JSON.parse(rawUser)
      if (u.name) userName.value = u.name
      if (u.role) userRole.value = u.role.toUpperCase()
    }
  } catch (e) {}

  // Check preferred dark mode
  if (localStorage.getItem('theme') === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  window.removeEventListener('keydown', handleKeyDown)
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const logout = () => {
  localStorage.removeItem('ris_token')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.sidebar-group-title {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  padding: 0 10px;
  margin-bottom: 6px;
}

:global(.dark) .sidebar-group-title {
  color: #64748b;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

:global(.dark) .sidebar-link {
  color: #94a3b8;
}

.sidebar-link:hover {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
  transform: translateX(2px);
}

:global(.dark) .sidebar-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.sidebar-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

:global(.dark) .sidebar-icon-box {
  background: rgba(255, 255, 255, 0.03);
}

.sidebar-link:hover .sidebar-icon-box {
  background: rgba(15, 23, 42, 0.08);
  transform: scale(1.06);
}

:global(.dark) .sidebar-link:hover .sidebar-icon-box {
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-active {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%) !important;
  color: #0369a1 !important;
  border: 1px solid rgba(14, 165, 233, 0.35) !important;
  box-shadow: 0 2px 10px rgba(6, 182, 212, 0.12);
  font-weight: 700 !important;
}

:global(.dark) .sidebar-active {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.22) 0%, rgba(37, 99, 235, 0.12) 100%) !important;
  color: #38bdf8 !important;
  border: 1px solid rgba(56, 189, 248, 0.35) !important;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.18);
}

.sidebar-active .sidebar-icon-box {
  background: rgba(6, 182, 212, 0.16) !important;
  color: #0284c7 !important;
}

:global(.dark) .sidebar-active .sidebar-icon-box {
  background: rgba(6, 182, 212, 0.2) !important;
  color: #38bdf8 !important;
}

.sidebar-link-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-sub-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
}

:global(.dark) .sidebar-sub-link {
  color: #94a3b8;
}

.sidebar-sub-link:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.04);
}

:global(.dark) .sidebar-sub-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-sub-active {
  color: #0284c7 !important;
  font-weight: 700 !important;
  background: rgba(6, 182, 212, 0.12) !important;
}

:global(.dark) .sidebar-sub-active {
  color: #38bdf8 !important;
  background: rgba(6, 182, 212, 0.14) !important;
}

/* Custom Scrollbar for Sleek Floating Look */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.25);
  border-radius: 9999px;
}
:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.45);
}
:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.4);
}

@keyframes pulseSlow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.97); }
}
.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}
</style>