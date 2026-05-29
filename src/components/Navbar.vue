<template>
  <nav class="navbar glass-panel">
    <div class="container flex justify-between items-center">
      <div class="brand">
        <div class="logo"></div>
        <span class="brand-name">Nabung</span>
      </div>
      <div class="nav-links flex gap-4 hidden-mobile">
        <router-link to="/" class="nav-link">Dashboard</router-link>
        <router-link to="/budget" class="nav-link">Budget (YNAB)</router-link>
        <router-link to="/categories" class="nav-link">Kategori</router-link>
        <router-link to="/wallets" class="nav-link">Buku Kas</router-link>
      </div>
      <div class="user-actions flex items-center gap-4">
        <!-- Wallet Switcher -->
        <div class="wallet-switcher" v-if="wallets && wallets.length > 0">
          <select 
            class="form-control wallet-select" 
            :value="activeWallet?.id" 
            @change="$emit('change-wallet', $event.target.value)"
          >
            <option v-for="w in wallets" :key="w.id" :value="w.id">
              {{ w.name }}
            </option>
          </select>
        </div>
        
        <span class="user-email hidden-mobile">{{ user?.email }}</span>
        <button class="btn btn-secondary btn-sm" @click="$emit('logout')">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: null
  },
  wallets: {
    type: Array,
    default: () => []
  },
  activeWallet: {
    type: Object,
    default: null
  }
})
defineEmits(['logout', 'change-wallet'])
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 1rem 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 8px;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-main);
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--primary);
  background-color: var(--primary-light);
}

.wallet-switcher {
  display: flex;
  align-items: center;
}

.wallet-select {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  min-width: 150px;
  background-color: var(--bg-surface-hover);
  border: 1px solid var(--border);
}

@media (max-width: 768px) {
  .hidden-mobile {
    display: none;
  }
}
</style>
