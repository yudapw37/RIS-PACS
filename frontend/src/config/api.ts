import axios from 'axios'

// Konfigurasi API terpusat untuk SmartRIS
// Adaptif & Dinamis:
// 1. Jika VITE_API_BASE_URL diset non-kosong dan bukan localhost, gunakan itu.
// 2. Jika diakses via Nginx (port 80 / 8080 atau default web port), gunakan relative path ""
//    sehingga otomatis ditangani oleh reverse proxy Nginx (/api/ -> smartris-backend:3000).
// 3. Jika diakses via Vite dev server (misal port 5173), arahkan ke host yang sama port 3000.
const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost')) {
    return envUrl.trim()
  }

  if (typeof window !== 'undefined') {
    // Pada production / Docker Nginx, reverse proxy /api/ aktif
    if (window.location.port === '8080' || window.location.port === '80' || window.location.port === '') {
      return ''
    }
    // Jika dev mode atau port lain, gunakan hostname browser secara dinamis
    return `http://${window.location.hostname}:3000`
  }

  return envUrl || ''
}

const API_BASE = getApiBase()

// Mengkonfigurasi Axios secara global untuk FE
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('ris_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  // Tangkap jika token expired / unauthorized
  const isLoginPage = window.location.pathname.includes('/login')
  const isApiDocs = window.location.pathname.includes('/admin/api-docs')
  const isAuthLoginRequest = error.config?.url?.includes('/api/auth/login')
  const shouldSkipRedirect = isLoginPage || isApiDocs || isAuthLoginRequest || error.config?.headers?.['X-Skip-Auth-Redirect']

  if (error.response && error.response.status === 401 && !shouldSkipRedirect) {
    localStorage.removeItem('ris_token')
    window.location.href = '/login?expired=1'
  }
  return Promise.reject(error)
})

export default API_BASE
