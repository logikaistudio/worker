export function computeTenure(joinDate: string, asOf: Date = new Date()) {
  const jd = new Date(joinDate);
  if (isNaN(jd.getTime())) return { years: 0, months: 0, days: 0 };
  let years = asOf.getFullYear() - jd.getFullYear();
  let months = asOf.getMonth() - jd.getMonth();
  let days = asOf.getDate() - jd.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function isExpiringSoon(expiryDate?: string | null, daysAhead = 90) {
  if (!expiryDate) return false;
  const exp = new Date(expiryDate);
  if (isNaN(exp.getTime())) return false;
  const diff = exp.getTime() - Date.now();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= daysAhead;
}
