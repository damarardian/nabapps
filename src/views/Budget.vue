<template>
  <div class="container mt-8">
    <!-- Header: Ready to Assign -->
    <div class="glass-panel rta-panel text-center mb-8 p-8">
      <h2 class="text-muted mb-2 font-normal">Siap Dialokasikan (Ready to Assign)</h2>
      <div class="rta-amount" :class="{ 'negative': readyToAssign < 0 }">
        Rp {{ formatCurrency(readyToAssign) }}
      </div>
      <p v-if="readyToAssign === 0" class="rta-status success mt-2">
        🎉 Selamat! Setiap rupiah sudah diberi tugas.
      </p>
      <p v-else-if="readyToAssign > 0" class="rta-status warning mt-2">
        Tugaskan sisa uang Anda ke dalam kategori di bawah.
      </p>
      <p v-else class="rta-status error mt-2">
        ⚠️ Anda mengalokasikan uang lebih dari yang Anda miliki!
      </p>
    </div>

    <!-- Month Selector -->
    <div class="flex justify-between items-center mb-6">
      <h2>Anggaran Bulan: {{ currentMonthFormatted }}</h2>
      <input type="month" v-model="selectedMonth" class="form-control w-auto">
    </div>

    <!-- Budget Table -->
    <div class="glass-panel overflow-hidden">
      <div v-if="fetching" class="p-8 text-center text-muted">Memuat data anggaran...</div>
      <div v-else-if="categories.length === 0" class="p-8 text-center text-muted">
        Silakan buat kategori pengeluaran terlebih dahulu di menu Kategori.
      </div>
      <div v-else class="table-responsive">
        <table class="budget-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th class="text-right">Dianggarkan (Assigned)</th>
              <th class="text-right">Terpakai (Activity)</th>
              <th class="text-right">Tersedia (Available)</th>
            </tr>
          </thead>
          <tbody>
          <template v-for="cat in expenseCategories" :key="cat.id">
            <!-- Parent Category Row -->
            <tr v-if="!cat.parent_id" class="parent-row">
              <td class="font-bold">{{ cat.name }}</td>
              <td class="text-right">
                <input 
                  type="text" 
                  class="budget-input form-control" 
                  :value="formatCurrencyValue(getBudgetForCategory(cat.id))"
                  @input="$event.target.value = formatCurrencyValue(unformatCurrency($event.target.value))"
                  @change="updateBudget(cat.id, unformatCurrency($event.target.value))"
                >
              </td>
              <td class="text-right text-muted">- Rp {{ formatCurrency(getActivityForCategory(cat.id)) }}</td>
              <td class="text-right font-bold" :class="getAvailableClass(getAvailableForCategory(cat.id))">
                Rp {{ formatCurrency(getAvailableForCategory(cat.id)) }}
              </td>
            </tr>
            <!-- Child Category Rows -->
            <tr v-for="sub in getSubcategories(cat.id)" :key="sub.id" class="child-row">
              <td class="pl-8 flex items-center gap-2">
                <span class="tree-line">└</span> {{ sub.name }}
              </td>
              <td class="text-right">
                <input 
                  type="text" 
                  class="budget-input form-control" 
                  :value="formatCurrencyValue(getBudgetForCategory(sub.id))"
                  @input="$event.target.value = formatCurrencyValue(unformatCurrency($event.target.value))"
                  @change="updateBudget(sub.id, unformatCurrency($event.target.value))"
                >
              </td>
              <td class="text-right text-muted">- Rp {{ formatCurrency(getActivityForCategory(sub.id)) }}</td>
              <td class="text-right font-bold" :class="getAvailableClass(getAvailableForCategory(sub.id))">
                Rp {{ formatCurrency(getAvailableForCategory(sub.id)) }}
              </td>
            </tr>
          </template>
        </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps(['user'])

const fetching = ref(true)
const categories = ref([])
const transactions = ref([])
const budgets = ref([])

// 'YYYY-MM' format for month input
const selectedMonth = ref(new Date().toISOString().substring(0, 7))

const currentMonthFormatted = computed(() => {
  if (!selectedMonth.value) return ''
  const [year, month] = selectedMonth.value.split('-')
  const date = new Date(year, month - 1)
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
})

// Fetch all necessary data
const fetchData = async () => {
  if (!props.user) return
  fetching.value = true
  
  const [catRes, txRes, budgetRes] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', props.user.id),
    supabase.from('transactions').select('*').eq('user_id', props.user.id),
    supabase.from('budgets').select('*').eq('user_id', props.user.id)
  ])

  if (catRes.data) categories.value = catRes.data
  if (txRes.data) transactions.value = txRes.data
  if (budgetRes.data) budgets.value = budgetRes.data
  
  fetching.value = false
}

// Watch selected month to re-render (we fetch all data once, filter in memory for speed)
watch(selectedMonth, () => {
  // Re-render handled by computeds
})

// Categories
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))

const getSubcategories = (parentId) => {
  return categories.value.filter(c => c.parent_id === parentId)
}

// YNAB Math
const totalIncomeAllTime = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalAssignedAllTime = computed(() => {
  return budgets.value.reduce((sum, b) => sum + Number(b.assigned_amount), 0)
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
  const [y, m] = ym.split('-')
  const start = new Date(y, m - 1, 1).toISOString()
  const end = new Date(y, m, 0, 23, 59, 59).toISOString() // last day of month
  return { start, end }
}

const getBudgetForCategory = (categoryId) => {
  // Budget for *selected* month
  const targetDateStr = `${selectedMonth.value}-01`
  const b = budgets.value.find(b => b.category_id === categoryId && b.month.startsWith(selectedMonth.value))
  return b ? Number(b.assigned_amount) : 0
}

const getActivityForCategory = (categoryId) => {
  // Activity for *selected* month
  const { start, end } = getMonthStartEnd(selectedMonth.value)
  return transactions.value
    .filter(t => t.category_id === categoryId && t.date >= start.split('T')[0] && t.date <= end.split('T')[0] && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount) + Number(t.admin_fee || 0), 0)
}

const getAvailableForCategory = (categoryId) => {
  // Available is All-Time Assigned - All-Time Activity
  const allTimeAssigned = budgets.value
    .filter(b => b.category_id === categoryId)
    .reduce((sum, b) => sum + Number(b.assigned_amount), 0)
    
  const allTimeActivity = transactions.value
    .filter(t => t.category_id === categoryId && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount) + Number(t.admin_fee || 0), 0)
    
  return allTimeAssigned - allTimeActivity
}

const getAvailableClass = (amount) => {
  if (amount > 0) return 'text-primary'
  if (amount < 0) return 'text-expense'
  return 'text-muted'
}

// Updating budget
const updateBudget = async (categoryId, value) => {
  if (!props.user) return
  const numVal = Number(value) || 0
  
  // Find if we need to insert or update
  const targetMonth = `${selectedMonth.value}-01` // Postgres DATE format
  const existingBudget = budgets.value.find(b => b.category_id === categoryId && b.month.startsWith(selectedMonth.value))
  
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
.rta-panel {
  background: linear-gradient(145deg, var(--primary-light), var(--bg-surface));
  border: 2px solid var(--primary);
}

.rta-amount {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.2;
}

.rta-amount.negative {
  color: var(--expense);
}

.font-normal { font-weight: 400; }
.font-bold { font-weight: 700; }
.text-primary { color: var(--primary); }
.text-expense { color: var(--expense); }
.text-muted { color: var(--text-muted); }

.rta-status { font-weight: 500; }
.rta-status.success { color: var(--primary-hover); }
.rta-status.warning { color: #d97706; }
.rta-status.error { color: var(--expense); }

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.budget-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Ensure columns don't squash too much */
}

.budget-table th, .budget-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.budget-table th {
  background-color: var(--bg-surface-hover);
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  font-weight: 600;
}

.parent-row {
  background-color: var(--bg-surface);
}

.child-row {
  background-color: var(--bg-body);
}

.budget-input {
  max-width: 150px;
  text-align: right;
  display: inline-block;
  padding: 0.5rem;
}

.tree-line {
  color: var(--border);
  font-weight: bold;
}

.pl-8 { padding-left: 2.5rem; }
.w-auto { width: auto; display: inline-block; }
</style>
