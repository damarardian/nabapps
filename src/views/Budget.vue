<template>
  <div class="container mt-8 pb-16">
    <div v-if="!activeWallet" class="glass-panel text-center p-8 mb-8 mt-12 empty-wallet-state">
      <div class="empty-icon-large mb-4 mx-auto text-muted opacity-50">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold mb-2">Tidak ada Buku Kas aktif</h2>
      <p class="text-muted">Silakan buat atau pilih buku kas di menu Navigasi (atas) terlebih dahulu untuk mulai mengatur anggaran.</p>
    </div>
    
    <div v-else class="budget-wrapper">
      
      <!-- Page Header with Month & User Selector -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        
        <div class="flex items-center gap-3">
          <!-- User Selector -->
          <div v-if="walletMembers.length > 1" class="user-selector-glass p-1 rounded-full flex items-center shadow-sm">
            <div class="icon-user px-3 text-primary">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <select v-model="selectedUserId" class="user-input">
              <option v-for="member in walletMembers" :key="member.user_id" :value="member.user_id">
                Anggaran {{ getUserLabel(member.user_id) }}
              </option>
            </select>
          </div>

          <!-- Custom Month Picker -->
          <div class="relative month-picker-container" @click.stop>
            <!-- Toggle Button -->
            <button @click="isMonthPickerOpen = !isMonthPickerOpen" class="month-selector-glass p-1 rounded-full flex items-center shadow-sm cursor-pointer transition-all">
              <div class="icon-calendar px-3 text-primary">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <span class="custom-month-text">{{ currentMonthFormatted }}</span>
              <div class="px-3 text-muted">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>

            <!-- Popup Dropdown -->
            <div v-if="isMonthPickerOpen" class="month-popup glass-panel absolute top-full left-0 mt-2 p-4 shadow-xl z-50 animate-slide-up">
              <!-- Year Selector Header -->
              <div class="flex justify-between items-center mb-4">
                <button @click="pickerYear--" class="year-nav-btn hover:text-primary">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span class="font-bold text-lg">{{ pickerYear }}</span>
                <button @click="pickerYear++" class="year-nav-btn hover:text-primary">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <!-- Months Grid -->
              <div class="grid grid-cols-3 gap-2">
                <button 
                  v-for="(monthName, index) in monthNames" 
                  :key="index"
                  @click="selectMonth(index + 1)"
                  class="month-btn py-2 px-3 rounded-lg text-sm text-center transition-colors"
                  :class="{
                    'bg-primary text-white font-bold': isSelectedMonth(index + 1),
                    'hover:bg-surface-hover text-muted': !isSelectedMonth(index + 1)
                  }"
                >
                  {{ monthName }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Header: Ready to Assign (Hero Card) -->
      <div class="glass-panel rta-hero mb-10 p-8 text-center" 
           :class="{ 
             'is-zero': readyToAssign === 0, 
             'is-positive': readyToAssign > 0, 
             'is-negative': readyToAssign < 0 
           }">
        <div class="rta-glow"></div>
        <div class="rta-content relative z-10">
          <h2 class="uppercase tracking-widest text-sm font-bold opacity-80 mb-2">Siap Dialokasikan</h2>
          <div class="rta-amount font-extrabold text-5xl md:text-6xl mb-4">
            <span class="currency-symbol text-2xl align-top mr-1">Rp</span>{{ formatCurrency(readyToAssign) }}
          </div>
          
          <div class="rta-status-badge inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm">
            <template v-if="readyToAssign === 0">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Setiap rupiah sudah diberi tugas!</span>
            </template>
            <template v-else-if="readyToAssign > 0">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <span>Tugaskan sisa uang ini ke kategori di bawah.</span>
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>Anda mengalokasikan uang lebih dari yang dimiliki!</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Budget Table -->
      <div class="glass-panel overflow-hidden p-0 budget-table-container shadow-md">
        <div v-if="fetching" class="p-16 text-center text-muted flex flex-col items-center">
          <div class="spinner mb-4"></div>
          <p>Memuat data anggaran...</p>
        </div>
        <div v-else-if="categories.length === 0" class="p-16 text-center text-muted">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <h3 class="text-xl font-bold mb-2">Kategori Belum Tersedia</h3>
          <p>Silakan buat kategori pengeluaran terlebih dahulu di menu Kategori.</p>
        </div>
        <div v-else class="table-responsive">
          <table class="budget-table">
            <thead>
              <tr>
                <th class="w-1/3">Kategori</th>
                <th class="text-right">Dianggarkan <span class="block text-xxs opacity-70 uppercase tracking-wider font-normal mt-1">Bulan Ini</span></th>
                <th class="text-right">Terpakai <span class="block text-xxs opacity-70 uppercase tracking-wider font-normal mt-1">Bulan Ini</span></th>
                <th class="text-right">Tersedia <span class="block text-xxs opacity-70 uppercase tracking-wider font-normal mt-1">Total Tersisa</span></th>
              </tr>
            </thead>
            <tbody>
            <template v-for="cat in budgetCategories" :key="cat.id">
              <!-- Parent Category Row -->
              <tr v-if="!cat.parent_id" class="parent-row">
                <td class="font-bold category-name">
                  <div class="flex items-center gap-2">
                    <div class="folder-icon text-primary opacity-70">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    {{ cat.name }}
                  </div>
                </td>
                <td class="text-right p-2">
                  <div class="input-wrapper" :class="{ 'opacity-50': selectedUserId !== props.user?.id }">
                    <span class="currency-prefix">Rp</span>
                    <input 
                      type="text" 
                      class="budget-input font-semibold text-primary" 
                      :value="formatCurrencyValue(getBudgetForCategory(cat.id))"
                      @input="$event.target.value = formatCurrencyValue(unformatCurrency($event.target.value))"
                      @change="updateBudget(cat.id, unformatCurrency($event.target.value))"
                      placeholder="0"
                      :disabled="selectedUserId !== props.user?.id"
                    >
                  </div>
                </td>
                <td class="text-right text-muted activity-cell">
                  <span v-if="getActivityForCategory(cat.id) > 0">- Rp {{ formatCurrency(getActivityForCategory(cat.id)) }}</span>
                  <span v-else class="opacity-30">Rp 0</span>
                </td>
                <td class="text-right font-bold available-cell">
                  <div class="available-pill" :class="getAvailableClass(getAvailableForCategory(cat.id))">
                    Rp {{ formatCurrency(getAvailableForCategory(cat.id)) }}
                  </div>
                </td>
              </tr>
              <!-- Child Category Rows -->
              <tr v-for="sub in getSubcategories(cat.id)" :key="sub.id" class="child-row">
                <td class="category-name pl-10 relative">
                  <div class="tree-line"></div>
                  {{ sub.name }}
                </td>
                <td class="text-right p-2">
                  <div class="input-wrapper" :class="{ 'opacity-50': selectedUserId !== props.user?.id }">
                    <span class="currency-prefix">Rp</span>
                    <input 
                      type="text" 
                      class="budget-input" 
                      :value="formatCurrencyValue(getBudgetForCategory(sub.id))"
                      @input="$event.target.value = formatCurrencyValue(unformatCurrency($event.target.value))"
                      @change="updateBudget(sub.id, unformatCurrency($event.target.value))"
                      placeholder="0"
                      :disabled="selectedUserId !== props.user?.id"
                    >
                  </div>
                </td>
                <td class="text-right text-muted activity-cell">
                  <span v-if="getActivityForCategory(sub.id) > 0">- Rp {{ formatCurrency(getActivityForCategory(sub.id)) }}</span>
                  <span v-else class="opacity-30">Rp 0</span>
                </td>
                <td class="text-right font-bold available-cell">
                  <div class="available-pill" :class="getAvailableClass(getAvailableForCategory(sub.id))">
                    Rp {{ formatCurrency(getAvailableForCategory(sub.id)) }}
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps(['user', 'activeWallet'])

const fetching = ref(true)
const categories = ref([])
const transactions = ref([])
const budgets = ref([])
const walletMembers = ref([])
const selectedUserId = ref(null)

// 'YYYY-MM' format for month input
const selectedMonth = ref(new Date().toISOString().substring(0, 7))

// Custom Month Picker Logic
const isMonthPickerOpen = ref(false)
const pickerYear = ref(parseInt(selectedMonth.value.split('-')[0]))
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const selectMonth = (monthNumber) => {
  const formattedMonth = String(monthNumber).padStart(2, '0')
  selectedMonth.value = `${pickerYear.value}-${formattedMonth}`
  isMonthPickerOpen.value = false
}

const isSelectedMonth = (monthNumber) => {
  const target = `${pickerYear.value}-${String(monthNumber).padStart(2, '0')}`
  return selectedMonth.value === target
}

// Close popup on outside click
const closePicker = (e) => {
  isMonthPickerOpen.value = false
}
onMounted(() => window.addEventListener('click', closePicker))
onUnmounted(() => window.removeEventListener('click', closePicker))

// Payday logic based on selected user
const getPaydayForSelectedUser = () => {
  const member = walletMembers.value.find(m => m.user_id === selectedUserId.value)
  return member?.payday_date || 1
}

const currentMonthFormatted = computed(() => {
  if (!selectedMonth.value) return ''
  const [year, month] = selectedMonth.value.split('-')
  const date = new Date(year, month - 1)
  const baseLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
  
  const payday = getPaydayForSelectedUser()
  if (payday === 1) return baseLabel
  
  const mIndex = parseInt(month) - 1
  const prevDate = new Date(year, mIndex - 1)
  const prevMonthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(prevDate)
  const currMonthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date)
  
  return `${baseLabel} (${payday} ${prevMonthName} - ${payday - 1} ${currMonthName})`
})

// Fetch all necessary data
const fetchData = async () => {
  if (!props.user || !props.activeWallet) {
    fetching.value = false
    return
  }
  fetching.value = true
  
  if (!selectedUserId.value) {
    selectedUserId.value = props.user.id
  }
  
  const [catRes, txRes, budgetRes, memberRes] = await Promise.all([
    supabase.from('categories').select('*').eq('wallet_id', props.activeWallet.id),
    supabase.from('transactions').select('*').eq('wallet_id', props.activeWallet.id),
    supabase.from('budgets').select('*').eq('wallet_id', props.activeWallet.id),
    supabase.from('wallet_members').select('user_id, role, payday_date').eq('wallet_id', props.activeWallet.id)
  ])

  if (catRes.data) categories.value = catRes.data
  if (txRes.data) transactions.value = txRes.data
  if (budgetRes.data) budgets.value = budgetRes.data
  if (memberRes.data) walletMembers.value = memberRes.data
  
  fetching.value = false
}

// Watch selected month to re-render (we fetch all data once, filter in memory for speed)
watch(selectedMonth, () => {
  // Re-render handled by computeds
})

// Refetch data when activeWallet changes
watch(() => props.activeWallet, (newWallet) => {
  if (newWallet) fetchData()
  else {
    categories.value = []
    transactions.value = []
    budgets.value = []
  }
})

// Categories
const budgetCategories = computed(() => categories.value.filter(c => c.type === 'expense' || c.type === 'savings'))

const getSubcategories = (parentId) => {
  return categories.value.filter(c => c.parent_id === parentId)
}

// User Formatting
const getUserLabel = (uid) => {
  if (uid === props.user?.id) return 'Anda'
  if (uid === props.activeWallet?.owner_id) return 'Pemilik'
  
  const otherMembers = walletMembers.value.map(m => m.user_id).filter(id => id !== props.activeWallet?.owner_id)
  if (otherMembers.length <= 1) {
    return 'Anggota'
  } else {
    const index = otherMembers.indexOf(uid)
    return `Anggota ${index + 1}`
  }
}

// YNAB Math (Scoped by User & Time-Aware up to Selected Month)
const getActiveMonths = () => {
  if (!selectedMonth.value) return []
  
  let earliest = selectedMonth.value
  transactions.value.forEach(t => {
    const ym = t.date.substring(0, 7)
    if (ym < earliest) earliest = ym
  })
  budgets.value.forEach(b => {
    const ym = b.month.substring(0, 7)
    if (ym < earliest) earliest = ym
  })
  
  const result = []
  let current = new Date(`${earliest}-01`)
  const end = new Date(`${selectedMonth.value}-01`)
  
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    result.push(`${y}-${m}`)
    current.setMonth(current.getMonth() + 1)
  }
  
  return result
}

const totalIncomeAllTime = computed(() => {
  if (!selectedMonth.value) return 0
  const endOfSelected = getMonthStartEnd(selectedMonth.value).end.split('T')[0]
  return transactions.value
    .filter(t => t.type === 'income' && t.user_id === selectedUserId.value && t.date <= endOfSelected)
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalAssignedAllTime = computed(() => {
  let sum = 0
  categories.value.forEach(c => {
    if (c.type === 'expense' || c.type === 'savings') {
       sum += getAllTimeAssigned(c.id)
    }
  })
  return sum
})

const readyToAssign = computed(() => {
  return totalIncomeAllTime.value - totalAssignedAllTime.value
})

const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val)

const formatCurrencyValue = (val) => {
  if (!val && val !== 0) return ''
  return new Intl.NumberFormat('id-ID').format(val)
}

const unformatCurrency = (val) => {
  return String(val).replace(/\D/g, '')
}

// Budget Cell Logics
const getMonthStartEnd = (ym) => {
  if (!ym) return { start: new Date().toISOString(), end: new Date().toISOString() }
  const [y, m] = ym.split('-')
  const year = parseInt(y)
  const month = parseInt(m)
  const payday = getPaydayForSelectedUser()
  
  if (payday === 1) {
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString()
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString()
    return { start, end }
  } else {
    // If payday > 1, cycle starts in previous month at payday, ends this month at payday - 1
    const start = new Date(Date.UTC(year, month - 2, payday)).toISOString()
    const end = new Date(Date.UTC(year, month - 1, payday - 1, 23, 59, 59)).toISOString()
    return { start, end }
  }
}

const getAssignedForMonth = (categoryId, monthStr) => {
  // Exact match for the month
  const exact = budgets.value.find(b => b.category_id === categoryId && b.user_id === selectedUserId.value && b.month.startsWith(monthStr))
  if (exact) return Number(exact.assigned_amount)
  
  // Past match (carry over the most recent budget)
  const pastBudgets = budgets.value
    .filter(b => b.category_id === categoryId && b.user_id === selectedUserId.value && b.month < `${monthStr}-01`)
    .sort((a, b) => b.month.localeCompare(a.month)) // descending
    
  if (pastBudgets.length > 0) return Number(pastBudgets[0].assigned_amount)
  
  return 0
}

const getBudgetForCategory = (categoryId) => {
  return getAssignedForMonth(categoryId, selectedMonth.value)
}

const getAllTimeAssigned = (categoryId) => {
  const months = getActiveMonths()
  return months.reduce((sum, monthStr) => {
    return sum + getAssignedForMonth(categoryId, monthStr)
  }, 0)
}

const getAllTimeActivity = (categoryId) => {
  if (!selectedMonth.value) return 0
  const endOfSelected = getMonthStartEnd(selectedMonth.value).end.split('T')[0]
  return transactions.value
    .filter(t => t.category_id === categoryId && t.user_id === selectedUserId.value && t.date <= endOfSelected && (t.type === 'expense' || t.type === 'savings'))
    .reduce((sum, t) => sum + Number(t.amount) + Number(t.admin_fee || 0), 0)
}

const getActivityForCategory = (categoryId) => {
  const { start, end } = getMonthStartEnd(selectedMonth.value)
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return 0
  
  let activity = transactions.value
    .filter(t => t.category_id === categoryId && t.user_id === selectedUserId.value && t.date >= start.split('T')[0] && t.date <= end.split('T')[0] && (t.type === 'expense' || t.type === 'savings'))
    .reduce((sum, t) => sum + Number(t.amount) + Number(t.admin_fee || 0), 0)
    
  if (!cat.parent_id) {
    // Kategori master: tambahkan terpakai dari sub-kategori yang tidak punya anggaran
    const subs = getSubcategories(categoryId)
    for (const sub of subs) {
      if (getAllTimeAssigned(sub.id) === 0) {
        const subActivity = transactions.value
          .filter(t => t.category_id === sub.id && t.user_id === selectedUserId.value && t.date >= start.split('T')[0] && t.date <= end.split('T')[0] && (t.type === 'expense' || t.type === 'savings'))
          .reduce((sum, t) => sum + Number(t.amount) + Number(t.admin_fee || 0), 0)
        activity += subActivity
      }
    }
  }
  
  return activity
}

const getAvailableForCategory = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return 0
  
  if (!cat.parent_id) {
    const assigned = getAllTimeAssigned(categoryId)
    let activity = getAllTimeActivity(categoryId)
    
    // Kurangi tersedia master dengan aktivitas sub-kategori yang tidak punya anggaran
    const subs = getSubcategories(categoryId)
    for (const sub of subs) {
      if (getAllTimeAssigned(sub.id) === 0) {
        activity += getAllTimeActivity(sub.id)
      }
    }
    return assigned - activity
  } else {
    const assigned = getAllTimeAssigned(categoryId)
    if (assigned === 0) {
      return 0 // Saldo diambil dari master, jadi sub ini tidak punya saldo tersedia sendiri
    }
    const activity = getAllTimeActivity(categoryId)
    return assigned - activity
  }
}

const getAvailableClass = (amount) => {
  if (amount > 0) return 'text-primary'
  if (amount < 0) return 'text-expense'
  return 'text-muted'
}

// Updating budget
const updateBudget = async (categoryId, value) => {
  if (!props.user || !props.activeWallet) return
  if (selectedUserId.value !== props.user.id) return // Readonly guard
  
  const numVal = Number(value) || 0
  
  // Find if we need to insert or update
  const targetMonth = `${selectedMonth.value}-01` // Postgres DATE format
  const existingBudget = budgets.value.find(b => b.category_id === categoryId && b.user_id === props.user.id && b.month.startsWith(selectedMonth.value))
  
  if (existingBudget) {
    // Update
    const { error } = await supabase
      .from('budgets')
      .update({ assigned_amount: numVal })
      .eq('id', existingBudget.id)
      
    if (!error) existingBudget.assigned_amount = numVal
  } else {
    // Insert
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        user_id: props.user.id,
        wallet_id: props.activeWallet.id,
        category_id: categoryId,
        month: targetMonth,
        assigned_amount: numVal
      }])
      .select()
      
    if (!error && data) budgets.value.push(data[0])
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Typography & Utility */
.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-h), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.tracking-widest { letter-spacing: 0.1em; }
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }
.font-extrabold { font-weight: 800; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.font-normal { font-weight: 400; }
.text-sm { font-size: 0.875rem; }
.text-5xl { font-size: 3rem; }
.text-xl { font-size: 1.25rem; }
.text-xxs { font-size: 10px; }
.opacity-80 { opacity: 0.8; }
.opacity-70 { opacity: 0.7; }
.opacity-50 { opacity: 0.5; }
.opacity-30 { opacity: 0.3; }
.m-0 { margin: 0; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-8 { margin-top: 2rem; }
.pb-16 { padding-bottom: 4rem; }
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-8 { padding: 2rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.pl-10 { padding-left: 2.5rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.w-1\/3 { width: 33.333333%; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.block { display: block; }
.inline-flex { display: inline-flex; }
.relative { position: relative; }
.z-10 { z-index: 10; }
.rounded-full { border-radius: 9999px; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.overflow-hidden { overflow: hidden; }

@media (min-width: 768px) {
  .md\:flex-row { flex-direction: row; }
  .md\:items-center { align-items: center; }
  .md\:text-6xl { font-size: 3.75rem; }
}

.text-primary { color: var(--primary) !important; }
.text-expense { color: var(--expense) !important; }

/* Month Selector & User Selector */
.month-selector-glass,
.user-selector-glass {
  background: var(--bg-surface);
  border: 1px solid var(--border);
}

.text-main { color: var(--text-h); }

/* Custom Month Picker Styles */
.custom-month-text {
  background: transparent;
  color: var(--text-h);
  font-weight: 600;
  padding: 0.5rem 0.5rem 0.5rem 0.25rem;
  font-size: 0.95rem;
}

.month-popup {
  width: 280px;
  border-radius: 1rem;
  border: 1px solid var(--border);
}
.year-nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--text-muted);
  transition: color 0.2s;
}
.month-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}
.month-btn.bg-primary {
  background-color: var(--primary) !important;
  color: white !important;
}
.hover\:bg-surface-hover:hover {
  background-color: var(--bg-surface-hover);
}
.z-50 {
  z-index: 50;
}
.absolute {
  position: absolute;
}
.top-full {
  top: 100%;
}
.left-0 {
  left: 0;
}
.grid {
  display: grid;
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.user-input {
  background: transparent;
  border: none;
  color: var(--text-h);
  font-weight: 600;
  padding: 0.5rem 1rem;
  outline: none;
  font-size: 0.95rem;
  cursor: pointer;
  appearance: none;
}

.user-input option {
  background: var(--bg-body);
  color: var(--text-h);
}

/* RTA Hero Card */
.rta-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s ease;
}

.rta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  opacity: 0.15;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  transition: background 0.5s ease;
}

.rta-hero.is-zero {
  border-color: rgba(170, 59, 255, 0.3);
}
.rta-hero.is-zero .rta-glow {
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
}
.rta-hero.is-zero .rta-status-badge {
  background: rgba(170, 59, 255, 0.15);
  color: var(--primary);
}
.rta-hero.is-zero .rta-amount {
  color: var(--text-h);
}

.rta-hero.is-positive {
  border-color: rgba(16, 185, 129, 0.3);
}
.rta-hero.is-positive .rta-glow {
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
}
.rta-hero.is-positive .rta-status-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.rta-hero.is-positive .rta-amount {
  color: #10b981;
}

.rta-hero.is-negative {
  border-color: rgba(239, 68, 68, 0.3);
}
.rta-hero.is-negative .rta-glow {
  background: radial-gradient(circle, #ef4444 0%, transparent 70%);
}
.rta-hero.is-negative .rta-status-badge {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.rta-hero.is-negative .rta-amount {
  color: #ef4444;
}

/* Budget Table */
.budget-table-container {
  border-radius: 1rem;
}
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.budget-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.budget-table th {
  background-color: var(--primary-light, rgba(170, 59, 255, 0.1));
  padding: 1.25rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary);
  border-bottom: 2px solid var(--border);
}

.budget-table td {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  vertical-align: middle;
}

.parent-row {
  background-color: rgba(255, 255, 255, 0.02);
}
.parent-row:hover { background-color: rgba(255, 255, 255, 0.04); }

.child-row {
  background-color: transparent;
}
.child-row:hover { background-color: rgba(255, 255, 255, 0.02); }

.category-name {
  font-size: 0.95rem;
  color: var(--text-h);
}

/* Tree Line for subcategories */
.tree-line {
  position: absolute;
  left: 1.25rem;
  top: 0;
  bottom: 50%;
  width: 1rem;
  border-left: 2px solid var(--border);
  border-bottom: 2px solid var(--border);
  border-bottom-left-radius: 0.3rem;
  opacity: 0.5;
}

/* Custom Input Field inside table */
.input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: var(--bg-body);
  border: 1px solid transparent;
  border-radius: 0.5rem;
  transition: all 0.2s;
}
.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(170, 59, 255, 0.2);
}
.input-wrapper:hover:not(:focus-within) {
  border-color: var(--border);
}
.currency-prefix {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}
.budget-input {
  width: 140px;
  background: transparent;
  border: none;
  color: var(--text-h);
  text-align: right;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  font-size: 0.9rem;
  outline: none;
}

.activity-cell {
  font-variant-numeric: tabular-nums;
}

/* Available Pill */
.available-pill {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-variant-numeric: tabular-nums;
  background-color: var(--bg-body);
  border: 1px solid transparent;
}
.available-pill.text-primary {
  background-color: rgba(170, 59, 255, 0.1);
  color: var(--primary);
}
.available-pill.text-expense {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.available-pill.text-muted {
  color: var(--text-muted);
}

/* Loader */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--primary-light);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
