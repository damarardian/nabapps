<template>
  <div class="container mt-8">
    <div class="glass-panel p-6">
      <h2 class="mb-4">Manajemen Kategori</h2>
      <p class="text-muted mb-6">Buat kategori dan sub-kategori untuk mengelompokkan transaksi Anda.</p>

      <div class="form-section mb-8">
        <form @submit.prevent="addCategory" class="category-form">
          <div class="form-group flex-1 mb-0">
            <label class="form-label">Nama Kategori</label>
            <input type="text" v-model="form.name" class="form-control" required placeholder="Misal: Makanan, Belanja, Tagihan">
          </div>
          <div class="form-group flex-1 mb-0">
            <label class="form-label">Jenis</label>
            <select v-model="form.type" class="form-control" required>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
          <div class="form-group flex-1 mb-0">
            <label class="form-label">Induk Kategori (Opsional)</label>
            <select v-model="form.parent_id" class="form-control">
              <option :value="null">-- Kategori Utama --</option>
              <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }})
              </option>
            </select>
          </div>
          <div class="form-group flex-1 mb-0 flex items-end">
             <button type="submit" class="btn btn-primary w-full h-full" :disabled="loading">Tambah</button>
          </div>
        </form>
      </div>

      <div class="categories-list">
        <h3>Daftar Kategori</h3>
        <div v-if="fetching" class="text-muted mt-4">Memuat kategori...</div>
        <div v-else-if="categories.length === 0" class="text-muted mt-4">Belum ada kategori.</div>
        
        <div class="tree-view mt-4" v-else>
          <div v-for="main in mainCategories" :key="main.id" class="tree-node mb-4">
            <div class="node-content surface flex justify-between items-center p-3">
              <div class="font-semibold flex items-center gap-2">
                <span class="badge" :class="main.type">{{ main.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</span>
                {{ main.name }}
              </div>
              <button @click="deleteCategory(main.id)" class="text-expense bg-transparent border-none cursor-pointer">Hapus</button>
            </div>
            
            <div v-if="getSubcategories(main.id).length > 0" class="sub-nodes ml-8 mt-2 border-l-2 border-gray-200 pl-4">
              <div v-for="sub in getSubcategories(main.id)" :key="sub.id" class="sub-node flex justify-between items-center p-2 surface mt-2 text-sm">
                <span>{{ sub.name }}</span>
                <button @click="deleteCategory(sub.id)" class="text-expense bg-transparent border-none cursor-pointer text-xs">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'

const props = defineProps(['user'])
const categories = ref([])
const loading = ref(false)
const fetching = ref(true)

const form = ref({
  name: '',
  type: 'expense',
  parent_id: null
})

const mainCategories = computed(() => {
  return categories.value.filter(c => !c.parent_id)
})

const getSubcategories = (parentId) => {
  return categories.value.filter(c => c.parent_id === parentId)
}

const fetchCategories = async () => {
  if (!props.user) return
  fetching.value = true
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', props.user.id)
    .order('name')

  if (!error && data) {
    categories.value = data
  }
  fetching.value = false
}

const addCategory = async () => {
  if (!props.user) return
  loading.value = true
  
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      user_id: props.user.id,
      name: form.value.name,
      type: form.value.type,
      parent_id: form.value.parent_id
    }])
    .select()

  if (error) {
    alert('Gagal menambah kategori: ' + error.message)
  } else if (data) {
    categories.value.push(data[0])
    form.value.name = ''
    form.value.parent_id = null
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
.p-6 { padding: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-0 { margin-bottom: 0; }
.flex-1 { flex: 1; }
.h-full { height: 100%; padding-top: 0.75rem; padding-bottom: 0.75rem; }
.p-3 { padding: 0.75rem; }
.p-2 { padding: 0.5rem; }
.ml-8 { margin-left: 2rem; }
.pl-4 { padding-left: 1rem; }
.border-l-2 { border-left: 2px solid var(--border); }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .category-form {
    flex-direction: row;
    align-items: flex-end;
  }
}

.badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  text-transform: uppercase;
}
.badge.income { background: var(--income-bg); color: var(--income); }
.badge.expense { background: var(--expense-bg); color: var(--expense); }
</style>
