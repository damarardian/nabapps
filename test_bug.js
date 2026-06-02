const selectedMonth = { value: '2026-06' }
const transactions = { value: [{date: '2026-05-15'}, {date: '2026-06-02'}] }
const budgets = { value: [{month: '2026-05-01'}, {month: '2026-06-01'}] }

const getActiveMonths = () => {
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
  let current = new Date(`${earliest}-01T00:00:00Z`)
  const end = new Date(`${selectedMonth.value}-01T00:00:00Z`)
  
  let iterations = 0;
  while (current <= end) {
    if(iterations++ > 1000) { console.log('INFINITE LOOP'); break; }
    const y = current.getUTCFullYear()
    const m = String(current.getUTCMonth() + 1).padStart(2, '0')
    result.push(`${y}-${m}`)
    current.setUTCMonth(current.getUTCMonth() + 1)
  }
  
  return result
}
console.log(getActiveMonths())
