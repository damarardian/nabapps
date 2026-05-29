<template>
  <div class="transaction-item surface flex justify-between items-center animate-slide-up" :style="{ animationDelay: `${index * 0.05}s` }">
    <div class="tx-left flex items-center gap-4">
      <div class="tx-icon" :class="transaction.type">
        <svg v-if="transaction.type === 'income'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      </div>
      <div class="tx-details">
        <h4 class="tx-title">
          {{ transaction.description }}
          <span v-if="transaction.merchant" class="merchant-badge">@ {{ transaction.merchant }}</span>
        </h4>
        <div class="tx-meta">
          <span class="tx-category">{{ category }}</span>
          <span class="meta-dot">•</span>
          <span>{{ formatDate(transaction.date) }}</span>
          <span class="meta-dot">•</span>
          <span class="tx-method">{{ transaction.payment_method || 'Cash' }}</span>
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
      <button class="btn-delete" @click="$emit('delete', transaction.id)" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
  }
})

defineEmits(['delete'])

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
  align-items: flex-start;
  gap: 1rem;
}

@media (min-width: 640px) {
  .transaction-item {
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
</style>
