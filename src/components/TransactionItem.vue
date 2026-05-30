<template>
  <div class="transaction-item surface animate-slide-up" :style="{ animationDelay: `${index * 0.05}s` }">
    <!-- Header Row -->
    <div class="tx-header flex justify-between items-center w-full" @click="toggleExpand" :class="{'cursor-pointer': hasDetails}">
      <div class="tx-left flex items-center gap-4">
        <div class="tx-icon" :class="transaction.type">
          <svg v-if="transaction.type === 'income'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <svg v-else-if="transaction.type === 'savings'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        </div>
        <div class="tx-details">
          <h4 class="tx-title">
            {{ summaryTitle }}
            <span v-if="transaction.merchant" class="merchant-badge">@ {{ transaction.merchant }}</span>
            <svg v-if="hasDetails" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon" :class="{'rotate-180': isExpanded}"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </h4>
          <div class="tx-meta">
            <span class="tx-category">{{ category }}</span>
            <span class="meta-dot">•</span>
            <span>{{ formatDate(transaction.date) }}</span>
            <span class="meta-dot">•</span>
            <span class="tx-method">{{ transaction.payment_method || 'Cash' }}</span>
            <span class="meta-dot">•</span>
            <span class="tx-creator">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {{ transaction.user_id === currentUser ? 'Anda' : (transaction.user_id === walletOwner ? 'Pemilik' : `Anggota (${transaction.user_id?.substring(0,4) || '?'})`) }}
            </span>
          </div>
          <div v-if="transaction.tags && transaction.tags.length > 0" class="tx-tags mt-1">
            <span v-for="tag in transaction.tags" :key="tag" class="tag-badge">#{{ tag }}</span>
          </div>
        </div>
      </div>
      <div class="tx-right flex items-center gap-4">
        <div class="amount-container text-right">
          <span class="tx-amount block" :class="transaction.type">
            {{ transaction.type === 'income' ? '+' : '-' }} Rp {{ formatCurrency(transaction.amount) }}
          </span>
          <span v-if="transaction.admin_fee && transaction.admin_fee > 0" class="tx-admin-fee block">
            + Rp {{ formatCurrency(transaction.admin_fee) }} (Admin)
          </span>
        </div>
        <button class="btn-delete" @click.stop="$emit('delete', transaction.id)" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Dropdown Details Row -->
    <div v-if="isExpanded" class="tx-expanded-details mt-4">
      <div class="details-card">
        <div class="details-header">Rincian Barang</div>
        <pre class="details-text">{{ transaction.description }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  index: {
    type: Number,
    default: 0
  },
  currentUser: {
    type: String,
    default: null
  },
  walletOwner: {
    type: String,
    default: null
  }
})

defineEmits(['delete'])

const isExpanded = ref(false)

const hasDetails = computed(() => {
  return props.transaction.description && props.transaction.description.includes('\n')
})

const summaryTitle = computed(() => {
  if (!props.transaction.description) return 'Transaksi'
  if (hasDetails.value) {
    return 'Belanja: ' + props.transaction.description.split('\n').length + ' item'
  }
  return props.transaction.description
})

const toggleExpand = () => {
  if (hasDetails.value) {
    isExpanded.value = !isExpanded.value
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}
</script>

<style scoped>
.transaction-item {
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  transition: var(--transition);
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
}

.tx-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

@media (min-width: 640px) {
  .tx-header {
    flex-direction: row;
    align-items: center;
    gap: 0;
  }
}

.transaction-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.tx-right {
  width: 100%;
  justify-content: space-between;
}

@media (min-width: 640px) {
  .tx-right {
    width: auto;
    justify-content: flex-end;
  }
}

.tx-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tx-icon svg {
  width: 24px;
  height: 24px;
}

.tx-icon.income {
  background-color: var(--income-bg);
  color: var(--income);
}

.tx-icon.expense {
  background-color: var(--expense-bg);
  color: var(--expense);
}

.tx-icon.savings {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.tx-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.merchant-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-body);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
}

.tx-meta {
  font-size: 0.8125rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.meta-dot {
  margin: 0 0.35rem;
  font-size: 0.6rem;
  opacity: 0.5;
}

.tx-category {
  font-weight: 500;
  color: var(--text-muted);
}

.tx-method {
  font-style: italic;
}

.tx-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag-badge {
  font-size: 0.65rem;
  background-color: var(--primary-light);
  color: var(--primary-hover);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.tx-amount {
  font-weight: 600;
  font-size: 1.125rem;
}

.tx-amount.income { color: var(--income); }
.tx-amount.expense { color: var(--text-main); }
.tx-amount.savings { color: #3b82f6; }

.tx-admin-fee {
  font-size: 0.75rem;
  color: var(--expense);
  font-weight: 500;
}

.block { display: block; }
.text-right { text-align: right; }

.btn-delete {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background-color: var(--expense-bg);
  color: var(--expense);
}

.btn-delete svg {
  width: 20px;
  height: 20px;
}

.tx-creator {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: 500;
  color: var(--primary);
  background: var(--primary-light, rgba(170, 59, 255, 0.1));
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
}

.inline-icon {
  display: inline-block;
  vertical-align: middle;
}

/* Accordion Specifics */
.cursor-pointer {
  cursor: pointer;
}

.chevron-icon {
  margin-left: 0.25rem;
  color: var(--text-muted);
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.tx-expanded-details {
  width: 100%;
  padding-left: 64px; /* Align with the text, skipping icon */
  animation: slideDown 0.3s ease-out;
}

.details-card {
  background-color: var(--bg-surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.details-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.details-text {
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--text-main);
  white-space: pre-wrap; /* Preserves newlines */
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .tx-expanded-details {
    padding-left: 0;
  }
}
</style>
