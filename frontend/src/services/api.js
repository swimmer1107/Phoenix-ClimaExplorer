import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api' 
})

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

export const authApi = {
  signup: (d) => api.post('/auth/signup', d),
  login:  (d) => api.post('/auth/login', d),
}

export const climateApi = {
  summary:  ()              => api.get('/climate/summary'),
  trends:   (v, r)          => api.get('/climate/trends', { params: { variable: v, region: r } }),
  compare:  (y1, y2, v, r)  => api.get('/climate/compare', { params: { year1: y1, year2: y2, variable: v, region: r } }),
  globe:    (y, v)          => api.get('/climate/globe',   { params: { year: y, variable: v } }),
  insights: (y1, y2, r, v)  => api.get('/climate/insights', { params: { year1: y1, year2: y2, region: r, variable: v } }),
  heatmap:  ()              => api.get('/climate/heatmap'),
  upload: (file) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/climate/upload', fd, { 
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000 // 5 minutes for heavy NetCDF processing
    })
  },
  exportNc: (y, v) => api.get('/climate/export', { 
    params: { year: y, variable: v },
    responseType: 'blob' 
  }),
  bulk: (r) => api.get('/climate/bulk', { params: { region: r } }),
}

export default api
