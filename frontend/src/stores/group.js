import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useGroupStore = defineStore('group', () => {
	const groups = ref([])
	const currentGroup = ref(null)
	const loading = ref(false)
	const error = ref('')

	const fetchGroups = async () => {
		loading.value = true
		error.value = ''
		try {
			const { data } = await api.get('/api/groups')
			// Backend renvoie { success: true, data: [...] }
			groups.value = data?.data || data || []
			return groups.value
		} catch (err) {
			console.error('Erreur fetchGroups:', err)
			error.value = err.response?.data?.message || 'Erreur lors du chargement des groupes'
			throw err
		} finally {
			loading.value = false
		}
	}

	const createGroup = async (payload) => {
		error.value = ''
		try {
			console.log('📝 Création groupe:', payload)
			const { data } = await api.post('/api/groups', payload)
			console.log('✅ Réponse création:', data)
			// Backend renvoie { success: true, data: group }
			const newGroup = data?.data || data
			groups.value = [newGroup, ...groups.value]
			return newGroup
		} catch (err) {
			console.error('❌ Erreur création groupe:', err)
			error.value = err.response?.data?.message || 'Erreur lors de la création du groupe'
			throw err
		}
	}

	const fetchGroupById = async (groupId) => {
		loading.value = true
		error.value = ''
		try {
			const { data } = await api.get(`/api/groups/${groupId}`)
			// Backend renvoie { success: true, data: group }
			currentGroup.value = data?.data || data
			return currentGroup.value
		} catch (err) {
			console.error('Erreur fetchGroupById:', err)
			error.value = err.response?.data?.message || 'Erreur lors du chargement du groupe'
			throw err
		} finally {
			loading.value = false
		}
	}

	const generateInviteLink = async (groupId) => {
		error.value = ''
		try {
			console.log('🔗 Génération lien pour groupe:', groupId)
			const { data } = await api.post(`/api/groups/${groupId}/invite`)
			console.log('✅ Réponse invite:', data)
			// Backend renvoie { success: true, data: "https://testnan-3.onrender.com/join/token" }
			const fullLink = data?.data || data?.link || data
			console.log('🔗 Lien complet généré:', fullLink)
			// Retourner le lien complet (le backend utilise déjà FRONTEND_URL)
			return fullLink
		} catch (err) {
			console.error('❌ Erreur génération lien:', err)
			error.value = err.response?.data?.message || 'Erreur lors de la génération du lien'
			throw err
		}
	}

	const removeMember = async (groupId, userId) => {
		error.value = ''
		try {
			await api.delete(`/api/groups/${groupId}/members/${userId}`)
			// mettre à jour localement
			if (currentGroup.value) {
				currentGroup.value.members = (currentGroup.value.members || []).filter(m => m._id !== userId)
			}
		} catch (err) {
			error.value = err.response?.data?.message || 'Erreur lors du retrait du membre'
			throw err
		}
	}

	const joinGroup = async (token) => {
		error.value = ''
		try {
			console.log('🔗 Tentative de rejoindre avec token:', token)
			const { data } = await api.get(`/api/groups/join/${token}`)
			console.log('✅ Réponse joinGroup:', data)
			// Backend renvoie { success: true, message: "...", data: group }
			const group = data?.data || data
			if (group?._id) {
				currentGroup.value = group
				// Ajouter à la liste des groupes
				if (!groups.value.find(g => g._id === group._id)) {
					groups.value = [group, ...groups.value]
				}
			}
			return group
		} catch (err) {
			console.error('❌ Erreur joinGroup:', err)
			error.value = err.response?.data?.message || 'Erreur lors de la jonction au groupe'
			throw err
		}
	}

	return {
		groups,
		currentGroup,
		loading,
		error,
		fetchGroups,
		createGroup,
		fetchGroupById,
		generateInviteLink,
		removeMember,
		joinGroup,
	}
})



