import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Master Data
      {
        path: 'patients',
        name: 'Patients',
        component: () => import('../views/Patients.vue')
      },
      {
        path: 'doctors',
        name: 'Doctors',
        component: () => import('../views/Doctors.vue')
      },
      {
        path: 'modalities',
        name: 'Modalities',
        component: () => import('../views/Modalities.vue')
      },
      {
        path: 'modality-logs',
        name: 'ModalityLogs',
        component: () => import('../views/ModalityLogs.vue')
      },
      // Order
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue')
      },
      {
        path: 'examination-worklist',
        name: 'ExaminationWorklist',
        component: () => import('../views/ExaminationWorklist.vue')
      },
      {
        path: 'expertise-worklist',
        name: 'ExpertiseWorklist',
        component: () => import('../views/ExpertiseWorklist.vue')
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetail.vue')
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('../views/HistoryOrder.vue')
      },
      // Report
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue')
      },
      {
        path: 'helpdesk',
        name: 'Helpdesk',
        component: () => import('../views/Helpdesk.vue')
      },
      {
        path: 'system-info',
        name: 'SystemInfo',
        component: () => import('../views/SystemInfo.vue')
      }
    ]
  },
  {
    // Catch-all route to redirect any undefined routes dynamically based on auth status
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/admin'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global Navigation Security Router Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('ris_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Apabila URL butuh autentikasi (seperti Dashboard) tapi belum login
    next({ name: 'Login' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    // Apabila sudah login lalu mencoba memaksa back/nge-hit landing page login
    next({ name: 'Admin' })
  } else {
    // Biarkan masuk ke halaman yang diminta
    next()
  }
})

export default router
