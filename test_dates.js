const getCycleStartEnd = (ym, payday) => {
  const [y, m] = ym.split('-');
  const year = parseInt(y);
  const month = parseInt(m); // 1-12
  
  if (payday === 1) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    return { start: start.toISOString(), end: end.toISOString() };
  } else {
    // If payday > 1, the "budget cycle" for June (06) starts in May (05) at payday, 
    // and ends in June (06) at payday - 1.
    const start = new Date(Date.UTC(year, month - 2, payday));
    const end = new Date(Date.UTC(year, month - 1, payday - 1, 23, 59, 59));
    return { start: start.toISOString(), end: end.toISOString() };
  }
}
console.log("Payday 1 for 2026-06:", getCycleStartEnd("2026-06", 1));
console.log("Payday 25 for 2026-06:", getCycleStartEnd("2026-06", 25));
