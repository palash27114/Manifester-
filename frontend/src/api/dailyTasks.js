import { request } from './client.js'

export const dailyTasksApi = {
  forDate: (date) => request(`/daily-tasks?date=${date}`),

  summary: (from, to) => request(`/daily-tasks/summary?from=${from}&to=${to}`),

  create: ({ title, kind, date, dreamId }) =>
    request('/daily-tasks', {
      method: 'POST',
      body: JSON.stringify({ title, kind, date, dream_id: dreamId ?? null }),
    }),

  update: (id, changes, viewDate) =>
    request(`/daily-tasks/${id}?date=${viewDate}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    }),

  remove: (id) => request(`/daily-tasks/${id}`, { method: 'DELETE' }),

  setDone: (id, date, done) =>
    request(`/daily-tasks/${id}/checks/${date}`, { method: done ? 'PUT' : 'DELETE' }),
}
