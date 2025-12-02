<template>
  <div class="join-group">
    <div class="join-card">
      <div v-if="loading" class="loading">
        <p>Vérification de l'invitation...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Erreur</h2>
        <p>{{ error }}</p>
        <button @click="goToGroups" class="btn-primary">
          Retour à mes groupes
        </button>
      </div>

      <div v-else-if="success" class="success-state">
        <h2>Félicitations !</h2>
        <p>Vous avez rejoint le groupe avec succès.</p>
        <button @click="goToGroup" class="btn-primary">
          Voir le groupe
        </button>
      </div>

      <div v-else class="confirm-state">
        <h2>Invitation au groupe</h2>
        <p>Vous êtes invité à rejoindre un groupe.</p>
        <button @click="handleJoin" class="btn-primary" :disabled="joining">
          {{ joining ? 'Rejoindre...' : 'Rejoindre le groupe' }}
        </button>
        <button @click="goToGroups" class="btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group.js'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const auth = useAuthStore()

const loading = ref(false)
const joining = ref(false)
const error = ref('')
const success = ref(false)
const joinedGroupId = ref(null)

onMounted(async () => {
  // Vérifier que l'utilisateur est bien connecté
  if (!auth.user) {
    try {
      await auth.fetchProfile()
    } catch (err) {
      console.error('Erreur récupération profil:', err)
      error.value = 'Vous devez être connecté pour rejoindre un groupe'
      return
    }
  }
  
  // Si l'utilisateur est connecté, essayer de rejoindre automatiquement
  if (auth.user) {
    handleJoin()
  }
})

const handleJoin = async () => {
  joining.value = true
  error.value = ''

  try {
    console.log('Tentative de rejoindre le groupe avec token:', route.params.token)
    const group = await groupStore.joinGroup(route.params.token)
    console.log('Groupe rejoint:', group)
    success.value = true
    joinedGroupId.value = group._id
  } catch (err) {
    console.error('Erreur joinGroup:', err)
    const errorMessage = err.response?.data?.message || err.message || 'Lien d\'invitation invalide ou expiré'
    
    // Si c'est une erreur d'authentification, rediriger vers login
    if (err.response?.status === 401) {
      sessionStorage.setItem('pendingInviteToken', route.params.token)
      router.push(`/login?redirect=/join/${route.params.token}`)
      return
    }
    
    error.value = errorMessage
  } finally {
    joining.value = false
  }
}

const goToGroup = () => {
  if (joinedGroupId.value) {
    router.push(`/groups/${joinedGroupId.value}`)
  }
}

const goToGroups = () => {
  router.push('/groups')
}
</script>

<style scoped>
.join-group {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.join-card {
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.join-card h2 {
  margin-top: 0;
  color: #2c3e50;
}

.join-card p {
  color: #666;
  margin: 1rem 0;
}

.loading {
  padding: 2rem;
}

.error-state, .success-state, .confirm-state {
  padding: 1rem;
}

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  margin: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ddd;
  color: #333;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin: 0.5rem;
}

.btn-secondary:hover {
  background: #ccc;
}
</style>