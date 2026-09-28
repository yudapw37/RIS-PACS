import axios from 'axios'

// Konfigurasi API terpusat untuk SmartRIS
// Otomatis menyesuaikan dengan hostname yang diakses di browser (localhost / IP LAN) pada port 3000
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    // Jika ada environment variable custom yang valid dan bukan IP lama 192.168.103.70
    const envUrl = import.meta.env.VITE_API_BASE_URL
    if (envUrl && !envUrl.includes('192.168.103.70')) {
      return envUrl
    }
    return `${protocol}//${hostname}:3000`
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
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
