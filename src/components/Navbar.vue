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
      </div>
      <div class="user-actions flex items-center gap-4">
        <span class="user-email">{{ user?.email }}</span>
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
  }
})
defineEmits(['logout'])
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

@media (max-width: 768px) {
  .hidden-mobile {
    display: none;
  }
}
</style>
