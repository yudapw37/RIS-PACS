<template>
  <div class="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500 selection:text-white relative overflow-hidden">
    <!-- Subtle Background Glows -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

    <!-- LEFT SIDE: Modern Medical Tech Login Panel -->
    <div class="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 relative bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/80">
      <!-- Top Branding -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" class="text-white">
              <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl font-black tracking-tight text-white">Smart<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">RIS</span></span>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v3.5 Enterprise
              </span>
            </div>
            <p class="text-[11px] font-medium text-slate-400">PACS & Radiology Information System</p>
          </div>
        </div>

        <!-- Live Server Status Indicator -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-emerald-400 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>PACS Online</span>
        </div>
      </div>

      <!-- Center: Login Form -->
      <div class="my-auto py-8 max-w-md w-full mx-auto">
        <div class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Selamat Datang</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Silakan masukkan kredensial akun untuk mengakses Worklist, PACS DCM4CHEE, dan Gateway SATUSEHAT.
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMsg" class="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-3 animate-shake">
          <svg class="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div class="flex-1">{{ errorMsg }}</div>
        </div>

        <!-- Form Elements -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nama Pengguna (Username)</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input 
                v-model="form.username"
                id="username" 
                name="username" 
                type="text" 
                required 
                autocomplete="username"
                class="block w-full py-3.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                placeholder="cth: superadmin" 
              />
            </div>
          </div>

          <!-- Password Field with Show/Hide Toggle -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">Kata Sandi (Password)</label>
              <a href="#" @click.prevent="showForgotNotice = true" class="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Lupa sandi?
              </a>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input 
                v-model="form.password"
                id="password" 
                name="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                autocomplete="current-password"
                class="block w-full py-3.5 pl-10 pr-11 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                placeholder="Masukkan kata sandi" 
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                title="Tampilkan / Sembunyikan sandi"
              >
                <!-- Eye Open -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye Off -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                v-model="rememberMe"
                class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 cursor-pointer"
              />
              <span class="text-xs font-medium text-slate-300">Ingat sesi login</span>
            </label>
            <span class="text-[11px] text-slate-500">Auto-lock 8 jam</span>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full relative group overflow-hidden py-3.5 px-5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-lg shadow-cyan-600/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>{{ isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Portal SmartRIS' }}</span>
            <svg v-if="!isLoading" class="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </form>

        <!-- Demo Quick-Fill Access Pills -->
        <div class="mt-8 pt-6 border-t border-slate-800/80">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Akses Cepat Pengujian:</span>
            <span class="text-[10px] text-cyan-400 font-normal">Klik untuk isi otomatis</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button"
              @click="fillDemo('superadmin', 'password123')"
              class="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-center"
            >
              Superadmin
            </button>
            <button 
              type="button"
              @click="fillDemo('radiografer1', 'password123')"
              class="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-center"
            >
              Radiografer
            </button>
            <button 
              type="button"
              @click="fillDemo('dokter1', 'password123')"
              class="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-center"
            >
              Dr. Radiologi
            </button>
          </div>
        </div>

        <div v-if="showForgotNotice" class="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between animate-fade-in">
          <span>Hubungi Tim IT Rumah Sakit untuk reset kata sandi akun Anda.</span>
          <button @click="showForgotNotice = false" class="text-cyan-400 font-bold ml-2">Tutup</button>
        </div>
      </div>

      <!-- Bottom Compliance & Security Footnote -->
      <div class="pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" class="text-cyan-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Enkripsi TLS 1.3 Terlindungi</span>
        </div>
        <span>Permenkes 24/2022 &bull; HL7 FHIR</span>
      </div>
    </div>

    <!-- RIGHT SIDE: Cinematic Medical Radiology Showcase -->
    <div class="hidden lg:flex lg:w-[52%] xl:w-[55%] relative bg-slate-950 items-end p-12 overflow-hidden">
      <!-- Background Hero Image -->
      <img 
        src="/login_hero.jpg" 
        alt="Modern Radiology Reading Room" 
        class="absolute inset-0 w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-[12s] ease-out brightness-95"
      />
      <!-- Gradient Overlays for Depth and Contrast -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent"></div>

      <!-- Top Right Floating Pill -->
      <div class="absolute top-10 right-10 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-200 shadow-xl">
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>DICOMweb & WADO-RS Ready</span>
      </div>

      <!-- Bottom Floating Glassmorphism Hero Card -->
      <div class="relative z-20 w-full max-w-xl p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500"></span>
          <span class="text-xs font-bold uppercase tracking-widest text-cyan-300">Pusat Kendali Radiologi Terpadu</span>
        </div>
        <h2 class="text-2xl font-black text-white tracking-tight leading-snug">
          Integrasi PACS, Worklist DICOM, dan Gateway SATUSEHAT Kemenkes RI
        </h2>
        <p class="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal">
          Solusi terpadu rumah sakit untuk pemrosesan citra medis beresolusi tinggi, pembacaan ekspertise klinis, serta audit Standar Pelayanan Minimal (SPM) waktu tunggu pasien secara real-time.
        </p>

        <!-- Feature Tags -->
        <div class="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-[11px]">
          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">⚡</div>
            <span>DCM4CHEE PACS</span>
          </div>
          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">🩺</div>
            <span>FHIR R4 Gateway</span>
          </div>
          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">⏱️</div>
            <span>Audit Waktu SPM</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import API_BASE from '../config/api'

const router = useRouter()
const isLoading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const showForgotNotice = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const fillDemo = (u: string, p: string) => {
  form.username = u
  form.password = p
  errorMsg.value = ''
}

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const res = await axios.post(`${API_BASE}/api/auth/login`, {
      username: form.username,
      password: form.password
    })
    
    if (res.data && res.data.code === 200) {
      const token = res.data.data.token
      // Store both for backward compatibility across modules
      localStorage.setItem('ris_token', token)
      localStorage.setItem('token', token)
      if (res.data.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user))
      }

      setTimeout(() => {
        router.push('/admin')
      }, 250)
    } else {
      errorMsg.value = res.data?.msg || 'Gagal masuk ke sistem'
    }
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.msg) {
      errorMsg.value = err.response.data.msg
    } else {
      errorMsg.value = 'Tidak dapat terhubung ke server SmartRIS. Pastikan backend aktif.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Pre-fill superadmin for easy convenience
  form.username = 'superadmin'
  form.password = 'password123'
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
