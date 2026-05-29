import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'

import Budget from '../views/Budget.vue'
import Categories from '../views/Categories.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/budget',
      name: 'budget',
      component: Budget,
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

// Navigation guard to check for auth
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  const { data: { session } } = await supabase.auth.getSession()

  if (requiresAuth && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/')
  } else {
    next()
  }
})

export default router
