<template>
  <div class="app-wrapper">
    <Navbar v-if="user" :user="user" @logout="handleLogout" />
    <main class="main-content">
      <router-view :user="user" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'
import Navbar from './components/Navbar.vue'

const router = useRouter()
const user = ref(null)

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user || null
  })

  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
  })
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
