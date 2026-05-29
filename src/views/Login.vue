<template>
  <div class="auth-container flex items-center justify-center">
    <div class="auth-card glass-panel">
      <div class="text-center mb-8">
        <h1 class="brand-title">Nabung</h1>
        <p>Mulai atur keuanganmu dengan cerdas</p>
      </div>

      <form @submit.prevent="handleAuth" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input 
            type="email" 
            v-model="email" 
            class="form-control" 
            placeholder="nama@email.com"
            required
          />
        </div>
        <div class="form-group mb-8">
          <label class="form-label">Password</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-control" 
            placeholder="Minimal 6 karakter"
            required
          />
        </div>
        
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar') }}
        </button>
      </form>

      <div class="text-center mt-4">
        <button @click="isLogin = !isLogin" class="btn-toggle">
          {{ isLogin ? 'Belum punya akun? Daftar disini' : 'Sudah punya akun? Masuk' }}
        </button>
      </div>
      
      <div v-if="errorMsg" class="error-msg mt-4 text-center">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleAuth = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      router.push('/')
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      alert('Pendaftaran berhasil! Silakan cek email Anda atau langsung masuk.')
      isLogin.value = true
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 80vh;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2rem;
  background: var(--bg-surface);
}

.brand-title {
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.btn-toggle {
  background: none;
  border: none;
  color: var(--secondary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

.error-msg {
  color: var(--expense);
  font-size: 0.875rem;
}
</style>
