<template>
  <div class="groups-view">
    <div class="header-section">
      <h2> Mes Groupes</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        Créer un groupe
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="groupStore.groups.length === 0" class="empty-state">
      <p>Vous n'avez pas encore de groupe.</p>
      <p>Créez-en un ou rejoignez un groupe existant !</p>
    </div>

    <div v-else class="groups-grid">
      <div 
        v-for="group in groupStore.groups" 
        :key="group._id" 
        class="group-card"
        @click="goToGroup(group._id)"
      >
        <h3>{{ group.name }}</h3>
        <p class="group-description">{{ group.description || 'Pas de description' }}</p>
        <div class="group-stats">
          <span> {{ group.members?.length || 0 }} membres</span>
          <span>{{ group.taskCount || 0 }} tâches</span>
        </div>
      </div>
    </div>

    <!-- Modal création de groupe -->
    <div v-if="showCreateModal" class="modal" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>Créer un nouveau groupe</h3>
        <form @submit.prevent="handleCreateGroup">
          <div class="form-group">
            <label for="groupName">Nom du groupe *</label>
            <input 
              v-model="newGroup.name" 
              type="text" 
              id="groupName"
              placeholder="Nom du groupe" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="groupDesc">Description</label>
            <textarea 
              v-model="newGroup.description" 
              id="groupDesc"
              placeholder="Description du groupe (optionnel)"
              rows="3"
            ></textarea>
          </div>

          <div v-if="createError" class="error-message">
            {{ createError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group.js'

const groupStore = useGroupStore()
const router = useRouter()

const loading = ref(false)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')

const newGroup = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  loading.value = true
  try {
    await groupStore.fetchGroups()
  } catch (error) {
    console.error('Erreur chargement groupes:', error)
  } finally {
    loading.value = false
  }
})

const handleCreateGroup = async () => {
  createError.value = ''
  creating.value = true

  try {
    const group = await groupStore.createGroup(newGroup.value)
    showCreateModal.value = false
    newGroup.value = { name: '', description: '' }
    router.push(`/groups/${group._id}`)
  } catch (error) {
    createError.value = error.response?.data?.message || 'Erreur lors de la création'
  } finally {
    creating.value = false
  }
}

const goToGroup = (groupId) => {
  router.push(`/groups/${groupId}`)
}
</script>

<style scoped>
.groups-view {
  padding: 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-section h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state p {
  margin: 0.5rem 0;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.group-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.group-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.group-description {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.group-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #777;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #ddd;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary:hover {
  background: #ccc;
}
</style>