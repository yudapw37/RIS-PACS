<template>
  <div class="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex overflow-hidden font-sans">
    
    <!-- Mobile Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
    ></div>

    <!-- Sidebar / Navigasi -->
    <aside 
      :class="[
        'w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 fixed lg:relative z-40 h-full',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div class="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold mr-3 shadow-md shadow-[var(--color-primary)]/20 text-lg">R</div>
        <span class="font-extrabold text-xl tracking-tight text-slate-800 dark:text-slate-100">Smart<span class="text-[var(--color-accent)]">RIS</span></span>
      </div>
      
      <!-- Navigasi -->
      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-6">

        <!-- Group: Dashboard -->
        <div>
          <p class="nav-group-label">Dashboard</p>
          <div class="space-y-1">
            <router-link to="/admin" exact-active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <span>Dashboard Utama</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Master Data -->
        <div>
          <p class="nav-group-label">Master Data</p>
          <div class="space-y-1">
            <router-link to="/admin/patients" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Pasien</span>
            </router-link>
            <router-link to="/admin/doctors" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Dokter</span>
            </router-link>
            <router-link to="/admin/modalities" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>Modality</span>
            </router-link>
            <router-link to="/admin/modality-logs" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon opacity-70"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Log Modality</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Order -->
        <div>
          <p class="nav-group-label">Order</p>
          <div class="space-y-1">
            <!-- Parent: Manajemen Order (collapsible) -->
            <div>
              <button
                @click="isOrderExpanded = !isOrderExpanded"
                :class="['nav-link group w-full text-left', isOrderActive ? 'nav-active' : '']"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                <span class="flex-1">Manajemen Order</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-200', isOrderExpanded ? 'rotate-180' : '']"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <!-- Direct link to /admin/orders -->
              <router-link v-if="!isOrderExpanded" to="/admin/orders" active-class="nav-active" class="hidden"/>

              <!-- Sub-items (collapsible) -->
              <div v-if="isOrderExpanded" class="ml-3 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                <router-link to="/admin/orders" active-class="nav-sub-active" class="nav-link nav-sub group text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  <span>Semua Order</span>
                </router-link>
                <router-link to="/admin/examination-worklist" active-class="nav-sub-active" class="nav-link nav-sub group text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon text-blue-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Antrean Pemeriksaan</span>
                </router-link>
                <router-link to="/admin/expertise-worklist" active-class="nav-sub-active" class="nav-link nav-sub group text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon text-amber-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Antrean Bacaan</span>
                </router-link>
              </div>
            </div>

            <router-link to="/admin/history" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>History Order</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Report -->
        <div>
          <p class="nav-group-label">Report</p>
          <div class="space-y-1">
            <router-link to="/admin/reports" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span>Laporan</span>
            </router-link>
            <router-link to="/admin/helpdesk" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Helpdesk Penggunaan</span>
            </router-link>
          </div>
        </div>

        <!-- Group: Sistem -->
        <div>
          <p class="nav-group-label">Sistem</p>
          <div class="space-y-1">
            <router-link to="/admin/system-info" active-class="nav-active" class="nav-link group">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Info Sistem & PACS</span>
            </router-link>
          </div>
        </div>

      </div>


      <!-- User Profile Card -->
      <div class="h-20 border-t border-slate-100 dark:border-slate-800 flex items-center px-5 shrink-0 bg-slate-50/50 mt-auto">
        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white shadow-sm dark:shadow-none overflow-hidden flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold">
           SA
        </div>
        <div class="ml-3 flex-1 overflow-hidden">
          <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Superadmin</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium truncate">IT Department</p>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Header / Topbar -->
      <header class="h-20 bg-white dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 shrink-0">
        <div class="flex items-center gap-4">
          <!-- Mobile Menu Button -->
          <button @click="isSidebarOpen = true" class="lg:hidden p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h1 class="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none truncate max-w-[200px] lg:max-w-none">Pusat Informasi RIS</h1>
        </div>
        
        <div class="flex items-center space-x-3 lg:space-x-4">
          <!-- Dark Mode Toggle -->
          <button @click="toggleTheme" class="relative p-2.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors hover:shadow">
            <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>
          
          <!-- Mock Notification Bell -->
          <div class="relative p-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors hover:shadow cursor-pointer hidden md:flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="absolute top-1 right-2 w-2.5 h-2.5 bg-red-50 dark:bg-red-900/400 rounded-full border-2 border-[var(--color-surface)]"></span>
          </div>
          
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <!-- Logout Button -->
          <button @click="logout" title="Keluar / Logout" class="flex items-center gap-2 p-2.5 px-3 lg:px-4 text-red-500 dark:text-red-400 hover:text-white hover:bg-red-50 dark:bg-red-900/400 bg-red-50 dark:bg-red-900/40 rounded-xl border border-red-100 dark:border-red-800/50 shadow-sm dark:shadow-none transition-all hover:shadow group font-bold text-sm">
             <span class="hidden lg:block">Keluar</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <!-- Page Content / RouterView -->
      <div class="flex-1 overflow-y-auto p-4 lg:p-10 relative bg-slate-50 dark:bg-slate-950">
         <!-- Welcome Widget (Will be moved to dashboard component later) -->
         <div v-if="$route.path === '/admin'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="glass p-10 rounded-3xl mb-10 relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-500 border border-slate-100 dark:border-slate-800">
               <div class="relative z-10 max-w-2xl">
                  <span class="inline-block py-1 px-3 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm dark:shadow-none border border-emerald-100 dark:border-emerald-800/50">Status Normal</span>
                  <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4">Infrastruktur Radiologi Terkoneksi Lancar</h2>
                  <p class="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 lg:mb-8 text-sm lg:text-base">Modality MRI dan CT Scan pada Proxmox merespon <span class="font-bold text-slate-700 dark:text-slate-200">DICOM Ping (C-ECHO)</span> secara stabil. Ada 14 status pasien di Worklist belum terjawab ke Expertise.</p>
                  <div class="flex flex-col sm:flex-row gap-3 lg:gap-4">
                     <button class="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(11,75,111,0.39)] transition-all active:scale-95 duration-200">
                        Buka Worklist Baru
                     </button>
                     <button class="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold text-sm shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 transition-colors">
                        Review Log Jaringan
                     </button>
                  </div>
               </div>
               
               <!-- Decorative pattern -->
               <div class="absolute right-0 top-0 -mr-6 -mt-6">
                  <div class="w-64 h-64 bg-cyan-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                  <div class="w-64 h-64 bg-blue-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -ml-10"></div>
                  <svg class="absolute inset-0 w-full h-full text-slate-100 opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="currentColor" d="M0 100 C 20 0 50 0 100 100 Z"></path></svg>
               </div>
            </div>

            <!-- Dashboard Stats Mockup -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Stat Card 1 -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                   <div class="flex items-center justify-between mb-6">
                      <div class="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      </div>
                      <span class="text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">+12% Hari Ini</span>
                   </div>
                   <h4 class="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Kunjungan Pasien</h4>
                   <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">128</p>
                </div>
                <!-- Stat Card 2 -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow hidden lg:block">
                   <div class="flex items-center justify-between mb-6">
                      <div class="w-12 h-12 rounded-2xl bg-[#0b4b6f]/5 flex items-center justify-center text-[#0b4b6f]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      </div>
                      <span class="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                         <span class="w-2 h-2 rounded-full bg-emerald-50 dark:bg-emerald-900/400 mr-2 animate-pulse"></span>
                         DICOM Live
                      </span>
                   </div>
                   <h4 class="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Alat Tersambung (Modalities)</h4>
                   <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">4<span class="text-xl text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold ml-1">/ 5 Unit</span></p>
                </div>
                <!-- Stat Card 3 -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                   <div class="flex items-center justify-between mb-6">
                      <div class="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center text-orange-500 dark:text-orange-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      </div>
                      <span class="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/40 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-800/50">Critical / Cito</span>
                   </div>
                   <h4 class="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Tunggu Hasil (Expertise)</h4>
                   <p class="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">14</p>
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
   router.push('/login')
}
</script>\n