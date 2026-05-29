<template>
  <div class="container mt-8 wallets-page">
    <div class="page-header text-center mb-8">
      <h1 class="page-title">Manajemen Buku Kas</h1>
      <p class="page-subtitle">Kelola kas pribadi Anda atau berkolaborasi dengan pengguna lain dalam satu ruang yang sama.</p>
    </div>

    <!-- Action Cards -->
    <div class="action-cards-container mb-12">
      <!-- Create Wallet -->
      <div class="action-card glass-panel create-card">
        <div class="card-icon create-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </div>
        <h3 class="mb-2">Buat Buku Kas Baru</h3>
        <p class="text-sm text-muted mb-4">Mulai buku kas baru untuk tim atau keluarga Anda.</p>
        <form @submit.prevent="createWallet" class="action-form">
          <div class="form-group mb-0 flex gap-2">
            <input type="text" v-model="newWalletName" class="form-control" required placeholder="Misal: Kas Keluarga">
            <button type="submit" class="btn btn-primary" :disabled="loadingCreate">
              {{ loadingCreate ? '...' : 'Buat' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Join Wallet -->
      <div class="action-card glass-panel join-card">
        <div class="card-icon join-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        </div>
        <h3 class="mb-2">Gabung Buku Kas</h3>
        <p class="text-sm text-muted mb-4">Punya kode undangan? Masukkan di sini untuk bergabung.</p>
        <form @submit.prevent="joinWallet" class="action-form">
          <div class="form-group mb-0 flex gap-2">
            <input type="text" v-model="joinWalletId" class="form-control" required placeholder="Masukkan ID / Kode">
            <button type="submit" class="btn btn-secondary" :disabled="loadingJoin">
              {{ loadingJoin ? '...' : 'Gabung' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- List Wallets -->
    <div class="wallets-list-section">
      <div class="flex justify-between items-center mb-6">
        <h2>Daftar Buku Kas Anda</h2>
        <span class="wallet-count badge-primary">{{ myWallets.length }} Buku Kas</span>
      </div>
      
      <div v-if="fetching" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat daftar buku kas...</p>
      </div>
      <div v-else-if="myWallets.length === 0" class="empty-state glass-panel">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        <h3>Belum ada buku kas</h3>
        <p class="text-muted">Buat atau gabung ke buku kas untuk mulai mencatat keuangan.</p>
      </div>
      <div v-else class="wallets-grid">
        <div 
          v-for="w in myWallets" 
          :key="w.wallet_id" 
          class="wallet-item glass-panel"
          :class="{ 'is-active': activeWallet?.id === w.wallet_id }"
        >
          <div class="wallet-item-header">
            <div class="wallet-info">
              <!-- Edit Mode -->
              <form v-if="editingWalletId === w.wallet_id" @submit.prevent="saveWalletName" class="edit-name-form mb-2">
                <input type="text" v-model="editingWalletName" class="form-control form-control-sm" required autofocus>
                <button type="submit" class="btn btn-primary btn-sm" title="Simpan">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button type="button" class="btn btn-secondary btn-sm" title="Batal" @click="cancelEdit">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </form>
              <!-- View Mode -->
              <div v-else class="flex items-center gap-2 mb-2">
                <h4 class="wallet-name" :title="w.wallets.name">{{ w.wallets.name }}</h4>
                <button v-if="w.role === 'owner'" class="menu-btn edit-btn" title="Edit Nama" @click="startEdit(w)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              </div>

              <span class="wallet-badge" :class="w.role === 'owner' ? 'badge-owner' : 'badge-member'">
                {{ w.role === 'owner' ? 'Pemilik' : 'Anggota' }}
              </span>
            </div>
            
            <button class="menu-btn danger-btn" title="Keluar / Hapus" @click="leaveWallet(w.wallet_id, w.role)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
          
          <div class="wallet-id-box">
            <span class="id-label">ID / KODE:</span>
            <code class="id-value" @click="copyToClipboard(w.wallet_id)" title="Klik untuk menyalin">{{ w.wallet_id }}</code>
          </div>
          
          <div class="wallet-item-footer">
            <button 
              class="btn w-full btn-select" 
              :class="activeWallet?.id === w.wallet_id ? 'btn-active' : 'btn-primary'"
              @click="switchWallet(w.wallet_id)"
              :disabled="activeWallet?.id === w.wallet_id"
            >
              {{ activeWallet?.id === w.wallet_id ? 'Sedang Digunakan' : 'Gunakan Buku Kas Ini' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps(['user', 'activeWallet'])
const emit = defineEmits(['refresh-wallets'])

const myWallets = ref([])
const fetching = ref(true)

const newWalletName = ref('')
const loadingCreate = ref(false)

const joinWalletId = ref('')
const loadingJoin = ref(false)

// Edit state
const editingWalletId = ref(null)
const editingWalletName = ref('')

const fetchMyWallets = async () => {
  if (!props.user) return
  fetching.value = true
  const { data, error } = await supabase
    .from('wallet_members')
    .select(`
      wallet_id,
      role,
      wallets (
        id,
        name,
        owner_id
      )
    `)
    .eq('user_id', props.user.id)
    
  if (data) {
    myWallets.value = data
  }
  fetching.value = false
}

onMounted(() => {
  fetchMyWallets()
})

watch(() => props.user, () => {
  fetchMyWallets()
})

const createWallet = async () => {
  if (!newWalletName.value.trim() || !props.user) return
  loadingCreate.value = true
  
  const { data, error } = await supabase
    .from('wallets')
    .insert([{
      name: newWalletName.value.trim(),
      owner_id: props.user.id
    }])
    .select()

  if (error) {
    alert('Gagal membuat buku kas: ' + error.message)
  } else {
    newWalletName.value = ''
    emit('refresh-wallets')
    await fetchMyWallets()
  }
  loadingCreate.value = false
}

const joinWallet = async () => {
  if (!joinWalletId.value.trim() || !props.user) return
  loadingJoin.value = true
  
  const { error } = await supabase
    .from('wallet_members')
    .insert([{
      wallet_id: joinWalletId.value.trim(),
      user_id: props.user.id,
      role: 'member'
    }])

  if (error) {
    alert('Gagal bergabung. Pastikan ID valid atau Anda belum bergabung. (' + error.message + ')')
  } else {
    joinWalletId.value = ''
    emit('refresh-wallets')
    await fetchMyWallets()
  }
  loadingJoin.value = false
}

const switchWallet = (id) => {
  localStorage.setItem('activeWalletId', id)
  window.location.reload()
}

// Edit functions
const startEdit = (wallet) => {
  editingWalletId.value = wallet.wallet_id
  editingWalletName.value = wallet.wallets.name
}

const cancelEdit = () => {
  editingWalletId.value = null
  editingWalletName.value = ''
}

const saveWalletName = async () => {
  if (!editingWalletName.value.trim() || !editingWalletId.value) return
  
  const { error } = await supabase
    .from('wallets')
    .update({ name: editingWalletName.value.trim() })
    .eq('id', editingWalletId.value)
    
  if (error) {
    alert('Gagal mengubah nama: ' + error.message)
  } else {
    // Optimistic update locally
    const wallet = myWallets.value.find(w => w.wallet_id === editingWalletId.value)
    if (wallet) wallet.wallets.name = editingWalletName.value.trim()
    
    // Also notify app to refresh the nav dropdown if it's the active wallet
    emit('refresh-wallets')
    
    cancelEdit()
  }
}

const leaveWallet = async (id, role) => {
  if (role === 'owner') {
    if (!confirm('Anda adalah pemilik. Menghapus buku kas ini akan MENGHAPUS SEMUA DATA di dalamnya. Yakin?')) return
    
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id)
      
    if (error) alert('Gagal menghapus: ' + error.message)
    else {
      emit('refresh-wallets')
      await fetchMyWallets()
    }
  } else {
    if (!confirm('Yakin ingin keluar dari buku kas ini?')) return
    
    const { error } = await supabase
      .from('wallet_members')
      .delete()
      .match({ wallet_id: id, user_id: props.user.id })
      
    if (error) alert('Gagal keluar: ' + error.message)
    else {
      emit('refresh-wallets')
      await fetchMyWallets()
    }
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('ID Buku Kas disalin ke clipboard!')
}
</script>

<style scoped>
.wallets-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  padding: 2rem 0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary, #8b5cf6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
}

/* Action Cards */
.action-cards-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .action-cards-container {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

.action-card {
  padding: 2rem;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
}

.create-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.join-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.card-icon svg {
  width: 24px;
  height: 24px;
}

.action-form .form-control {
  background-color: var(--bg-body);
  border: 1px solid var(--border);
}

/* Wallets Grid */
.wallet-count {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
}

.wallets-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .wallets-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

.wallet-item {
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: var(--bg-surface);
}

.wallet-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.wallet-item.is-active {
  border-color: var(--primary);
  background: linear-gradient(145deg, var(--bg-surface), rgba(170, 59, 255, 0.03));
}

.wallet-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.wallet-info {
  flex: 1;
  overflow: hidden;
}

.wallet-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-h);
}

.edit-name-form {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.form-control-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  height: 30px;
}

.btn-sm {
  padding: 0 0.5rem;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-owner {
  background-color: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-member {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.menu-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.danger-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.wallet-id-box {
  background-color: var(--bg-body);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px dashed var(--border);
  position: relative;
}

.id-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.id-value {
  font-size: 0.8rem;
  word-break: break-all;
  color: var(--text-h);
  font-family: var(--mono);
  cursor: pointer;
  display: block;
  transition: color 0.2s;
}

.id-value:hover {
  color: var(--primary);
}

.wallet-item-footer {
  margin-top: auto;
}

.btn-select {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-active {
  background-color: rgba(170, 59, 255, 0.1);
  color: var(--primary);
  border: 1px solid var(--primary);
  cursor: default;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state {
  border-radius: 1rem;
  border: 1px dashed var(--border);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(170, 59, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.w-full { width: 100%; }
.flex { display: flex; }
.gap-2 { gap: 0.5rem; }
.mb-0 { margin-bottom: 0; }
</style>
