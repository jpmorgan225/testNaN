import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useTaskStore = defineStore('task', () => {
	const loading = ref(false)
	const error = ref('')

	const fetchTasksByGroup = async (groupId) => {
		loading.value = true
		error.value = ''
		try {
			const { data } = await api.get(`/api/tasks/group/${groupId}`)
			// Backend renvoie { success: true, data: [...] }
			return data?.data || data || []
		} catch (err) {
			console.error('Erreur fetchTasksByGroup:', err)
			error.value = err.response?.data?.message || 'Erreur lors du chargement des tâches'
			throw err
		} finally {
			loading.value = false
		}
	}

	const createTask = async (payload) => {
		error.value = ''
		try {
			console.log('📝 Création tâche:', payload)
			const { data } = await api.post('/api/tasks', payload)
			console.log('✅ Réponse création tâche:', data)
			// Backend renvoie { success: true, data: task }
			return data?.data || data
		} catch (err) {
			console.error('❌ Erreur création tâche:', err)
			error.value = err.response?.data?.message || 'Erreur lors de la création de la tâche'
			throw err
		}
	}

	const updateTask = async (taskId, payload) => {
		error.value = ''
		try {
			const { data } = await api.put(`/api/tasks/${taskId}`, payload)
			// Backend renvoie { success: true, data: task }
			return data?.data || data
		} catch (err) {
			console.error('Erreur updateTask:', err)
			error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche'
			throw err
		}
	}

	const deleteTask = async (taskId) => {
		error.value = ''
		try {
			console.log('🗑️ Suppression tâche - ID:', taskId)
			const { data } = await api.delete(`/api/tasks/${taskId}`)
			console.log('✅ Réponse suppression:', data)
			return data
		} catch (err) {
			console.error('❌ Erreur suppression tâche:', err)
			error.value = err.response?.data?.message || 'Erreur lors de la suppression de la tâche'
			throw err
		}
	}

	return {
		loading,
		error,
		fetchTasksByGroup,
		createTask,
		updateTask,
		deleteTask,
	}
})



