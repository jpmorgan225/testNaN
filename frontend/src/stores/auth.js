import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const register = async (userData) => {
    try {
      console.log('📝 Inscription en cours...')
      const { data } = await api.post('/api/auth/register', userData)
      console.log('✅ Réponse inscription:', data)
      
      if (data?.success) {
        // Stocker le token dans localStorage comme fallback si les cookies ne fonctionnent pas
        if (data?.token) {
          localStorage.setItem('accessToken', data.token)
          console.log('💾 Token stocké dans localStorage')
        }
        
        // Le backend a placé les cookies, récupérons le profil pour vérifier
        console.log('🔍 Récupération du profil après inscription...')
        try {
          const profile = await fetchProfile()
          console.log('✅ Profil récupéré:', profile)
          return { success: true, data: profile }
        } catch (profileError) {
          console.error('⚠️ Erreur récupération profil:', profileError)
          // Si le profil échoue, utiliser les données de l'inscription
          if (data?.data) {
            user.value = data.data
            isAuthenticated.value = true
          }
          return data
        }
      }
      return data
    } catch (error) {
      console.error('❌ Erreur inscription:', error)
      throw error.response?.data || error
    }
  }

  const login = async (credentials) => {
    try {
      console.log('🔐 Connexion en cours...')
      const { data } = await api.post('/api/auth/login', credentials)
      console.log('✅ Réponse connexion:', data)
      
      if (data?.success) {
        // Stocker le token dans localStorage comme fallback si les cookies ne fonctionnent pas
        if (data?.token) {
          localStorage.setItem('accessToken', data.token)
          console.log('💾 Token stocké dans localStorage')
        }
        
        // Le backend a placé les cookies, récupérons le profil pour vérifier
        console.log('🔍 Récupération du profil après connexion...')
        try {
          const profile = await fetchProfile()
          console.log('✅ Profil récupéré:', profile)
          return { success: true, data: profile }
        } catch (profileError) {
          console.error('⚠️ Erreur récupération profil:', profileError)
          // Si le profil échoue, utiliser les données de la connexion
          if (data?.data) {
            user.value = data.data
            isAuthenticated.value = true
          }
          return data
        }
      }
      return data
    } catch (error) {
      console.error('❌ Erreur connexion:', error)
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
      // Supprimer le token du localStorage
      localStorage.removeItem('accessToken')
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

  // Au démarrage, essayer de récupérer le profil si un token existe
  const initAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      console.log('🔍 Token trouvé dans localStorage, récupération du profil...')
      try {
        await fetchProfile()
      } catch (error) {
        console.error('⚠️ Erreur récupération profil au démarrage:', error)
        // Si le token est invalide, le supprimer
        localStorage.removeItem('accessToken')
      }
    } else {
      // Essayer quand même avec les cookies
      fetchProfile().catch(() => {
        // Ignorer silencieusement si pas de cookies
      })
    }
  }

  initAuth()

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchProfile
  }
})