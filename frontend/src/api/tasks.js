import { request } from './client.js'

// "Tasks" on the backend are dreams.
export const tasksApi = {
  list: () => request('/tasks'),

  create: (dream) =>
    request('/tasks', { method: 'POST', body: JSON.stringify({ dream }) }),

  update: (id, changes) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),

  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}
