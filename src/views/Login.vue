<template>
  <div class="auth-container flex items-center justify-center">
    <div class="auth-card glass-panel flex flex-col items-center">
      <!-- Logo Area -->
      <div class="logo-wrapper mb-6">
        <div class="logo-icon bg-gradient-primary">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>
      
      <div class="text-center mb-8">
        <h1 class="brand-title">{{ isLogin ? 'Form Login' : 'Registrasi' }}</h1>
        <p class="text-muted mt-2">Nabung - Kelola keuangan Anda dengan cerdas.</p>
      </div>

      <form @submit.prevent="handleAuth" class="auth-form w-full">
        <div class="form-group relative mb-5">
          <label class="form-label font-medium text-sm">Email</label>
          <div class="input-icon-wrapper relative">
            <div class="input-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted z-10 pointer-events-none">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <input 
              type="email" 
              v-model="email" 
              class="form-control pl-10 auth-input" 
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>
        
        <div class="form-group relative mb-8">
          <label class="form-label font-medium text-sm">Kata Sandi</label>
          <div class="input-icon-wrapper relative">
            <div class="input-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted z-10 pointer-events-none">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input 
              type="password" 
              v-model="password" 
              class="form-control pl-10 auth-input" 
              placeholder="Minimal 6 karakter"
              required
            />
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary w-full submit-btn relative overflow-hidden flex justify-center items-center font-bold text-[15px]" :disabled="loading">
          <span class="btn-text" :class="{ 'opacity-0': loading }">{{ isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru' }}</span>
          <div v-if="loading" class="absolute inset-0 flex justify-center items-center">
            <div class="spinner-small"></div>
          </div>
        </button>
      </form>

      <div class="text-center mt-6 w-full">
        <div class="divider flex items-center justify-center gap-3 opacity-50 mb-4">
          <div class="h-px bg-border flex-1"></div>
          <span class="text-xs uppercase tracking-widest text-muted">atau</span>
          <div class="h-px bg-border flex-1"></div>
        </div>
        
        <button @click="toggleMode" class="btn-toggle group w-full p-2 rounded-xl transition-all duration-300 hover:bg-surface-hover">
          <span class="text-muted">{{ isLogin ? 'Belum punya akun?' : 'Sudah punya akun?' }}</span>
          <span class="highlight font-semibold ml-1 group-hover:text-primary transition-colors">{{ isLogin ? 'Daftar di sini' : 'Masuk di sini' }}</span>
        </button>
      </div>
      
      <!-- Error Toast -->
      <transition name="slide-up">
        <div v-if="errorMsg" class="error-toast mt-6 flex items-center justify-center gap-2 w-full">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span class="text-sm font-medium">{{ errorMsg }}</span>
        </div>
      </transition>
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

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  password.value = ''
}

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
      password.value = ''
    }
  } catch (error) {
    if (error.message.includes('Invalid login credentials')) {
      errorMsg.value = 'Email atau password salah.'
    } else if (error.message.includes('User already registered')) {
      errorMsg.value = 'Email sudah terdaftar.'
    } else {
      errorMsg.value = error.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 8rem);
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 3rem;
  background: var(--bg-surface);
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #a855f7);
}

.logo-wrapper {
  position: relative;
}

.logo-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
  transform: rotate(-5deg);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.auth-card:hover .logo-icon {
  transform: rotate(0deg) scale(1.05);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--primary), #2563eb);
}

.brand-title {
  color: var(--text-h);
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  letter-spacing: -0.025em;
}

.auth-input {
  background: var(--bg-body);
  border: 1px solid var(--border);
  height: 52px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.auth-input:focus {
  background: var(--bg-surface);
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.submit-btn {
  height: 52px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, var(--primary), #2563eb);
  border: none;
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -4px rgba(59, 130, 246, 0.5);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
}

.highlight {
  color: var(--primary);
}

.error-toast {
  color: var(--expense);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.h-px { height: 1px; }
.flex-1 { flex: 1; }
.bg-border { background-color: var(--border); }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.p-2 { padding: 0.5rem; }
.pl-10 { padding-left: 2.5rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.left-3 { left: 0.75rem; }
.top-1\/2 { top: 50%; }
.transform { transform: translateY(-50%); }
.-translate-y-1\/2 { transform: translateY(-50%); }
.text-center { text-align: center; }
.text-muted { color: var(--text-p); }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-\[15px\] { font-size: 15px; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: 0.1em; }
.opacity-0 { opacity: 0; }
.opacity-50 { opacity: 0.5; }
.z-10 { z-index: 10; }
.pointer-events-none { pointer-events: none; }
.rounded-xl { border-radius: 0.75rem; }
.transition-all { transition-property: all; }
.transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
.duration-300 { transition-duration: 300ms; }
.hover\:bg-surface-hover:hover { background-color: rgba(255, 255, 255, 0.05); }
.group:hover .group-hover\:text-primary { color: var(--primary); }
</style>
