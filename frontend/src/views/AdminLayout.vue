<template>
  <div class="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex overflow-hidden font-sans">
    
    <!-- Mobile Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
    ></div>

    <!-- Sidebar / Navigasi (Sleek Dark Theme) -->
    <aside 
      :class="[
        'w-68 lg:w-72 bg-[#091122] border-r border-slate-800/80 flex flex-col transition-all duration-300 fixed lg:relative z-40 h-full select-none shadow-2xl lg:shadow-none',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Top Branding Logo Area -->
      <div class="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 shrink-0 bg-[#070e1b]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
            R
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black text-lg tracking-tight text-white">Smart<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">RIS</span></span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">v3.5</span>
            </div>
            <p class="text-[10px] font-medium text-slate-400 tracking-wide">PACS & Radiology System</p>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button @click="isSidebarOpen = false" class="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      
      <!-- Navigasi Links -->
      <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">

        <!-- Group: Dashboard -->
        <div>
          <p class="sidebar-group-title">Dashboard</p>
          <div class="space-y-1">
            <router-link to="/admin" exact-active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <span>Dashboard Utama</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Master Data -->
        <div>
          <p class="sidebar-group-title">Master Data</p>
          <div class="space-y-1">
            <router-link to="/admin/patients" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-cyan-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Data Pasien</span>
            </router-link>
            <router-link to="/admin/doctors" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-blue-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Dokter Radiologi</span>
            </router-link>
            <router-link to="/admin/modalities" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-indigo-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>Alat & Modality</span>
            </router-link>
            <router-link to="/admin/modality-logs" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Log Modality (PACS)</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Order -->
        <div>
          <p class="sidebar-group-title">Manajemen Order</p>
          <div class="space-y-1">
            <!-- Parent: Manajemen Order (collapsible) -->
            <div>
              <button
                @click="isOrderExpanded = !isOrderExpanded"
                :class="['sidebar-link group w-full text-left justify-between', isOrderActive ? 'sidebar-active' : '']"
              >
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-amber-400"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                  <span>Alur Kerja Radiologi</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-200 text-slate-400', isOrderExpanded ? 'rotate-180' : '']"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              <!-- Sub-items -->
              <div v-if="isOrderExpanded" class="ml-3 mt-1.5 space-y-1 border-l-2 border-slate-800/80 pl-3">
                <router-link to="/admin/orders" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  <span>Semua Order</span>
                </router-link>
                <router-link to="/admin/examination-worklist" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Antrean Tindakan</span>
                  <span class="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                </router-link>
                <router-link to="/admin/expertise-worklist" active-class="sidebar-sub-active" class="sidebar-sub-link group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Antrean Ekspertise</span>
                  <span class="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                </router-link>
              </div>
            </div>

            <router-link to="/admin/history" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Riwayat / History Order</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Report -->
        <div>
          <p class="sidebar-group-title">Laporan & Audit</p>
          <div class="space-y-1">
            <router-link to="/admin/reports" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-emerald-400"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span>Laporan Statistik</span>
            </router-link>
            <router-link to="/admin/reports/waiting-time" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-amber-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Waktu Tunggu Pasien</span>
              <span class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">TAT</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Interoperabilitas -->
        <div>
          <p class="sidebar-group-title">Interoperabilitas</p>
          <div class="space-y-1">
            <router-link to="/admin/satusehat" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-teal-400"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>SATUSEHAT Gateway</span>
              <span class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">FHIR</span>
            </router-link>
            <router-link to="/admin/api-docs" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-cyan-400"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span>Dokumentasi API SIMRS</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Sistem -->
        <div>
          <p class="sidebar-group-title">Sistem</p>
          <div class="space-y-1">
            <router-link to="/admin/system-info" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-indigo-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Info Server & PACS</span>
            </router-link>
            <router-link to="/admin/helpdesk" active-class="sidebar-active" class="sidebar-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-icon text-slate-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Panduan Penggunaan</span>
            </router-link>
          </div>
        </div>

      </div>

      <!-- Bottom User Profile Card -->
      <div class="p-4 border-t border-slate-800/80 bg-[#070e1b] shrink-0">
        <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/20 border border-cyan-400/30">
              {{ userInitials }}
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" title="Status: Online"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-white truncate">{{ userName }}</p>
            <p class="text-[10px] font-medium text-cyan-300 truncate">{{ userRole }}</p>
          </div>
          <button 
            @click="logout" 
            title="Keluar / Logout" 
            class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Modern Topbar / Header -->
      <header class="h-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 shrink-0">
        <!-- Left: Mobile Toggle & Dynamic Breadcrumb Navigation -->
        <div class="flex items-center gap-4 min-w-0">
          <button 
            @click="isSidebarOpen = true" 
            class="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Buka Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <!-- Dynamic Title & Category Breadcrumb -->
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>SmartRIS</span>
              <span class="text-slate-300 dark:text-slate-600">&bull;</span>
              <span class="text-cyan-600 dark:text-cyan-400">{{ pageMeta.category }}</span>
            </div>
            <h1 class="text-lg lg:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight truncate">
              {{ pageMeta.title }}
            </h1>
          </div>
        </div>

        <!-- Center: Live Healthcare Server Status Badges -->
        <div class="hidden xl:flex items-center gap-2.5">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DCM4CHEE PACS Online</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/70 dark:border-cyan-800/60 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>SATUSEHAT Ready</span>
          </div>
        </div>

        <!-- Right: Action Controls -->
        <div class="flex items-center space-x-2.5 lg:space-x-3.5">
          <!-- Dark Mode Toggle Button -->
          <button 
            @click="toggleTheme" 
            :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'" 
            class="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
          >
            <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>

          <!-- Notification Bell -->
          <div class="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer hidden sm:flex shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full"></span>
          </div>

          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

          <!-- Logout Button -->
          <button 
            @click="logout" 
            title="Keluar dari Akun" 
            class="flex items-center gap-2 py-2 px-3.5 text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-xl border border-rose-200/70 dark:border-rose-900/50 transition-all font-extrabold text-xs shadow-sm group"
          >
            <span class="hidden md:inline">Keluar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <!-- Page Content / RouterView -->
      <div class="flex-1 overflow-y-auto p-4 lg:p-8 relative bg-slate-50 dark:bg-slate-950">
        <!-- Welcome Widget (On /admin root) -->
        <div v-if="$route.path === '/admin'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="glass p-8 lg:p-10 rounded-3xl mb-8 relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-500 border border-slate-100 dark:border-slate-800">
            <div class="relative z-10 max-w-2xl">
              <span class="inline-block py-1 px-3 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3 shadow-sm border border-emerald-100 dark:border-emerald-800/50">Status Sistem Normal</span>
              <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-3">Infrastruktur Radiologi Terkoneksi Lancar</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 text-sm lg:text-base">Modality MRI dan CT Scan pada server DCM4CHEE PACS merespon <span class="font-bold text-slate-700 dark:text-slate-200">DICOM Ping (C-ECHO)</span> secara stabil dan terhubung ke Gateway SATUSEHAT.</p>
              <div class="flex flex-col sm:flex-row gap-3">
                <router-link to="/admin/examination-worklist" class="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(11,75,111,0.39)] transition-all active:scale-95 text-center">
                  Buka Antrean Worklist
                </router-link>
                <router-link to="/admin/satusehat" class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-colors text-center">
                  Cek Gateway SATUSEHAT
                </router-link>
              </div>
            </div>
            
            <!-- Decorative Pattern -->
            <div class="absolute right-0 top-0 -mr-6 -mt-6 pointer-events-none">
              <div class="w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div class="w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-10"></div>
            </div>
          </div>
        </div>

        <!-- Default child route mapping -->
        <div class="pb-10">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Mobile sidebar & dark mode states
const isSidebarOpen = ref(false)
const isDark = ref(false)

// User info from localStorage
const userName = ref('Superadmin')
const userRole = ref('Administrator IT')
const userInitials = computed(() => {
  return userName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA'
})

// Dynamic Breadcrumb / Page Title Mapping
const pageMeta = computed(() => {
  const p = route.path
  if (p === '/admin') return { title: 'Dashboard Utama', category: 'Ringkasan Sistem' }
  if (p.startsWith('/admin/patients')) return { title: 'Database Pasien', category: 'Master Data' }
  if (p.startsWith('/admin/doctors')) return { title: 'Dokter Radiologi', category: 'Master Data' }
  if (p.startsWith('/admin/modalities')) return { title: 'Alat & Modality Radiologi', category: 'Master Data' }
  if (p.startsWith('/admin/modality-logs')) return { title: 'Log Modality PACS', category: 'Master Data' }
  if (p.startsWith('/admin/orders')) return { title: 'Semua Order Pemeriksaan', category: 'Manajemen Order' }
  if (p.startsWith('/admin/examination-worklist')) return { title: 'Antrean Pemeriksaan (Worklist)', category: 'Manajemen Order' }
  if (p.startsWith('/admin/expertise-worklist')) return { title: 'Antrean Bacaan (Expertise)', category: 'Manajemen Order' }
  if (p.startsWith('/admin/history')) return { title: 'Riwayat & History Order', category: 'Manajemen Order' }
  if (p.startsWith('/admin/reports/waiting-time')) return { title: 'Laporan Waktu Tunggu Pasien', category: 'Laporan & Mutu' }
  if (p.startsWith('/admin/reports')) return { title: 'Laporan Statistik Radiologi', category: 'Laporan & Mutu' }
  if (p.startsWith('/admin/satusehat')) return { title: 'SATUSEHAT Gateway Hub', category: 'Interoperabilitas' }
  if (p.startsWith('/admin/api-docs')) return { title: 'Dokumentasi API SIMRS', category: 'Interoperabilitas' }
  if (p.startsWith('/admin/system-info')) return { title: 'Info Server & PACS', category: 'Sistem' }
  if (p.startsWith('/admin/helpdesk')) return { title: 'Panduan Penggunaan', category: 'Sistem' }
  return { title: 'Pusat Informasi RIS', category: 'Portal' }
})

// Order sub-menu state
const orderRoutes = ['/admin/orders', '/admin/examination-worklist', '/admin/expertise-worklist']
const isOrderActive = computed(() => orderRoutes.some(r => route.path.startsWith(r)))
const isOrderExpanded = ref(false)

// Auto-expand order menu if on an order route
watch(() => route.path, (path) => {
  if (orderRoutes.some(r => path.startsWith(r))) isOrderExpanded.value = true
  if (window.innerWidth < 1024) isSidebarOpen.value = false
}, { immediate: true })

onMounted(() => {
  // Load user info if available
  try {
    const rawUser = localStorage.getItem('user')
    if (rawUser) {
      const u = JSON.parse(rawUser)
      if (u.name) userName.value = u.name
      if (u.role) userRole.value = u.role.toUpperCase()
    }
  } catch (e) {}

  // Check prefered dark mode
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
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
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  padding: 0 12px;
  margin-bottom: 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 12.5px;
  font-weight: 700;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
}

.sidebar-link:hover {
  background: rgba(30, 41, 59, 0.7);
  color: #ffffff;
  transform: translateX(2px);
}

.sidebar-active {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.16) 0%, rgba(37, 99, 235, 0.08) 100%) !important;
  color: #38bdf8 !important;
  border: 1px solid rgba(56, 189, 248, 0.35) !important;
  box-shadow: 0 2px 10px rgba(6, 182, 212, 0.15);
}

.sidebar-sub-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
}

.sidebar-sub-link:hover {
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.5);
}

.sidebar-sub-active {
  color: #38bdf8 !important;
  font-weight: 700 !important;
  background: rgba(6, 182, 212, 0.1) !important;
}

.sidebar-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sidebar-link:hover .sidebar-icon {
  transform: scale(1.1);
}

/* Custom Scrollbar for Sidebar */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.5);
  border-radius: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.8);
}
</style>