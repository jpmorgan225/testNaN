<template>
  <div class="group-detail" v-if="group">
    <div class="group-header">
      <div>
        <button @click="goBack" class="btn-back">← Retour</button>
        <h2>{{ group.name }}</h2>
        <p class="group-desc">{{ group.description }}</p>
      </div>
      <button @click="showInviteModal = true" class="btn-primary">
        🔗 Inviter des membres
      </button>
    </div>

    <!-- Membres -->
    <div class="section">
      <h3> Membres ({{ group.members?.length || 0 }})</h3>
      <div class="members-list">
        <div 
          v-for="member in group.members" 
          :key="member._id" 
          class="member-item"
        >
          <span>{{ member.name }}</span>
          <span class="member-email">{{ member.email }}</span>
          <button 
            v-if="canRemoveMember(member._id)"
            @click="confirmRemoveMember(member)"
            class="btn-remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Tâches -->
    <div class="section">
      <div class="section-header">
        <h3> Tâches ({{ tasks.length }})</h3>
        <button @click="showTaskModal = true" class="btn-primary">
           Nouvelle tâche
        </button>
      </div>

      <div v-if="loadingTasks" class="loading">Chargement des tâches...</div>

      <div v-else-if="tasks.length === 0" class="empty-state">
        Aucune tâche dans ce groupe
      </div>

      <div v-else class="tasks-list">
        <div 
          v-for="task in tasks" 
          :key="task._id" 
          class="task-item"
          :class="{ completed: task.status === 'completed' }"
        >
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="status" :class="task.status">
                {{ getStatusText(task.status) }}
              </span>
              <span v-if="task.deadline" class="deadline">
                 {{ formatDate(task.deadline) }}
              </span>
              <span v-if="task.assignedTo">
                 {{ getUserName(task.assignedTo) }}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)" class="btn-icon" title="Modifier la tâche">✏️</button>
            <button @click="confirmDeleteTask(task)" class="btn-icon btn-danger" title="Supprimer la tâche">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Invitation -->
    <div v-if="showInviteModal" class="modal" @click.self="showInviteModal = false">
      <div class="modal-content">
        <h3>Inviter des membres</h3>
        <p>Partagez ce lien pour inviter des membres au groupe :</p>
        <div class="invite-link">
          <input 
            ref="inviteLinkInput"
            :value="inviteLink" 
            readonly 
          />
          <button @click="copyInviteLink" class="btn-copy">
            {{ copied ? '✓ Copié' : ' Copier' }}
          </button>
        </div>
        <button @click="showInviteModal = false" class="btn-secondary">
          Fermer
        </button>
      </div>
    </div>

    <!-- Modal Tâche -->
    <div v-if="showTaskModal" class="modal" @click.self="closeTaskModal">
      <div class="modal-content">
        <h3>{{ editingTask ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h3>
        <form @submit.prevent="handleTaskSubmit">
          <div class="form-group">
            <label>Titre *</label>
            <input v-model="taskForm.title" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="taskForm.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Statut</label>
            <select v-model="taskForm.status">
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          </div>

          <div class="form-group">
            <label>Date limite</label>
            <input v-model="taskForm.deadline" type="date" />
          </div>

          <div class="form-group">
            <label>Assigner à</label>
            <select v-model="taskForm.assignedTo">
              <option value="">Non assignée</option>
              <option 
                v-for="member in group.members" 
                :key="member._id" 
                :value="member._id"
              >
                {{ member.name }}
              </option>
            </select>
          </div>

          <div v-if="taskError" class="error-message">{{ taskError }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeTaskModal" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="taskLoading">
              {{ taskLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group.js'
import { useTaskStore } from '@/stores/task.js'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const taskStore = useTaskStore()
const authStore = useAuthStore()

const group = computed(() => groupStore.currentGroup)
const tasks = ref([])
const loadingTasks = ref(false)

const showInviteModal = ref(false)
const inviteLink = ref('')
const copied = ref(false)
const inviteLinkInput = ref(null)

const showTaskModal = ref(false)
const editingTask = ref(null)
const taskLoading = ref(false)
const taskError = ref('')

const taskForm = ref({
  title: '',
  description: '',
  status: 'todo',
  deadline: '',
  assignedTo: ''
})

onMounted(async () => {
  await loadGroupData()
})

const loadGroupData = async () => {
  try {
    await groupStore.fetchGroupById(route.params.id)
    await loadTasks()
  } catch (error) {
    console.error('Erreur chargement groupe:', error)
    router.push('/groups')
  }
}

const loadTasks = async () => {
  loadingTasks.value = true
  try {
    tasks.value = await taskStore.fetchTasksByGroup(route.params.id)
  } catch (error) {
    console.error('Erreur chargement tâches:', error)
  } finally {
    loadingTasks.value = false
  }
}

const generateInviteLink = async () => {
  try {
    // Le backend renvoie déjà le lien complet avec FRONTEND_URL
    const fullLink = await groupStore.generateInviteLink(route.params.id)
    inviteLink.value = fullLink
    console.log('🔗 Lien d\'invitation:', inviteLink.value)
  } catch (error) {
    console.error('Erreur génération lien:', error)
  }
}

const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    inviteLinkInput.value?.select()
    document.execCommand('copy')
  }
}

const canRemoveMember = (memberId) => {
  // Vérifier que l'utilisateur est le propriétaire du groupe
  const isOwner = group.value?.owner?.toString() === authStore.user?._id?.toString()
  // Ne pas permettre de retirer soi-même
  const isSelf = authStore.user?._id?.toString() === (typeof memberId === 'string' ? memberId : memberId?.toString())
  // Seul le propriétaire peut retirer des membres, et il ne peut pas se retirer lui-même
  return isOwner && !isSelf
}

const confirmRemoveMember = (member) => {
  if (confirm(`Êtes-vous sûr de vouloir retirer ${member.name} du groupe ?`)) {
    removeMember(member._id)
  }
}

const removeMember = async (memberId) => {
  try {
    console.log('👤 Retrait membre - ID:', memberId)
    await groupStore.removeMember(route.params.id, memberId)
    // Recharger les données du groupe pour mettre à jour la liste
    await loadGroupData()
    console.log('✅ Membre retiré avec succès')
  } catch (error) {
    console.error('❌ Erreur retrait membre:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du retrait du membre'
    alert(errorMessage)
  }
}

const editTask = (task) => {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
    assignedTo: task.assignedTo?._id || task.assignedTo || ''
  }
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    status: 'todo',
    deadline: '',
    assignedTo: ''
  }
  taskError.value = ''
}

const handleTaskSubmit = async () => {
  taskError.value = ''
  taskLoading.value = true

  try {
    const data = {
      ...taskForm.value,
      group: route.params.id
    }

    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value._id, data)
    } else {
      await taskStore.createTask(data)
    }

    await loadTasks()
    closeTaskModal()
  } catch (error) {
    taskError.value = error.response?.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    taskLoading.value = false
  }
}

const confirmDeleteTask = (task) => {
  if (confirm(`Supprimer la tâche "${task.title}" ?`)) {
    deleteTask(task._id)
  }
}

const deleteTask = async (taskId) => {
  try {
    console.log('🗑️ Suppression tâche:', taskId)
    await taskStore.deleteTask(taskId)
    tasks.value = tasks.value.filter(t => t._id !== taskId)
    console.log('✅ Tâche supprimée avec succès')
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression'
    alert(errorMessage)
  }
}

const getUserName = (userId) => {
  if (typeof userId === 'object') return userId.name
  const member = group.value?.members?.find(m => m._id === userId)
  return member?.name || 'Inconnu'
}

const getStatusText = (status) => {
  const statuses = {
    'todo': 'À faire',
    'in-progress': 'En cours',
    'completed': 'Terminée'
  }
  return statuses[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const goBack = () => {
  router.push('/groups')
}

// Générer le lien d'invitation quand le modal s'ouvre
const showInviteModalHandler = async () => {
  showInviteModal.value = true
  if (!inviteLink.value) {
    await generateInviteLink()
  }
}

// Watcher pour déclencher la génération
watch(showInviteModal, (newVal) => {
  if (newVal && !inviteLink.value) {
    generateInviteLink()
  }
})
</script>

<style scoped>
.group-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.btn-back {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.btn-back:hover {
  text-decoration: underline;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.group-header h2 {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.group-desc {
  color: #666;
  margin: 0.5rem 0;
}

.section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
}

.members-list {
  display: grid;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.member-email {
  color: #666;
  font-size: 0.9rem;
  margin-left: auto;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-remove:hover {
  background: #c0392b;
}

.tasks-list {
  display: grid;
  gap: 1rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.task-item.completed {
  opacity: 0.7;
  border-left-color: #2ecc71;
}

.task-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.task-info p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.status.todo {
  background: #e3f2fd;
  color: #1976d2;
}

.status.in-progress {
  background: #fff3e0;
  color: #f57c00;
}

.status.completed {
  background: #e8f5e9;
  color: #388e3c;
}

.deadline {
  color: #666;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.1);
}

.btn-icon.btn-danger:hover {
  transform: scale(1.1);
}

.invite-link {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.invite-link input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn-copy {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #359268;
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

.btn-secondary {
  background: #ddd;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  width: 100%;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

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
  max-height: 80vh;
  overflow-y: auto;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
}
</style>

 