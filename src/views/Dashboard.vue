<template>
  <div class="container dashboard mt-8">
    <div v-if="!activeWallet" class="glass-panel text-center p-8 mb-8 mt-12 empty-wallet-state">
      <div class="empty-icon-large mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold mb-2">Tidak ada Buku Kas aktif</h2>
      <p class="text-muted">Silakan buat atau pilih buku kas di menu Navigasi (atas) terlebih dahulu untuk mulai mencatat keuangan.</p>
    </div>
    
    <div v-else>
      <!-- Header Summary -->
      <div class="summary-grid mb-10">
        <!-- Total Balance -->
        <div class="summary-card glass-panel total-card">
          <div class="card-icon-wrapper bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div class="card-content">
            <h3>Saldo Utama</h3>
            <p class="amount">Rp {{ formatCurrency(totalBalance) }}</p>
          </div>
        </div>
        <!-- Savings -->
        <div class="summary-card glass-panel savings-card items-start">
          <div class="card-icon-wrapper bg-blue-light" style="background: linear-gradient(135deg, #60a5fa, #2563eb);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          </div>
          <div class="card-content flex-1">
            <h3>Total Tabungan</h3>
            <p class="amount text-savings mb-1" style="color: #3b82f6;">Rp {{ formatCurrency(totalSavings) }}</p>
            <div v-if="hasMultipleMembers" class="breakdown-list">
              <div v-for="(data, uid) in totalsByUser" :key="uid" class="breakdown-item" v-show="data.savings > 0 || uid === props.user?.id">
                <span class="user-label">{{ getUserLabel(uid) }}</span>
                <span class="user-amount">Rp {{ formatCurrency(data.savings) }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Income -->
        <div class="summary-card glass-panel income-card items-start">
          <div class="card-icon-wrapper bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div class="card-content flex-1">
            <h3>Total Pemasukan</h3>
            <p class="amount text-income mb-1">Rp {{ formatCurrency(totalIncome) }}</p>
            <div v-if="hasMultipleMembers" class="breakdown-list">
              <div v-for="(data, uid) in totalsByUser" :key="uid" class="breakdown-item" v-show="data.income > 0 || uid === props.user?.id">
                <span class="user-label">{{ getUserLabel(uid) }}</span>
                <span class="user-amount">Rp {{ formatCurrency(data.income) }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Expense -->
        <div class="summary-card glass-panel expense-card items-start">
          <div class="card-icon-wrapper bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
          </div>
          <div class="card-content flex-1">
            <h3>Total Pengeluaran</h3>
            <p class="amount text-expense mb-1">Rp {{ formatCurrency(totalExpense) }}</p>
            <div v-if="hasMultipleMembers" class="breakdown-list">
              <div v-for="(data, uid) in totalsByUser" :key="uid" class="breakdown-item" v-show="data.expense > 0 || uid === props.user?.id">
                <span class="user-label">{{ getUserLabel(uid) }}</span>
                <span class="user-amount">Rp {{ formatCurrency(data.expense) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="main-grid">
        <!-- Add Transaction Form -->
        <div class="form-section glass-panel">
          <div class="flex justify-between items-center mb-4">
            <h2 class="m-0 text-xl font-bold">Catat Transaksi</h2>
            <!-- AI Scanner Button -->
            <button type="button" @click="triggerFileInput" class="btn btn-secondary btn-sm flex items-center gap-2">
              <span>✨</span> Scan Struk
            </button>
            <input type="file" ref="fileInput" accept="image/*" capture="environment" class="hidden" style="display: none;" @change="handleFileUpload">
          </div>
          
          <form @submit.prevent="addTransaction" class="tx-form">
            <!-- Segmented Control for Type -->
            <div class="form-group">
              <div class="segmented-control">
                <input type="radio" id="type-expense" v-model="form.type" value="expense">
                <label for="type-expense" class="segment-label expense-label">Keluar</label>
                
                <input type="radio" id="type-income" v-model="form.type" value="income">
                <label for="type-income" class="segment-label income-label">Masuk</label>
                
                <input type="radio" id="type-savings" v-model="form.type" value="savings">
                <label for="type-savings" class="segment-label savings-label">Tabung</label>
              </div>
            </div>

            <div class="form-group amount-group">
              <label class="form-label">Nominal</label>
              <div class="input-with-prefix">
                <span class="prefix">Rp</span>
                <input type="text" :value="formatCurrencyValue(form.amount)" @input="form.amount = unformatCurrency($event.target.value)" class="form-control amount-input" required placeholder="0">
              </div>
            </div>
            
            <div class="form-group admin-fee-toggle" v-if="form.type === 'expense'">
              <label class="toggle-label cursor-pointer">
                <div class="toggle-text">
                  <span class="font-medium">Biaya Admin / Pajak</span>
                  <span class="text-xs text-muted block">Tambahan biaya di luar nominal utama</span>
                </div>
                <div class="switch">
                  <input type="checkbox" v-model="hasAdminFee">
                  <span class="slider round"></span>
                </div>
              </label>
              <div class="input-with-prefix mt-3" v-if="hasAdminFee" style="animation: slideDown 0.3s ease;">
                <span class="prefix">Rp</span>
                <input type="text" :value="formatCurrencyValue(form.admin_fee)" @input="form.admin_fee = unformatCurrency($event.target.value)" class="form-control" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Kategori</label>
              <div class="select-wrapper">
                <select v-model="form.category_id" class="form-control custom-select" required>
                  <option disabled :value="null">Pilih Kategori Transaksi</option>
                  <template v-for="main in mainCategories" :key="main.id">
                    <optgroup v-if="main.type === form.type" :label="main.name">
                      <option :value="main.id">{{ main.name }} (Utama)</option>
                      <option v-for="sub in getSubcategories(main.id)" :key="sub.id" :value="sub.id">
                        ↳ {{ sub.name }}
                      </option>
                    </optgroup>
                  </template>
                </select>
                <div class="select-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Keterangan</label>
              <textarea v-model="form.description" class="form-control" rows="3" required placeholder="Misal: Beli makan siang / Rincian barang..."></textarea>
            </div>
            
            <div class="advanced-options-toggle mt-4 mb-2">
              <p class="text-xs text-muted font-medium uppercase tracking-wider">Opsi Tambahan</p>
              <hr class="my-2 border-t border-gray-200 opacity-50">
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label text-sm">Tanggal</label>
                <input type="date" v-model="form.date" class="form-control text-sm" required>
              </div>
              <div class="form-group">
                <label class="form-label text-sm">Metode Bayar</label>
                <input type="text" list="paymentMethods" v-model="form.payment_method" class="form-control text-sm" required placeholder="Cash, BCA...">
                <datalist id="paymentMethods">
                  <option value="Cash" /><option value="QRIS" /><option value="BCA" /><option value="GoPay" />
                </datalist>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label text-sm">Merchant / Lokasi</label>
              <input type="text" v-model="form.merchant" class="form-control text-sm" placeholder="Misal: Tokopedia">
            </div>
            
            <div class="form-group">
              <label class="form-label text-sm">Label (Tags)</label>
              <input type="text" v-model="form.tagsInput" class="form-control text-sm" placeholder="Pisahkan koma (Misal: Liburan, Dinas)">
            </div>

            <button type="submit" class="btn btn-primary w-full submit-btn mt-2" :disabled="loading">
              <span class="flex items-center justify-center gap-2">
                <svg v-if="!loading" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                <svg v-else class="animate-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                {{ loading ? 'Menyimpan...' : 'Simpan Transaksi' }}
              </span>
            </button>
          </form>
        </div>

        <!-- Transaction List -->
        <div class="list-section">
          <div class="flex justify-between items-center mb-4 pl-1">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="text-muted"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              Riwayat Transaksi
            </h2>
          </div>
          
          <!-- Filter & Sort Controls -->
          <div class="filters-container glass-panel p-4 mb-6 rounded-xl flex flex-wrap gap-4 items-end shadow-sm">
            <div class="filter-group flex-1 min-w-[130px]">
              <label class="filter-label">Jenis Transaksi</label>
              <div class="select-wrapper">
                <select v-model="filters.type" class="form-control form-control-sm custom-select">
                  <option value="all">Semua Jenis</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="savings">Tabungan</option>
                </select>
                <div class="select-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
              </div>
            </div>
            
            <div class="filter-group flex-1 min-w-[130px]">
              <label class="filter-label">Dibuat Oleh</label>
              <div class="select-wrapper">
                <select v-model="filters.creator" class="form-control form-control-sm custom-select">
                  <option value="all">Semua Pengguna</option>
                  <option value="me">Hanya Saya</option>
                  <option value="owner">Pemilik Buku Kas</option>
                  <option value="member">Anggota Lain</option>
                </select>
                <div class="select-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
              </div>
            </div>
            
            <div class="filter-group flex-1 min-w-[150px]">
              <label class="filter-label">Urutkan Berdasarkan</label>
              <div class="select-wrapper">
                <select v-model="sortOption" class="form-control form-control-sm custom-select">
                  <option value="date_desc">Tanggal (Terbaru)</option>
                  <option value="date_asc">Tanggal (Terlama)</option>
                  <option value="amount_desc">Nominal (Tertinggi)</option>
                  <option value="amount_asc">Nominal (Terendah)</option>
                </select>
                <div class="select-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
              </div>
            </div>
            
            <div class="filter-group">
              <button @click="resetFilters" class="btn btn-secondary btn-sm flex items-center justify-center filter-reset-btn" title="Reset Filter">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
              </button>
            </div>
          </div>
          
          <div v-if="fetching" class="loading-state glass-panel">
            <div class="spinner"></div>
            <p>Memuat transaksi...</p>
          </div>
          <div v-else-if="transactions.length === 0" class="empty-state glass-panel text-center">
            <div class="empty-icon-large mx-auto mb-4 text-muted opacity-50">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Buku kas masih kosong</h3>
            <p class="text-muted">Belum ada transaksi dicatat di buku kas ini. Mulai catat transaksi pertama Anda!</p>
          </div>
          <div v-else-if="filteredAndSortedTransactions.length === 0" class="empty-state glass-panel text-center">
            <div class="empty-icon-large mx-auto mb-4 text-muted opacity-50">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Tidak ada hasil</h3>
            <p class="text-muted">Tidak ada transaksi yang cocok dengan filter pencarian Anda.</p>
            <button @click="resetFilters" class="btn btn-primary mt-4">Reset Filter</button>
          </div>
          <div v-else class="transactions-container">
            <TransactionItem 
              v-for="(tx, index) in filteredAndSortedTransactions" 
              :key="tx.id" 
              :transaction="tx"
              :category="getCategoryPath(tx.category_id)"
              :index="index"
              :current-user="user?.id"
              :wallet-owner="activeWallet?.owner_id"
              @delete="deleteTransaction"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- AI Receipt Scanner Modal -->
  <ReceiptScannerModal 
    v-if="scanningFile" 
    :file="scanningFile" 
    @close="closeScanner" 
    @success="handleScanSuccess" 
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../supabase'
import TransactionItem from '../components/TransactionItem.vue'
import ReceiptScannerModal from '../components/ReceiptScannerModal.vue'

const props = defineProps(['user', 'activeWallet'])

const transactions = ref([])
const categories = ref([])
const loading = ref(false)
const fetching = ref(true)
const hasAdminFee = ref(false)
const fileInput = ref(null)
const scanningFile = ref(null)

const defaultForm = {
  type: 'expense',
  amount: '',
  admin_fee: '',
  category_id: null,
  description: '',
  merchant: '',
  payment_method: 'Cash',
  tagsInput: '',
  date: new Date().toISOString().split('T')[0]
}
const form = ref({ ...defaultForm })

// Filter & Sort State
const filters = ref({
  type: 'all',
  creator: 'all'
})
const sortOption = ref('date_desc')

const resetFilters = () => {
  filters.value = { type: 'all', creator: 'all' }
  sortOption.value = 'date_desc'
}

const filteredAndSortedTransactions = computed(() => {
  let result = [...transactions.value]
  
  // Apply Filter: Type
  if (filters.value.type !== 'all') {
    result = result.filter(t => t.type === filters.value.type)
  }
  
  // Apply Filter: Creator
  if (filters.value.creator !== 'all') {
    const isOwner = t => t.user_id === props.activeWallet?.owner_id
    const isMe = t => t.user_id === props.user?.id
    
    if (filters.value.creator === 'me') {
      result = result.filter(isMe)
    } else if (filters.value.creator === 'owner') {
      result = result.filter(isOwner)
    } else if (filters.value.creator === 'member') {
      result = result.filter(t => !isMe(t) && !isOwner(t))
    }
  }
  
  // Apply Sort
  result.sort((a, b) => {
    if (sortOption.value === 'date_desc') {
      return new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortOption.value === 'date_asc') {
      return new Date(a.date) - new Date(b.date) || new Date(a.created_at) - new Date(b.created_at)
    }
    if (sortOption.value === 'amount_desc') {
      const amountA = Number(a.amount) + (a.type === 'expense' ? Number(a.admin_fee || 0) : 0)
      const amountB = Number(b.amount) + (b.type === 'expense' ? Number(b.admin_fee || 0) : 0)
      return amountB - amountA
    }
    if (sortOption.value === 'amount_asc') {
      const amountA = Number(a.amount) + (a.type === 'expense' ? Number(a.admin_fee || 0) : 0)
      const amountB = Number(b.amount) + (b.type === 'expense' ? Number(b.admin_fee || 0) : 0)
      return amountA - amountB
    }
    return 0
  })
  
  return result
})

// Reset form values on type change
watch(() => form.value.type, () => {
  form.value.category_id = null
  if (form.value.type === 'income') {
    hasAdminFee.value = false
    form.value.admin_fee = ''
  }
})

// Refetch data when activeWallet changes
watch(() => props.activeWallet, (newWallet) => {
  if (newWallet) fetchData()
  else {
    transactions.value = []
    categories.value = []
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value)
}

const formatCurrencyValue = (val) => {
  if (!val && val !== 0) return ''
  return new Intl.NumberFormat('id-ID').format(val)
}

const unformatCurrency = (val) => {
  return val.replace(/\D/g, '')
}

const mainCategories = computed(() => {
  return categories.value.filter(c => !c.parent_id)
})

const getSubcategories = (parentId) => {
  return categories.value.filter(c => c.parent_id === parentId)
}

const getCategoryPath = (id) => {
  const cat = categories.value.find(c => c.id === id)
  if (!cat) return 'Uncategorized'
  if (!cat.parent_id) return cat.name
  const parent = categories.value.find(c => c.id === cat.parent_id)
  return parent ? `${parent.name} -> ${cat.name}` : cat.name
}

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount) + Number(t.admin_fee || 0), 0)
})

const totalSavings = computed(() => {
  return transactions.value
    .filter(t => t.type === 'savings')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalBalance = computed(() => {
  return totalIncome.value - totalExpense.value - totalSavings.value
})

const memberIds = computed(() => {
  const ids = new Set(transactions.value.map(t => t.user_id))
  const others = Array.from(ids).filter(id => id !== props.user?.id).sort()
  return others
})

const getUserLabel = (uid) => {
  if (uid === props.user?.id) return 'Anda'
  if (uid === props.activeWallet?.owner_id) return 'Pemilik'
  
  const otherMembers = memberIds.value.filter(id => id !== props.activeWallet?.owner_id)
  if (otherMembers.length <= 1) {
    return 'Anggota'
  } else {
    const index = otherMembers.indexOf(uid)
    return `Anggota ${index + 1}`
  }
}

const totalsByUser = computed(() => {
  const result = {}
  transactions.value.forEach(t => {
    if (!result[t.user_id]) {
      result[t.user_id] = { income: 0, expense: 0, savings: 0 }
    }
    const amount = Number(t.amount)
    if (t.type === 'income') result[t.user_id].income += amount
    if (t.type === 'expense') result[t.user_id].expense += amount + Number(t.admin_fee || 0)
    if (t.type === 'savings') result[t.user_id].savings += amount
  })
  return result
})

const hasMultipleMembers = computed(() => Object.keys(totalsByUser.value).length > 1)

const fetchData = async () => {
  if (!props.user || !props.activeWallet) {
    fetching.value = false
    return
  }
  fetching.value = true
  
  // Fetch categories scoped to wallet
  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .eq('wallet_id', props.activeWallet.id)
    .order('name')
  if (catData) categories.value = catData

  // Fetch transactions scoped to wallet
  const { data: txData, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', props.activeWallet.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
  } else if (txData) {
    transactions.value = txData
  }
  fetching.value = false
}

const addTransaction = async () => {
  if (!props.user || !props.activeWallet) return
  
  if (!form.value.category_id) {
    alert('Harap buat dan pilih kategori terlebih dahulu!')
    return
  }
  
  loading.value = true
  
  const tagsArray = form.value.tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: props.user.id,
      wallet_id: props.activeWallet.id,
      amount: Number(form.value.amount),
      admin_fee: hasAdminFee.value && form.value.admin_fee ? Number(form.value.admin_fee) : 0,
      type: form.value.type,
      category_id: form.value.category_id,
      description: form.value.description,
      merchant: form.value.merchant || null,
      payment_method: form.value.payment_method,
      tags: tagsArray.length > 0 ? tagsArray : null,
      date: form.value.date
    }])
    .select()

  if (error) {
    alert('Gagal menyimpan transaksi: ' + error.message)
  } else if (data) {
    transactions.value.unshift(data[0])
    hasAdminFee.value = false
    form.value = { ...defaultForm, type: form.value.type }
  }
  loading.value = false
}

const deleteTransaction = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Gagal menghapus: ' + error.message)
  } else {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }
}

// AI Scanner Logic
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Show Modal and pass the file
  scanningFile.value = file
  
  // Reset file input so user can select the same file again if needed
  if (fileInput.value) fileInput.value.value = ''
}

const closeScanner = () => {
  scanningFile.value = null
}

const handleScanSuccess = (aiResult) => {
  scanningFile.value = null
  
  // Auto-fill form
  form.value.type = 'expense'
  form.value.amount = aiResult.amount || ''
  form.value.merchant = aiResult.merchant && aiResult.merchant !== 'Toko Tidak Diketahui' ? aiResult.merchant : ''
  form.value.description = aiResult.items_detail || aiResult.items || 'Belanja Struk'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Typography & Layout */
.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-h), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
}

.text-primary { color: var(--primary); }
.font-bold { font-weight: 700; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }

/* Summary Cards Area */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  position: relative;
  z-index: 10;
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.summary-card {
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255,255,255,0.05);
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-icon-wrapper svg {
  width: 28px;
  height: 28px;
}

.bg-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.bg-green { background: linear-gradient(135deg, #10b981, #047857); }
.bg-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

.summary-card h3 {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.25rem 0;
}

.summary-card .amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-h);
  margin: 0;
  line-height: 1.2;
}

.breakdown-list {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.user-label {
  color: var(--text-muted);
}

.user-amount {
  font-weight: 600;
  opacity: 0.9;
}

.text-income { color: #10b981 !important; }
.text-expense { color: #ef4444 !important; }

/* Main Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 420px 1fr;
  }
  
  .form-section, .list-section {
    position: sticky;
    top: 80px; /* Offset to avoid navbar */
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  
  .transactions-container {
    max-height: none !important;
    overflow-y: visible !important;
  }
}

/* Form Section Styling */
.form-section {
  padding: 1.75rem;
  border-radius: 1rem;
}

/* Custom Scrollbar for Form and List */
.form-section::-webkit-scrollbar, .list-section::-webkit-scrollbar { width: 6px; }
.form-section::-webkit-scrollbar-track, .list-section::-webkit-scrollbar-track { background: transparent; }
.form-section::-webkit-scrollbar-thumb, .list-section::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.form-section::-webkit-scrollbar-thumb:hover, .list-section::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.icon-box {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-light);
  color: var(--primary);
  border-radius: 10px;
}

.form-label {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--text-h);
}

/* Segmented Control */
.segmented-control {
  display: flex;
  background-color: var(--bg-body);
  border-radius: 0.5rem;
  padding: 0.25rem;
  border: 1px solid var(--border);
}

.segmented-control input[type="radio"] {
  display: none;
}

.segment-label {
  flex: 1;
  text-align: center;
  padding: 0.6rem 1rem;
  border-radius: 0.35rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
}

#type-expense:checked ~ .expense-label {
  background-color: var(--expense-bg);
  color: var(--expense);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

#type-income:checked ~ .income-label {
  background-color: var(--income-bg);
  color: var(--income);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

#type-savings:checked ~ .savings-label {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Inputs with Prefix / Icons */
.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-prefix .prefix {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  font-weight: 600;
  pointer-events: none;
}

.input-with-prefix input {
  padding-left: 2.5rem;
}

.amount-input {
  font-size: 1.25rem !important;
  font-weight: 700;
  height: 50px !important;
}

/* Custom Select Dropdown */
.select-wrapper {
  position: relative;
}

.custom-select {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: none !important;
  padding-right: 2.5rem;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  width: 16px;
  height: 16px;
}

/* Toggle Switch */
.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border);
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Filters UI */
.filters-container {
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.4rem;
  display: block;
}

.filter-reset-btn {
  height: 38px;
  width: 38px;
  padding: 0;
  border-radius: 0.5rem;
  background-color: var(--bg-body);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.filter-reset-btn:hover {
  background-color: var(--expense-bg);
  color: var(--expense);
  border-color: var(--expense-bg);
}

.form-control-sm {
  height: 38px;
  font-size: 0.85rem;
  border-radius: 0.5rem;
  background-color: var(--bg-body);
}

/* Animations & States */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-state, .empty-state {
  padding: 4rem 2rem;
  border-radius: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--primary-light);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Utility Classes */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.gap-3 { gap: 0.75rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.m-0 { margin: 0; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.mt-12 { margin-top: 3rem; }
.pl-1 { padding-left: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.opacity-50 { opacity: 0.5; }
.animate-spin { animation: spin 1s linear infinite; }

/* Custom Scrollbar for Transactions */
.transactions-container {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.transactions-container::-webkit-scrollbar { width: 6px; }
.transactions-container::-webkit-scrollbar-track { background: transparent; }
.transactions-container::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.transactions-container::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
</style>
