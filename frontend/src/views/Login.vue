<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100/50">
    <!-- Split Screen Container -->
    <div class="relative max-w-6xl w-full mx-4 md:mx-auto h-[600px] flex rounded-[2rem] overflow-hidden shadow-2xl glass border border-white/50">
      
      <!-- Left side: Form -->
      <div class="w-full md:w-1/2 flex flex-col justify-center p-12 bg-white/95 z-10 relative">
        <div class="max-w-sm mx-auto w-full space-y-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-md">
                R
              </div>
              <h2 class="text-3xl font-extrabold tracking-tight text-slate-800">Smart<span class="text-[var(--color-accent)]">RIS</span> <span class="text-sm font-bold bg-slate-100 text-slate-500 py-1 px-2 rounded-lg ml-1">V2</span></h2>
            </div>
            <p class="text-sm text-slate-500 font-medium">Sistem radiologi terintegrasi masa depan. Silakan masuk ke akun institusi Anda.</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div class="space-y-4">
              <div class="relative group">
                <label for="username" class="sr-only">Username</label>
                <input 
                  v-model="form.username"
                  id="username" 
                  name="username" 
                  type="text" 
                  required 
                  class="block w-full py-3.5 pl-4 px-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all shadow-sm bg-slate-50/50 hover:bg-slate-50 font-medium" 
                  placeholder="Nama Pengguna" 
                />
              </div>
              
              <div class="relative group">
                <label for="password" class="sr-only">Password</label>
                <input 
                  v-model="form.password"
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  class="block w-full py-3.5 pl-4 px-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all shadow-sm bg-slate-50/50 hover:bg-slate-50 font-medium" 
                  placeholder="Kata Sandi" 
                />
              </div>
            </div>

            <div class="flex items-center justify-between mt-2 px-1">
              <div class="flex items-center">
                <input id="remember" name="remember" type="checkbox" class="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded cursor-pointer accent-[var(--color-primary)]">
                <label for="remember" class="ml-2 block text-sm text-slate-600 font-medium select-none cursor-pointer hover:text-slate-900 transition-colors">
                  Ingat saya
                </label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors">Lupa sandi?</a>
              </div>
            </div>

            <button 
              type="submit" 
              class="group relative w-full flex justify-center py-3.5 px-4 rounded-xl text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] text-sm font-bold tracking-wide shadow-[0_4px_14px_0_rgba(11,75,111,0.39)] transition-all hover:translate-y-[-1px] disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </span>
              {{ isLoading ? 'Memverifikasi...' : 'Masuk Dashboard' }}
            </button>
          </form>
          
          <div v-if="errorMsg" class="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-semibold border border-red-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {{ errorMsg }}
          </div>
        </div>
      </div>

      <!-- Right side: Cinematic Image -->
      <div class="hidden md:block md:w-1/2 relative bg-slate-900 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-[#0b4b6f]/60 to-transparent z-10"></div>
        <img class="absolute inset-0 h-full w-full object-cover opacity-90 scale-105 transition-transform duration-[20s] hover:scale-110 ease-out" src="/hospital_tech_bg.png" alt="Hospital technology background" />
        
        <div class="absolute bottom-12 left-12 right-12 z-20">
          <div class="glass-dark p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]"></div>
            <h3 class="text-white font-bold tracking-tight text-2xl mb-2 flex flex-col">
               <span>Pusat Kendali</span>
               <span class="text-cyan-200">Radiologi Terpadu</span>
            </h3>
            <p class="text-slate-300 text-sm leading-relaxed mt-2 font-medium">Manajemen DICOM, Worklist Patient, C-Echo Ping secara Real-Time tanpa hambatan protokol Proxmox PACS lokal Anda.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import API_BASE from '../config/api'

const router = useRouter()
const isLoading = ref(false)
const errorMsg = ref('')

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const res = await axios.post(`${API_BASE}/api/auth/login`, {
      username: form.username,
      password: form.password
    })
    
    if (res.data && res.data.code === 200) {
      localStorage.setItem('ris_token', res.data.data.token)
      setTimeout(() => {
        router.push('/admin')
      }, 300)
    }
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.msg) {
      errorMsg.value = err.response.data.msg
    } else {
      errorMsg.value = 'Terjadi kesalahan koneksi ke server RIS.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
