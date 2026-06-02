<template>
  <div class="app-wrapper">
    <Navbar 
      v-if="user" 
      :user="user" 
      :wallets="wallets"
      :active-wallet="activeWallet"
      @logout="handleLogout" 
      @change-wallet="setActiveWallet"
    />
    <main class="main-content">
      <router-view 
        :user="user" 
        :active-wallet="activeWallet" 
        @refresh-wallets="fetchWallets"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'
import Navbar from './components/Navbar.vue'

const router = useRouter()
const user = ref(null)
const wallets = ref([])
const activeWallet = ref(null)

let isFetchingWallets = false

const fetchWallets = async () => {
  if (!user.value || isFetchingWallets) return
  isFetchingWallets = true
  
  try {
    // Fetch wallets this user is a member of
    const { data, error } = await supabase
      .from('wallet_members')
      .select(`
        wallet_id,
        role,
        payday_date,
        wallets (
          id,
          name,
          owner_id
        )
      `)
      .eq('user_id', user.value.id)
      
    if (data && data.length > 0) {
      wallets.value = data.map(m => m.wallets)
      
      // Try to load from localStorage first
      const savedId = localStorage.getItem('activeWalletId')
      const savedWallet = savedId ? wallets.value.find(w => w.id === savedId) : null
      
      if (savedWallet) {
        activeWallet.value = savedWallet
      } else {
        // Fallback to the first wallet
        activeWallet.value = wallets.value[0]
        localStorage.setItem('activeWalletId', activeWallet.value.id)
      }
    } else if (data && data.length === 0) {
      // User has no wallets, create a default "Buku Kas Pribadi"
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert([{
          name: 'Buku Kas Pribadi',
          owner_id: user.value.id
        }])
        .select()
        
      if (newWallet && newWallet.length > 0) {
        wallets.value = newWallet
        activeWallet.value = newWallet[0]
        localStorage.setItem('activeWalletId', activeWallet.value.id)
      }
    }
  } finally {
    isFetchingWallets = false
  }
}

const setActiveWallet = (walletId) => {
  const wallet = wallets.value.find(w => w.id === walletId)
  if (wallet) {
    activeWallet.value = wallet
    localStorage.setItem('activeWalletId', walletId)
    // Force reload to re-fetch data for the new wallet in the current view
    window.location.reload()
  }
}

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user || null
    if (user.value) fetchWallets()
  })

  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
    if (user.value) {
      fetchWallets()
    } else {
      wallets.value = []
      activeWallet.value = null
      localStorage.removeItem('activeWalletId')
    }
  })
})

onUnmounted(() => {
  removeActivityListeners()
})

// === Session Timeout Logic ===
const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes
let inactivityTimer = null

const resetTimer = () => {
  if (!user.value) return
  if (inactivityTimer) clearTimeout(inactivityTimer)
  
  inactivityTimer = setTimeout(() => {
    handleTimeoutLogout()
  }, SESSION_TIMEOUT_MS)
}

const handleTimeoutLogout = async () => {
  if (inactivityTimer) clearTimeout(inactivityTimer)
  alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali untuk keamanan akun Anda.')
  await handleLogout()
}

const activityEvents = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll']

const setupActivityListeners = () => {
  activityEvents.forEach(event => {
    window.addEventListener(event, resetTimer, { passive: true })
  })
}

const removeActivityListeners = () => {
  activityEvents.forEach(event => {
    window.removeEventListener(event, resetTimer)
  })
  if (inactivityTimer) clearTimeout(inactivityTimer)
}

// Start tracking only when user is logged in
watch(user, (newUser) => {
  if (newUser) {
    setupActivityListeners()
    resetTimer()
  } else {
    removeActivityListeners()
  }
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}
</style>
