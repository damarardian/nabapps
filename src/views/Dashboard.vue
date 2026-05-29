<template>
  <div class="container dashboard">
    <!-- Header Summary -->
    <div class="summary-grid mt-8 mb-8">
      <div class="summary-card glass-panel total">
        <h3>Total Saldo</h3>
        <p class="amount">Rp {{ formatCurrency(totalBalance) }}</p>
      </div>
      <div class="summary-card glass-panel income">
        <h3>Pemasukan</h3>
        <p class="amount text-income">Rp {{ formatCurrency(totalIncome) }}</p>
      </div>
      <div class="summary-card glass-panel expense">
        <h3>Pengeluaran</h3>
        <p class="amount text-expense">Rp {{ formatCurrency(totalExpense) }}</p>
      </div>
    </div>

    <div class="main-grid">
      <!-- Add Transaction Form -->
      <div class="form-section glass-panel">
        <h2 class="mb-4">Catat Transaksi</h2>
        <form @submit.prevent="addTransaction">
          <div class="form-group">
            <label class="form-label">Jenis</label>
            <div class="flex gap-4">
              <label class="radio-label">
                <input type="radio" v-model="form.type" value="income"> Pemasukan
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.type" value="expense"> Pengeluaran
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nominal (Rp)</label>
            <input type="text" :value="formatCurrencyValue(form.amount)" @input="form.amount = unformatCurrency($event.target.value)" class="form-control" required placeholder="0">
          </div>
          
          <div class="form-group" v-if="form.type === 'expense'">
            <label class="form-label flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="hasAdminFee"> 
              Tambahkan Biaya Admin / Pajak
            </label>
            <input v-if="hasAdminFee" type="text" :value="formatCurrencyValue(form.admin_fee)" @input="form.admin_fee = unformatCurrency($event.target.value)" class="form-control mt-2" placeholder="0">
          </div>

          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select v-model="form.category_id" class="form-control" required>
              <option disabled :value="null">Pilih Kategori</option>
              <template v-for="main in mainCategories" :key="main.id">
                <optgroup v-if="main.type === form.type" :label="main.name">
                  <option :value="main.id">{{ main.name }} (Utama)</option>
                  <option v-for="sub in getSubcategories(main.id)" :key="sub.id" :value="sub.id">
                    -- {{ sub.name }}
                  </option>
                </optgroup>
              </template>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan</label>
            <input type="text" v-model="form.description" class="form-control" required placeholder="Misal: Makan siang">
          </div>
          
          <!-- Advanced Dimensions -->
          <div class="form-group">
            <label class="form-label">Merchant / Lokasi (Opsional)</label>
            <input type="text" v-model="form.merchant" class="form-control" placeholder="Misal: Warteg, Tokopedia">
          </div>
          
          <div class="form-group">
            <label class="form-label">Metode Pembayaran</label>
            <input type="text" list="paymentMethods" v-model="form.payment_method" class="form-control" required placeholder="Cash, BCA, GoPay...">
            <datalist id="paymentMethods">
              <option value="Cash" />
              <option value="QRIS" />
              <option value="BCA" />
              <option value="Mandiri" />
              <option value="GoPay" />
              <option value="OVO" />
              <option value="Kartu Kredit" />
              <option value="Paylater" />
            </datalist>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tags / Label (Opsional)</label>
            <input type="text" v-model="form.tagsInput" class="form-control" placeholder="Pisahkan dengan koma (misal: Liburan2026, Dinas)">
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input type="date" v-model="form.date" class="form-control" required>
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Simpan Transaksi' }}
          </button>
        </form>
      </div>

      <!-- Transaction List -->
      <div class="list-section">
        <div class="flex justify-between items-center mb-4">
          <h2>Riwayat Transaksi</h2>
        </div>
        
        <div v-if="fetching" class="text-center text-muted py-8">
          Memuat data...
        </div>
        <div v-else-if="transactions.length === 0" class="text-center text-muted py-8 surface">
          Belum ada transaksi dicatat.
        </div>
        <div v-else class="transactions-container">
          <TransactionItem 
            v-for="(tx, index) in transactions" 
            :key="tx.id" 
            :transaction="tx"
            :category="getCategoryPath(tx.category_id)"
            :index="index"
            @delete="deleteTransaction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../supabase'
import TransactionItem from '../components/TransactionItem.vue'

const props = defineProps(['user'])

const transactions = ref([])
const categories = ref([])
const loading = ref(false)
const fetching = ref(true)
const hasAdminFee = ref(false)

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

// Reset form values on type change
watch(() => form.value.type, () => {
  form.value.category_id = null
  if (form.value.type === 'income') {
    hasAdminFee.value = false
    form.value.admin_fee = ''
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

const totalBalance = computed(() => {
  return totalIncome.value - totalExpense.value
})

const fetchData = async () => {
  if (!props.user) return
  fetching.value = true
  
  // Fetch categories
  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', props.user.id)
    .order('name')
  if (catData) categories.value = catData

  // Fetch transactions
  const { data: txData, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', props.user.id)
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
  if (!props.user) return
  
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  position: sticky;
  top: 60px; /* Below navbar */
  z-index: 40;
  padding-bottom: 1rem;
  background-color: var(--bg-body); /* Prevent transparency issues */
}

.summary-card {
  padding: 1.5rem;
  background-color: var(--bg-surface);
}

.summary-card h3 {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.summary-card .amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-main);
}

.text-income { color: var(--income) !important; }
.text-expense { color: var(--text-main) !important; }

.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

@media (min-width: 768px) {
  .main-grid {
    grid-template-columns: 400px 1fr;
  }
  
  .form-section {
    position: sticky;
    top: 80px; /* Offset for navbar */
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  
  .list-section {
    /* Optional: constrain list height to screen as well */
    max-height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
  }
}

.form-section {
  padding: 1.5rem;
  background-color: var(--bg-surface);
}

/* Custom Scrollbar for form-section */
.form-section::-webkit-scrollbar { width: 4px; }
.form-section::-webkit-scrollbar-track { background: transparent; }
.form-section::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.cursor-pointer { cursor: pointer; }

.list-section h2 {
  flex-shrink: 0;
}

.transactions-container {
  overflow-y: auto;
  padding-right: 0.5rem;
  flex: 1;
}

@media (max-width: 767px) {
  .transactions-container {
    max-height: 600px; /* Keep strict max height for mobile */
  }
}

.transactions-container::-webkit-scrollbar { width: 6px; }
.transactions-container::-webkit-scrollbar-track { background: transparent; }
.transactions-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.transactions-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
