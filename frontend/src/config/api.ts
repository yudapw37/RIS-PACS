import axios from 'axios'

// Konfigurasi API terpusat untuk SmartRIS V2
// Nilai VITE_API_BASE_URL di-inject saat build Docker (lihat docker-compose.prod.yml)
// Default fallback ke localhost untuk development lokal

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
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('ris_token')
    
    // Jangan redirect jika kita sudah berada di halaman login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=1'
    }
  }
  return Promise.reject(error)
})

export default API_BASE
