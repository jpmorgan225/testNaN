<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Connexion</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            v-model="email" 
            type="email" 
            id="email"
            placeholder="votre@email.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            v-model="password" 
            type="password" 
            id="password"
            placeholder="Votre mot de passe" 
            required 
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-link">
        Pas encore de compte ? 
        <RouterLink to="/register">S'inscrire</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter, useRoute } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  // Si on vient d'une redirection avec un token d'invitation, le sauvegarder
  if (route.query.redirect && route.query.redirect.includes('/join/')) {
    const token = route.query.redirect.split('/join/')[1]
    if (token) {
      sessionStorage.setItem('pendingInviteToken', token)
    }
  }
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const result = await auth.login({ 
      email: email.value, 
      password: password.value 
    })
    
    if (result?.success) {
      // Vérifier s'il y a un token d'invitation en attente
      const pendingToken = sessionStorage.getItem('pendingInviteToken')
      if (pendingToken) {
        sessionStorage.removeItem('pendingInviteToken')
        router.push(`/join/${pendingToken}`)
      } else {
        router.push('/groups')
      }
    } else {
      error.value = result?.message || 'Erreur de connexion.'
    }
  } catch (err) {
    error.value = err?.message || 'Email ou mot de passe incorrect.'
    console.error('Erreur détaillée:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}

.auth-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.auth-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>