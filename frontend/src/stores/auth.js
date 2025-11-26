import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const register = async (userData) => {
    try {
      const { data } = await api.post('/api/auth/register', userData)
      if (data?.success && data?.data) {
        user.value = data.data
        isAuthenticated.value = true
      }
      return data
    } catch (error) {
      console.error('Erreur inscription:', error)
      throw error.response?.data || error
    }
  }

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/api/auth/login', credentials)
      if (data?.success && data?.data) {
        user.value = data.data
        isAuthenticated.value = true
      }
      return data
    } catch (error) {
      console.error('Erreur connexion:', error)
      throw error.response?.data || error
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Erreur logout:', error)
    } finally {
      user.value = null
      isAuthenticated.value = false
    }
  }

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      if (data?.success && data?.data) {
        user.value = data.data
        isAuthenticated.value = true
        return data.data
      }
    } catch (error) {
      console.error('Erreur profil:', error)
      user.value = null
      isAuthenticated.value = false
      throw error
    }
  }

  fetchProfile().catch(() => {
  })

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchProfile
  }
})