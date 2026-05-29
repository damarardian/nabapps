<template>
  <div class="container mt-8 pb-16">
    <div v-if="!activeWallet" class="glass-panel text-center p-8 mb-8 mt-12 empty-wallet-state">
      <div class="empty-icon-large mb-4 mx-auto text-muted opacity-50">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold mb-2">Tidak ada Buku Kas aktif</h2>
      <p class="text-muted">Silakan buat atau pilih buku kas di menu Navigasi (atas) terlebih dahulu untuk mengelola kategori.</p>
    </div>
    
    <div v-else class="categories-wrapper">


      <div class="main-grid">
        <!-- Form Section -->
        <div class="form-section glass-panel">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="icon-box">
                <svg v-if="!editingId" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
                <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <h2 class="text-xl font-bold m-0">{{ editingId ? 'Edit Kategori' : 'Tambah Kategori' }}</h2>
            </div>
            <button v-if="editingId" @click="cancelEdit" class="btn btn-secondary btn-sm text-xs px-3 py-1 h-auto" type="button">
              Batal
            </button>
          </div>
          
          <form @submit.prevent="addCategory" class="category-form flex flex-col gap-5">
            <!-- Nama Kategori -->
            <div class="form-group mb-0">
              <label class="form-label uppercase tracking-wider text-[10px] opacity-70 mb-1 block">Nama Kategori</label>
              <div class="input-with-icon">
                <div class="icon-prefix">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                </div>
                <input type="text" v-model="form.name" class="form-control pl-10 h-12" required placeholder="Misal: Gaji, Makanan, Dana Darurat">
              </div>
            </div>

            <!-- Jenis -->
            <div class="form-group mb-0">
              <label class="form-label uppercase tracking-wider text-[10px] opacity-70 mb-1 block">Jenis Kategori</label>
              <div class="segmented-control">
                <input type="radio" id="type-expense" value="expense" v-model="form.type">
                <label for="type-expense" class="segment-label expense-label">Keluar</label>
                
                <input type="radio" id="type-income" value="income" v-model="form.type">
                <label for="type-income" class="segment-label income-label">Masuk</label>
                
                <input type="radio" id="type-savings" value="savings" v-model="form.type">
                <label for="type-savings" class="segment-label savings-label">Tabung</label>
              </div>
            </div>

            <!-- Parent -->
            <div class="form-group mb-0">
              <label class="form-label uppercase tracking-wider text-[10px] opacity-70 mb-1 block">Induk Kategori (Opsional)</label>
              <div class="select-wrapper relative">
                <select v-model="form.parent_id" class="form-control custom-select h-12 w-full">
                  <option :value="null">-- Sebagai Kategori Utama --</option>
                  <option v-for="cat in mainCategoriesFiltered" :key="cat.id" :value="cat.id">
                    {{ cat.name }} ({{ getTypeName(cat.type) }})
                  </option>
                </select>
                <div class="select-arrow absolute right-3 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary h-12 mt-2 w-full flex justify-center items-center gap-2" :disabled="loading">
              <div v-if="loading" class="spinner-small"></div>
              <span v-else>{{ editingId ? 'Update Kategori' : 'Simpan Kategori' }}</span>
            </button>
          </form>
        </div>

        <!-- List Section -->
        <div class="list-section">
          <div class="glass-panel p-0 overflow-hidden shadow-md">
            <div class="p-6 border-b border-white/5 flex justify-between items-center bg-black/10">
              <h2 class="text-xl font-bold m-0 flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><path d="M4 6h16M4 12h16M4 18h7"></path></svg>
                Daftar Kategori
              </h2>
            </div>
            
            <div v-if="fetching" class="p-16 text-center text-muted flex flex-col items-center">
              <div class="spinner mb-4"></div>
              <p>Memuat daftar kategori...</p>
            </div>
            <div v-else-if="categories.length === 0" class="p-16 text-center text-muted">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              <h3 class="text-lg font-bold mb-2">Belum ada kategori</h3>
              <p class="text-sm">Buat kategori pertama Anda melalui formulir di samping.</p>
            </div>
            
            <div class="tree-view p-4" v-else>
              <div v-for="main in mainCategories" :key="main.id" class="tree-node mb-3 relative group">
                <div class="node-content surface flex justify-between items-center p-4 rounded-xl border border-white/5 shadow-sm transition-all hover:bg-white/5 mb-1">
                  <div class="font-semibold flex items-center gap-4">
                    <span class="type-indicator w-1 h-10 rounded-full" :class="main.type"></span>
                    <div class="flex flex-col gap-1">
                      <span class="text-base text-h leading-none">{{ main.name }}</span>
                      <span class="text-[10px] uppercase tracking-wider font-bold" :class="getTextClass(main.type)">{{ getTypeName(main.type) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 transition-opacity">
                    <button v-if="getSubcategories(main.id).length > 0" @click="toggleExpand(main.id)" class="action-btn w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-white/5 transition-colors mr-1" title="Tampilkan/Sembunyikan Sub-Kategori">
                      <svg :class="{'rotate-180': expandedCategories.includes(main.id)}" class="transition-transform duration-200" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <button @click="startEdit(main)" class="action-btn w-8 h-8 flex items-center justify-center rounded-lg text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors" title="Edit Kategori">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button @click="deleteCategory(main.id)" class="action-btn w-8 h-8 flex items-center justify-center rounded-lg text-expense bg-expense/10 hover:bg-expense hover:text-white transition-colors" title="Hapus Kategori">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
                
                <Transition name="slide">
                  <div v-show="expandedCategories.includes(main.id)" v-if="getSubcategories(main.id).length > 0" class="sub-nodes ml-6 mt-1 relative pb-2">
                    <div class="absolute left-[-15px] top-0 bottom-4 border-l-2 border-white/10"></div>
                    <div v-for="sub in getSubcategories(main.id)" :key="sub.id" class="sub-node surface flex justify-between items-center p-3 rounded-xl border border-white/5 shadow-sm hover:bg-white/5 transition-all mt-2 relative group">
                      <div class="absolute left-[-15px] top-1/2 w-3 border-t-2 border-white/10"></div>
                      <div class="font-semibold flex items-center gap-3 w-full justify-start text-left">
                        <span class="type-indicator w-1 h-6 rounded-full flex-shrink-0 opacity-50" :class="main.type"></span>
                        <div class="flex-1 text-left text-sm pl-1 text-h opacity-90 truncate">
                          {{ sub.name }}
                        </div>
                      </div>
                      <div class="flex items-center gap-1 transition-opacity">
                        <button @click="startEdit(sub)" class="action-btn w-7 h-7 flex items-center justify-center rounded-md text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors" title="Edit Sub-Kategori">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button @click="deleteCategory(sub.id)" class="action-btn w-7 h-7 flex items-center justify-center rounded-md text-expense bg-expense/10 hover:bg-expense hover:text-white transition-colors" title="Hapus Sub-Kategori">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps(['user', 'activeWallet'])
const categories = ref([])
const loading = ref(false)
const fetching = ref(true)
const editingId = ref(null)
const expandedCategories = ref([])

const toggleExpand = (id) => {
  const index = expandedCategories.value.indexOf(id)
  if (index === -1) {
    expandedCategories.value.push(id)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

const defaultForm = {
  name: '',
  type: 'expense',
  parent_id: null
}
const form = ref({ ...defaultForm })

// Only allow parent categories of the SAME type
const mainCategoriesFiltered = computed(() => {
  return categories.value.filter(c => !c.parent_id && c.type === form.value.type)
})

const mainCategories = computed(() => {
  return categories.value.filter(c => !c.parent_id)
})

const getSubcategories = (parentId) => {
  return categories.value.filter(c => c.parent_id === parentId)
}

const getTypeName = (type) => {
  if (type === 'income') return 'Pemasukan'
  if (type === 'expense') return 'Pengeluaran'
  if (type === 'savings') return 'Tabungan'
  return type
}

const getTextClass = (type) => {
  if (type === 'income') return 'text-income'
  if (type === 'expense') return 'text-expense'
  if (type === 'savings') return 'text-savings'
  return 'text-muted'
}

const fetchCategories = async () => {
  if (!props.user || !props.activeWallet) {
    fetching.value = false
    return
  }
  fetching.value = true
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('wallet_id', props.activeWallet.id)
    .order('name')

  if (!error && data) {
    categories.value = data
    // Auto-expand parents that have children by default
    const parentsWithChildren = [...new Set(data.filter(c => c.parent_id).map(c => c.parent_id))]
    expandedCategories.value = parentsWithChildren
  }
  fetching.value = false
}

watch(() => props.activeWallet, (newWallet) => {
  if (newWallet) fetchCategories()
  else categories.value = []
})

// Reset parent_id when type changes to prevent orphaned categories
watch(() => form.value.type, () => {
  form.value.parent_id = null
})

const startEdit = (cat) => {
  editingId.value = cat.id
  form.value = {
    name: cat.name,
    type: cat.type,
    parent_id: cat.parent_id
  }
}

const cancelEdit = () => {
  editingId.value = null
  form.value = { ...defaultForm }
}

const addCategory = async () => {
  if (!props.user || !props.activeWallet) return
  loading.value = true
  
  if (editingId.value) {
    // Update existing
    const { error } = await supabase
      .from('categories')
      .update({
        name: form.value.name,
        type: form.value.type,
        parent_id: form.value.parent_id
      })
      .eq('id', editingId.value)

    if (error) {
      alert('Gagal mengupdate kategori: ' + error.message)
    } else {
      // Update local state
      const idx = categories.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) {
        categories.value[idx] = { ...categories.value[idx], ...form.value }
      }
      cancelEdit()
    }
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        user_id: props.user.id,
        wallet_id: props.activeWallet.id,
        name: form.value.name,
        type: form.value.type,
        parent_id: form.value.parent_id
      }])
      .select()

    if (error) {
      alert('Gagal menambah kategori: ' + error.message)
    } else if (data) {
      categories.value.push(data[0])
      cancelEdit()
    }
  }
  loading.value = false
}

const deleteCategory = async (id) => {
  if (!confirm('Hapus kategori ini? (Sub-kategori juga akan ikut terhapus jika ada)')) return
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Gagal menghapus: ' + error.message)
  } else {
    categories.value = categories.value.filter(c => c.id !== id && c.parent_id !== id)
  }
}

onMounted(() => {
  fetchCategories()
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
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-\[10px\] { font-size: 10px; }
.opacity-70 { opacity: 0.7; }
.opacity-90 { opacity: 0.9; }
.opacity-100 { opacity: 1; }
.opacity-0 { opacity: 0; }
.block { display: block; }
.m-0 { margin: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-0\.5 { margin-top: 0.125rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-16 { padding-bottom: 4rem; }
.p-0 { padding: 0; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-16 { padding: 4rem; }
.pl-2 { padding-left: 0.5rem; }
.pl-10 { padding-left: 2.5rem; }
.ml-6 { margin-left: 1.5rem; }
.w-1 { width: 0.25rem; }
.w-3 { width: 0.75rem; }
.w-7 { width: 1.75rem; }
.w-8 { width: 2rem; }
.w-full { width: 100%; }
.h-7 { height: 1.75rem; }
.h-8 { height: 2rem; }
.h-12 { height: 3rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-full { border-radius: 9999px; }
.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-l-2 { border-left-width: 2px; }
.border-t-2 { border-top-width: 2px; }
.border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
.border-white\/10 { border-color: rgba(255, 255, 255, 0.1); }
.bg-black\/10 { background-color: rgba(0, 0, 0, 0.1); }
.bg-white\/5 { background-color: rgba(255, 255, 255, 0.05); }

/* Custom Form Icon Placement */
.input-with-icon {
  position: relative;
}
.icon-prefix {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  pointer-events: none;
}
.hover\:bg-white\/5:hover { background-color: rgba(255, 255, 255, 0.05); }
.group:hover .group-hover\:opacity-100 { opacity: 1; }

.action-btn {
  padding: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  outline: none;
}
.action-btn + .action-btn {
  margin-left: 0.5rem;
}

/* Slide Transition for Sub Categories */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 600px;
  opacity: 1;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.text-primary { color: var(--primary) !important; }
.text-income { color: var(--income) !important; }
.text-expense { color: var(--expense) !important; }
.text-savings { color: #3b82f6 !important; } /* Blue for savings */
.bg-expense\/10 { background-color: rgba(239, 68, 68, 0.1); }
.bg-primary\/10 { background-color: rgba(170, 59, 255, 0.1); } /* Uses primary rgb */
.hover\:bg-expense\/10:hover { background-color: rgba(239, 68, 68, 0.1); }
.hover\:bg-primary\/10:hover { background-color: rgba(170, 59, 255, 0.1); }
.hover\:text-expense:hover { color: var(--expense); }
.hover\:text-primary:hover { color: var(--primary); }
.hover\:text-white:hover { color: #ffffff; }

/* Grid layout matching Dashboard */
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
    top: 80px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  /* Custom Scrollbar for Form and List */
  .form-section::-webkit-scrollbar, .list-section::-webkit-scrollbar { width: 6px; }
  .form-section::-webkit-scrollbar-track, .list-section::-webkit-scrollbar-track { background: transparent; }
  .form-section::-webkit-scrollbar-thumb, .list-section::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
  .form-section::-webkit-scrollbar-thumb:hover, .list-section::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
}

.form-section {
  padding: 1.75rem;
  border-radius: 1rem;
}

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

/* Segmented Control for 3 options */
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
  padding: 0.6rem 0.5rem;
  border-radius: 0.35rem;
  font-weight: 600;
  font-size: 0.8rem;
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
  background-color: rgba(59, 130, 246, 0.15); /* Blue bg */
  color: #3b82f6; /* Blue text */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Select overrides */
.custom-select {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: none !important;
}

/* Type Indicator Dots */
.type-indicator.expense { background-color: var(--expense); box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
.type-indicator.income { background-color: var(--income); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
.type-indicator.savings { background-color: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }

/* Loaders */
.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}
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
