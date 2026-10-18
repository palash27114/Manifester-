// Dates are handled as local "YYYY-MM-DD" strings so a task never jumps a day across timezones.

const pad = (n) => String(n).padStart(2, '0')

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO() {
  return toISODate(new Date())
}

export function addDays(iso, days) {
  const date = fromISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function addMonths(iso, months) {
  const date = fromISODate(iso)
  return toISODate(new Date(date.getFullYear(), date.getMonth() + months, 1))
}

export function startOfMonth(iso) {
  return `${iso.slice(0, 7)}-01`
}

// 6 rows x 7 days, weeks starting on Monday, padded with days from neighbouring months.
export function monthGrid(monthIso) {
  const first = fromISODate(startOfMonth(monthIso))
  const offset = (first.getDay() + 6) % 7
  const start = addDays(toISODate(first), -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function formatMonth(iso) {
  return fromISODate(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function formatDay(iso, options = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return fromISODate(iso).toLocaleDateString(undefined, options)
}

export const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  // 2024-01-01 was a Monday.
  new Date(2024, 0, 1 + i).toLocaleDateString(undefined, { weekday: 'narrow' }),
)
