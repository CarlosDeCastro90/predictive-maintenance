import axios from 'axios'

const API_URL = 'https://predictive-maintenance-gamma.vercel.app'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const machinesAPI = {
  list: () => api.get('/api/v1/machines/'),
  get: (id) => api.get(`/api/v1/machines/${id}`),
  create: (data) => api.post('/api/v1/machines/', data),
  update: (id, data) => api.patch(`/api/v1/machines/${id}`, data),
  delete: (id) => api.delete(`/api/v1/machines/${id}`),
  stats: (id, hours = 24) => api.get(`/api/v1/machines/${id}/stats?hours=${hours}`),
}

export const readingsAPI = {
  getByMachine: (id, hours = 24) => api.get(`/api/v1/readings/machine/${id}?hours=${hours}`),
  getLatest: (id) => api.get(`/api/v1/readings/machine/${id}/latest`),
  ingest: (data) => api.post('/api/v1/readings/', data),
}

export const alertsAPI = {
  list: (params) => api.get('/api/v1/alerts/', { params }),
  get: (id) => api.get(`/api/v1/alerts/${id}`),
  acknowledge: (id, notes) => api.patch(`/api/v1/alerts/${id}/acknowledge`, { resolution_notes: notes }),
  resolve: (id, notes) => api.patch(`/api/v1/alerts/${id}/resolve`, { resolution_notes: notes }),
}

export const ordersAPI = {
  list: (params) => api.get('/api/v1/orders/', { params }),
  create: (data) => api.post('/api/v1/orders/', data),
  start: (id) => api.patch(`/api/v1/orders/${id}/start`),
  complete: (id) => api.patch(`/api/v1/orders/${id}/complete`),
  cancel: (id) => api.patch(`/api/v1/orders/${id}/cancel`),
}

export const dashboardAPI = {
  stats: () => api.get('/api/v1/dashboard/stats'),
  machinesMap: () => api.get('/api/v1/dashboard/machines/map'),
}

export const assistantAPI = {
  chat: (message, machine_id = null, history = []) =>
    api.post('/api/v1/assistant/chat', { message, machine_id, history }),
}

export default api