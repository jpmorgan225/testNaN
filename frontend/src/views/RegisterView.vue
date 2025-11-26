<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2> Inscription</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Nom complet</label>
          <input 
            v-model="name" 
            type="text" 
            id="name"
            placeholder="Votre nom" 
            required 
          />
        </div>

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
            placeholder="Minimum 6 caractères" 
            minlength="6"
            required 
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="auth-link">
        Déjà un compte ? 
        <RouterLink to="/login">Se connecter</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    console.log('📝 Début inscription...')
    const result = await auth.register({
      name: name.value,
      email: email.value,
      password: password.value
    })
    
    console.log('✅ Résultat inscription:', result)
    console.log('👤 Utilisateur connecté:', auth.user)
    console.log('🔐 Authentifié:', auth.isAuthenticated)
    
    if (result?.success) {
      // Attendre un peu pour que les cookies soient bien stockés
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/groups')
    } else {
      error.value = result?.message || 'Erreur lors de l\'inscription.'
    }
  } catch (err) {
    console.error('❌ Erreur inscription complète:', err)
    error.value = err?.message || 'Erreur lors de l\'inscription.'
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

 