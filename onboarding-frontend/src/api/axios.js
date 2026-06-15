import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI gateway
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the token is missing/expired, the API returns 401/403. Instead of leaving
// the user on a broken page (empty lists, "failed" messages), clear the dead
// session and send them back to login to get a fresh token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
