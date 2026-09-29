import axios from 'axios'

// Konfigurasi API terpusat untuk SmartRIS
// Mengambil URL Backend API murni dari environment (.env / .env.staging / .env.production)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
